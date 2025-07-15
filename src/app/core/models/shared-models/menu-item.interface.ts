export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  children?: MenuItem[];
  expanded?: boolean;
} 

export enum RouteNames {
  QUICK_ACTIONS = 'quick-actions',
  SKILLS = 'skills',
  SKILLS_UNITS = 'features/units',
  ALL_SKILLS = 'features/skills',
  ASSIGNMENTS = 'assignments',
  EXAMS = 'exams',
  STUDENTS = 'features/students',
  NOTIFICATIONS = 'notifications',
  LEVELED_READING = 'features/leveled-reading',
} 