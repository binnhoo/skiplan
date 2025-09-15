import { useCalendar } from '../contexts/CalendarContext';
import type { WeekSchedule } from '../types/calendar';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const WeeklySchedule = () => {
  const { state, updateSchedule } = useCalendar();

  const handleClassChange = (
    day: keyof WeekSchedule,
    period: 'morning' | 'afternoon',
    classCode: string
  ) => {
    updateSchedule(day, period, classCode || undefined);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Weekly Schedule</h2>
      
      <div className="space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="grid grid-cols-3 gap-4 items-center">
            <div className="font-medium capitalize">{day}</div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">First Class</label>
              <select
                value={state.semester.weekSchedule[day].morning || ''}
                onChange={(e) => handleClassChange(day, 'morning', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">No class</option>
                {state.classes.map((cls) => (
                  <option key={cls.code} value={cls.code}>
                    {cls.code} - {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Second Class</label>
              <select
                value={state.semester.weekSchedule[day].afternoon || ''}
                onChange={(e) => handleClassChange(day, 'afternoon', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">No class</option>
                {state.classes.map((cls) => (
                  <option key={cls.code} value={cls.code}>
                    {cls.code} - {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};