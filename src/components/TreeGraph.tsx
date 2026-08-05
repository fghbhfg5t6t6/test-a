import { useState } from 'react';
import { X, Server, Key, Unlock, Zap } from 'lucide-react';
import type { SiteUser, ModuleAssignment } from '@/types';
import { modules, servers } from '@/mockData';
import { cx } from '@/lib/utils';

type Props = {
  user: SiteUser;
  onFriendClick?: (id: string) => void;
};

const W = 740;
const H = 340;
const rootX = 120;
const rootY = H / 2;
const moduleNodeX = 440;
const moduleStartY = 60;
const moduleSpacing = 60;

export function TreeGraph({ user }: Props) {
  const [assignments, setAssignments] = useState<ModuleAssignment[]>(user.moduleAssignments);
  const [popupAssignment, setPopupAssignment] = useState<string | null>(null);

  const loadedAssignments = assignments.filter((a) => a.loaded);
  const popupAssignmentData = assignments.find((a) => a.id === popupAssignment);

  const updateAssignment = (id: string, updates: Partial<ModuleAssignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const freeModule = (id: string) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, loaded: false } : a)));
    setPopupAssignment(null);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-ink">System Map</p>
          <p className="text-[11px] text-ink-muted">
            {user.baseInfo.computerName} · {loadedAssignments.length} modules loaded
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink-faint px-2 py-0.5 rounded-md bg-white/5 ring-1 ring-border-subtle">
          {user.ip}
        </span>
      </div>

      <div className="flex-1 min-h-0 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mod-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Module connections */}
          {loadedAssignments.map((ma, i) => {
            const my = moduleStartY + i * moduleSpacing;
            const path = `M ${rootX + 34} ${rootY} L ${moduleNodeX - 20} ${my}`;
            return (
              <g key={`modconn-${ma.id}`}>
                <path d={path} fill="none" stroke="url(#mod-line)" strokeWidth={1.5} />
                <circle r="2.5" fill="#10B981" opacity="0.8">
                  <animateMotion dur={`${1.2 + i * 0.2}s`} repeatCount="indefinite" path={path} />
                </circle>
              </g>
            );
          })}

          {/* Root node (user system) */}
          <g filter="url(#glow)">
            <circle cx={rootX} cy={rootY} r={34} fill="#111827" stroke="#2563EB" strokeWidth="2" />
          </g>
          <rect x={rootX - 13} y={rootY - 11} width={26} height={16} rx={2} fill="none" stroke="#60A5FA" strokeWidth={1.3} />
          <line x1={rootX} y1={rootY + 5} x2={rootX} y2={rootY + 10} stroke="#60A5FA" strokeWidth={1.3} />
          <line x1={rootX - 7} y1={rootY + 10} x2={rootX + 7} y2={rootY + 10} stroke="#60A5FA" strokeWidth={1.3} />
          <text x={rootX} y={rootY + 34 + 14} textAnchor="middle" fontSize="10" fill="#F9FAFB" fontWeight="600">{user.baseInfo.computerName}</text>
          <text x={rootX} y={rootY + 34 + 25} textAnchor="middle" fontSize="8.5" fill="#6B7280">{user.baseInfo.osName}</text>
          <circle cx={rootX + 26} cy={rootY + 26} r={5} fill="#10B981" stroke="#111827" strokeWidth="2" />

          {/* Module nodes */}
          {loadedAssignments.map((ma, i) => {
            const my = moduleStartY + i * moduleSpacing;
            const mod = modules.find((m) => m.id === ma.moduleId);
            const srv = servers.find((s) => s.id === ma.serverId);
            return (
              <g key={`mod-${ma.id}`} className="cursor-pointer" onClick={() => setPopupAssignment(ma.id)}>
                <circle cx={moduleNodeX} cy={my} r={20} fill="#0d1117" stroke="#10B981" strokeWidth="1.5" />
                <rect x={moduleNodeX - 8} y={my - 7} width={16} height={14} rx={2} fill="none" stroke="#10B981" strokeWidth={1} />
                <line x1={moduleNodeX - 5} y1={my - 3} x2={moduleNodeX + 5} y2={my - 3} stroke="#10B981" strokeWidth={0.8} />
                <line x1={moduleNodeX - 5} y1={my} x2={moduleNodeX + 5} y2={my} stroke="#10B981" strokeWidth={0.8} />
                <line x1={moduleNodeX - 5} y1={my + 3} x2={moduleNodeX + 5} y2={my + 3} stroke="#10B981" strokeWidth={0.8} />
                <text x={moduleNodeX + 24} y={my - 2} fontSize="9.5" fill="#F9FAFB" fontWeight="500">{mod?.name ?? ma.moduleId}</text>
                <text x={moduleNodeX + 24} y={my + 9} fontSize="8" fill="#6B7280">{srv?.name ?? '—'} · {ma.keyType.toUpperCase()}-K{ma.keyIndex + 1}</text>
                <circle cx={moduleNodeX + 16} cy={my + 14} r={3.5} fill="#10B981" stroke="#0d1117" strokeWidth="1.5" />
              </g>
            );
          })}

          {/* Legend */}
          <g>
            <circle cx={16} cy={H - 16} r={4} fill="#2563EB" />
            <text x={24} y={H - 12} fontSize="8.5" fill="#6B7280">User System</text>
            <circle cx={110} cy={H - 16} r={4} fill="#10B981" />
            <text x={118} y={H - 12} fontSize="8.5" fill="#6B7280">Module loaded</text>
          </g>
        </svg>

        {/* Module popup */}
        {popupAssignmentData && (
          <ModulePopup
            assignment={popupAssignmentData}
            onUpdate={(updates) => updateAssignment(popupAssignmentData.id, updates)}
            onFree={() => freeModule(popupAssignmentData.id)}
            onClose={() => setPopupAssignment(null)}
          />
        )}
      </div>
    </div>
  );
}

