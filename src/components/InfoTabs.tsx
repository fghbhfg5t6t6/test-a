import { useState, useRef, useCallback } from 'react';
import {
  History, PlusCircle, FolderOpen, Terminal, ShieldAlert,
  RefreshCw, Eye, Loader2, AlertTriangle, ChevronRight, RotateCw,
  Boxes, Camera, Video, Square, Trash2, Key,
  FileCode, Upload, Unlock, Zap, Lock, Check, RotateCcw, Settings2,
} from 'lucide-react';
import type { SiteUser, PowerShellCommand, Screenshot, Recording, ModuleAssignment, ModuleKind } from '@/types';
import { FileExplorer } from './FileExplorer';
import { cx } from '@/lib/utils';
import { modules, moduleKinds, getKeyList } from '@/mockData';

type Props = { user: SiteUser };

const allTabs = ['Module Management', 'Base Information', 'File Explorer', 'Logger', 'PowerShell'] as const;
type TabId = (typeof allTabs)[number];

const fields: { key: keyof SiteUser['baseInfo']; label: string }[] = [
  { key: 'username', label: 'Username' },
  { key: 'domain', label: 'Domain' },
  { key: 'computerName', label: 'Computer Name' },
  { key: 'kernelVersion', label: 'Kernel Version' },
  { key: 'osName', label: 'OS Name' },
  { key: 'buildNumber', label: 'Build Number' },
  { key: 'elevation', label: 'Elevation' },
];

const tabIcons: Record<TabId, typeof History> = {
  'Module Management': Boxes,
  'Base Information': History,
  'File Explorer': FolderOpen,
  'Logger': Camera,
  'PowerShell': Terminal,
};

const kindToTab: Record<ModuleKind, TabId> = {
  'base': 'Base Information',
  'file-explorer': 'File Explorer',
  'logger': 'Logger',
  'powershell': 'PowerShell',
};

