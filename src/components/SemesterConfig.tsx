import { useState } from 'react';
import { useCalendar } from '../contexts/CalendarContext';

export const SemesterConfig = () => {
  const { state, updateSemester, updatePercentageColors, resetAllDayMarks } = useCalendar();
  const [startDate, setStartDate] = useState(state.semester.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(state.semester.endDate.split('T')[0]);
  const [minimum, setMinimum] = useState(state.semester.percentageColors?.minimum || 75);
  const [caution, setCaution] = useState(state.semester.percentageColors?.caution || 85);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDateChange = () => {
    updateSemester({
      ...state.semester,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
  };

  const handlePercentageChange = () => {
    // Validate that caution is greater than minimum
    const validMinimum = Math.max(0, Math.min(100, minimum));
    const validCaution = Math.max(validMinimum, Math.min(100, caution));
    
    updatePercentageColors({
      minimum: validMinimum,
      caution: validCaution,
    });
    
    // Update local state with validated values
    setMinimum(validMinimum);
    setCaution(validCaution);
  };

  const handleResetConfirm = () => {
    resetAllDayMarks();
    setShowResetConfirm(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Semester Configuration</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">📅 Semester Period</h3>
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium">🎨 Percentage Color Configuration</h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure the thresholds for color-coding class attendance percentages.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                🔴 Minimum Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={minimum}
                onChange={(e) => setMinimum(Number(e.target.value))}
                onBlur={handlePercentageChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="75"
              />
              <p className="text-xs text-gray-500 mt-1">Below this shows red</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                🟡 Caution Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={caution}
                onChange={(e) => setCaution(Number(e.target.value))}
                onBlur={handlePercentageChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="85"
              />
              <p className="text-xs text-gray-500 mt-1">Below this shows yellow</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Color Preview:</h4>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>≤ {minimum}% (Red)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span>{minimum + 1}% - {caution}% (Yellow)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>&gt; {caution}% (Green)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">🔄 Reset Data</h3>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            Reset all day selections to regular status. This will clear all absence, free day, and holiday markings.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🗑️ Reset All Day Selections
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Reset
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to reset all day selections? This will:
              </p>
              <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Clear all absence markings</li>
                <li>• Remove all free day markings</li>
                <li>• Delete all holiday markings</li>
                <li>• Reset all days to regular status</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleResetCancel}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};