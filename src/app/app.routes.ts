import { Routes } from '@angular/router';
import { AdminLayout } from './core/layout/admin-layout/admin-layout';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ۱. بخش عمومی سایت (MainLayout)
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        // یک کامپوننت برای صفحه اصلی عمومی (مثلاً Home) لود کنید
        // اگر هنوز نساخته‌اید، می‌توانید موقتاً یک کامپوننت ساده بگذارید
        loadComponent: () =>
          import('./features/client/home/home').then((m) => m.Home),
      },
    ],
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/login/login').then((m) => m.Login),
  },
  // ۲. بخش پنل مدیریت (AdminLayout)
  {
    path: 'admin',
    component: AdminLayout,
    canActivate:[authGuard],
    children: [
      // وقتی کاربر فقط /admin زد، به صورت امن ریدایرکت شود به /admin/dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users').then((m) => m.Users),
      },
    ],
  },

  // ۳. آدرس‌های نامعتبر
  {
    path: '**',
    redirectTo: '',
  },
];
