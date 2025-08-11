import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Result } from '../../models/shared-models/result';
import { HttpService } from '../http.service';
import { LookupItem } from '../../models/shared-models/lookup-item.model';
import { StartNewYearStudentsResponse } from '../../models/new-year/start-new-year.models';

@Injectable({ providedIn: 'root' })
export class NewYearService {
  constructor(private http: HttpService) { }

  getEndedSchools(organizationId: number | null): Observable<Result<LookupItem[]>> {
    const payload = { organizationId: organizationId ?? 0 };
    return this.http.post<Result<LookupItem[]>>(`student/upgrade/get-schools`, payload);
  }

  getOrganizationList(): Observable<Result<LookupItem[]>> {
    return this.http.post<Result<LookupItem[]>>(`student/upgrade/get-organizations`, null);
  }

  getHomeroomsForSchool(schoolId: number, gradeId: number | null): Observable<Result<LookupItem[]>> {
    return this.http.post<Result<LookupItem[]>>(`student/upgrade/get-homerooms`, { schoolId, gradeId: gradeId ?? 0 });
  }

  getSchoolInfo(schoolId: number): Observable<Result<StartNewYearStudentsResponse[]>> {
    return this.http.post<Result<StartNewYearStudentsResponse[]>>(`student/upgrade/get-school-info`, {
      schoolId
    });
  }

  getStartSummary(schoolId: number): Observable<Result<StartNewYearStudentsResponse>> {
    return this.http.post<Result<StartNewYearStudentsResponse>>(`student/upgrade/get-start-summary`, { schoolId });
  }
}
