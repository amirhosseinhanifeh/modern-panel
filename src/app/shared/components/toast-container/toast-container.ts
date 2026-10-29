import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { ToastType } from '../../../core/models/toast/toast.model';

@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  getToastStyles(type: ToastType): { border: string; iconBg: string; text: string } {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/80',
          iconBg: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50',
          text: 'text-emerald-900 dark:text-emerald-200',
        };
      case 'error':
        return {
          border: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/80',
          iconBg: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50',
          text: 'text-rose-900 dark:text-rose-200',
        };
      case 'warning':
        return {
          border: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/80',
          iconBg: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50',
          text: 'text-amber-900 dark:text-amber-200',
        };
      default:
        return {
          border: 'border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/80',
          iconBg: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50',
          text: 'text-indigo-900 dark:text-indigo-200',
        };
    }
  }
}
