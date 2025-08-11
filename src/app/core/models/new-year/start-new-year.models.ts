export interface StartNewYearSchool {
  schoolId: number;
  nameEnglish: string;
  nameArabic: string;
}

export interface StartNewYearGrade {
  gradeId: number;
  nameEnglish: string;
  nameArabic: string;
}

export class StartNewYearStudentsResponse {
  school: StartNewYearSchool;
  gradesList: StartNewYearGrade[];
  numberOfStudents: number;
}


