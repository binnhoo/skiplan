import { useState } from 'react';
import { useCalendar } from '../contexts/CalendarContext';

export const SemesterConfig = () => {
  const { state, updateSemester } = useCalendar();
  const [startDate, setStartDate] = useState(state.semester.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(state.semester.endDate.split('T')[0]);

  const handleDateChange = () => {
    updateSemester({
      ...state.semester,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Semester Period</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onBlur={handleDateChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onBlur={handleDateChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
};