import { db } from './firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface MemberStatistics {
  totalMembers: number;
  baptizedCount: number;
  unBaptizedCount: number;
  donesEspirituales: Record<string, number>;
  estadoCivil: Record<string, number>;
  byClass: Record<string, ClassStatistics>;
}

export interface ClassStatistics {
  className: string;
  totalMembers: number;
  baptizedCount: number;
  unBaptizedCount: number;
  donesEspirituales: Record<string, number>;
  estadoCivil: Record<string, number>;
}

/**
 * Get comprehensive member statistics
 * @param filterClass Optional class name to filter by
 * @returns Member statistics with breakdowns by spiritual gifts and civil status
 */
export const getMemberStatistics = async (
  filterClass?: string
): Promise<MemberStatistics> => {
  try {
    const membersRef = collection(db, 'members');
    let q = query(membersRef);

    if (filterClass) {
      q = query(membersRef, where('clase', '==', filterClass));
    }

    const snapshot = await getDocs(q);
    const members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Initialize statistics structure
    const stats: MemberStatistics = {
      totalMembers: members.length,
      baptizedCount: 0,
      unBaptizedCount: 0,
      donesEspirituales: {},
      estadoCivil: {},
      byClass: {},
    };

    // Process each member
    members.forEach((member) => {
      // Count baptized
      if (member.bautizado === 'Sí' || member.bautizado === true) {
        stats.baptizedCount++;
      } else {
        stats.unBaptizedCount++;
      }

      // Count spiritual gifts
      if (member.donesEspirituales && Array.isArray(member.donesEspirituales)) {
        member.donesEspirituales.forEach((don: string) => {
          stats.donesEspirituales[don] = (stats.donesEspirituales[don] || 0) + 1;
        });
      }

      // Count civil status
      if (member.estadoCivil) {
        const estado = member.estadoCivil;
        stats.estadoCivil[estado] = (stats.estadoCivil[estado] || 0) + 1;
      }

      // Group by class if not filtering
      if (!filterClass && member.clase) {
        const className = member.clase;
        if (!stats.byClass[className]) {
          stats.byClass[className] = {
            className,
            totalMembers: 0,
            baptizedCount: 0,
            unBaptizedCount: 0,
            donesEspirituales: {},
            estadoCivil: {},
          };
        }

        stats.byClass[className].totalMembers++;

        if (member.bautizado === 'Sí' || member.bautizado === true) {
          stats.byClass[className].baptizedCount++;
        } else {
          stats.byClass[className].unBaptizedCount++;
        }

        if (member.donesEspirituales && Array.isArray(member.donesEspirituales)) {
          member.donesEspirituales.forEach((don: string) => {
            stats.byClass[className].donesEspirituales[don] =
              (stats.byClass[className].donesEspirituales[don] || 0) + 1;
          });
        }

        if (member.estadoCivil) {
          const estado = member.estadoCivil;
          stats.byClass[className].estadoCivil[estado] =
            (stats.byClass[className].estadoCivil[estado] || 0) + 1;
        }
      }
    });

    console.log('Member Statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching member statistics:', error);
    throw error;
  }
};

/**
 * Get baptized members count
 */
export const getBaptizedCount = async (filterClass?: string): Promise<number> => {
  const stats = await getMemberStatistics(filterClass);
  return stats.baptizedCount;
};

/**
 * Get spiritual gifts distribution
 */
export const getDonesEspirituales = async (
  filterClass?: string
): Promise<Record<string, number>> => {
  const stats = await getMemberStatistics(filterClass);
  return stats.donesEspirituales;
};

/**
 * Get civil status distribution
 */
export const getEstadoCivil = async (
  filterClass?: string
): Promise<Record<string, number>> => {
  const stats = await getMemberStatistics(filterClass);
  return stats.estadoCivil;
};

/**
 * Get statistics for a specific class
 */
export const getClassStatistics = async (
  className: string
): Promise<ClassStatistics | null> => {
  const stats = await getMemberStatistics();
  return stats.byClass[className] || null;
};