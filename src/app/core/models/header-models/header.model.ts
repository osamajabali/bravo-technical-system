export class Classes {
    roleId: number; 
    subjectId: number; 
    gradeId: number;
    courseSectionId: number;
  }
  

  export class Grade {
    gradeId: number;
    name: string;
    isSelected: boolean;
  }
  
  export class Section {
    courseSectionId: number;
    name: string;
    isSelected: boolean;
  }
  
  export class Subject {
    subjectId: number;
    name: string;
    isSelected: boolean;
  }
  
  export class ClassesData {
    grades: Grade[];
    courseSections: Section[];
    subjects: Subject[];
  }
  