import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticatedUser } from './models';

const TOKEN_KEY = 'suite_token';
const USER_KEY = 'suite_user';
type Profile = Omit<AuthenticatedUser, 'name'> & {
  firstName?: string; lastName?: string; secondLastName?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly user = signal<AuthenticatedUser | null>(this.restore());
  private readonly base = environment.apiBaseUrl + '/auth';

  token(): string | null { return sessionStorage.getItem(TOKEN_KEY); }

  login(username: string, password: string) {
    return this.http.post<{ token: string; user: Profile; passwordChangeRequired?: boolean }>(this.base + '/system-login', {
      username, password, system: environment.systemCode,
    }).pipe(map(response => {
      sessionStorage.setItem(TOKEN_KEY, response.token);
      if (response.passwordChangeRequired) { sessionStorage.removeItem(USER_KEY); this.user.set(null); return { passwordChangeRequired: true }; }
      return { passwordChangeRequired: false, user: this.saveProfile(response.user) };
    }));
  }

  requestPasswordReset(identifier: string) {
    return this.http.post<{message:string}>(this.base + '/password-reset-requests', {identifier, system: environment.systemCode});
  }

  changeRequiredPassword(currentPassword: string, newPassword: string) {
    return this.http.put<void>(this.base + '/required-password', {currentPassword, newPassword}).pipe(tap(() => this.clearSession()));
  }

  me() {
    if (!this.token()) return throwError(() => new HttpErrorResponse({
      status: 401, error: { message: 'Tu sesión no es válida o expiró.' },
    }));
    return this.http.get<Profile>(this.base + '/me').pipe(map(profile => this.saveProfile(profile)));
  }

  clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  logout() { return of(void 0).pipe(tap(() => this.clearSession())); }

  private saveProfile(profile: Profile): AuthenticatedUser {
    if (profile.system !== environment.systemCode) {
      this.clearSession();
      throw new HttpErrorResponse({ status: 403, error: { message: 'La sesión no corresponde a Suite.' } });
    }
    const user: AuthenticatedUser = {
      id: profile.id, username: profile.username,
      name: [profile.firstName, profile.lastName, profile.secondLastName].filter(Boolean).join(' ') || profile.username,
      system: profile.system, roles: profile.roles ?? [], permissions: profile.permissions ?? [],
      systemAdmin: profile.systemAdmin === true,
    };
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
    return user;
  }

  private restore(): AuthenticatedUser | null {
    try {
      if (!sessionStorage.getItem(TOKEN_KEY)) return null;
      const user = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
      if (user?.system === environment.systemCode && typeof user.id === 'string' && typeof user.username === 'string') return user;
    } catch {}
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}
