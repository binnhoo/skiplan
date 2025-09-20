import { createContext, useContext, useEffect, useState } from 'react';
import { CalendarState, SemesterConfig, WeekSchedule, Class, DayMark, ClassMark, PercentageColorConfig } from '../types/calendar';
import { storageService } from '../services/storageService';

type CalendarContextType = {
  state: CalendarState;
  updateSemester: (semester: SemesterConfig) => void;
  updateDaySchedule: (day: keyof WeekSchedule, classes: string[]) => void;
  addClass: (newClass: Class) => void;
  removeClass: (code: string) => void;
  updateDayMark: (date: string, classMarks: ClassMark[], allDayFree: boolean) => void;
  updatePercentageColors: (config: PercentageColorConfig) => void;
  resetAllDayMarks: () => void;
  refreshState: () => void;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
  const initialState = storageService.getState();

  const [state, setState] = useState<CalendarState>(initialState);

  useEffect(() => {
    const loadedState = storageService.getState();
    
    // Migrate old mark format to new format
    const migratedMarks: DayMark[] = (loadedState.marks || []).map(mark => {
      // Check if it's the old format
      if ('type' in mark && typeof mark.type === 'string') {
        const oldMark = mark as any;
        return {
          date: mark.date,
          classMarks: [],
          allDayFree: oldMark.type === 'holiday' || oldMark.type === 'free'
        } as DayMark;
      }
      // Already in new format
      return mark as DayMark;
    });
    
    // Migrate old schedule format (morning/afternoon) to new format (classes array)
    const migratedSchedule: WeekSchedule = {} as WeekSchedule;
    let scheduleChanged = false;
    
    Object.entries(loadedState.semester.weekSchedule).forEach(([day, schedule]) => {
      const dayKey = day as keyof WeekSchedule;
      
      // Check if it's the old format with morning/afternoon
      if ('morning' in schedule || 'afternoon' in schedule) {
        const classes: string[] = [];
        if ((schedule as any).morning) classes.push((schedule as any).morning);
        if ((schedule as any).afternoon) classes.push((schedule as any).afternoon);
        
        migratedSchedule[dayKey] = { classes };
        scheduleChanged = true;
      } else {
        // Already in new format or empty
        migratedSchedule[dayKey] = schedule.classes ? schedule : { classes: [] };
      }
    });
    
    // Add default percentage color configuration if not present
    const defaultPercentageColors: PercentageColorConfig = {
      minimum: 75,
      caution: 85
    };

    const migratedState = {
      ...loadedState,
      marks: migratedMarks,
      semester: {
        ...loadedState.semester,
        weekSchedule: migratedSchedule,
        percentageColors: loadedState.semester.percentageColors || defaultPercentageColors
      }
    };
    
    // Save the migrated state if there were changes
    const marksChanged = migratedMarks.length !== (loadedState.marks || []).length || 
                        migratedMarks.some((_, index) => {
                          const oldMark = (loadedState.marks || [])[index];
                          return !oldMark || ('type' in oldMark);
                        });
    const percentageColorsChanged = !loadedState.semester.percentageColors;
    if (marksChanged || scheduleChanged || percentageColorsChanged) {
      storageService.setState(migratedState);
    }
    
    setState(migratedState);
  }, []);

  const updateSemester = (semester: SemesterConfig) => {
    const newState = {
      ...state,
      semester,
    };
    storageService.setState(newState);
    setState(newState);
  };

  const updateDaySchedule = (day: keyof WeekSchedule, classes: string[]) => {
    const updatedSchedule = {
      ...state.semester.weekSchedule,
      [day]: {
        classes: [...classes],
      },
    };

    const newState = {
      ...state,
      semester: {
        ...state.semester,
        weekSchedule: updatedSchedule,
      },
    };
    storageService.setState(newState);
    setState(newState);
  };

  const addClass = (newClass: Class) => {
    if (!state.classes.some(c => c.code === newClass.code)) {
      const newState = {
        ...state,
        classes: [...state.classes, newClass],
      };
      storageService.setState(newState);
      setState(newState);
    }
  };

  const removeClass = (code: string) => {
    const updatedSchedule: WeekSchedule = {} as WeekSchedule;

    // Remove class from all days
    Object.keys(state.semester.weekSchedule).forEach(day => {
      const dayKey = day as keyof WeekSchedule;
      const schedule = state.semester.weekSchedule[dayKey];
      updatedSchedule[dayKey] = {
        classes: schedule.classes.filter(classCode => classCode !== code)
      };
    });

    const newState = {
      ...state,
      classes: state.classes.filter(c => c.code !== code),
      semester: {
        ...state.semester,
        weekSchedule: updatedSchedule,
      },
    };
    storageService.setState(newState);
    setState(newState);
  };

  const updateDayMark = (date: string, classMarks: ClassMark[], allDayFree: boolean) => {
    const marks = [...(state.marks || [])];
    const existingMarkIndex = marks.findIndex(m => m.date === date);
    
    const newMark: DayMark = {
      date,
      classMarks,
      allDayFree
    };
    
    if (existingMarkIndex >= 0) {
      marks[existingMarkIndex] = newMark;
    } else {
      marks.push(newMark);
    }
    
    // Remove mark if it's all regular and not all day free
    const filteredMarks = marks.filter(mark => {
      return mark.allDayFree || 
             (mark.classMarks && mark.classMarks.some(cm => cm.status !== 'regular'));
    });
    
    const newState = {
      ...state,
      marks: filteredMarks,
    };
    storageService.setState(newState);
    setState(newState);
  };

  const updatePercentageColors = (config: PercentageColorConfig) => {
    const newState = {
      ...state,
      semester: {
        ...state.semester,
        percentageColors: config,
      },
    };
    storageService.setState(newState);
    setState(newState);
  };

  const resetAllDayMarks = () => {
    const newState = {
      ...state,
      marks: [], // Clear all day marks, making everything regular
    };
    storageService.setState(newState);
    setState(newState);
  };

  const refreshState = () => {
    const newState = storageService.getState();
    setState(newState);
  };

  const contextValue: CalendarContextType = {
    state,
    updateSemester,
    updateDaySchedule,
    addClass,
    removeClass,
    updateDayMark,
    updatePercentageColors,
    resetAllDayMarks,
    refreshState,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};