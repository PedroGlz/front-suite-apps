import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!request.url.startsWith(environment.apiBaseUrl + '/')) return next(request);
  const token = auth.token();
  const login = request.url === environment.apiBaseUrl + '/auth/system-login';
  const authenticated = token && !login
    ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : request;
  return next(authenticated).pipe(catchError(error => {
    if (error.status === 401) {
      auth.clearSession();
      void router.navigateByUrl('/login');
    }
    return throwError(() => error);
  }));
};
