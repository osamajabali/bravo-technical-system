import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { HttpService } from '../http.service';
import { LogIn } from '../../models/login/login.model';
import { Result } from '../../models/shared-models/result';
import { AccessToken } from '../../models/login/access-token';
import { LoginResponse } from '../../models/login/login-response.model';
import { Permission } from '../../models/shared-models/permission.model';
import { Configurations } from '../../models/login/configrations';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  calledRequests = [];

  constructor(private apiHlpr: HttpService, private router: Router, private http: HttpClient) { }

  login = (obj: LogIn): Observable<Result<LoginResponse>> => {
    return this.apiHlpr.post<Result<any>>(`auth/login`, obj);
  }

  getConfigrations = (): Observable<Result<Configurations>> => {
    return this.apiHlpr.post<Result<Configurations>>(`global/configuration`, null);
  }

  getPermission = (): Observable<Result<Permission>> => {
    return this.apiHlpr.post<Result<Permission>>(`auth/get-permissions`, null);
  }

  setUser = (accessToken: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("_accessToken", accessToken);
    }
  }

  getUser = (): AccessToken | null => {
    return this.isLoggedIn() ? (this.decodeToken()) as unknown as AccessToken : null;
  }

  decodeToken = () =>
    this.isLoggedIn() ? jwtDecode(this.getAccessToken()!) as AccessToken : null;

  isLoggedIn = (): boolean => {
    return typeof window !== 'undefined' && !!localStorage.getItem("_accessToken");
  }


  getAccessToken = (): string | null => {
    return typeof window !== 'undefined' ? localStorage.getItem("_accessToken") : null;
  }

  // // Logout the user and redirect to home
  logout() {
    localStorage.clear();
    localStorage.setItem('sessionMessage', 'Your session has expired.');
    this.router.navigate(['/']);
  }
}
