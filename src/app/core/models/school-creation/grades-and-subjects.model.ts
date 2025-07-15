export class GradesAndSubjectsRequest {
  schoolId: number;
  stepNumber: number;
  gradeSubjects: Array<{
    gradeId: number | null;
    subjectIds: number[];
  }> = [{ gradeId: null, subjectIds: [] }];
}
