import type { CalendarState, WeekSchedule } from '../types/calendar';
import defaultDataFile from '../../calendar-data.json';

const STORAGE_KEY = 'calendar-data';

const defaultWeekSchedule: WeekSchedule = {
  monday: {},
  tuesday: {},
  wednesday: {},
  thursday: {},
  friday: {},
  saturday: {},
  sunday: {},
};

function getDefaultSemesterDates(): { startDate: string; endDate: string } {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let startDate: Date;
  let endDate: Date;

  if (currentMonth >= 0 && currentMonth <= 5) {
    // First semester: January to June
    startDate = new Date(currentYear, 0, 1);
    endDate = new Date(currentYear, 5, 30);
  } else if (currentMonth >= 7) {
    // Second semester: August to December
    startDate = new Date(currentYear, 7, 1);
    endDate = new Date(currentYear, 11, 31);
  } else {
    // July - show next semester
    startDate = new Date(currentYear, 7, 1);
    endDate = new Date(currentYear, 11, 31);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
}

const defaultState: CalendarState = {
  semester: {
    ...getDefaultSemesterDates(),
    weekSchedule: defaultWeekSchedule,
  },
  classes: [],
  marks: [],
};

function downloadConfig(state: CalendarState) {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'calendar-data.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function loadFromLocalStorage(): CalendarState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const state = JSON.parse(data);
    return {
      ...defaultState,
      ...state,
      semester: {
        ...defaultState.semester,
        ...state.semester,
        weekSchedule: {
          ...defaultWeekSchedule,
          ...state.semester.weekSchedule,
        },
      },
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

function loadFromBundledFile(): CalendarState | null {
  try {
    const state = defaultDataFile as unknown as CalendarState;
    if (!state) return null;
    return {
      ...defaultState,
      ...state,
      semester: {
        ...defaultState.semester,
        ...state.semester,
        weekSchedule: {
          ...defaultWeekSchedule,
          ...state.semester.weekSchedule,
        },
      },
    };
  } catch {
    return null;
  }
}

function saveToFile(state: CalendarState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export const storageService = {
  getState(): CalendarState {
    const local = loadFromLocalStorage();
    if (local) return local;

    const file = loadFromBundledFile();
    if (file) {
      saveToFile(file);
      return file;
    }

    saveToFile(defaultState);
    return defaultState;
  },

  setState(state: CalendarState): void {
    saveToFile(state);
  },

  downloadConfig(): void {
    const state = this.getState();
    downloadConfig(state);
  },

  uploadConfig(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const state = JSON.parse(content);
          this.setState(state);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },
};