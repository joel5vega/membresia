import { useState, useEffect, useCallback } from 'react';
import { memberService } from '../services/memberService';

export function useMembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    memberService.getMembers()
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Actualiza la lista al instante; si Firestore falla, revierte
  const update = useCallback(async (id, patch) => {
    let previous;
    setMembers((ms) => ms.map((m) => {
      if (m.id !== id) return m;
      previous = m;
      return { ...m, ...patch };
    }));
    try {
      await memberService.updateMember(id, patch);
    } catch (e) {
      setMembers((ms) => ms.map((m) => (m.id === id ? previous : m)));
      throw e;
    }
  }, []);

  const remove = useCallback(async (id) => {
    let previous;
    setMembers((ms) => ms.filter((m) => {
      if (m.id === id) previous = m;
      return m.id !== id;
    }));
    try {
      await memberService.deleteMember(id);
    } catch (e) {
      setMembers((ms) => [...ms, previous]);
      throw e;
    }
  }, []);

  return { members, loading, error, update, remove };
}