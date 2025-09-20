import { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { CalendarProvider } from './contexts/CalendarContext';
import { TabNavigation } from './components/TabNavigation';
import Calendar from './components/Calendar';
import { ClassManager } from './components/ClassManager';
import { WeeklySchedule } from './components/WeeklySchedule';
import { SemesterConfig } from './components/SemesterConfig';
import { ConfigManager } from './components/ConfigManager';
import { TabType } from './types/calendar';

function App() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'calendar':
        return <Calendar />;
      case 'classes':
        return <ClassManager />;
      case 'schedule':
        return <WeeklySchedule />;
      case 'semester':
        return <SemesterConfig />;
      default:
        return null;
    }
  };

  return (
    <CalendarProvider>
      <div className="min-h-screen">
        <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold">Skiplan</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? '🌞 Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        <div className="container mx-auto max-w-6xl px-4 py-2">
          <ConfigManager />
        </div>

        <main className="container mx-auto max-w-6xl p-4">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-6">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </CalendarProvider>
  );
}

export default App;