import { cx } from '@/lib/utils';

type Props = {
  value?: number;
  className?: string;
  rows?: number;
};

export function Skeleton({ className }: Props) {
  return <div className={cx('skeleton rounded-md', className)} />;
}

export function SkeletonRows({ rows = 3 }: Props) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cx('h-3', i % 2 === 0 ? 'w-full' : 'w-4/5')} />
      ))}
    </div>
  );
}
