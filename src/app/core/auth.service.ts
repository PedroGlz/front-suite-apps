import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticatedUser } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly user = signal<AuthenticatedUser | null>(null);
  private readonly base = `${environment.apiBaseUrl}/api/auth`;

  login(username: string, password: string) {
    return this.http.post<AuthenticatedUser>(`${this.base}/login`, { username, password }, { withCredentials: true })
      .pipe(tap(user => this.user.set(user)));
  }

  me() {
    return this.http.get<AuthenticatedUser>(`${this.base}/me`, { withCredentials: true })
      .pipe(tap(user => this.user.set(user)));
  }

  logout() {
    return this.http.post<void>(`${this.base}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.user.set(null)));
  }
}
