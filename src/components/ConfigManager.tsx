import { useRef } from 'react';
import { storageService } from '../services/storageService';

export function ConfigManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    storageService.downloadConfig();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await storageService.uploadConfig(file);
        window.location.reload(); // Reload to apply new config
      } catch (error) {
        console.error('Error uploading config:', error);
        alert('Error uploading configuration file. Please make sure it is a valid JSON file.');
      }
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Download Config
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
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Upload Config
      </button>
    </div>
  );
}
