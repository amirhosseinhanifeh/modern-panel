import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserDto, UsersService } from './users.service';
import { User, PaginatedResponse, HttpState } from '../../../core/models/user/user.model';
import { Modal } from '../../../shared/components/modal/modal';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  catchError,
  tap,
} from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast.service';

type UsersPageState = HttpState<PaginatedResponse<User>>;

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
  readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);
  readonly pageSize = signal(5);
  readonly currentPage = signal(1);
  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);
  // ۱. سیگنالی برای ذخیره ID کاربری که در حال حذف است (برای نمایش لودینگ اختصاصی همان سطر)
  readonly deletingUserId = signal<number | null>(null);

  readonly refreshKey = signal(0);

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly search$ = this.searchControl.valueChanges.pipe(
    startWith(this.searchControl.value),
    debounceTime(350),
    distinctUntilChanged(),
    tap(() => {
      this.currentPage.set(1)
      console.log(this.users())
    }) // ریست به صفحه ۱ با سرچ جدید
  );

  private readonly page$ = toObservable(this.currentPage);
  private readonly refresh$ = toObservable(this.refreshKey);

  // 👈 جریان دادهٔ معماری‌شده: هر خروجی، کل وضعیت را مشخص می‌کند
  private readonly usersState$ = combineLatest({
    page: this.page$,
    search: this.search$,
    refresh: this.refresh$,
  }).pipe(
    switchMap(({ page, search }) =>
      this.usersService.getUsers(page, this.pageSize(), search.trim()).pipe(
        map(
          (response): UsersPageState => ({
            data: response,
            isLoading: false,
            error: null,
          }),
        ),
        startWith<UsersPageState>({
          data: {
            data: [],
            total: 0,
            page: 1,
            limit: this.pageSize(),
          },
          isLoading: true,
          error: null,
        }),
        catchError(() =>
          of<UsersPageState>({
            data: {
              data: [],
              total: 0,
              page: 1,
              limit: this.pageSize(),
            },
            isLoading: false,
            error: 'خطا در برقراری ارتباط با سرور. لطفاً دوباره تلاش کنید.',
          }),
        )
      )
    )
  );

  // 👈 تنها منبع حقیقت (Single Source of Truth) برای کل صفحه
  readonly usersState = toSignal<UsersPageState>(
    this.usersState$
  );

  // 👈 سیگنال‌های مشتق‌شده (Derived State) - کاملاً خواندنی و بدون باگ
  readonly users = computed(() => this.usersState()?.data.data);
  readonly totalUsers = computed(() => this.usersState()?.data.total);
  readonly isLoading = computed(() => this.usersState()?.isLoading);
  readonly errorMessage = computed(() => this.usersState()?.error);
  // ۱. سیگنال نگهداری کاربری که قرار است حذف شود (null یعنی مودال بسته است)
  readonly userToDelete = signal<User | null>(null);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalUsers()! / this.pageSize())),
  );

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1)
  );

  // فرم ثبت کاربر جدید
  readonly userForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    companyName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  fetchUsers(): void {
    this.refreshKey.update((val) => val + 1);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
  }


  closeModal(): void {
    this.isModalOpen.set(false);
  }

  // ۲. متدی که با کلیک روی دکمه سطل‌آشغال جدول صدا زده می‌شود (باز کردن مودال)
  openDeleteModal(user: User): void {
    this.userToDelete.set(user);
  }

  // ۳. بستن مودال تایید
  closeDeleteModal(): void {
    if (this.deletingUserId() !== null) return; // اگر در حال حذف است، اجازه بستن ندهد
    this.userToDelete.set(null);
  }
  // 👈 باز کردن مودال برای ویرایش کاربر موجود
  openEditModal(user: User): void {
    this.editingUser.set(user);

    // مقداردهی اولیه فرم با اطلاعات کاربر انتخابی
    this.userForm.setValue({
      name: user.name,
      username: user.username,
      email: user.email,
      companyName: user.company?.name || '',
    });

    this.isModalOpen.set(true);
  }
  // ۴. تایید نهایی حذف توسط کاربر از داخل مودال
  confirmDelete(): void {
    const targetUser = this.userToDelete();
    if (!targetUser || this.deletingUserId() !== null) return;

    this.deletingUserId.set(targetUser.id);

    this.usersService.deleteUser(targetUser.id).subscribe({
      next: () => {
        this.deletingUserId.set(null);
        this.closeDeleteModal();
                this.toast.success('کاربر حذف شد');
        // بررسی Edge Case: اگر آخرین سطر این صفحه بود، برگرد به صفحه قبلی
        if (this.users()?.length === 1 && this.currentPage() > 1) {
          this.currentPage.update((p) => p - 1);
        } else {
          this.fetchUsers();
        }
      },
      error: (err) => {
        this.deletingUserId.set(null);
        alert('خطا در حذف کاربر. لطفاً مجدداً تلاش کنید.');
        console.error('Delete error:', err);
      },
    });
  }


  readonly editingUser = signal<User | null>(null);

  // 👈 باز کردن مودال برای ایجاد کاربر جدید
  openCreateModal(): void {
    this.editingUser.set(null);
    this.userForm.reset();
    this.isModalOpen.set(true);
  }

  // 👈 مدیریت ارسال فرم برای هر دو حالت (Create یا Edit)
  onSubmitUser(): void {
    if (this.userForm.invalid || this.isSubmitting()) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.userForm.getRawValue();
    const payload: (CreateUserDto) = {
      name: formValue.name,
      username: formValue.username,
      email: formValue.email,
      company: {
        name: formValue.companyName,
        bs: "",
        catchPhrase: ""
      },
      address: {

      },
      phone: "",
      website: ""
    };

    const currentEditingUser = this.editingUser();

    const request$ = currentEditingUser
      ? this.usersService.updateUser(currentEditingUser.id, payload)
      : this.usersService.createUser(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        this.fetchUsers();

        this.toast.success(
          this.editingUser() ? 'اطلاعات کاربر با موفقیت بروزرسانی شد.' : 'کاربر جدید با موفقیت ایجاد شد.'
        );
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toast.error('خطا در ذخیره‌سازی اطلاعات کاربر. لطفاً مجدداً تلاش کنید.');
        console.error('Save user error:', err);
      },
    });

  }
}
