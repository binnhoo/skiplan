import { createContext, useContext, useEffect, useState } from 'react';
import { CalendarState, SemesterConfig, WeekSchedule, Class, DayMark } from '../types/calendar';
import { storageService } from '../services/storageService';

type CalendarContextType = {
  state: CalendarState;
  updateSemester: (semester: SemesterConfig) => void;
  updateDaySchedule: (day: keyof WeekSchedule, classes: string[]) => void;
  addClass: (newClass: Class) => void;
  removeClass: (code: string) => void;
  updateMarks: (marks: DayMark[]) => void;
  refreshState: () => void;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
  const initialState = storageService.getState();

  const [state, setState] = useState<CalendarState>(initialState);

  useEffect(() => {
    const loadedState = storageService.getState();
    
    // Migrate any existing 'simulated' marks to 'absence' marks
    const migratedMarks = (loadedState.marks || []).map(mark => ({
      ...mark,
      type: mark.type === 'simulated' ? 'absence' : mark.type
    }));
    
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
    
    const migratedState = {
      ...loadedState,
      marks: migratedMarks,
      semester: {
        ...loadedState.semester,
        weekSchedule: migratedSchedule
      }
    };
    
    // Save the migrated state if there were changes
    const marksChanged = migratedMarks.some((mark, index) => mark.type !== (loadedState.marks || [])[index]?.type);
    if (marksChanged || scheduleChanged) {
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

  const updateMarks = (marks: DayMark[]) => {
    const newState = {
      ...state,
      marks,
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
    updateMarks,
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