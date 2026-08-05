import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/lib/utils';

type Props = {
  label: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
};

export function Tooltip({ label, side = 'top', children }: Props) {
  const pos =
    side === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-1.5'
      : side === 'bottom'
      ? 'top-full left-1/2 -translate-x-1/2 mt-1.5'
      : side === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-1.5'
      : 'right-full top-1/2 -translate-y-1/2 mr-1.5';

  return (
    <span className="tooltip-host relative inline-flex">
      {children}
      <span className={cx('tooltip', pos)}>{label}</span>
    </span>
  );
}

export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef<number>();
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    ref.current = id;
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
