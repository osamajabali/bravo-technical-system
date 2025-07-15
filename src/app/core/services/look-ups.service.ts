import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Result } from '../models/shared-models/result';
import { HttpService } from './http.service';
import { LookupsResponse } from '../models/shared-models/lookups-response.model';
import { City } from '../models/shared-models/city.model';

@Injectable({
  providedIn: 'root'
})
export class LookUps {
  lookups = signal<LookupsResponse>(new LookupsResponse());

  setLookups(data: LookupsResponse) {
    this.lookups.set(data);
  }

  getLookups() {
    return this.lookups;
  }

  constructor(private apiHlpr: HttpService) { }

  getCities = (countryId: number): Observable<Result<City[]>> => {
    return this.apiHlpr.post<Result<City[]>>(`school/add/get-cities`, {countryId : countryId});
  }

  mainLookups = (): Observable<Result<LookupsResponse>> => {
    return this.apiHlpr.post<Result<LookupsResponse>>(`school/add/get-main-lookups`, null);
  }

  getGrades = (educationalSystemIds : number[]): Observable<Result<any>> => {
    return this.apiHlpr.post<Result<any>>(`school/add/get-grades`, {educationalSystemIds : educationalSystemIds});
  }
}
