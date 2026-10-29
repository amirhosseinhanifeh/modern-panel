import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
   // 👈 مخزن پیام‌ها به صورت سیگنال غیرقابل تغییر از بیرون
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', title?: string, duration = 4000): void {
    const id = crypto.randomUUID();
    const newToast: Toast = { id, message, type, title, duration };

    this._toasts.update((items: Toast[]) => [...items, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'موفقیت'): void {
    this.show(message, 'success', title);
  }

  error(message: string, title: string = 'خطا'): void {
    this.show(message, 'error', title);
  }

  info(message: string, title: string = 'اطلاعیه'): void {
    this.show(message, 'info', title);
  }

  warning(message: string, title: string = 'هشدار'): void {
    this.show(message, 'warning', title);
  }

  dismiss(id: string): void {
    this._toasts.update((items) => items.filter((t) => t.id !== id));
  }
}
