import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { dbMemberToFormData } from '../adapters/memberAdapter';
import MemberForm from './MemberForm';

const EditMemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const memberData = await memberService.getMemberById(id);
        setMember(dbMemberToFormData(memberData));
      } catch (err) {
        console.error('Error loading member:', err);
        setError('Error cargando el miembro: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadMember();
  }, [id]);

  const handleSuccess = () => {
    navigate('/members');
  };

  const handleCancel = () => {
    navigate('/members');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-gray-600">Cargando datos del miembro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <button
          onClick={handleCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-red-600">No se encontró el miembro</p>
      </div>
    );
  }

  return (
    <div className="edit-member-form-container">
      <MemberForm
        editMode={true}
        memberId={id}
        initialMember={member}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditMemberForm;
