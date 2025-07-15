import { inject, Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { Result } from '../../models/shared-models/result';
import { Observable } from 'rxjs';
import { AddSchoolDetailsRequest } from '../../models/school-creation/add-school-details-request.model';
import { GradesAndSubjectsRequest } from '../../models/school-creation/grades-and-subjects.model';

@Injectable({
  providedIn: 'root'
})
export class SchoolCreationService {
  apiHlpr = inject(HttpService);

  addSchoolDetails = (obj: FormData): Observable<Result<{newSchoolId : number}>> => {
    return this.apiHlpr.post<Result<{newSchoolId: number}>>(`school/add/first-step`, obj);
  }

  addGradesAndSubjects = (obj: GradesAndSubjectsRequest): Observable<Result<any>> => {
    return this.apiHlpr.post<Result<any>>(`school/add/second-step`, obj);
  }
}
