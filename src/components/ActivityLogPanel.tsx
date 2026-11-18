import { useUserLogs } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import type { SiteUser } from '@/types';

type Props = { user: SiteUser };

export function ActivityLogPanel({ user }: Props) {
  const { data: logs, loading, error } = useUserLogs(user.id);

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[#0d1117] overflow-hidden p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-center p-3">
        <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
        <p className="text-[11px] text-ink-muted">Failed to load activity log</p>
        <p className="text-[10px] text-ink-faint mt-1">{error}</p>
      </div>
    );
  }

  const allLogs = [...(logs ?? []), ...user.logs];

  if (allLogs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-center p-3">
        <p className="text-[11px] text-ink-faint">No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed">
        {allLogs.map((log, i) => (
          <LogLine key={log.id} log={log} index={i} />
        ))}
      </div>
    </div>
  );
}

function LogLine({ log, index }: { log: { id: string; datetime: string; actor: string; description: string }; index: number }) {
  return (
    <div
      className="flex items-start gap-0 py-[3px] hover:bg-white/[0.03] rounded px-1 -mx-1 transition-colors animate-fade-in"
      style={{ animationDelay: `${index * 25}ms` }}
    >
      <span className="text-[#4B5563] flex-shrink-0 tabular-nums mr-2">{log.datetime}</span>
      <span className="text-[#374151] flex-shrink-0 mr-2">-</span>
      <span className="text-blue-400 flex-shrink-0 mr-2">{log.actor}</span>
      <span className="text-[#374151] flex-shrink-0 mr-2">-</span>
      <span className="text-[#D1D5DB] break-words">{log.description}</span>
    </div>
  );
}
