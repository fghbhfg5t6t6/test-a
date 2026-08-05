import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { cx } from '@/lib/utils';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-bg-card shadow-[0_24px_64px_rgba(0,0,0,0.7)] p-5">
        <div className="flex items-start gap-3">
          <div className={cx(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            isDanger ? 'bg-red-500/15 ring-1 ring-red-500/30' : 'bg-amber-500/15 ring-1 ring-amber-500/30'
          )}>
            <AlertTriangle className={cx('w-5 h-5', isDanger ? 'text-red-400' : 'text-amber-400')} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-ink-faint hover:text-ink hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cx(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50',
              isDanger
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            )}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
