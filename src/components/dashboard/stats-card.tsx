import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className 
}: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium text-slate-700">
            {title}
          </h3>
          {Icon && <Icon className="h-4 w-4 text-slate-500" />}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center space-x-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}