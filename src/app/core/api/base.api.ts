import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

@Injectable({ providedIn: 'root' })
export abstract class BaseApi {
  protected readonly baseUrl = stripTrailingSlash(environment.baseURL);
  protected readonly http = inject(HttpClient);

  constructor(protected readonly endpointPath: string) {}

  protected buildUrl(path?: string): string {
    const endpointBase = `${this.baseUrl}/${this.endpointPath}`;
    return path ? `${endpointBase}/${path}` : endpointBase;
  }

  protected get<T>(url = '', params?: HttpParams) {
    return this.http.get<T>(this.buildUrl(url), { params });
  }

  protected post<T>(url = '', body: any) {
    return this.http.post<T>(this.buildUrl(url), body);
  }

  protected put<T>(url = '', body: any) {
    return this.http.put<T>(this.buildUrl(url), body);
  }

  protected delete<T>(url = '') {
    return this.http.delete<T>(this.buildUrl(url));
  }
}
