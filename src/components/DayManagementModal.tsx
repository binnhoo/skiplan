import { useState, useEffect } from 'react';
import { Class, ClassStatus, ClassMark } from '../types/calendar';

interface DayManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classMarks: ClassMark[], allDayFree: boolean) => void;
  date: Date | null;
  dayClasses: Class[];
  currentClassMarks: ClassMark[];
  currentAllDayFree: boolean;
}

type AllDayMode = 'individual' | 'all-regular' | 'all-absence' | 'all-free';

const STATUS_CONFIG = {
  regular: { icon: '✅', label: 'Regular', color: 'text-gray-600' },
  absence: { icon: '❌', label: 'Absence', color: 'text-red-600' },
  free: { icon: '🟢', label: 'Free/No Class', color: 'text-green-600' }
};

export const DayManagementModal = ({
  isOpen,
  onClose,
  onSave,
  date,
  dayClasses,
  currentClassMarks,
  currentAllDayFree
}: DayManagementModalProps) => {
  const [classMarks, setClassMarks] = useState<ClassMark[]>([]);
  const [allDayMode, setAllDayMode] = useState<AllDayMode>('individual');

  useEffect(() => {
    if (isOpen && date) {
      // Initialize class marks
      const initialMarks = dayClasses.map(cls => {
        const existingMark = currentClassMarks.find(mark => mark.classCode === cls.code);
        return {
          classCode: cls.code,
          status: existingMark?.status || 'regular'
        } as ClassMark;
      });
      
      setClassMarks(initialMarks);
      
      // Determine initial all-day mode
      if (currentAllDayFree) {
        setAllDayMode('all-free');
      } else if (initialMarks.length > 0) {
        const allRegular = initialMarks.every(mark => mark.status === 'regular');
        const allAbsence = initialMarks.every(mark => mark.status === 'absence');
        const allFree = initialMarks.every(mark => mark.status === 'free');
        
        if (allRegular) {
          setAllDayMode('all-regular');
        } else if (allAbsence) {
          setAllDayMode('all-absence');
        } else if (allFree) {
          setAllDayMode('all-free');
        } else {
          setAllDayMode('individual');
        }
      } else {
        setAllDayMode('individual');
      }
    }
  }, [isOpen, date, dayClasses, currentClassMarks, currentAllDayFree]);

  const handleStatusChange = (classCode: string, status: ClassStatus) => {
    setClassMarks(prev => 
      prev.map(mark => 
        mark.classCode === classCode 
          ? { ...mark, status }
          : mark
      )
    );
    setAllDayMode('individual');
  };

  const handleAllDayModeChange = (mode: AllDayMode) => {
    setAllDayMode(mode);
    
    if (mode !== 'individual') {
      const status: ClassStatus = mode === 'all-regular' ? 'regular' : 
                                  mode === 'all-absence' ? 'absence' : 'free';
      
      setClassMarks(prev => 
        prev.map(mark => ({ ...mark, status }))
      );
    }
  };

  const handleSave = () => {
    const allDayFree = allDayMode === 'all-free';
    onSave(classMarks, allDayFree);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !date) return null;

  const dateString = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const ALL_DAY_MODES = [
    { mode: 'individual' as AllDayMode, icon: '⚙️', label: 'Individual Control', description: 'Set each class separately' },
    { mode: 'all-regular' as AllDayMode, icon: '✅', label: 'All Regular', description: 'All classes normal' },
    { mode: 'all-absence' as AllDayMode, icon: '❌', label: 'All Absence', description: 'All classes missed' },
    { mode: 'all-free' as AllDayMode, icon: '🟢', label: 'All Free', description: 'Entire day free/no class' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold">Manage Day</h3>
            <p className="text-sm text-gray-500 mt-1">{dateString}</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {dayClasses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-lg font-medium">No classes scheduled</p>
              <p className="text-sm">This day has no classes in your weekly schedule.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* All Day Mode Selection */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Day Mode</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_DAY_MODES.map((modeConfig) => (
                    <button
                      key={modeConfig.mode}
                      onClick={() => handleAllDayModeChange(modeConfig.mode)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        allDayMode === modeConfig.mode
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{modeConfig.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{modeConfig.label}</div>
                          <div className="text-sm text-gray-500">{modeConfig.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Class Settings */}
              {allDayMode === 'individual' && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Individual Classes</h4>
                  <div className="space-y-4">
                    {dayClasses.map((cls) => {
                      const classMark = classMarks.find(mark => mark.classCode === cls.code);
                      const currentStatus = classMark?.status || 'regular';
                      
                      return (
                        <div key={cls.code} className="border rounded-lg p-4 dark:border-gray-600">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium text-lg">{cls.code}</div>
                              <div className="text-gray-600 dark:text-gray-400">{cls.name}</div>
                              <div className="text-sm text-gray-500">Weight: {cls.weight}%</div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {(Object.keys(STATUS_CONFIG) as ClassStatus[]).map((status) => {
                              const config = STATUS_CONFIG[status];
                              const isSelected = currentStatus === status;
                              
                              return (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(cls.code, status)}
                                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isSelected
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  <span>{config.icon}</span>
                                  <span>{config.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preview when not individual mode */}
              {allDayMode !== 'individual' && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Preview</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      All {dayClasses.length} classes will be marked as:
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {allDayMode === 'all-regular' ? '✅' : 
                         allDayMode === 'all-absence' ? '❌' : '🟢'}
                      </span>
                      <span className="font-medium">
                        {allDayMode === 'all-regular' ? 'Regular' : 
                         allDayMode === 'all-absence' ? 'Absence' : 'Free/No Class'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleCancel}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
