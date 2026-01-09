import React, { useState, useEffect } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { genogramService } from "../../services/genogramService";

const GenogramCanvas = ({ familyId, onFamilyUpdated }) => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", gender: "other" });

  useEffect(() => {
    loadData();
  }, [familyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await genogramService.getPersonsByFamily(familyId);
      setPeople(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;
    try {
      setLoading(true);
      await genogramService.addPerson(familyId, "", formData.firstName, formData.lastName, formData.gender);
      setFormData({ firstName: "", lastName: "", gender: "other" });
      loadData();
      onFamilyUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Family Members ({people.length})</h3>
      <form onSubmit={handleAddPerson}>
        <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
        <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
        <button type="submit" disabled={loading}>Add</button>
      </form>
      <div>
        {people.map(p => (<div key={p.id}>{p.firstName} {p.lastName}</div>))}
      </div>
    </div>
  );
};

export default GenogramCanvas;
