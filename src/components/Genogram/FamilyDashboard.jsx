import { useState, useEffect, useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { buildFamilyGroups, buildGenogramData } from "../../utils/familyGrouping";
import dagre from "dagre";

function MaleNode({ data }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-sm bg-blue-100 border-2 border-blue-500">
      {data.photoUrl && <img src={data.photoUrl} alt={data.label} className="w-12 h-12 rounded-full mx-auto mb-2" />}
      <div className="text-sm font-bold text-center">{data.label}</div>
      {data.edad && <div className="text-xs text-center text-gray-600">{data.edad} años</div>}
      <div className="text-xs text-center text-gray-500">{data.estadoCivil}</div>
    </div>
  );
}

function FemaleNode({ data }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-full bg-pink-100 border-2 border-pink-500">
      {data.photoUrl && <img src={data.photoUrl} alt={data.label} className="w-12 h-12 rounded-full mx-auto mb-2" />}
      <div className="text-sm font-bold text-center">{data.label}</div>
      {data.edad && <div className="text-xs text-center text-gray-600">{data.edad} años</div>}
      <div className="text-xs text-center text-gray-500">{data.estadoCivil}</div>
    </div>
  );
}

const nodeTypes = { maleNode: MaleNode, femaleNode: FemaleNode };

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => { dagreGraph.setNode(node.id, { width: 150, height: 100 }); });
  edges.forEach((edge) => { dagreGraph.setEdge(edge.source, edge.target); });
  dagre.layout(dagreGraph);
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = { x: nodeWithPosition.x - 75, y: nodeWithPosition.y - 50 };
  });
  return { nodes, edges };
};

export default function FamilyDashboard() {
  const [miembros, setMiembros] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const snapshot = await getDocs(collection(db, "miembros"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMiembros(data);
      const gruposFamiliares = buildFamilyGroups(data);
      setFamilias(gruposFamiliares);
      mostrarVistaGeneral(gruposFamiliares, data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function mostrarVistaGeneral(gruposFamiliares, todosMiembros) {
    const nodos = gruposFamiliares.map((familia, idx) => ({
      id: familia.id,
      data: { label: `Familia ${idx + 1}\n${familia.size} miembros`, familyId: familia.id, members: familia.members },
      position: { x: (idx % 3) * 300, y: Math.floor(idx / 3) * 200 },
      type: "default",
      style: { background: "#4F46E5", color: "white", border: "2px solid #312E81", width: 200, height: 100, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
    }));
    setNodes(nodos);
    setEdges([]);
    setFamiliaSeleccionada(null);
  }

  const onNodeClick = useCallback((event, node) => {
    if (node.data.familyId) {
      const familia = familias.find((f) => f.id === node.data.familyId);
      if (familia) {
        const { nodes: genogramNodes, edges: genogramEdges } = buildGenogramData(familia.members, miembros);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          genogramNodes,
          genogramEdges.map((edge) => ({
            ...edge,
            type: "smoothstep",
            animated: edge.animated,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: edge.type === "marriage" ? 3 : 2, stroke: edge.type === "marriage" ? "#EF4444" : "#6B7280" }
          }))
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setFamiliaSeleccionada(familia);
      }
    }
  }, [familias, miembros]);

  function volverAVistaGeneral() { mostrarVistaGeneral(familias, miembros); }

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-xl">Cargando familias...</div></div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard de Genogramas Familiares</h1>
        {familiaSeleccionada && (
          <button onClick={volverAVistaGeneral} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">← Volver</button>
        )}
      </div>
      <div className="flex-1">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} nodeTypes={nodeTypes} fitView>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <div className="bg-gray-100 p-4 border-t">
        <p className="text-sm text-gray-600">{familiaSeleccionada ? `Genograma con ${familiaSeleccionada.size} miembros` : `Total de familias: ${familias.length}`}</p>
      </div>
    </div>
  );
}