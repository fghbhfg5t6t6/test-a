import type { ReactNode } from 'react';
import { cx } from '@/lib/utils';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-blue-900/40 text-blue-400 ring-1 ring-blue-500/30',
  success: 'bg-emerald-900/40 text-emerald-400 ring-1 ring-emerald-500/30',
  warning: 'bg-amber-900/40 text-amber-400 ring-1 ring-amber-500/30',
  danger: 'bg-red-900/40 text-red-400 ring-1 ring-red-500/30',
  info: 'bg-sky-900/40 text-sky-400 ring-1 ring-sky-500/30',
  muted: 'bg-gray-800 text-gray-400 ring-1 ring-gray-700',
};

type Props = {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
};

export function Badge({ variant = 'muted', children, dot, className }: Props) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cx(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            variant === 'success' && 'bg-emerald-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'primary' && 'bg-blue-400',
            variant === 'info' && 'bg-sky-400',
            variant === 'muted' && 'bg-gray-400'
          )}
        />
      )}
      {children}
    </span>
  );
}
