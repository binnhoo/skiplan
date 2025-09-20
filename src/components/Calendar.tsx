import { useState, useEffect } from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import { WeekSchedule, ClassStatus, ClassMark } from '../types/calendar';
import { DayManagementModal } from './DayManagementModal';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Calendar() {
  const { state, updateDayMark } = useCalendar();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const getDayMark = (date: Date) => {
    const marks = state.marks || [];
    const mark = marks.find(m => new Date(m.date).toDateString() === date.toDateString());
    return mark || { date: date.toISOString(), classMarks: [], allDayFree: false };
  };

  const getClassStatus = (date: Date, classCode: string): ClassStatus => {
    const dayMark = getDayMark(date);
    if (dayMark.allDayFree) return 'free';
    
    const classMark = dayMark.classMarks?.find(cm => cm.classCode === classCode);
    return classMark?.status || 'regular';
  };

  const handleDayClick = (date: Date) => {
    if (!isWithinSemester(date) || !isClassDay(date)) return;

    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSaveDayMark = (classMarks: ClassMark[], allDayFree: boolean) => {
    if (selectedDate) {
      updateDayMark(selectedDate.toISOString(), classMarks, allDayFree);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    let totalClassDays = 0;
    let availableClassDays = 0;
    let freeDays = 0;
    let totalAbsences = 0;
    let current = new Date(startDate);

    while (current <= endDate) {
      if (isClassDay(current)) {
        const dayMark = getDayMark(current);
        const dayClasses = getClassesForDay(current);
        
        if (dayMark.allDayFree) {
          freeDays++;
        } else {
          dayClasses.forEach(cls => {
            const status = getClassStatus(current, cls.code);
            totalClassDays++;
            
            if (status === 'absence') {
              totalAbsences++;
            } else if (status === 'free') {
              // Individual class marked as free
            } else if (status === 'regular') {
              if (current >= now) {
                availableClassDays++;
              }
            }
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return { 
      totalClassDays, 
      availableClassDays,
      freeDays,
      totalAbsences
    };
  };

  const calculateClassStats = () => {
    const classStats = state.classes
      .map(cls => {
        let remainingPercentage = 100;
        let absenceCount = 0;
        let freeCount = 0;
        let totalDays = 0;
        let current = new Date(startDate);

        while (current <= endDate) {
          const dayMark = getDayMark(current);
          const hasClass = getClassesForDay(current).some(c => c.code === cls.code);
          
          if (hasClass) {
            totalDays++;
            
            if (dayMark.allDayFree) {
              // Entire day marked as free - don't count against percentage
              freeCount++;
            } else {
              const classStatus = getClassStatus(current, cls.code);
              if (classStatus === 'absence') {
                remainingPercentage -= cls.weight;
                absenceCount++;
              } else if (classStatus === 'free') {
                // Individual class marked as free - don't count against percentage
                freeCount++;
              }
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
          freeCount,
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

    const baseClasses = 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 relative overflow-hidden';
    return `${baseClasses} ${todayClasses}`;
  };

  const getDayBackgroundStyle = (date: Date) => {
    if (!isClassDay(date)) return {};
    
    const dayMark = getDayMark(date);
    if (dayMark.allDayFree) {
      return { backgroundColor: 'rgb(34, 197, 94)' }; // Green for all day free
    }
    
    const dayClasses = getClassesForDay(date);
    if (dayClasses.length === 0) return {};
    
    const classStatuses = dayClasses.map(cls => getClassStatus(date, cls.code));
    const freeCount = classStatuses.filter(s => s === 'free').length;
    const absenceCount = classStatuses.filter(s => s === 'absence').length;
    const regularCount = classStatuses.filter(s => s === 'regular').length;
    
    if (absenceCount === dayClasses.length) {
      return { backgroundColor: 'rgb(239, 68, 68)' }; // All red for all absence
    }
    
    if (freeCount === dayClasses.length) {
      return { backgroundColor: 'rgb(34, 197, 94)' }; // All green for all free
    }
    
    if (regularCount === dayClasses.length) {
      return {}; // No background for all regular
    }
    
    // Mixed states - create gradient
    const colors = [];
    let currentPercentage = 0;
    
    if (regularCount > 0) {
      const endPercentage = currentPercentage + (regularCount / dayClasses.length) * 100;
      colors.push(`transparent ${currentPercentage}%, transparent ${endPercentage}%`);
      currentPercentage = endPercentage;
    }
    if (freeCount > 0) {
      const endPercentage = currentPercentage + (freeCount / dayClasses.length) * 100;
      colors.push(`rgb(34, 197, 94) ${currentPercentage}%, rgb(34, 197, 94) ${endPercentage}%`);
      currentPercentage = endPercentage;
    }
    if (absenceCount > 0) {
      const endPercentage = currentPercentage + (absenceCount / dayClasses.length) * 100;
      colors.push(`rgb(239, 68, 68) ${currentPercentage}%, rgb(239, 68, 68) ${endPercentage}%`);
    }
    
    return {
      background: `linear-gradient(45deg, ${colors.join(', ')})`
    };
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
                style={getDayBackgroundStyle(currentDate)}
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
            <div className="w-4 h-4 bg-green-500 mr-2" />
            Free/No Class
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2" />
            Absence
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 mr-2" />
            No Schedule
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Statistics:</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Total Class Days:</span>
              <span className="ml-2 font-medium">{stats.totalClassDays}</span>
            </div>
            <div>
              <span className="text-gray-500">Available Days:</span>
              <span className="ml-2 font-medium">{stats.availableClassDays}</span>
            </div>
            <div>
              <span className="text-gray-500">Free Days:</span>
              <span className="ml-2 font-medium">{stats.freeDays}</span>
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
                  <div>Absences: {stat.absenceCount} | Free: {stat.freeCount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DayManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveDayMark}
        date={selectedDate}
        dayClasses={selectedDate ? getClassesForDay(selectedDate) : []}
        currentClassMarks={selectedDate ? getDayMark(selectedDate).classMarks || [] : []}
        currentAllDayFree={selectedDate ? getDayMark(selectedDate).allDayFree || false : false}
      />
    </div>
  );
}

export default Calendar;