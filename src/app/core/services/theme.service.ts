import { effect, Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root', // سرویس سینگلتون در سطح کل اپلیکیشن
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-preference';

  // خواندن تم ذخیره‌شده از LocalStorage یا پیش‌فرض سیستم عامل
  private getInitialTheme(): AppTheme {
    const saved = localStorage.getItem(this.THEME_KEY) as AppTheme | null;
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // بررسی پیش‌فرض مرورگر کاربر (OS prefers dark)
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // سیگنال وضعیت تم
  readonly theme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    // افکت واکنشی: به ازای هر بار تغییر سیگنال theme اجرا می‌شود
    effect(() => {
      const currentTheme = this.theme();

      // ۱. ذخیره در حافظه مرورگر
      localStorage.setItem(this.THEME_KEY, currentTheme);

      // ۲. اضافه/حذف کلاس dark به تگ <html> برای استایل‌های Tailwind
      const root = document.documentElement;
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    });
  }

  // سوئیچ بین حالت روشن و تاریک
  toggleTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
}
