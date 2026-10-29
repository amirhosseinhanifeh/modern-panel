import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // وضعیت لاگین را از سیگنال می‌خوانیم
  if (authService.isAuthenticated()) {
    return true;
  }

  // اگر لاگین نبود، بفرستش به صفحه لاگین همراه با آدرس فعلی (returnUrl)
  return router.createUrlTree(['/admin/login'], {
    queryParams: { returnUrl: state.url },
  });
};
