import { useState } from 'react';
import { X, Key, Unlock, Zap, FileCode, Check, Loader2, RotateCcw } from 'lucide-react';
import type { SiteUser, ModuleAssignment } from '@/types';
import { modules, getKeyList } from '@/mockData';
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
const moduleStartY = 50;
const moduleSpacing = 55;

export function TreeGraph({ user }: Props) {
  const [assignments, setAssignments] = useState<ModuleAssignment[]>(user.moduleAssignments);
  const [popupAssignment, setPopupAssignment] = useState<string | null>(null);

  const baseAssignment = assignments.find((a) => a.kind === 'base');
  const loadedFeatureAssignments = assignments.filter((a) => a.loaded && a.kind !== 'base');
  const popupAssignmentData = assignments.find((a) => a.id === popupAssignment);

  const updateAssignment = (id: string, updates: Partial<ModuleAssignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const freeModule = (id: string) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, loaded: false } : a)));
    setPopupAssignment(null);
  };

  const resetAllModules = () => {
    setAssignments((prev) => prev.map((a) => (a.kind === 'base' ? a : { ...a, loaded: false })));
    setPopupAssignment(null);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-ink">System Map</p>
          <p className="text-[11px] text-ink-muted">
            {user.baseInfo.computerName} · {loadedFeatureAssignments.length} modules loaded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAllModules}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20 transition-colors"
            title="Free all non-base modules"
          >
            <RotateCcw className="w-3 h-3" />Reset All
          </button>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink-faint px-2 py-0.5 rounded-md bg-white/5 ring-1 ring-border-subtle">
            {user.ip}
          </span>
        </div>
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

          {/* Module connections from base node to feature modules */}
          {loadedFeatureAssignments.map((ma, i) => {
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

          {/* Root node — Base Information module */}
          <g
            filter="url(#glow)"
            className="cursor-pointer"
            onClick={() => baseAssignment && setPopupAssignment(baseAssignment.id)}
          >
            <circle cx={rootX} cy={rootY} r={34} fill="#111827" stroke="#2563EB" strokeWidth="2" />
          </g>
          <rect x={rootX - 13} y={rootY - 11} width={26} height={16} rx={2} fill="none" stroke="#60A5FA" strokeWidth={1.3} />
          <line x1={rootX} y1={rootY + 5} x2={rootX} y2={rootY + 10} stroke="#60A5FA" strokeWidth={1.3} />
          <line x1={rootX - 7} y1={rootY + 10} x2={rootX + 7} y2={rootY + 10} stroke="#60A5FA" strokeWidth={1.3} />
          <text x={rootX} y={rootY + 34 + 14} textAnchor="middle" fontSize="10" fill="#F9FAFB" fontWeight="600">Base Info</text>
          <text x={rootX} y={rootY + 34 + 25} textAnchor="middle" fontSize="8.5" fill="#6B7280">{user.baseInfo.computerName}</text>
          <circle cx={rootX + 26} cy={rootY + 26} r={5} fill="#10B981" stroke="#111827" strokeWidth="2" />
          {/* Edit indicator */}
          {baseAssignment && (
            <g className="pointer-events-none">
              <circle cx={rootX - 26} cy={rootY - 26} r={6} fill="#2563EB" stroke="#111827" strokeWidth="1.5" />
              <text x={rootX - 26} y={rootY - 23} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">E</text>
            </g>
          )}

          {/* Feature module nodes */}
          {loadedFeatureAssignments.map((ma, i) => {
            const my = moduleStartY + i * moduleSpacing;
            const mod = modules.find((m) => m.id === ma.moduleId);
            return (
              <g key={`mod-${ma.id}`} className="cursor-pointer" onClick={() => setPopupAssignment(ma.id)}>
                <circle cx={moduleNodeX} cy={my} r={20} fill="#0d1117" stroke="#10B981" strokeWidth="1.5" />
                <rect x={moduleNodeX - 8} y={my - 7} width={16} height={14} rx={2} fill="none" stroke="#10B981" strokeWidth={1} />
                <line x1={moduleNodeX - 5} y1={my - 3} x2={moduleNodeX + 5} y2={my - 3} stroke="#10B981" strokeWidth={0.8} />
                <line x1={moduleNodeX - 5} y1={my} x2={moduleNodeX + 5} y2={my} stroke="#10B981" strokeWidth={0.8} />
                <line x1={moduleNodeX - 5} y1={my + 3} x2={moduleNodeX + 5} y2={my + 3} stroke="#10B981" strokeWidth={0.8} />
                <text x={moduleNodeX + 24} y={my - 2} fontSize="9.5" fill="#F9FAFB" fontWeight="500">{mod?.name ?? ma.moduleId}</text>
                <text x={moduleNodeX + 24} y={my + 9} fontSize="8" fill="#6B7280">{ma.keyType.toUpperCase()}-K{ma.keyIndex + 1} · {ma.interval}s</text>
                <circle cx={moduleNodeX + 16} cy={my + 14} r={3.5} fill="#10B981" stroke="#0d1117" strokeWidth="1.5" />
              </g>
            );
          })}

          {/* Legend */}
          <g>
            <circle cx={16} cy={H - 16} r={4} fill="#2563EB" />
            <text x={24} y={H - 12} fontSize="8.5" fill="#6B7280">Base Module</text>
            <circle cx={110} cy={H - 16} r={4} fill="#10B981" />
            <text x={118} y={H - 12} fontSize="8.5" fill="#6B7280">Feature module loaded</text>
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
  const isBase = assignment.kind === 'base';
  const [editKeyType, setEditKeyType] = useState<'d' | 'a' | 's'>(assignment.keyType);
  const [editKeyIndex, setEditKeyIndex] = useState(assignment.keyIndex);
  const [editInterval, setEditInterval] = useState(assignment.interval);
  const [applying, setApplying] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const keyList = getKeyList(editKeyType);
  const keyValue = keyList[editKeyIndex]?.value ?? '—';
  const inputCls = 'w-full h-8 px-2 rounded-md bg-bg-base border border-border text-[11px] text-ink focus:outline-none focus:border-brand-primary/60 transition-colors';

  const checkChanges = (kt: 'd' | 'a' | 's', ki: number, iv: number) => {
    setHasChanges(kt !== assignment.keyType || ki !== assignment.keyIndex || iv !== assignment.interval);
  };

  const handleKeyType = (k: 'd' | 'a' | 's') => {
    setEditKeyType(k);
    setEditKeyIndex(0);
    checkChanges(k, 0, editInterval);
  };

  const handleKeyIndex = (idx: number) => {
    setEditKeyIndex(idx);
    checkChanges(editKeyType, idx, editInterval);
  };

  const handleInterval = (val: number) => {
    setEditInterval(val);
    checkChanges(editKeyType, editKeyIndex, val);
  };

  const applyChange = () => {
    setApplying(true);
    setTimeout(() => {
      onUpdate({ keyType: editKeyType, keyIndex: editKeyIndex, interval: editInterval });
      setApplying(false);
      setHasChanges(false);
    }, 1000);
  };

  return (
    <div className="absolute top-4 right-4 z-30 w-64 rounded-xl border border-border bg-bg-card shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className={cx(
          'w-8 h-8 rounded-lg flex items-center justify-center ring-1',
          isBase ? 'bg-brand-primary/15 ring-brand-primary/40' : 'bg-emerald-500/15 ring-emerald-500/30'
        )}>
          {isBase ? <FileCode className="w-4 h-4 text-brand-primary" /> : <Zap className="w-4 h-4 text-emerald-400" />}
        </div>
        <div className="leading-tight flex-1 min-w-0">
          <p className="text-xs font-semibold text-ink truncate">
            {mod?.name ?? assignment.moduleId}
            {isBase && <span className="text-[9px] text-brand-primary ml-1.5 px-1 py-0.5 rounded bg-brand-primary/10">BASE</span>}
          </p>
          <p className="text-[10px] text-ink-muted">Module settings</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-ink-faint hover:text-ink hover:bg-white/5 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-medium text-ink-muted mb-1 flex items-center gap-1"><Key className="w-3 h-3" />Key Type</label>
          <div className="flex gap-1">
            {(['d', 'a', 's'] as const).map((k) => (
              <button
                key={k}
                onClick={() => handleKeyType(k)}
                className={cx(
                  'flex-1 h-8 rounded-md text-[10px] font-semibold uppercase transition-all',
                  editKeyType === k ? 'bg-brand-primary text-white' : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle hover:text-ink'
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-ink-muted mb-1">Key Index</label>
          <div className="flex gap-1">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => handleKeyIndex(idx)}
                title={keyList[idx]?.value ?? ''}
                className={cx(
                  'flex-1 h-8 rounded-md text-[10px] font-medium transition-all',
                  editKeyIndex === idx ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40' : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle hover:text-ink'
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-ink-faint font-mono mt-1 truncate" title={keyValue}>Key value: {keyValue}</p>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-ink-muted mb-1">Interval (seconds)</label>
          <input
            type="number"
            value={editInterval}
            onChange={(e) => handleInterval(Math.max(1, Number(e.target.value)))}
            min={1}
            className={cx(inputCls, 'font-mono')}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={applyChange}
            disabled={!hasChanges || applying}
            className={cx(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
              hasChanges && !applying
                ? 'bg-brand-primary text-white hover:bg-blue-600'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Apply Change
          </button>
          {!isBase && (
            <button
              onClick={onFree}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/20 transition-all"
            >
              <Unlock className="w-3.5 h-3.5" />Free
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
