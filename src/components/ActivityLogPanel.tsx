import { activityLogsForUser } from '@/mockData';
import type { SiteUser, ActivityLog } from '@/types';

type Props = { user: SiteUser };

export function ActivityLogPanel({ user }: Props) {
  const logs = activityLogsForUser(user.id);

  return (
    <div className="h-full flex flex-col bg-[#0d1117] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed">
        {logs.map((log, i) => (
          <LogLine key={log.id} log={log} index={i} />
        ))}
      </div>
    </div>
  );
}

function LogLine({ log, index }: { log: ActivityLog; index: number }) {
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
