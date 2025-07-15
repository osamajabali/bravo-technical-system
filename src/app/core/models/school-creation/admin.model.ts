// Admin and AdminRequest models
export class AdminGradeSubject {
    gradeId: number;
    subjectIds: number[];
  }
  
  export class Admin {
    genderId: number;
    nameEnglishFirst: string;
    nameEnglishMiddle?: string;
    nameEnglishLast: string;
    nameArabicFirst: string;
    nameArabicMiddle?: string;
    nameArabicLast: string;
    email?: string;
    phoneNumber?: string;
    gradeSubjects: AdminGradeSubject[];
  }
  
  export class AdminsRequest {
    schoolId: number;
    stepNumber: number;
    isUpdateStep: boolean;
    admins: Admin[];
  }