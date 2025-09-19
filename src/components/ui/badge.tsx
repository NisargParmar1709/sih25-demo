import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = ({ className, variant = 'default', size = 'md', ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        {
          // Variants
          'bg-slate-100 text-slate-800 border-slate-200': variant === 'default',
          'bg-slate-50 text-slate-600 border-slate-200': variant === 'secondary',
          'bg-green-100 text-green-800 border-green-200': variant === 'success',
          'bg-yellow-100 text-yellow-800 border-yellow-200': variant === 'warning',
          'bg-red-100 text-red-800 border-red-200': variant === 'error',
          'bg-blue-100 text-blue-800 border-blue-200': variant === 'info',
          // Sizes
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1.5 text-sm': size === 'md',
          'px-4 py-2 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
};

export { Badge };