function ModulePopup({ assignment, onUpdate, onFree, onClose }: {
  assignment: ModuleAssignment;
  onUpdate: (updates: Partial<ModuleAssignment>) => void;
  onFree: () => void;
  onClose: () => void;
}) {
  const mod = modules.find((m) => m.id === assignment.moduleId);
  const srv = servers.find((s) => s.id === assignment.serverId);
  const keyList = srv ? (assignment.keyType === 'd' ? srv.dKeys : assignment.keyType === 'a' ? srv.aKeys : srv.sKeys) : [];
  const keyValue = keyList[assignment.keyIndex]?.value ?? '—';
  const inputCls = 'w-full h-8 px-2 rounded-md bg-bg-base border border-border text-[11px] text-ink focus:outline-none focus:border-brand-primary/60 transition-colors';

  return (
    <div className="absolute top-4 right-4 z-30 w-64 rounded-xl border border-border bg-bg-card shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="leading-tight flex-1 min-w-0">
          <p className="text-xs font-semibold text-ink truncate">{mod?.name ?? assignment.moduleId}</p>
          <p className="text-[10px] text-ink-muted">Module settings</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-ink-faint hover:text-ink hover:bg-white/5 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-medium text-ink-muted mb-1 flex items-center gap-1"><Server className="w-3 h-3" />Server</label>
          <select
            value={assignment.serverId}
            onChange={(e) => onUpdate({ serverId: e.target.value })}
            className={inputCls}
          >
            {servers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-ink-muted mb-1 flex items-center gap-1"><Key className="w-3 h-3" />Key</label>
          <div className="flex gap-1">
            {(['d', 'a', 's'] as const).map((k) => (
              <button
                key={k}
                onClick={() => onUpdate({ keyType: k })}
                className={cx(
                  'flex-1 h-8 rounded-md text-[10px] font-semibold uppercase transition-all',
                  assignment.keyType === k ? 'bg-brand-primary text-white' : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle hover:text-ink'
                )}
              >
                {k}
              </button>
            ))}
            <select
              value={assignment.keyIndex}
              onChange={(e) => onUpdate({ keyIndex: Number(e.target.value) })}
              className={cx(inputCls, 'w-12 flex-1')}
              title={keyValue}
            >
              {[0, 1, 2].map((idx) => <option key={idx} value={idx}>{idx + 1}</option>)}
            </select>
          </div>
          <p className="text-[9px] text-ink-faint font-mono mt-1 truncate" title={keyValue}>{keyValue}</p>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-ink-muted mb-1">Interval (seconds)</label>
          <input
            type="number"
            value={assignment.interval}
            onChange={(e) => onUpdate({ interval: Math.max(1, Number(e.target.value)) })}
            min={1}
            className={cx(inputCls, 'font-mono')}
          />
        </div>

        <button
          onClick={onFree}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/20 transition-all"
        >
          <Unlock className="w-3.5 h-3.5" />Free Module
        </button>
      </div>
    </div>
  );
}
