import React, { useState, useEffect } from 'react';
import { memberService } from '../../../services/memberService';
import { Check, X } from 'lucide-react';
import { familyCreationService } from '../../services/genogramService';

const FamilyForm = ({ churchId, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberRelationships, setMemberRelationships] = useState({});

  useEffect(() => {
    loadMembers();
  }, [churchId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('churchId passed to loadMembers:', churchId);
      
      if (!churchId) {
        setError('Church ID is required to load members');
        setMembers([]);
        setLoading(false);
        return;
      }
      
      const membersList = await memberService.getAllMembers();
      console.log('membersList:', membersList);
      
      if (membersList && membersList.length > 0) {
        setMembers(membersList);
        setError(null);
      } else {
        setMembers([]);
        setError('No church members found. Please add members to your church first.');
      }
    } catch (err) {
      console.error('Error loading members:', err);
      setError(`Failed to load church members: ${err.message}`);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!familyName.trim()) {
        setError('Please enter a family name');
        return;
      }
      setStep(2);
      setError(null);
    } else {
      await createFamily();
    }
  };

  const createFamily = async () => {
    if (!churchId) {
      setError('Church ID not found. Cannot create family.');
      return;
    }
    
    if (selectedMembers.length === 0) {
      setError('Please select at least one family member');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Pass churchId as string and selectedMembers as array of strings (IDs only)
      const familyId = await familyCreationService.createFamilyFromMembers(
        String(churchId),
        familyName,
        selectedMembers, // Array of member IDs (strings)
        true
      );
      
      console.log('Family created successfully with ID:', familyId);
      
      // Reset form
      setFamilyName('');
      setSelectedMembers([]);
      setMemberRelationships({});
      setStep(1);
      
      onSuccess?.(familyId);
    } catch (err) {
      console.error('Error creating family:', err);
      setError('Failed to create family: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Get member display name with fallbacks for different field names
  const getMemberName = (member) => {
    const firstName = member.firstName || member.nombre || '';
    const lastName = member.lastName || member.apellido || '';
    return `${firstName} ${lastName}`.trim() || 'Unnamed Member';
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          marginBottom: '15px', 
          padding: '12px', 
          backgroundColor: '#ffebee', 
          borderRadius: '4px',
          borderLeft: '4px solid #d32f2f',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px', color: '#333' }}>
            Create New Family
          </h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333',
              fontSize: '14px'
            }}>
              Family Name *
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g., Smith Family / Familia García"
              autoFocus
              style={{ 
                width: '100%', 
                padding: '10px', 
                fontSize: '14px', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>
            Enter the name of the family you want to create. You'll select members in the next step.
          </p>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px', color: '#333' }}>
            Select Family Members
          </h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            Select members from your church to include in this family genogram
          </p>
          
          {loading ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666',
              fontSize: '14px'
            }}>
              ⏳ Loading members...
            </div>
          ) : members.length === 0 ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#d32f2f',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              border: '1px solid #ffcdd2',
              fontSize: '14px'
            }}>
              ❌ No church members available
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              maxHeight: '400px', 
              overflowY: 'auto',
              backgroundColor: '#f9f9f9'
            }}>
              {members.map((member) => (
                <div 
                  key={member.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: selectedMembers.includes(member.id) ? '#e3f2fd' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    id={member.id}
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberSelect(member.id)}
                    style={{ 
                      marginRight: '10px', 
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  <label 
                    htmlFor={member.id} 
                    style={{ 
                      margin: 0, 
                      cursor: 'pointer', 
                      flex: 1,
                      fontWeight: selectedMembers.includes(member.id) ? '500' : 'normal',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  >
                    {getMemberName(member)}
                  </label>
                  <select 
                    style={{ 
                      marginLeft: '8px', 
                      fontSize: '12px', 
                      padding: '4px 6px',
                      minWidth: '130px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }} 
                    onChange={(e) => {
                      setMemberRelationships({
                        ...memberRelationships, 
                        [member.id]: e.target.value
                      });
                    }} 
                    value={memberRelationships[member.id] || ''}
                  >
                    <option value="">-- Relación --</option>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="esposo">Esposo/a</option>
                    <option value="hijo">Hijo/a</option>
                    <option value="hermano">Hermano/a</option>
                    <option value="abuelo">Abuelo/a</option>
                    <option value="tio">Tío/a</option>
                    <option value="primo">Primo/a</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
            ✓ {selectedMembers.length} member(s) selected
          </div>
        </div>
      )}

      <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#f0f0f0', 
              border: '1px solid #ccc', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#e0e0e0')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
          >
            ← Back
          </button>
        )}
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#f5f5f5', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            opacity: loading ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#ececec')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
        >
          <X size={16} /> Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            opacity: loading ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#45a049')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
        >
          <Check size={16} /> {step === 1 ? 'Next →' : 'Create Family'}
        </button>
      </div>
    </form>
  );
};

export default FamilyForm;
