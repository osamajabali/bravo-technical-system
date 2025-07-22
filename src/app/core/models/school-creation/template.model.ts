export class AddTemplate {
    schoolId: number;
    stepNumber: number;
    isUpdateStep: boolean;
    courseType: number;
    sectionsExcel?: File;
    teachersExcel?: File;
    studentsExcel?: File;
}
export class ValidateTemplate {
    schoolId: number;
    courseType: number;
    excelType: number;
    excelFile: File;
}