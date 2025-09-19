import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm',
      className
    )}
    {...props}
  />
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3
    className={cn('font-semibold leading-none tracking-tight text-lg', className)}
    {...props}
  />
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = ({ className, ...props }: CardDescriptionProps) => (
  <p className={cn('text-sm text-slate-500', className)} {...props} />
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };