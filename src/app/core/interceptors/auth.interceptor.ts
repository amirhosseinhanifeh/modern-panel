import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ۱. توکن را مستقیماً از سیگنال سرویس AuthService می‌خوانیم
  const token = authService.token();

  // ۲. ریکوئست‌ها در انگولار Immutable (تغییرناپذیر) هستند.
  // بنابراین به جای تغییر مستقیم req، آن را clone می‌کنیم:
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // ۳. ارسال ریکوئست به مرحله بعد و مدیریت خطاهای سراسری (مثل 401)
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // اگر توکن منقضی شده بود یا دسترسی غیرمجاز بود:
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/admin/login'], {
          queryParams: { returnUrl: router.url },
        });
      }

      // خطای 403 (عدم دسترسی کافی)
      if (error.status === 403) {
        console.error('شما مجوز دسترسی به این بخش را ندارید.');
      }

      return throwError(() => error);
    })
  );
};
