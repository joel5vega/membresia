import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Plus, Edit2, X, ZoomIn, ZoomOut, Grid3X3 } from "lucide-react";
import { familyService, genogramService } from "../../services/genogramService";
import FamilyForm from "./FamilyForm";
import GenogramCanvas from "./GenogramCanvas";
import "./GenogramEditor.css";

const GenogramEditor = () => {
    const { user } = useAuth();
      const churchId = user?.iglesia || user?.churchI || 'IED8_Canaa';
  const [viewMode, setViewMode] = useState("directory");
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFamilies();
  });

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const data = await familyService.getFamiliesByChurch(churchId);
      setFamilies(data);
    } catch (err) {
      setError("Failed to load families");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div><p>Loading...</p></div>;

  return (
    <div>
      <h1>Family Genograms</h1>
      <button onClick={() => setShowFamilyForm(true)}>Create Family</button>
      {families.map(f => (<div key={f.id}>{f.name}</div>))}
      {showFamilyForm && <FamilyForm churchId={churchId || "IEDB_Canaan"} onSuccess={() => {setShowFamilyForm(false); loadFamilies();}} />}
    </div>
  );
};

export default GenogramEditor;
