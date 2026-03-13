import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const addToken = (request: any, token: string) => {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  let authReq = req;

  if (token) {
    authReq = addToken(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (isRefreshing) {
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => next(addToken(req, token))),
          );
        } else {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const token = authService.getToken();
          const refreshToken = authService.getRefreshToken();

          if (token && refreshToken) {
            authService.refreshToken({ token, refreshToken }).pipe(
              switchMap((response) => {
                isRefreshing = false;
                if (response.token && response.refreshToken) {
                  refreshTokenSubject.next(response.token);
                  return next(addToken(req, response.token));
                } else {
                  authService.logout();
                  return throwError(() => error);
                }
              }),
            );
          } else {
            isRefreshing = false;
            authService.logout();
            return throwError(() => error);
          }
        }
      }
      return throwError(() => error);
    }),
  );
};
