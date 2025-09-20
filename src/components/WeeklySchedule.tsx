import { useState } from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import { ClassSelectionModal } from './ClassSelectionModal';
import type { WeekSchedule } from '../types/calendar';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const WeeklySchedule = () => {
  const { state, updateDaySchedule } = useCalendar();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<keyof WeekSchedule | null>(null);

  const handleEditDay = (day: keyof WeekSchedule) => {
    setSelectedDay(day);
    setModalOpen(true);
  };

  const handleSelectClasses = (classes: string[]) => {
    if (selectedDay) {
      updateDaySchedule(selectedDay, classes);
    }
  };

  const handleRemoveClass = (day: keyof WeekSchedule, classCode: string) => {
    const currentClasses = state.semester.weekSchedule[day].classes || [];
    const updatedClasses = currentClasses.filter(code => code !== classCode);
    updateDaySchedule(day, updatedClasses);
  };

  const getClassDetails = (classCode: string) => {
    return state.classes.find(cls => cls.code === classCode);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Weekly Schedule</h2>
        <div className="text-sm text-gray-500">
          Click "Edit" to add or remove classes for each day
        </div>
      </div>
      
      <div className="space-y-4">
        {DAYS.map((day) => {
          const daySchedule = state.semester.weekSchedule[day];
          const classes = daySchedule.classes || [];
          
          return (
            <div key={day} className="border rounded-lg p-4 dark:border-gray-600">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg capitalize">{day}</h3>
                <button
                  onClick={() => handleEditDay(day)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
              </div>
              
              {classes.length === 0 ? (
                <div className="text-gray-500 italic">No classes scheduled</div>
              ) : (
                <div className="space-y-2">
                  {classes.map((classCode, index) => {
                    const classDetails = getClassDetails(classCode);
                    return (
                      <div
                        key={classCode}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {index + 1}. {classCode}
                            {classDetails && ` - ${classDetails.name}`}
                          </div>
                          {classDetails && (
                            <div className="text-sm text-gray-500">
                              Weight: {classDetails.weight}%
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveClass(day, classCode)}
                          className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Remove class"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ClassSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectClasses={handleSelectClasses}
        availableClasses={state.classes}
        currentClasses={selectedDay ? (state.semester.weekSchedule[selectedDay].classes || []) : []}
        dayName={selectedDay || ''}
      />
    </div>
  );
};