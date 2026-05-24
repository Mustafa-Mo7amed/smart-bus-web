import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
  null,
);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const addToken = (request: HttpRequest<any>, token: string) => {
    return request.clone({
      body: {
        ...request.body,
        token: token,
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
            filter((t) => t !== null),
            take(1),
            switchMap((t) => next(addToken(req, t!))),
          );
        } else {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const oldToken = authService.getToken();
          const refreshToken = authService.getRefreshToken();

          if (oldToken && refreshToken) {
            return authService.refreshToken({ token: oldToken, refreshToken }).pipe(
              switchMap((response) => {
                isRefreshing = false;
                if (response.token && response.refreshToken) {
                  refreshTokenSubject.next(response.token);
                  return next(addToken(req, response.token));
                } else {
                  authService.clearSession();
                  return throwError(() => error);
                }
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                authService.clearSession();
                return throwError(() => refreshError);
              }),
            );
          } else {
            isRefreshing = false;
            authService.clearSession();
            return throwError(() => error);
          }
        }
      }
      return throwError(() => error);
    }),
  );
};
