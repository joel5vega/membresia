import { useState } from 'react';
import { ClassSelector } from './ClassSelector';
import { ClassMembersList } from './ClassMembersList';
import { TabNavigation } from '../Shared/TabNavigation';
import { StatisticsView } from '../Statistics/StatisticsView';
import { useClassMembers } from '../../hooks/useClassMembers';
import { useAttendanceStats } from '../../hooks/useAttendanceStats';

const TABS = [
  { id: 'members', label: 'Miembros' },
  { id: 'statistics', label: 'Estadísticas' }
];

export const ClassManagement = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [activeTab, setActiveTab] = useState('members');
  
  const { members, loading: membersLoading, error: membersError } = useClassMembers(selectedClass);
  const { stats, loading: statsLoading, error: statsError } = useAttendanceStats(selectedClass);

  return (
    <div className="class-management">
      <h1>Gestión de Clases</h1>
      
      <div className="selector-section">
        <ClassSelector
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
        />
      </div>

      {selectedClass && (
        <>
          <div className="tabs-section">
            <TabNavigation
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="content-section">
            {activeTab === 'members' && (
              <ClassMembersList
                members={members}
                loading={membersLoading}
                error={membersError}
              />
            )}
            {activeTab === 'statistics' && (
              <StatisticsView
                classStats={stats}
                loading={statsLoading}
                error={statsError}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
