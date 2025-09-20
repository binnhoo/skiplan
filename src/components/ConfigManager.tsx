import { useRef, useState } from 'react';
import { storageService } from '../services/storageService';
import { useCalendar } from '../contexts/CalendarContext';

export function ConfigManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshState } = useCalendar();
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
        refreshState(); // Refresh the context state instead of reloading
        setUploadStatus('success');
        setUploadMessage('Configuration uploaded successfully!');
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error uploading config:', error);
        setUploadStatus('error');
        setUploadMessage('Error uploading configuration file. Please make sure it is a valid JSON file.');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 5000);
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <span>📥</span>
          <span>Download Config</span>
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
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            uploadStatus === 'uploading' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          <span>📤</span>
          <span>{uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Config'}</span>
        </button>
      </div>
      
      {uploadMessage && (
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
      )}
    </div>
  );
}
