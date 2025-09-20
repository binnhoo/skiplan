import { useState, useRef } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { CalendarProvider, useCalendar } from './contexts/CalendarContext';
import Calendar from './components/Calendar';
import { ClassManager } from './components/ClassManager';
import { WeeklySchedule } from './components/WeeklySchedule';
import { SemesterConfig } from './components/SemesterConfig';
import { storageService } from './services/storageService';
import { TabType } from './types/calendar';

function AppContent() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { refreshState } = useCalendar();
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleDownload = () => {
    storageService.downloadConfig();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadStatus('uploading');
      setUploadMessage('Uploading configuration...');
      
      try {
        await storageService.uploadConfig(file);
        refreshState();
        setUploadStatus('success');
        setUploadMessage('Configuration uploaded successfully!');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error uploading config:', error);
        setUploadStatus('error');
        setUploadMessage('Error uploading configuration file. Please make sure it is a valid JSON file.');
        
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 5000);
      }
    }
  };

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
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold">Skiplan</h1>
        
        <nav className="flex-1 flex justify-center">
          <div className="flex space-x-6">
            {[
              { id: 'calendar', label: 'Calendar' },
              { id: 'classes', label: 'Class Definitions' },
              { id: 'schedule', label: 'Weekly Schedule' },
              { id: 'semester', label: 'Semester Config' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Download</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadStatus === 'uploading'}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              uploadStatus === 'uploading' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            <span>📤</span>
            <span>{uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isDarkMode ? '🌞 Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {uploadMessage && (
        <div className="container mx-auto max-w-6xl px-4 py-2">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
            uploadStatus === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : uploadStatus === 'error'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            <span>
              {uploadStatus === 'success' ? '✅' : uploadStatus === 'error' ? '❌' : '⏳'}
            </span>
            <span>{uploadMessage}</span>
          </div>
        </div>
      )}

      <main className="container mx-auto max-w-6xl p-4">
        {renderActiveTab()}
      </main>
    </div>
  );
}

function App() {
  return (
    <CalendarProvider>
      <AppContent />
    </CalendarProvider>
  );
}

export default App;