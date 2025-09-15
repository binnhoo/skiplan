import { TabType } from '../types/calendar';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'classes', label: 'Class Definitions' },
    { id: 'schedule', label: 'Weekly Schedule' },
    { id: 'semester', label: 'Semester Config' },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
