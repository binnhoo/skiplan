import { useState, useEffect } from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import { DayType, WeekSchedule } from '../types/calendar';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Calendar() {
  const { state, updateMarks } = useCalendar();

  const [isCompactView, setIsCompactView] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const startDate = new Date(state.semester.startDate);
  const endDate = new Date(state.semester.endDate);

  const getMonthsInRange = () => {
    const months = [];
    const current = new Date(startDate);
    current.setDate(1);
    
    while (current <= endDate) {
      if (current.getMonth() === endDate.getMonth() && current.getFullYear() === endDate.getFullYear()) {
        months.push(new Date(current));
        break;
      }
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const monthsInRange = getMonthsInRange();

  useEffect(() => {

    const today = new Date();
    const start = new Date(state.semester.startDate);
    const end = new Date(state.semester.endDate);

    if (today >= start && today <= end) {
      setCurrentDate(today);
    } else {
      setCurrentDate(start);
    }
  }, [state.semester.startDate, state.semester.endDate]);

  const isWithinSemester = (date: Date) => {
    return date >= startDate && date <= endDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isClassDay = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeekSchedule;
    const schedule = state.semester.weekSchedule[dayName];
    return Boolean(schedule.classes && schedule.classes.length > 0);
  };

  const getClassesForDay = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeekSchedule;
    const schedule = state.semester.weekSchedule[dayName];
    const classes: typeof state.classes = [];
    
    if (schedule.classes) {
      schedule.classes.forEach(classCode => {
        const classObj = state.classes.find(c => c.code === classCode);
        if (classObj) classes.push(classObj);
      });
    }
    
    return classes;
  };

  const getDayMark = (date: Date): DayType => {
    const marks = state.marks || [];
    const mark = marks.find(m => new Date(m.date).toDateString() === date.toDateString());
    const storedType = mark?.type || 'regular';
    
    // If stored as 'absence' but date is in future, display as 'simulated'
    if (storedType === 'absence') {
      const now = new Date();
      return date > now ? 'simulated' : 'absence';
    }
    
    return storedType;
  };

  const handleDayClick = (date: Date) => {
    if (!isWithinSemester(date) || !isClassDay(date)) return;

    const currentMark = getDayMark(date);
    let newType: DayType = 'regular';

    switch (currentMark) {
      case 'regular':
        newType = 'holiday';
        break;
      case 'holiday':
        newType = 'absence'; // Always store as 'absence', display logic handles past/future
        break;
      case 'absence':
      case 'simulated':
        newType = 'regular';
        break;
    }

    const marks = [...(state.marks || [])];
    const filteredMarks = marks.filter(m => new Date(m.date).toDateString() !== date.toDateString());
    
    if (newType !== 'regular') {
      filteredMarks.push({ type: newType, date: date.toISOString() });
    }

    updateMarks(filteredMarks);
  };

  const calculateStats = () => {
    const now = new Date();
    let totalDays = 0;
    let availableDays = 0;
    let holidays = 0;
    let absences = 0;
    let simulated = 0;
    let current = new Date(startDate);

    while (current <= endDate) {
      if (isClassDay(current)) {
        const mark = getDayMark(current);
        switch (mark) {
          case 'holiday':
            holidays++;
            break;
          case 'absence':
            absences++;
            totalDays++;
            break;
          case 'simulated':
            simulated++;
            totalDays++;
            break;
          case 'regular':
            totalDays++;
            if (current >= now) {
              availableDays++;
            }
            break;
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return { 
      totalDays, 
      availableDays,
      holidays,
      absences,
      simulated,
      totalAbsences: absences + simulated
    };
  };

  const calculateClassStats = () => {
    const classStats = state.classes
      .map(cls => {
        let remainingPercentage = 100;
        let absenceCount = 0;
        let simulatedCount = 0;
        let totalDays = 0;
        let current = new Date(startDate);

        while (current <= endDate) {
          const mark = getDayMark(current);
          const hasClass = getClassesForDay(current).some(c => c.code === cls.code);
          
          if (hasClass && mark !== 'holiday') {
            totalDays++;
            if (mark === 'absence') {
              remainingPercentage -= cls.weight;
              absenceCount++;
            } else if (mark === 'simulated') {
              remainingPercentage -= cls.weight;
              simulatedCount++;
            }
          }
          current.setDate(current.getDate() + 1);
        }

        return {
          code: cls.code,
          name: cls.name,
          weight: cls.weight,
          remainingPercentage: Math.max(0, remainingPercentage),
          absenceCount,
          simulatedCount,
          totalDays,
        };
      })
      .sort((a, b) => a.code.localeCompare(b.code));

    return classStats;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDay: firstDay.getDay(),
    };
  };

  const getDayClasses = (date: Date, inMonth: boolean) => {
    if (!inMonth) return 'text-gray-400';
    if (!isWithinSemester(date)) return 'text-gray-400';

    const isClass = isClassDay(date);
    const todayClasses = isToday(date) ? 'ring-2 ring-blue-500 ring-inset' : '';
    
    if (!isClass) {
      return `bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed ${todayClasses}`;
    }

    const mark = getDayMark(date);
    const baseClasses = 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 relative';
    
    switch (mark) {
      case 'holiday':
        return `${baseClasses} ${todayClasses} bg-green-100 dark:bg-green-900`;
      case 'absence':
        return `${baseClasses} ${todayClasses} bg-red-100 dark:bg-red-900`;
      case 'simulated':
        return `${baseClasses} ${todayClasses} bg-yellow-100 dark:bg-yellow-900`;
      default:
        return `${baseClasses} ${todayClasses}`;
    }
  };

  const renderMonth = (date: Date) => {
    const { daysInMonth, startingDay } = getDaysInMonth(date);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div key={date.toISOString()} className={`${isCompactView ? 'text-sm' : ''}`}>
        <h3 className="text-lg font-semibold mb-2">
          {MONTHS[date.getMonth()]} {date.getFullYear()}
        </h3>
        <div className={`grid grid-cols-7 gap-1 ${!isCompactView ? 'text-lg' : ''}`}>
          {DAYS.map(day => (
            <div key={day} className="text-center py-1 text-sm font-medium">
              {isCompactView ? day.charAt(0) : day}
            </div>
          ))}
          
          {Array(startingDay).fill(null).map((_, i) => (
            <div key={`empty-start-${i}`} className={`${!isCompactView ? 'p-4' : 'p-2'} text-center`} />
          ))}

          {days.map(day => {
            const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
            return (
              <div
                key={day}
                onClick={() => handleDayClick(currentDate)}
                className={`${!isCompactView ? 'p-4' : 'p-2'} text-center ${getDayClasses(currentDate, true)}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const stats = calculateStats();
  const classStats = calculateClassStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className={`${!isCompactView ? 'lg:col-span-3 xl:col-span-3 2xl:col-span-3' : 'lg:col-span-3'} space-y-6`}>
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <button
              onClick={() => setIsCompactView(false)}
              className={`px-3 py-1 rounded-lg ${!isCompactView ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              Single Month
            </button>
            <button
              onClick={() => setIsCompactView(true)}
              className={`px-3 py-1 rounded-lg ${isCompactView ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              Full Semester
            </button>
          </div>
        </div>

        

        <div className={`grid gap-6 ${isCompactView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {isCompactView
            ? monthsInRange.map(date => renderMonth(date))
            : renderMonth(currentDate)
          }
        </div>

        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 mr-2" />
            Holiday
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900 mr-2" />
            Absence
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 mr-2" />
            Simulated
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 mr-2" />
            No Class
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Statistics:</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Total Class Days:</span>
              <span className="ml-2 font-medium">{stats.totalDays}</span>
            </div>
            <div>
              <span className="text-gray-500">Available Days:</span>
              <span className="ml-2 font-medium">{stats.availableDays}</span>
            </div>
            <div>
              <span className="text-gray-500">Holidays:</span>
              <span className="ml-2 font-medium">{stats.holidays}</span>
            </div>
            <div>
              <span className="text-gray-500">Absences:</span>
              <span className="ml-2 font-medium">{stats.absences}</span>
            </div>
            <div>
              <span className="text-gray-500">Simulated:</span>
              <span className="ml-2 font-medium">{stats.simulated}</span>
            </div>
            <div className="pt-2 border-t dark:border-gray-700">
              <span className="text-gray-500">Total Absences:</span>
              <span className="ml-2 font-medium">{stats.totalAbsences}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Class Percentages:</h3>
          <div className="space-y-4">
            {classStats.map(stat => (
              <div key={stat.code} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>{stat.code} - {stat.name}</span>
                  <div className="text-right">
                    <span className="font-medium">{stat.remainingPercentage.toFixed(1)}%</span>
                    <span className="text-gray-500 text-xs ml-1">(-{(100 - stat.remainingPercentage).toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${stat.remainingPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Weight per class: {stat.weight}%</div>
                  <div>Total class days: {stat.totalDays}</div>
                  <div>Absences: {stat.absenceCount} | Simulated: {stat.simulatedCount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;