export function InfoTabs({ user }: Props) {
  const [assignments, setAssignments] = useState<ModuleAssignment[]>(user.moduleAssignments);
  const [active, setActive] = useState<TabId>('Module Management');

  const loadedKinds = new Set(assignments.filter((a) => a.loaded).map((a) => a.kind));
  const isTabEnabled = (tab: TabId): boolean => {
    if (tab === 'Module Management') return true;
    if (tab === 'Base Information') return loadedKinds.has('base');
    if (tab === 'File Explorer') return loadedKinds.has('file-explorer');
    if (tab === 'Logger') return loadedKinds.has('logger');
    if (tab === 'PowerShell') return loadedKinds.has('powershell');
    return false;
  };

  const lastRecord = user.history[0];
  const [view, setView] = useState<'last' | 'new'>('last');
  const shown = view === 'last' ? lastRecord?.data ?? user.baseInfo : user.baseInfo;

  return (
    <div className="border-t border-border bg-bg-card/90 h-full flex flex-col overflow-hidden">
      <div className="flex items-center overflow-x-auto border-b border-border flex-shrink-0">
        {allTabs.map((t) => {
          const Icon = tabIcons[t];
          const isActive = active === t;
          const enabled = isTabEnabled(t);
          return (
            <button
              key={t}
              onClick={() => enabled && setActive(t)}
              disabled={!enabled}
              className={cx(
                'flex-1 min-w-[110px] flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium transition-all whitespace-nowrap border-b-2',
                isActive
                  ? 'border-brand-primary text-ink bg-brand-primary/10'
                  : enabled
                  ? 'border-transparent text-ink-muted hover:text-ink hover:bg-white/5'
                  : 'border-transparent text-ink-faint/40 cursor-not-allowed bg-white/[0.01]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t}
              {!enabled && <Lock className="w-2.5 h-2.5 ml-0.5 opacity-50" />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden">
        {active === 'Module Management' && (
          <ModuleManagementTab assignments={assignments} setAssignments={setAssignments} onJumpToTab={setActive} />
        )}
        {active === 'Base Information' && (
          <BaseInfoTab user={user} shown={shown} view={view} setView={setView} lastRecord={lastRecord} />
        )}
        {active === 'File Explorer' && (
          <div className="animate-fade-in h-full">
            <FileExplorer files={user.files} />
          </div>
        )}
        {active === 'Logger' && <LoggerTab user={user} />}
        {active === 'PowerShell' && (
          <div className="animate-fade-in h-full">
            <PowerShellTab user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleManagementTab({ assignments, setAssignments, onJumpToTab }: {
  assignments: ModuleAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<ModuleAssignment[]>>;
  onJumpToTab: (tab: TabId) => void;
}) {
  const [selModule, setSelModule] = useState('');
  const [selKeyType, setSelKeyType] = useState<'d' | 'a' | 's'>('d');
  const [selKeyIndex, setSelKeyIndex] = useState(0);
  const [selInterval, setSelInterval] = useState(30);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editKeyType, setEditKeyType] = useState<'d' | 'a' | 's'>('d');
  const [editKeyIndex, setEditKeyIndex] = useState(0);
  const [editInterval, setEditInterval] = useState(30);
  const [applying, setApplying] = useState(false);

  const loadableModules = modules.filter((m) => m.id !== 'mod-base');
  const canLoad = selModule;
  const selKeys = getKeyList(selKeyType);
  const selKeyValue = selKeys[selKeyIndex]?.value ?? '';

  const loadModule = () => {
    if (!canLoad) return;
    setLoading(true);
    setTimeout(() => {
      const kind = moduleKinds[selModule];
      setAssignments((prev) => {
        const existing = prev.find((a) => a.moduleId === selModule);
        if (existing) {
          return prev.map((a) => a.id === existing.id ? { ...a, keyType: selKeyType, keyIndex: selKeyIndex, interval: selInterval, loaded: true } : a);
        }
        return [...prev, {
          id: `ma-${Date.now()}`,
          moduleId: selModule,
          kind,
          keyType: selKeyType,
          keyIndex: selKeyIndex,
          interval: selInterval,
          loaded: true,
        }];
      });
      setLoading(false);
      setSelModule('');
      setSelKeyType('d');
      setSelKeyIndex(0);
      setSelInterval(30);
    }, 1500);
  };

  const freeModule = (assignmentId: string) => {
    setAssignments((prev) => prev.map((a) => a.id === assignmentId ? { ...a, loaded: false } : a));
    if (editId === assignmentId) setEditId(null);
  };

  const resetAllModules = () => {
    setAssignments((prev) => prev.map((a) => a.kind === 'base' ? a : { ...a, loaded: false }));
    setEditId(null);
  };

  const startEdit = (a: ModuleAssignment) => {
    setEditId(editId === a.id ? null : a.id);
    setEditKeyType(a.keyType);
    setEditKeyIndex(a.keyIndex);
    setEditInterval(a.interval);
  };

  const applyEdit = (assignmentId: string) => {
    setApplying(true);
    setTimeout(() => {
      setAssignments((prev) => prev.map((a) => a.id === assignmentId ? { ...a, keyType: editKeyType, keyIndex: editKeyIndex, interval: editInterval } : a));
      setApplying(false);
      setEditId(null);
    }, 1000);
  };

  const selCls = 'w-full h-8 px-2.5 rounded-lg bg-bg-base border border-border text-xs text-ink focus:outline-none focus:border-brand-primary/60 transition-colors';

  return (
    <div className="h-full overflow-y-auto p-3 animate-fade-in">
      {/* Load form */}
      <div className="rounded-xl border border-border bg-bg-card shadow-soft p-3 mb-3">
        <div className="flex items-center gap-2 mb-2.5">
          <Upload className="w-3.5 h-3.5 text-brand-primary" />
          <p className="text-xs font-semibold text-ink">Load Module</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 items-end">
          <div>
            <label className="block text-[10px] text-ink-faint mb-0.5">Module</label>
            <select value={selModule} onChange={(e) => setSelModule(e.target.value)} className={selCls}>
              <option value="">Select…</option>
              {loadableModules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-ink-faint mb-0.5">Key Type</label>
            <div className="flex gap-0.5">
              {(['d', 'a', 's'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => { setSelKeyType(k); setSelKeyIndex(0); }}
                  className={cx(
                    'flex-1 h-8 rounded-md text-[10px] font-semibold uppercase transition-all',
                    selKeyType === k ? 'bg-brand-primary text-white' : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle hover:text-ink'
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-ink-faint mb-0.5">Key Index</label>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelKeyIndex(idx)}
                  title={selKeys[idx]?.value ?? 'No key'}
                  className={cx(
                    'flex-1 h-8 rounded-md text-[10px] font-medium transition-all',
                    selKeyIndex === idx ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40' : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle hover:text-ink'
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-ink-faint mb-0.5">Interval (s)</label>
            <input
              type="number"
              value={selInterval}
              onChange={(e) => setSelInterval(Math.max(1, Number(e.target.value)))}
              min={1}
              className={cx(selCls, 'font-mono')}
            />
          </div>
          <button
            onClick={loadModule}
            disabled={!canLoad || loading}
            className={cx(
              'h-8 inline-flex items-center justify-center gap-1.5 px-2 rounded-lg text-[11px] font-medium transition-all',
              canLoad && !loading
                ? 'bg-brand-primary text-white hover:bg-blue-600'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Load
          </button>
        </div>
        {selKeyValue && (
          <p className="text-[9px] text-ink-faint font-mono mt-1.5 truncate">Selected key: {selKeyValue}</p>
        )}
      </div>

      {/* Loaded modules */}
      <div className="rounded-xl border border-border bg-bg-card shadow-soft p-3">
        <div className="flex items-center gap-2 mb-2">
          <Boxes className="w-3.5 h-3.5 text-emerald-400" />
          <p className="text-xs font-semibold text-ink">Loaded Modules</p>
          <span className="text-[10px] text-ink-faint ml-auto">{assignments.filter((a) => a.loaded).length} active · {assignments.length} total</span>
          <button
            onClick={resetAllModules}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20 transition-colors"
            title="Free all non-base modules"
          >
            <RotateCcw className="w-3 h-3" />Reset All
          </button>
        </div>

        {assignments.length === 0 ? (
          <p className="text-[11px] text-ink-faint text-center py-4">No modules assigned</p>
        ) : (
          <div className="space-y-1.5">
            {assignments.map((a) => {
              const mod = modules.find((m) => m.id === a.moduleId);
              const isBase = a.kind === 'base';
              const keyList = getKeyList(a.keyType);
              const keyValue = keyList[a.keyIndex]?.value ?? '—';
              const isEditing = editId === a.id;
              return (
                <div key={a.id} className={cx(
                  'rounded-lg ring-1 px-2.5 py-2 transition-all',
                  a.loaded ? 'bg-emerald-500/5 ring-emerald-500/20' : 'bg-bg-base/50 ring-border-subtle opacity-50'
                )}>
                  <div className="flex items-center gap-2">
                    <FileCode className={cx('w-3 h-3 flex-shrink-0', a.loaded ? 'text-emerald-400' : 'text-ink-faint')} />
                    <button
                      onClick={() => a.loaded && onJumpToTab(kindToTab[a.kind])}
                      className={cx(
                        'text-xs font-medium flex-1 truncate text-left transition-colors',
                        a.loaded ? 'text-ink hover:text-brand-primary' : 'text-ink-muted cursor-default'
                      )}
                    >
                      {mod?.name ?? a.moduleId}
                      {isBase && <span className="text-[9px] text-brand-primary ml-1.5 px-1 py-0.5 rounded bg-brand-primary/10">BASE</span>}
                    </button>
                    {a.loaded ? (
                      <span className="text-[9px] font-medium text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/15">LOADED</span>
                    ) : (
                      <span className="text-[9px] font-medium text-ink-faint px-1.5 py-0.5 rounded bg-white/5">FREED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-ink-muted mt-1">
                    <span className="inline-flex items-center gap-0.5" title={keyValue}>
                      <Key className="w-2.5 h-2.5" />{a.keyType.toUpperCase()}-K{a.keyIndex + 1}
                    </span>
                    <span className="font-mono truncate max-w-[200px]" title={keyValue}>{keyValue}</span>
                    <span>· {a.interval}s</span>
                  </div>
                  {a.loaded && !isBase && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => startEdit(a)}
                        className={cx(
                          'inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md text-[10px] font-medium transition-colors',
                          isEditing ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/5 text-ink-muted hover:text-ink hover:bg-white/10'
                        )}
                      >
                        <Settings2 className="w-2.5 h-2.5" />Edit
                      </button>
                      <button
                        onClick={() => freeModule(a.id)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md text-[10px] font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/20 transition-colors"
                      >
                        <Unlock className="w-2.5 h-2.5" />Free
                      </button>
                    </div>
                  )}
                  {isEditing && (
                    <div className="mt-2 pt-2 border-t border-border-subtle animate-fade-in space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] text-ink-faint mb-0.5">Key Type</label>
                          <div className="flex gap-0.5">
                            {(['d', 'a', 's'] as const).map((k) => (
                              <button
                                key={k}
                                onClick={() => { setEditKeyType(k); setEditKeyIndex(0); }}
                                className={cx(
                                  'flex-1 h-7 rounded-md text-[10px] font-semibold uppercase transition-all',
                                  editKeyType === k ? 'bg-brand-primary text-white' : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle'
                                )}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-ink-faint mb-0.5">Key Index</label>
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map((idx) => (
                              <button
                                key={idx}
                                onClick={() => setEditKeyIndex(idx)}
                                title={getKeyList(editKeyType)[idx]?.value ?? ''}
                                className={cx(
                                  'flex-1 h-7 rounded-md text-[10px] font-medium transition-all',
                                  editKeyIndex === idx ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40' : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle'
                                )}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-ink-faint mb-0.5">Interval (s)</label>
                          <input
                            type="number"
                            value={editInterval}
                            onChange={(e) => setEditInterval(Math.max(1, Number(e.target.value)))}
                            min={1}
                            className="w-full h-7 px-2 rounded-md bg-bg-base border border-border-subtle text-[10px] font-mono text-ink focus:outline-none focus:border-brand-primary/60"
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-ink-faint font-mono truncate">
                        Key value: {getKeyList(editKeyType)[editKeyIndex]?.value ?? '—'}
                      </p>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditId(null)}
                          className="px-2 py-1 rounded-md text-[10px] font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => applyEdit(a.id)}
                          disabled={applying}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {applying ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
                          Apply Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BaseInfoTab({ user, shown, view, setView, lastRecord }: {
  user: SiteUser;
  shown: SiteUser['baseInfo'];
  view: 'last' | 'new';
  setView: (v: 'last' | 'new') => void;
  lastRecord?: SiteUser['history'][number];
}) {
  const [newIpLoading, setNewIpLoading] = useState(false);
  const [currentIp, setCurrentIp] = useState(user.ip);
  const [suspMode, setSuspMode] = useState<'hidden' | 'last' | 'new'>('hidden');
  const [suspLoading, setSuspLoading] = useState(false);
  const [suspList, setSuspList] = useState(user.suspiciousProcesses);

  const handleNewIp = () => {
    setNewIpLoading(true);
    setTimeout(() => {
      const oct = () => Math.floor(Math.random() * 254 + 1);
      setCurrentIp(`${oct()}.${oct()}.${oct()}.${oct()}`);
      setNewIpLoading(false);
    }, 1500);
  };

  const handleSuspicious = (mode: 'last' | 'new') => {
    if (suspMode === mode) { setSuspMode('hidden'); return; }
    setSuspLoading(true);
    setTimeout(() => {
      if (mode === 'new') {
        const newProcs = user.suspiciousProcesses.map((p, i) => ({
          ...p,
          id: `sp-new-${i}-${Date.now()}`,
          pid: String(Math.floor(Math.random() * 9000 + 1000)),
          cpu: `${(Math.random() * 90 + 5).toFixed(1)}%`,
          memory: `${Math.floor(Math.random() * 500 + 20)} MB`,
          detected: new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16),
        }));
        setSuspList(newProcs);
      } else {
        setSuspList(user.suspiciousProcesses);
      }
      setSuspLoading(false);
      setSuspMode(mode);
    }, 1200);
  };

  return (
    <div className="h-full overflow-y-auto p-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-base/50 ring-1 ring-border-subtle">
              <span className="text-[11px] text-ink-muted">{f.label}</span>
              <span className={cx(
                'text-xs font-medium text-ink font-mono',
                f.key === 'elevation' && shown.elevation === 'Admin' && 'text-amber-400',
                f.key === 'elevation' && shown.elevation === 'System' && 'text-red-400',
              )}>
                {f.key === 'elevation' && shown.elevation === 'Admin' && <ShieldAlert className="w-3 h-3 inline mr-1" />}
                {shown[f.key]}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-base/50 ring-1 ring-border-subtle">
            <span className="text-[11px] text-ink-muted">Current IP Address</span>
            <span className="text-xs font-medium text-ink font-mono">{currentIp}</span>
          </div>

          {suspMode !== 'hidden' && suspList.length > 0 && (
            <div className="mt-3 rounded-lg ring-1 ring-red-500/20 bg-red-950/10 overflow-hidden animate-fade-in">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] font-semibold text-red-400">
                  Suspicious Processes ({suspList.length}) · {suspMode === 'new' ? 'New scan' : 'Last recorded'}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {suspList.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 border-b border-red-500/10 last:border-0">
                    <span className="text-[11px] text-ink font-mono flex-1 truncate">{p.name}</span>
                    <span className="text-[10px] text-ink-faint font-mono w-16">PID: {p.pid}</span>
                    <span className="text-[10px] text-ink-faint font-mono w-12">{p.cpu}</span>
                    <span className="text-[10px] text-ink-faint font-mono hidden sm:block truncate max-w-[160px]">{p.path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-base/50 ring-1 ring-border-subtle">
            <button
              onClick={() => setView('last')}
              className={cx(
                'flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[11px] font-medium transition-all',
                view === 'last' ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40' : 'text-ink-muted hover:text-ink'
              )}
            >
              <History className="w-3.5 h-3.5" />Last
            </button>
            <button
              onClick={() => setView('new')}
              className={cx(
                'flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[11px] font-medium transition-all',
                view === 'new' ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40' : 'text-ink-muted hover:text-ink'
              )}
            >
              <PlusCircle className="w-3.5 h-3.5" />New
            </button>
          </div>
          {view === 'last' && lastRecord && (
            <p className="text-[10px] text-ink-faint text-center">Recorded {lastRecord.timestamp}</p>
          )}

          <div className="space-y-2 mt-2">
            <p className="text-[10px] uppercase tracking-wide text-ink-faint px-1">Actions</p>
            <button
              onClick={handleNewIp}
              disabled={newIpLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 hover:bg-brand-primary/20 transition-all disabled:opacity-50"
            >
              {newIpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Get New IP Address
            </button>
            <button
              onClick={() => handleSuspicious('last')}
              disabled={suspLoading}
              className={cx(
                'w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ring-1 transition-all disabled:opacity-50',
                suspMode === 'last'
                  ? 'bg-red-500/20 text-red-400 ring-red-500/40'
                  : 'bg-red-500/10 text-red-400 ring-red-500/30 hover:bg-red-500/20'
              )}
            >
              {suspLoading && suspMode !== 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              {suspMode === 'last' ? 'Hide Last Suspicious' : 'Show Last Suspicious'}
            </button>
            <button
              onClick={() => handleSuspicious('new')}
              disabled={suspLoading}
              className={cx(
                'w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ring-1 transition-all disabled:opacity-50',
                suspMode === 'new'
                  ? 'bg-amber-500/20 text-amber-400 ring-amber-500/40'
                  : 'bg-amber-500/10 text-amber-400 ring-amber-500/30 hover:bg-amber-500/20'
              )}
            >
              {suspLoading && suspMode === 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              {suspMode === 'new' ? 'Hide New Suspicious' : 'Get New Suspicious'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoggerTab({ user }: { user: SiteUser }) {
  const [section, setSection] = useState<'screenshot' | 'recorder'>('screenshot');
  const [screenshots, setScreenshots] = useState<Screenshot[]>(user.screenshots);
  const [recordings, setRecordings] = useState<Recording[]>(user.recordings);
  const [taking, setTaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recFrames, setRecFrames] = useState<Recording['frames']>([]);
  const [recInterval, setRecInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(user.screenshots[0]?.id ?? null);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(user.recordings[0]?.id ?? null);
  const [leftPct, setLeftPct] = useState(65);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(85, Math.max(30, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  const selectedShot = screenshots.find((s) => s.id === selectedShotId) ?? null;
  const selectedRec = recordings.find((r) => r.id === selectedRecId) ?? null;

  const takeScreenshot = () => {
    setTaking(true);
    setTimeout(() => {
      const shots = [
        'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
      ];
      const newShot: Screenshot = {
        id: `ss-${Date.now()}`,
        timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
        thumbnail: shots[Math.floor(Math.random() * shots.length)],
        width: 1920,
        height: 1080,
      };
      setScreenshots((prev) => [newShot, ...prev]);
      setSelectedShotId(newShot.id);
      setTaking(false);
    }, 1500);
  };

  const startRecording = () => {
    setRecording(true);
    setRecFrames([]);
    const frameShots = [
      'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=200&h=120&fit=crop',
      'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=200&h=120&fit=crop',
      'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=200&h=120&fit=crop',
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=200&h=120&fit=crop',
    ];
    let count = 0;
    const iv = setInterval(() => {
      const frame = {
        id: `frame-${Date.now()}-${count}`,
        timestamp: `00:00:${String(count * 2).padStart(2, '0')}`,
        thumbnail: frameShots[count % frameShots.length],
      };
      setRecFrames((prev) => [...prev, frame]);
      count++;
      if (count >= 20) {
        clearInterval(iv);
        stopRecording();
      }
    }, 500);
    setRecInterval(iv);
  };

  const stopRecording = () => {
    if (recInterval) { clearInterval(recInterval); setRecInterval(null); }
    setRecording(false);
    setRecFrames((prev) => {
      if (prev.length === 0) return prev;
      const newRec: Recording = {
        id: `rec-${Date.now()}`,
        timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
        duration: `00:00:${String(prev.length * 2).padStart(2, '0')}`,
        frames: prev,
        videoUrl: 'https://example.com/recordings/rec.mp4',
        size: `${(prev.length * 0.6).toFixed(1)} MB`,
      };
      setRecordings((r) => [newRec, ...r]);
      setSelectedRecId(newRec.id);
      return [];
    });
  };

  const deleteScreenshot = (id: string) => {
    setScreenshots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (selectedShotId === id) setSelectedShotId(next[0]?.id ?? null);
      return next;
    });
  };
  const deleteRecording = (id: string) => {
    setRecordings((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (selectedRecId === id) setSelectedRecId(next[0]?.id ?? null);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0c0c0c]">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#1a1a1a] bg-[#161616] flex-shrink-0">
        <button
          onClick={() => setSection('screenshot')}
          className={cx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            section === 'screenshot' ? 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          )}
        >
          <Camera className="w-3.5 h-3.5" />Screenshot
        </button>
        <button
          onClick={() => setSection('recorder')}
          className={cx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            section === 'recorder' ? 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          )}
        >
          <Video className="w-3.5 h-3.5" />Screen Recorder
        </button>

        <div className="ml-auto flex items-center gap-2">
          {section === 'screenshot' ? (
            <button
              onClick={takeScreenshot}
              disabled={taking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30 hover:bg-sky-500/20 transition-all disabled:opacity-50"
            >
              {taking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              Take Screenshot
            </button>
          ) : !recording ? (
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/20 transition-all"
            >
              <Square className="w-3 h-3 fill-current" />Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-gray-600/30 text-gray-300 ring-1 ring-gray-500/30 hover:bg-gray-600/40 transition-all"
            >
              <Loader2 className="w-3 h-3 animate-spin" />Stop ({recFrames.length}/20)
            </button>
          )}
          {recording && <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />REC</span>}
        </div>
      </div>

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        <div style={{ width: `${leftPct}%` }} className="flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a1a1a] bg-[#121212] flex-shrink-0">
            {section === 'screenshot' ? <Camera className="w-3.5 h-3.5 text-sky-500" /> : <Video className="w-3.5 h-3.5 text-sky-500" />}
            <span className="text-[11px] font-mono text-gray-400">
              {section === 'screenshot' ? 'Screenshot Preview' : 'Recording Preview'}
            </span>
            {section === 'screenshot' && selectedShot && (
              <span className="text-[10px] font-mono text-gray-600 ml-auto truncate max-w-[200px]">{selectedShot.width}x{selectedShot.height}</span>
            )}
            {section === 'recorder' && selectedRec && (
              <span className="text-[10px] font-mono text-gray-600 ml-auto truncate max-w-[200px]">{selectedRec.duration} · {selectedRec.size}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-[#0a0a0a]">
            {section === 'screenshot' ? (
              !selectedShot ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                  <Camera className="w-8 h-8 mb-2" />
                  <p className="text-[11px] font-mono">No screenshot selected</p>
                </div>
              ) : (
                <div className="animate-fade-in flex flex-col items-center">
                  <img src={selectedShot.thumbnail} alt={selectedShot.timestamp} className="max-w-full max-h-[55vh] rounded-lg ring-1 ring-[#1a1a1a] object-contain" />
                  <p className="text-[10px] font-mono text-gray-500 mt-2">{selectedShot.timestamp}</p>
                </div>
              )
            ) : (
              !selectedRec ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                  <Video className="w-8 h-8 mb-2" />
                  <p className="text-[11px] font-mono">No recording selected</p>
                </div>
              ) : (
                <div className="animate-fade-in flex flex-col items-center">
                  <video controls className="w-full max-h-[50vh] rounded-lg bg-black ring-1 ring-[#1a1a1a]" poster={selectedRec.frames[0]?.thumbnail}>
                    <source src={selectedRec.videoUrl} type="video/mp4" />
                  </video>
                  <p className="text-[10px] font-mono text-gray-500 mt-2">{selectedRec.timestamp} · {selectedRec.frames.length} frames</p>
                </div>
              )
            )}
          </div>
        </div>

        <div
          onMouseDown={onResizeStart}
          className={cx(
            'w-1.5 flex-shrink-0 cursor-col-resize bg-[#1a1a1a] hover:bg-sky-500 transition-colors',
            isDragging && 'bg-sky-500'
          )}
        />

        <div style={{ width: `${100 - leftPct}%` }} className="flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a1a1a] bg-[#121212] flex-shrink-0">
            <History className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-mono text-gray-400">
              {section === 'screenshot' ? `Screenshots (${screenshots.length})` : `Recordings (${recordings.length})`}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {section === 'screenshot' ? (
              screenshots.length === 0 ? (
                <p className="text-[11px] font-mono text-gray-600 text-center py-6">No screenshots</p>
              ) : (
                screenshots.map((ss) => (
                  <button
                    key={ss.id}
                    onClick={() => setSelectedShotId(ss.id)}
                    className={cx(
                      'w-full text-left px-3 py-2 border-b border-[#1a1a1a] transition-colors group flex items-center gap-2',
                      selectedShotId === ss.id ? 'bg-sky-500/10 border-l-2 border-l-sky-400' : 'hover:bg-white/[0.02]'
                    )}
                  >
                    <ChevronRight className={cx('w-3 h-3 flex-shrink-0', selectedShotId === ss.id ? 'text-sky-400' : 'text-gray-600')} />
                    <span className="text-[11px] font-mono text-gray-300 truncate flex-1">{ss.timestamp}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteScreenshot(ss.id); }}
                      className="p-0.5 rounded text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </button>
                ))
              )
            ) : (
              recordings.length === 0 && !recording ? (
                <p className="text-[11px] font-mono text-gray-600 text-center py-6">No recordings</p>
              ) : (
                <>
                  {recording && recFrames.length > 0 && (
                    <div className="px-2 py-2 border-b border-[#1a1a1a] bg-red-500/5">
                      <p className="text-[9px] font-mono text-red-400 uppercase mb-1.5">Live · {recFrames.length} frames</p>
                      <div className="grid grid-cols-6 gap-0.5">
                        {recFrames.map((f, i) => (
                          <div key={f.id} className="relative rounded overflow-hidden ring-1 ring-[#1a1a1a]">
                            <img src={f.thumbnail} alt="" className="w-full h-8 object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 text-[7px] text-white bg-black/60 text-center">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {recordings.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedRecId(rec.id)}
                      className={cx(
                        'w-full text-left px-3 py-2 border-b border-[#1a1a1a] transition-colors group flex items-center gap-2',
                        selectedRecId === rec.id ? 'bg-sky-500/10 border-l-2 border-l-sky-400' : 'hover:bg-white/[0.02]'
                      )}
                    >
                      <ChevronRight className={cx('w-3 h-3 flex-shrink-0', selectedRecId === rec.id ? 'text-sky-400' : 'text-gray-600')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono text-gray-300 truncate">{rec.timestamp}</p>
                        <p className="text-[9px] font-mono text-gray-600">{rec.duration} · {rec.size}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRecording(rec.id); }}
                        className="p-0.5 rounded text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </button>
                  ))}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PowerShellTab({ user }: { user: SiteUser }) {
  const [history, setHistory] = useState<PowerShellCommand[]>(user.powerShellHistory);
  const [selectedId, setSelectedId] = useState<string | null>(user.powerShellHistory[0]?.id ?? null);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [leftPct, setLeftPct] = useState(62);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(85, Math.max(25, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  const selected = history.find((h) => h.id === selectedId);

  const runCommand = () => {
    if (!input.trim() || running) return;
    setRunning(true);
    const cmd = input.trim();
    setInput('');
    setTimeout(() => {
      const fakeOutputs = [
        `Command executed successfully.\nExit code: 0\nDuration: 00:00:01.${Math.floor(Math.random() * 900 + 100)}`,
        `Status   : Running\nPID      : ${Math.floor(Math.random() * 9000 + 1000)}\nCPU      : ${(Math.random() * 20).toFixed(1)}%\nMemory   : ${(Math.random() * 500 + 50).toFixed(0)} MB`,
        `Directory of C:\\Users\\${user.baseInfo.username}\n\n2026-08-02  09:14    <DIR>          Documents\n2026-08-02  09:14    <DIR>          Downloads\n2026-08-01  22:05         4,096  config.json\n2026-07-31  14:27       128,000  report.pdf`,
        `Get-Process output:\nHandles  NPM(K)  CPU(s)    ProcessName\n-------  ------  ------    -----------\n   832      24  1,847.42  miner_helper\n   654      18    892.11  svchost32\n   421      12    124.55  chrome`,
      ];
      const newCmd: PowerShellCommand = {
        id: `ps-${Date.now()}`,
        input: cmd,
        output: fakeOutputs[Math.floor(Math.random() * fakeOutputs.length)],
        timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      };
      setHistory((prev) => [newCmd, ...prev]);
      setSelectedId(newCmd.id);
      setRunning(false);
    }, 1200);
  };

  return (
    <div ref={containerRef} className="flex h-full bg-[#0c0c0c] overflow-hidden">
      <div style={{ width: `${leftPct}%` }} className="flex flex-col overflow-hidden min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a1a1a] bg-[#161616] flex-shrink-0">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-mono text-gray-400">PowerShell Output</span>
          {selected && (
            <span className="text-[10px] font-mono text-gray-600 ml-auto truncate max-w-[200px]">{selected.timestamp}</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <Terminal className="w-8 h-8 mb-2" />
              <p className="text-[11px]">Select a command to view its output</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex items-center gap-1.5 mb-2 text-gray-600">
                <span className="text-sky-500">PS</span>
                <span className="text-gray-500">{'>'}</span>
                <span className="text-gray-300">{selected.input}</span>
              </div>
              <pre className="text-gray-300 whitespace-pre-wrap break-words">{selected.output}</pre>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-[#1a1a1a] bg-[#161616] flex-shrink-0">
          <span className="text-sky-500 font-mono text-[12px]">PS {'>'}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runCommand(); }}
            placeholder="Type a command and press Enter…"
            disabled={running}
            className="flex-1 bg-transparent text-gray-200 font-mono text-[12px] placeholder:text-gray-700 focus:outline-none disabled:opacity-50"
          />
          {running && <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin flex-shrink-0" />}
        </div>
      </div>

      <div
        onMouseDown={onResizeStart}
        className={cx(
          'resize-handle w-1.5 flex-shrink-0 cursor-col-resize bg-[#1a1a1a] hover:bg-sky-500 transition-colors',
          isDragging && 'bg-sky-500 active'
        )}
        title="Drag to resize"
      />

      <div style={{ width: `${100 - leftPct}%` }} className="flex flex-col overflow-hidden min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a1a1a] bg-[#161616] flex-shrink-0">
          <History className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[11px] font-mono text-gray-400">History ({history.length})</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedId(h.id)}
              className={cx(
                'w-full text-left px-3 py-2 border-b border-[#1a1a1a] transition-colors group',
                selectedId === h.id ? 'bg-sky-500/10 border-l-2 border-l-sky-400' : 'hover:bg-white/[0.02]'
              )}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight className={cx('w-3 h-3 flex-shrink-0', selectedId === h.id ? 'text-sky-400' : 'text-gray-600')} />
                <span className="text-[11px] font-mono text-gray-300 truncate flex-1">{h.input}</span>
              </div>
              <p className="text-[9px] text-gray-600 font-mono ml-4.5 truncate">{h.timestamp}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
