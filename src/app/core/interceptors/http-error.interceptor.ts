import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = getErrorMessage(error);

      toastService.error(message);

      return throwError(() => error);
    }),
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'ارتباط با سرور برقرار نشد. اتصال اینترنت یا وضعیت سرور را بررسی کنید.';
  }

  switch (error.status) {
    case 400:
      return 'اطلاعات ارسال‌شده معتبر نیست.';

    case 401:
      return 'دسترسی شما منقضی شده است. دوباره وارد شوید.';

    case 403:
      return 'شما اجازه دسترسی به این بخش را ندارید.';

    case 404:
      return 'منبع موردنظر پیدا نشد.';

    case 409:
      return 'این عملیات با وضعیت فعلی سازگار نیست.';

    case 422:
      return 'اطلاعات واردشده قابل پردازش نیست.';

    case 500:
    case 502:
    case 503:
    case 504:
      return 'خطایی در سرور رخ داده است. لطفاً بعداً دوباره تلاش کنید.';

    default:
      return error.error?.message ?? 'خطایی غیرمنتظره رخ داد.';
  }
}
