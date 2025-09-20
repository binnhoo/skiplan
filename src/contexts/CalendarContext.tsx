import { createContext, useContext, useEffect, useState } from 'react';
import { CalendarState, SemesterConfig, WeekSchedule, Class, DayMark } from '../types/calendar';
import { storageService } from '../services/storageService';

type CalendarContextType = {
  state: CalendarState;
  updateSemester: (semester: SemesterConfig) => void;
  updateSchedule: (day: keyof WeekSchedule, period: 'morning' | 'afternoon', classCode: string | undefined) => void;
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
    setState(loadedState);
  }, []);

  const updateSemester = (semester: SemesterConfig) => {
    const newState = {
      ...state,
      semester,
    };
    storageService.setState(newState);
    setState(newState);
  };

  const updateSchedule = (day: keyof WeekSchedule, period: 'morning' | 'afternoon', classCode: string | undefined) => {
    const updatedSchedule = {
      ...state.semester.weekSchedule,
      [day]: {
        ...state.semester.weekSchedule[day],
        [period]: classCode,
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
    const updatedSchedule: WeekSchedule = {
      ...state.semester.weekSchedule,
      monday: { ...state.semester.weekSchedule.monday },
      tuesday: { ...state.semester.weekSchedule.tuesday },
      wednesday: { ...state.semester.weekSchedule.wednesday },
      thursday: { ...state.semester.weekSchedule.thursday },
      friday: { ...state.semester.weekSchedule.friday },
      saturday: { ...state.semester.weekSchedule.saturday },
      sunday: { ...state.semester.weekSchedule.sunday },
    };

    // Remove class from all days
    Object.keys(updatedSchedule).forEach(day => {
      const schedule = updatedSchedule[day as keyof WeekSchedule];
      if (schedule.morning === code) schedule.morning = undefined;
      if (schedule.afternoon === code) schedule.afternoon = undefined;
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
    updateSchedule,
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