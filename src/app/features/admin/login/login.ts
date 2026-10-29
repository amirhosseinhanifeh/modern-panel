import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal<string>('admin@domain.com');
  readonly errorMessage = signal<string | null>(null);

  onEmailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  handleLogin(): void {
    if (!this.email().trim()) {
      this.errorMessage.set('لطفاً ایمیل را وارد کنید.');
      return;
    }

    const success = this.authService.login(this.email());
    if (success) {
      // هدایت به آدرسی که کاربر می‌خواست ببیند یا داشبورد
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
      this.router.navigateByUrl(returnUrl);
    }
  }
}
