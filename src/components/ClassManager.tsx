import { useState } from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import type { Class } from '../types/calendar';

export const ClassManager = () => {
  const { state, addClass, removeClass } = useCalendar();
  const [newClass, setNewClass] = useState<Partial<Class>>({
    code: '',
    name: '',
    weight: 2.5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClass.code && newClass.name && newClass.weight) {
      addClass({
        code: newClass.code.toUpperCase(),
        name: newClass.name,
        weight: newClass.weight,
      });
      setNewClass({ code: '', name: '', weight: 2.5 });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Class Definitions</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class Code</label>
            <input
              type="text"
              value={newClass.code}
              onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
              placeholder="e.g., A"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              maxLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Class Name</label>
            <input
              type="text"
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              placeholder="e.g., Mathematics"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (%)</label>
            <input
              type="number"
              value={newClass.weight}
              onChange={(e) => setNewClass({ ...newClass, weight: parseFloat(e.target.value) })}
              step="0.5"
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Class
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Defined Classes</h3>
        <div className="grid grid-cols-1 gap-2">
          {state.classes.map((cls) => (
            <div
              key={cls.code}
              className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <span className="font-medium">{cls.code}</span>
                <span className="mx-2">-</span>
                <span>{cls.name}</span>
                <span className="ml-2 text-gray-500">({cls.weight}%)</span>
              </div>
              <button
                onClick={() => removeClass(cls.code)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
