import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Progress({ 
  value, 
  max = 100, 
  className, 
  showLabel = false,
  size = 'md',
  variant = 'default'
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'w-full bg-slate-200 rounded-full overflow-hidden',
        {
          'h-2': size === 'sm',
          'h-3': size === 'md', 
          'h-4': size === 'lg'
        }
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            {
              'bg-indigo-600': variant === 'default',
              'bg-green-500': variant === 'success',
              'bg-yellow-500': variant === 'warning',
              'bg-red-500': variant === 'error'
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-slate-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}