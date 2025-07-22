import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../http.service';
import { Result } from '../../models/shared-models/result';
import { Observable } from 'rxjs';
import { AddSchoolDetailsRequest } from '../../models/school-creation/add-school-details-request.model';
import { GradesAndSubjectsRequest } from '../../models/school-creation/grades-and-subjects.model';
import { AdminsRequest } from '../../models/school-creation/admin.model';
import { AddTemplate } from '../../models/school-creation/template.model';
import { FileError } from '../../models/school-creation/file-error';

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

  addAdmins = (obj: AdminsRequest): Observable<Result<{fileUrl : string}>> => {
    return this.apiHlpr.post<Result<{fileUrl : string}>>(`school/add/third-step`, obj);
  }

  addSection = (obj: AddTemplate): Observable<Result<FileError>> => {
    return this.apiHlpr.post<Result<FileError>>(`school/add/fourth-step`, obj);
  }

  addTeacher = (obj: AddTemplate): Observable<Result<FileError>> => {
    return this.apiHlpr.post<Result<FileError>>(`school/add/fifth-step`, obj);
  }

  addStudent = (obj: AddTemplate): Observable<Result<FileError>> => {
    return this.apiHlpr.post<Result<FileError>>(`school/add/sixth-step`, obj);
  }

  validateExcel = (obj: FormData): Observable<Result<FileError>> => {
    return this.apiHlpr.post<Result<FileError>>(`school/add/validate-excel`, obj);
  }
}
