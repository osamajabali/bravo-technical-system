import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {
  }

  get<T = any>(url: string, options?: {
    //added prop
    body?: any;
    //added prop
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    context?: HttpContext;
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {

    if (options && options.body) {
      return this.http.get<T>(
        environment.apiUrl + url, {
          ...options,
          params: this.removeNullValuesFromQueryParams(this.mapBodyToQueryParams(options.body))
        }
      );
    } else {
      if (options?.params && options.params instanceof HttpParams) {
        options.params = this.removeNullValuesFromQueryParams(options.params);
      }
      return this.http.get<T>(environment.apiUrl + url, options);
    }
  }

  post<T = any>(url: string, body: any | null, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    context?: HttpContext;
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<any> {
    return this.http.post<T>(environment.apiUrl + url, body, options);
  }

  put<T = any>(url: string, body: any | null, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    context?: HttpContext;
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<any> {
    return this.http.put<T>(environment.apiUrl + url, body, options);
  }

  delete<T = any>(url: string, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    context?: HttpContext;
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
    body?: any | null;
  }): Observable<any> {
    if (options?.params && options.params instanceof HttpParams) {
      options.params = this.removeNullValuesFromQueryParams(options.params);
    }
    return this.http.delete<T>(environment.apiUrl + url, options);
  }

  private removeNullValuesFromQueryParams(params: HttpParams): HttpParams {
    const paramsKeysAux = params.keys();
    paramsKeysAux.forEach((key) => {
      const value = params.get(key);
      if (value === null || value === undefined || value === '' || value === 'undefined' || value === 'null') {
        params['map'].delete(key);
      } else if (this.isDateStringValid(value)) {
        // Check if the value is a date string and convert it to ISO string
        const isoDateString = new Date(value).toISOString();
        params = params.set(key, isoDateString);
      }
    });
    return params;
  }

  private isDateStringValid(dateString: string): boolean {
    const dateRegex = /^[a-zA-Z]{3} [a-zA-Z]{3} \d{1,2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(GMT[+-]\d{2}:\d{2}\)$/;

    return dateRegex.test(dateString);
  }
  private mapBodyToQueryParams = (body: any, httpParams: HttpParams = new HttpParams(), masterKey?: string): HttpParams => {
    Object.keys(body).forEach(key => {
      const value = body[key];
      if (Array.isArray(body[key])) {
        body[key].forEach((element: any) => {
          if (typeof element === 'object') {
            httpParams = this.mapBodyToQueryParams(element, httpParams, masterKey ? `${masterKey}.${key}` : key);
          } else {
            httpParams = httpParams.append(key, element);
          }
        });
      } else if (value !== null && value !== undefined && value !== '' && value !== 'undefined' && value !== 'null') {
        httpParams = httpParams.append(masterKey ? `${masterKey}.` + key : key, value);
      }
    });
    return httpParams;
  };
}
