import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, timer, interval, map, switchMap, delay } from 'rxjs';
import { DashboardStats, RecentActivity, SystemHealth } from '../../../core/models/dashboard/dashboard.model';
@Injectable({ providedIn: 'root' })
export class DashboardService {
    // ============ دیتای پایه ============
    private readonly baseStats: DashboardStats = {
        totalUsers: 12847,
        totalOrders: 3421,
        totalRevenue: 158_600_000,
        activeNow: 342,
        lastUpdated: new Date()
    };

    // ============ استریم زنده "کاربران آنلاین" ============
    // هر ۵ ثانیه با کمی نوسان، آپدیت میشود
    liveActiveUsers(): Observable<number> {
        return interval(500).pipe(
            map(() => {
                const fluctuation = Math.floor(Math.random() * 30) - 15;
                return this.baseStats.activeNow + fluctuation;
            })
        );
    }

    // ============ آمار (با delay واقعگرایانه) ============
    fetchStats(): Observable<DashboardStats> {
        // اگر نکته: در خیلی از بکاندها این خطا ممکن است رخ دهد
        return of({ ...this.baseStats }).pipe(delay(600));
    }


    // ============ فعالیتها ============
    fetchRecentActivities(): Observable<RecentActivity[]> {
        const data: RecentActivity[] = [
            { id: 'a1', type: 'order', user: 'سارا محمدی', action: 'سفارش جدید با کد #ORD-2048 ثبت کرد', time: new Date(Date.now() - 1000 * 60 * 2).toISOString() },   // ۲ دقیقه پیش
            { id: 'a2', type: 'user', user: 'علی رضایی', action: 'کاربر جدید ثبتنام کرد', time: new Date(Date.now() - 1000 * 60 * 15).toISOString() },               // ۱۵ دقیقه پیش
            { id: 'a3', type: 'system', user: 'سیستم', action: 'بکاپ خودکار دیتابیس انجام شد', time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },        // ۳ ساعت پیش
            { id: 'a4', type: 'order', user: 'نگار احمدی', action: 'سفارش #ORD-2099 تأیید شد', time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },        // ۶ ساعت پیش
            { id: 'a5', type: 'user', user: 'حسین کریمی', action: 'حساب کاربری بهروزرسانی شد', time: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },       // ۲۶ ساعت پیش
        ]
        return of(data).pipe(delay(900));
    }

    // ============ سلامت سیستم ============
    fetchSystemHealth(): Observable<SystemHealth> {
        const data: SystemHealth={
            status: 'ok',
            uptimeMinutes: 4_392,
            lastDeploy: new Date('2026-10-15T09:30:00'),
            serverVersion: 'v21.0.3'
        }
        return of(data).pipe(delay(300));
    }

    // ============ شبیهسازی خطای شبکه (برای آموزش Error Handling) ============
    simulateError(): Observable<never> {
        return throwError(() => new Error('ارتباط با سرور قطع شد'));
    }
}
