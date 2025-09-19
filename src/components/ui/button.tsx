import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            // Variants
            'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700': variant === 'primary',
            'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400': variant === 'secondary',
            'bg-transparent text-slate-700 border-slate-300 hover:bg-slate-50': variant === 'outline',
            'bg-transparent text-slate-700 border-transparent hover:bg-slate-100': variant === 'ghost',
            'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700': variant === 'danger',
            // Sizes
            'px-3 py-2 text-sm h-9': size === 'sm',
            'px-4 py-2.5 text-sm h-10': size === 'md',
            'px-6 py-3 text-base h-12': size === 'lg',
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };