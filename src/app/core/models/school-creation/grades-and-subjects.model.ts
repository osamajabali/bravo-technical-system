export class GradesAndSubjectsRequest {
  schoolId: number;
  isUpdateStep : boolean = false;
  stepNumber: number;
  gradeSubjects: Array<{
    gradeId: number | null;
    subjectIds: number[];
  }> = [{ gradeId: null, subjectIds: [] }];
}
