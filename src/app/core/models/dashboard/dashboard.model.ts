export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeNow: number;
  lastUpdated: Date;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'system';
  user: string;
  action: string;
  time: string; // ISO
}

export interface SystemHealth {
  status: 'ok' | 'warning' | 'degraded';
  uptimeMinutes: number;
  lastDeploy: Date;
  serverVersion: string;
}