import { SystemAnalytics } from '../../types';

interface AdminDashboardKPIProps {
  analytics: SystemAnalytics;
  isKioskMode?: boolean;
}

export function AdminDashboardKPI({ analytics, isKioskMode = false }: AdminDashboardKPIProps) {
  return (
    <div className="flex items-center space-x-6">
      <div>
        <div className={`font-bold ${isKioskMode ? 'text-3xl' : 'text-2xl'}`}>
          {analytics.platform_stats.total_users.toLocaleString()}
        </div>
        <div className={`text-purple-100 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
          Total Users
        </div>
      </div>
      <div>
        <div className={`font-bold ${isKioskMode ? 'text-3xl' : 'text-2xl'}`}>
          {analytics.platform_stats.total_institutions}
        </div>
        <div className={`text-purple-100 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
          Institutions
        </div>
      </div>
      <div>
        <div className={`font-bold ${isKioskMode ? 'text-3xl' : 'text-2xl'}`}>
          {analytics.platform_stats.verification_accuracy}%
        </div>
        <div className={`text-purple-100 ${isKioskMode ? 'text-base' : 'text-sm'}`}>
          Accuracy Rate
        </div>
      </div>
    </div>
  );
}