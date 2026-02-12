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

/**
 * Calculate fidelity metrics from attendance dates
 * @param dates Array of attendance records with date and status
 * @param attendanceRate Overall attendance rate percentage
 * @returns Fidelity metrics (level, streak, commitmentLabel, percent)
 */
function calculateFidelityFromDates(
  dates: Array<{ date: any; status: string }>,
  attendanceRate: number
): {
  level: 'ORO' | 'PLATA' | 'BRONCE';
  streak: number;
  commitmentLabel: string;
  percent: number;
} {
  // Sort by date ascending
  const sorted = [...dates].sort((a, b) => {
    const dateA = a.date.toMillis ? a.date.toMillis() : a.date.getTime();
    const dateB = b.date.toMillis ? b.date.toMillis() : b.date.getTime();
    return dateA - dateB;
  });

  // Calculate streak: count consecutive 'present' from the end
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].status === 'present') {
      streak += 1;
    } else {
      break;
    }
  }

  // Determine level based on attendance rate and streak
  let level: 'ORO' | 'PLATA' | 'BRONCE' = 'BRONCE';
  if (attendanceRate >= 85 && streak >= 4) {
    level = 'ORO';
  } else if (attendanceRate >= 70 && streak >= 2) {
    level = 'PLATA';
  }

  // Determine commitment label
  let commitmentLabel = 'INICIANDO';
  if (level === 'ORO') {
    commitmentLabel = 'EXCELENTE';
  } else if (level === 'PLATA') {
    commitmentLabel = 'CONSTANTE';
  }

  const percent = Math.min(100, Math.round(attendanceRate));

  return { level, streak, commitmentLabel, percent };
}

/**
 * Get fidelity statistics with class filter and ordered by attendance
 * @param filterClass Optional class name to filter by (null = all classes)
 * @returns Fidelity stats ordered by total attendances descending
 */
export const getFidelityStatistics = async (
  filterClass?: string | null
): Promise<{
  fidelityStats: Array<{
    memberId: string;
    level: 'ORO' | 'PLATA' | 'BRONCE';
    streak: number;
    commitmentLabel: string;
    percent: number;
  }>;
  memberStats: any[];
}> => {
  try {
    // Get members data first (for class filtering)
    const membersRef = collection(db, 'members');
    let membersQuery = query(membersRef);
    
    if (filterClass) {
      membersQuery = query(membersRef, where('clase', '==', filterClass));
    }
    
    const membersSnapshot = await getDocs(membersQuery);
    const membersData: Record<string, any> = {};
    const validMemberIds: string[] = [];
    
    membersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const memberId = doc.id;
      membersData[memberId] = {
        id: memberId,
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        nombreCompleto: data.nombreCompleto || `${data.nombre || ''} ${data.apellido || ''}`.trim(),
        photoUrl: data.photoUrl || data.foto || '',
        clase: data.clase || data.className || '',
      };
      validMemberIds.push(memberId);
    });

    // Get attendance records from last 12 months
    const attendanceRef = collection(db, 'attendance');
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const attendanceQuery = query(
      attendanceRef,
      where('date', '>=', oneYearAgo)
    );
    
    const snapshot = await getDocs(attendanceQuery);
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter attendance records by class members only
    const filteredRecords = filterClass 
      ? records.filter(rec => validMemberIds.includes(rec.memberId))
      : records;

    // Group by member
    const byMember: Record<string, any> = {};

    for (const rec of filteredRecords as any[]) {
      const { memberId, status, date, className, memberName } = rec;
      
      if (!byMember[memberId]) {
        byMember[memberId] = {
          memberId,
          memberName: memberName || membersData[memberId]?.nombreCompleto || 'Miembro',
          className,
          totalAttendances: 0,
          totalAbsences: 0,
          dates: [],
        };
      }
      
      byMember[memberId].dates.push({ date, status });
      
      if (status === 'present') {
        byMember[memberId].totalAttendances += 1;
      } else {
        byMember[memberId].totalAbsences += 1;
      }
    }

    // Calculate fidelity and ORDER BY totalAttendances DESC
    const memberStats = Object.values(byMember)
      .map((m: any) => {
        const total = m.totalAttendances + m.totalAbsences;
        const attendanceRate = total > 0 ? (m.totalAttendances / total) * 100 : 0;
        const fidelity = calculateFidelityFromDates(m.dates, attendanceRate);

        return {
          ...m,
          attendanceRate,
          nombreCompleto: membersData[m.memberId]?.nombreCompleto || m.memberName || 'Miembro',
          nombre: membersData[m.memberId]?.nombre || '',
          apellido: membersData[m.memberId]?.apellido || '',
          photoUrl: membersData[m.memberId]?.photoUrl || '',
          clase: membersData[m.memberId]?.clase || m.className || '',
          ...fidelity,
        };
      })
      .sort((a: any, b: any) => b.totalAttendances - a.totalAttendances); // Orden descendente por asistencias

    const fidelityStats = memberStats.map((m: any) => ({
      memberId: m.memberId,
      level: m.level,
      streak: m.streak,
      commitmentLabel: m.commitmentLabel,
      percent: m.percent,
    }));

    return {
      fidelityStats,
      memberStats,
    };
  } catch (error) {
    console.error('Error calculating fidelity statistics:', error);
    return {
      fidelityStats: [],
      memberStats: [],
    };
  }
};
