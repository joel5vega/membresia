export const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tab-navigation">
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
