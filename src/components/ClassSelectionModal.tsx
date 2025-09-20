import { useState, useEffect } from 'react';
import { Class } from '../types/calendar';

interface ClassSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClasses: (selectedClasses: string[]) => void;
  availableClasses: Class[];
  currentClasses: string[];
  dayName: string;
}

export const ClassSelectionModal = ({
  isOpen,
  onClose,
  onSelectClasses,
  availableClasses,
  currentClasses,
  dayName
}: ClassSelectionModalProps) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedClasses([...currentClasses]);
    }
  }, [isOpen, currentClasses]);

  const handleToggleClass = (classCode: string) => {
    setSelectedClasses(prev => 
      prev.includes(classCode)
        ? prev.filter(code => code !== classCode)
        : [...prev, classCode]
    );
  };

  const handleSave = () => {
    onSelectClasses(selectedClasses);
    onClose();
  };

  const handleCancel = () => {
    setSelectedClasses([...currentClasses]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold capitalize">
            Select Classes for {dayName}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {availableClasses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No classes defined yet.</p>
            <p className="text-sm mt-2">Go to "Class Definitions" to add classes first.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableClasses.map((cls) => (
              <label
                key={cls.code}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(cls.code)}
                  onChange={() => handleToggleClass(cls.code)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium">{cls.code}</div>
                  <div className="text-sm text-gray-500">{cls.name}</div>
                  <div className="text-xs text-gray-400">Weight: {cls.weight}%</div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={availableClasses.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save ({selectedClasses.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
};
