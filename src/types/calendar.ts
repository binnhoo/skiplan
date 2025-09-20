export interface Class {
  code: string;
  name: string;
  weight: number;
}

export interface DaySchedule {
  classes: string[]; // Array of class codes
}

export interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export type ClassStatus = 'free' | 'absence' | 'regular';

export interface ClassMark {
  classCode: string;
  status: ClassStatus;
}

export interface DayMark {
  date: string; // ISO date string
  classMarks: ClassMark[]; // Individual status for each class
  allDayFree?: boolean; // Option to mark entire day as free/no class
}

export interface SemesterConfig {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  weekSchedule: WeekSchedule;
}

export interface CalendarState {
  semester: SemesterConfig;
  classes: Class[];
  marks: DayMark[];
}

export type TabType = 'calendar' | 'classes' | 'schedule' | 'semester';