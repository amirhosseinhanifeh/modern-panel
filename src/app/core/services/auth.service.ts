import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root', // سینگلتون در سطح روت
})
export class AuthService {
  // کلید ذخیره‌سازی در LocalStorage
  private readonly TOKEN_KEY = 'admin_access_token';
  private readonly USER_KEY = 'admin_user_data';

  // State داخلی (Private)
  private readonly _currentUser = signal<AuthUser | null>(this.getStoredUser());
  private readonly _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  // State عمومی و فقط-خواندنی (Read-only Exposure)
  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();

  // سیگنال‌های مشتق‌شده (Computed)
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  login(email: string, role: 'admin' | 'user' = 'admin'): boolean {
    // شبیه‌سازی دریافت دیتا و توکن از بک‌اند
    const mockToken = 'mock-jwt-token-xyz-12345';
    const mockUser: AuthUser = {
      id: 1,
      name: 'مدیر کل سیستم',
      email,
      role,
    };

    // ذخیره در LocalStorage
    localStorage.setItem(this.TOKEN_KEY, mockToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));

    // به‌روزرسانی سیگنال‌ها (ری‌اکتیو شدن کل اپلیکیشن)
    this._token.set(mockToken);
    this._currentUser.set(mockUser);

    return true;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this._token.set(null);
    this._currentUser.set(null);
  }

  private getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
