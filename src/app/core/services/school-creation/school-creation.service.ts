import { inject, Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { Result } from '../../models/shared-models/result';
import { Observable } from 'rxjs';
import { AddSchoolDetailsRequest } from '../../models/school-creation/add-school-details-request.model';

@Injectable({
  providedIn: 'root'
})
export class SchoolCreationService {
  apiHlpr = inject(HttpService);

  addSchoolDetails = (obj: FormData): Observable<Result<AddSchoolDetailsRequest>> => {
    return this.apiHlpr.post<Result<AddSchoolDetailsRequest>>(`school/add/first-step`, obj);
  }
}
