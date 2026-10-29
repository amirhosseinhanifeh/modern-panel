import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, interval, of, startWith } from 'rxjs';
import { DashboardService } from './dashboard.service';

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: 'order' | 'user' | 'system';
}

@Component({
  selector: 'app-dashboard',
  imports: [StatCard], // 👈 کامپوننت مشترک کارت را وارد کردیم
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
private readonly dashboardService = inject(DashboardService);

  // ============ State مدیریتزنده ============
  readonly statsSignal = toSignal(
    this.dashboardService.fetchStats().pipe(
      catchError(() => of(null))
    ),
    { initialValue: null }
  );
  readonly stats = computed(() => this.statsSignal() ?? {
    totalUsers: 0, totalOrders: 0, totalRevenue: 0, activeNow: 0,
  });

  readonly loadError = signal(false);

  readonly activitiesSignal = toSignal(
    this.dashboardService.fetchRecentActivities().pipe(
      catchError(() => of([]))
    ),
    { initialValue: [] }
  );

  readonly systemHealthSignal = toSignal(
    this.dashboardService.fetchSystemHealth().pipe(
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  // ❤️ استریم زنده کاربران آنلاین (هر ۵ ثانیه)
  readonly activeNow = toSignal(
    this.dashboardService.liveActiveUsers().pipe(startWith(342)),
    { initialValue: 342 }
  );

  // ⏱ سیگنال تایم جاری — برای آپدیت خودکار "۳ دقیقه پیش"
  private readonly tick = toSignal(interval(500), { initialValue: 0 });
  readonly currentTime = computed(() => Date.now());

  // ============ نقشه کارتهای آماری ============
  readonly statItems = computed(() => {
    const s = this.stats();
    return [
      { key: 'users', title: 'کاربران کل', value: this.formatNumber(s.totalUsers), changeRate: '+12.4%', icon: 'users', colorScheme: 'blue' },
      { key: 'orders', title: 'سفارشات', value: this.formatNumber(s.totalOrders), changeRate: '+8.1%', icon: 'bag', colorScheme: 'indigo' },
      { key: 'revenue', title: 'درآمد کل', value: this.formatCurrency(s.totalRevenue), changeRate: '+15.2%', icon: 'coin', colorScheme: 'emerald' },
      { key: 'active', title: 'کاربران آنلاین', value: this.formatNumber(this.activeNow()), changeRate: '+3.7%', icon: 'activity', colorScheme: 'amber' },
    ];
  });

  // ============ Loading & Skeleton ============
  readonly loadingStats = computed(() => this.statsSignal() === null);
  readonly loadingActivities = computed(() => this.activitiesSignal() === null);
  readonly loadingHealth = computed(() => this.systemHealthSignal() === null);

  // ============ فرمتها معرکه ============
  formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  formatCurrency(value: number): string {
    return `${this.formatNumber(value)} تومان`;
  }

  // ثبت: هرچه currentTime() آپدیت شود، relativeShop.size بروز میشود
  relativeTime(iso: string): string {
    // استفاده از currentTime() اینجا باعث میشود effect محاسبه شود
    const now = this.currentTime();
    const diff = now - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'هماکنون';
    if (mins < 60) return `${mins} دقیقه پیش`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ساعت پیش`;
    return `${Math.floor(hrs / 24)} روز پیش`;
  }

  // ============ تعریف انیمیشن تلگرافمانند تعداد بهروز ============
}
