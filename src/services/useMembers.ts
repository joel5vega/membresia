import { useState, useEffect } from 'react';
import { Member } from '../types';
import { getCachedMembers, isCacheValid } from '../services/dataCache';
import { memberService } from '../services/memberService';

export function useMembers(forceRefresh = false) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);

        // SIEMPRE intentar cache primero
        const { members: cachedMembers, timestamp } = await getCachedMembers();
        
        if (cachedMembers.length > 0 && isCacheValid(timestamp) && !forceRefresh) {
          console.log('✓ Using cached members');
          setMembers(cachedMembers);
          setLoading(false);
          return;
        }

        // Solo si cache inválido o forceRefresh
        console.log('→ Fetching fresh members');
        const freshMembers = await memberService.getMembers();
        setMembers(freshMembers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [forceRefresh]);

  return { members, loading, error };
}
