import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import {
  DashboardStats,
  RecentActivity,
  SystemHealth,
} from '../../../core/models/dashboard/dashboard.model';
import { describe, it, beforeEach, expect } from 'vitest';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService],
    });

    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return stats after 600ms', fakeAsync(() => {
    let stats: DashboardStats | undefined;

    service.fetchStats().subscribe((value) => {
      stats = value;
    });

    expect(stats).toBeUndefined();

    tick(600);

    expect(stats).toEqual(
      expect.objectContaining({
        totalUsers: 12847,
        totalOrders: 3421,
        totalRevenue: 158_600_000,
        activeNow: 342,
      }),
    );
  }));

  it('should return five recent activities after 900ms', fakeAsync(() => {
    let activities: RecentActivity[] | undefined;

    service.fetchRecentActivities().subscribe((value) => {
      activities = value;
    });

    tick(900);

    expect(activities).toBeDefined();
    expect(activities?.length).toBe(5);
    expect(activities?.[0].id).toBe('a1');
  }));

  it('should return system health after 300ms', fakeAsync(() => {
    let health: SystemHealth | undefined;

    service.fetchSystemHealth().subscribe((value) => {
      health = value;
    });

    tick(300);

    expect(health?.status).toBe('ok');
    expect(health?.uptimeMinutes).toBe(4_392);
    expect(health?.serverVersion).toBe('v21.0.3');
  }));

  it('should emit the expected error', () => {
    let receivedError: Error | undefined;

    service.simulateError().subscribe({
      error: (error: Error) => {
        receivedError = error;
      },
    });

    expect(receivedError?.message).toBe('ارتباط با سرور قطع شد');
  });

  it('should emit one active-user value every 500ms', fakeAsync(() => {
    const values: number[] = [];

    const subscription = service.liveActiveUsers().subscribe((value) => {
      values.push(value);
    });

    tick(1_500);

    expect(values.length).toBe(3);

    values.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(327);
      expect(value).toBeLessThanOrEqual(357);
    });

    subscription.unsubscribe();
  }));
});
