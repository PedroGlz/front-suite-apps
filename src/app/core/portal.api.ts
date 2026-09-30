import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PortalApplication, Version } from './models';

@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/portal`;

  apps() { return this.http.get<PortalApplication[]>(`${this.base}/apps`, { withCredentials: true }); }
  app(id: string) { return this.http.get<PortalApplication>(`${this.base}/apps/${encodeURIComponent(id)}`, { withCredentials: true }); }
  versions(id: string) { return this.http.get<Version[]>(`${this.base}/apps/${encodeURIComponent(id)}/versions`, { withCredentials: true }); }
  download(id: string) {
    return this.http.get(`${this.base}/downloads/${encodeURIComponent(id)}`, { withCredentials: true, responseType: 'blob' });
  }
}
