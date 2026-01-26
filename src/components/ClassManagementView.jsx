import { useStat, useEffecte } from 'react';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const ClassManagementView = () => {
  const [classes, setClasses] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({
    nombre: '',
    tipo: 'Sociedad',
    genero: 'Mixto',
    maestro: '',
    descripcion: '',
    activo: true
  });
  const [isAdding, setIsAdding] = useState(false);

    // Cargar clases al montar el componente
  useEffect(() => {
    loadClasses();
  }, []);

  // Cargar clases desde Firestore
  const loadClasses = async () => {
    try {
      const classesSnapshot = await getDocs(collection(getFirestore(), 'classes'));
      const classList = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classList);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    }
  };

  // Agregar nueva clase
  const addClass = async () => {
    try {
      await addDoc(collection(getFirestore(), 'classes'), newClass);
      setNewClass({
        nombre: '',
        tipo: 'Sociedad',
        genero: 'Mixto',
        maestro: '',
        descripcion: '',
        activo: true
      });
      setIsAdding(false);
      loadClasses();
    } catch (error) {
      console.error('Error al agregar clase:', error);
    }
  };

  // Actualizar clase
  const updateClass = async (id, data) => {
    try {
      await updateDoc(doc(getFirestore(),'classes', id), data);
      setEditingClass(null);
      loadClasses();
    } catch (error) {
      console.error('Error al actualizar clase:', error);
    }
  };

  // Eliminar clase
  const deleteClass = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta clase?')) {
      try {
        await deleteDoc(doc(getFirestore(),'classes', id));
        loadClasses();
      } catch (error) {
        console.error('Error al eliminar clase:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuración de Clases</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
        >
          <FaPlus /> Nueva Clase
        </button>
      </div>

      {/* Formulario para agregar nueva clase */}
      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Agregar Nueva Clase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Clase</label>
              <input
                type="text"
                value={newClass.nombre}
                onChange={(e) => setNewClass({...newClass, nombre: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Ej: Varones 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={newClass.tipo}
                onChange={(e) => setNewClass({...newClass, tipo: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="Sociedad">Sociedad</option>
                <option value="Avenida">Avenida</option>
                <option value="Escuela Dominical">Escuela Dominical</option>
                <option value="Juvenil">Juvenil</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Género</label>
              <select
                value={newClass.genero}
                onChange={(e) => setNewClass({...newClass, genero: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="Mixto">Mixto</option>
                <option value="Varones">Varones</option>
                <option value="Mujeres">Mujeres</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maestro</label>
              <input
                type="text"
                value={newClass.maestro}
                onChange={(e) => setNewClass({...newClass, maestro: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Nombre del maestro"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={newClass.descripcion}
                onChange={(e) => setNewClass({...newClass, descripcion: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Descripción de la clase"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addClass}
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
            >
              <FaSave /> Guardar
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
            >
              <FaTimes /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de clases */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Género</th>
              <th className="p-3 text-left">Maestro</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{cls.nombre}</td>
                <td className="p-3">{cls.tipo}</td>
                <td className="p-3">{cls.genero}</td>
                <td className="p-3">{cls.maestro}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    cls.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cls.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingClass(cls)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteClass(cls.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassManagementView;