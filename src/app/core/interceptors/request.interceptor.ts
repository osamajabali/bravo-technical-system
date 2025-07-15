import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../services/login-services/login.service';

export const RequestInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: LoginService = inject(LoginService);
  let token: string | null = null;
  let language = '2'; // Default to English

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('_accessToken');
    const storedLanguage = localStorage.getItem('language'); // Store language preference
    if (storedLanguage === 'ar' || storedLanguage === 'en') {
      language = storedLanguage;
    }
  }

  // Clone the request and add custom headers
  const modifiedRequest = req.clone({
    setHeaders: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Accept-Language': language === 'ar' ? '1' : '2', // Convert language code
      'Login-Type': '1' // ✅ Always send `Login-Type: 1`
    }
  });

  return next(modifiedRequest).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
      }
      return throwError(() => error
      )
    }));

};
