import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authReq = this.addAuthHeader(req);

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401 || this.isAuthRequest(req) || !this.authService.refreshToken) {
          return throwError(() => error);
        }

        return this.authService.refreshSession().pipe(
          switchMap(() => next.handle(this.addAuthHeader(req))),
          catchError((refreshError) => {
            this.authService.logout();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }

  private addAuthHeader(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = this.authService.token;

    if (!token) {
      return req;
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthRequest(req: HttpRequest<unknown>): boolean {
    return req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh');
  }
}
