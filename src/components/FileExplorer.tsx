import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Folder, FileText, FileSpreadsheet, FileImage, FileArchive,
  FileVideo, FileCode, FileType, ChevronRight, Download, Home, ArrowLeft,
  Archive, ArrowDownUp, X, Loader2, CheckCircle2, FileDown,
  PanelRightClose, PanelRightOpen,
} from 'lucide-react';
import type { FileItem } from '@/types';
import { cx } from '@/lib/utils';

type Props = { files: FileItem[] };

type SortBy = 'name' | 'date' | 'type';
type ProgressTask = {
  id: string;
  name: string;
  kind: 'download' | 'compress';
  progress: number;
  done: boolean;
  result?: string;
};

const iconFor: Record<FileItem['type'], typeof Folder> = {
  folder: Folder,
  pdf: FileType,
  image: FileImage,
  doc: FileText,
  spreadsheet: FileSpreadsheet,
  archive: FileArchive,
  video: FileVideo,
  code: FileCode,
  text: FileText,
};

const colorFor: Record<FileItem['type'], string> = {
  folder: 'text-brand-primary',
  pdf: 'text-red-400',
  image: 'text-emerald-400',
  doc: 'text-sky-400',
  spreadsheet: 'text-amber-400',
  archive: 'text-purple-400',
  video: 'text-pink-400',
  code: 'text-blue-400',
  text: 'text-ink-muted',
};

export function FileExplorer({ files }: Props) {
  const [path, setPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOpen, setSortOpen] = useState(false);
  const [zipTarget, setZipTarget] = useState<FileItem | null>(null);
  const [tasks, setTasks] = useState<ProgressTask[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(220);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  let current: FileItem[] = files;
  let breadcrumbs: { name: string; idx: number }[] = [{ name: 'Home', idx: -1 }];

  for (let i = 0; i < path.length; i++) {
    const found = current.find((f) => f.id === path[i]);
    if (!found) break;
    breadcrumbs.push({ name: found.name, idx: i });
    current = found.children ?? [];
  }

  const sorted = useMemo(() => {
    const items = [...current];
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return b.modified.localeCompare(a.modified);
      return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
    });
    return items;
  }, [current, sortBy]);

  const navigateTo = (idx: number) => {
    setPath(idx === -1 ? [] : path.slice(0, idx + 1));
    setSelected(null);
  };

  const openFolder = (item: FileItem) => {
    if (item.type !== 'folder') return;
    setPath([...path, item.id]);
    setSelected(null);
  };

  const goBack = () => {
    if (path.length > 0) {
      setPath(path.slice(0, -1));
      setSelected(null);
    }
  };

  const startDownload = (item: FileItem) => {
    const taskId = `dl-${Date.now()}-${item.id}`;
    setTasks((prev) => [...prev, { id: taskId, name: item.name, kind: 'download', progress: 0, done: false }]);
  };

  const startCompress = (item: FileItem, level: number, parts: number) => {
    const taskId = `zip-${Date.now()}-${item.id}`;
    const partLabel = parts > 1 ? `${parts} parts` : 'single';
    setTasks((prev) => [...prev, { id: taskId, name: `${item.name}.zip`, kind: 'compress', progress: 0, done: false, result: `Level ${level} · ${partLabel}` }]);
  };

  useEffect(() => {
    const active = tasks.filter((t) => !t.done);
    if (active.length === 0) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.done) return t;
            const next = Math.min(100, t.progress + Math.random() * 12 + 5);
            return { ...t, progress: next, done: next >= 100 };
          })
        );
      }, 400);
    }
    return () => {
      if (tasks.every((t) => t.done) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tasks]);

  const clearTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.right - ev.clientX;
      setPanelWidth(Math.min(360, Math.max(160, w)));
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

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      {/* Main file area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
          <button
            onClick={goBack}
            disabled={path.length === 0}
            className={cx(
              'p-1 rounded-md transition-colors',
              path.length > 0 ? 'text-ink-muted hover:text-ink hover:bg-white/5' : 'text-ink-faint cursor-not-allowed'
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
            {breadcrumbs.map((bc, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                {i === 0 ? (
                  <button onClick={() => navigateTo(-1)} className="p-0.5 rounded text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
                    <Home className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigateTo(bc.idx)}
                    className={cx(
                      'text-[11px] px-1.5 py-0.5 rounded transition-colors',
                      i === breadcrumbs.length - 1 ? 'text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-white/5'
                    )}
                  >
                    {bc.name}
                  </button>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-ink-faint flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setSortOpen((o) => !o)}
              onBlur={() => setTimeout(() => setSortOpen(false), 150)}
              className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium text-ink-muted hover:text-ink hover:bg-white/5 transition-colors"
            >
              <ArrowDownUp className="w-3 h-3" />
              {sortBy === 'name' ? 'Name' : sortBy === 'date' ? 'Date' : 'Type'}
            </button>
            {sortOpen && (
              <div className="absolute top-full right-0 mt-1 z-20 min-w-[120px] rounded-lg bg-bg-elevated border border-border shadow-soft py-1 animate-fade-in">
                {(['name', 'date', 'type'] as SortBy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSortBy(s); setSortOpen(false); }}
                    className={cx(
                      'w-full text-left px-3 py-1.5 text-[11px] capitalize transition-colors',
                      sortBy === s ? 'text-brand-primary bg-brand-primary/10' : 'text-ink-muted hover:text-ink hover:bg-white/5'
                    )}
                  >
                    Sort by {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle transfers panel */}
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-white/5 transition-colors flex-shrink-0"
            title={panelOpen ? 'Hide transfers' : 'Show transfers'}
          >
            {panelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Column headers */}
        <div className="flex items-center px-3 py-1.5 border-b border-border-subtle text-[10px] uppercase tracking-wide text-ink-faint flex-shrink-0">
          <span className="flex-1">Name</span>
          <span className="w-20 text-right">Size</span>
          <span className="w-32 text-right hidden sm:block">Modified</span>
          <span className="w-20 text-right">Actions</span>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="w-8 h-8 text-ink-faint mb-2" />
              <p className="text-xs text-ink-muted">This folder is empty</p>
            </div>
          ) : (
            sorted.map((item) => {
              const Icon = iconFor[item.type];
              const isFolder = item.type === 'folder';
              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  onDoubleClick={() => openFolder(item)}
                  className={cx(
                    'group flex items-center px-3 py-2 cursor-default transition-colors border-b border-border-subtle/50',
                    selected === item.id ? 'bg-brand-primary/10 ring-1 ring-brand-primary/20' : 'hover:bg-white/[0.02]'
                  )}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Icon className={cx('w-4 h-4 flex-shrink-0', colorFor[item.type])} />
                    <button
                      onClick={(e) => { e.stopPropagation(); isFolder ? openFolder(item) : setSelected(item.id); }}
                      className="text-xs text-ink truncate text-left hover:text-brand-primary transition-colors"
                    >
                      {item.name}
                    </button>
                  </div>
                  <span className="w-20 text-right text-[11px] text-ink-muted font-mono">{item.size}</span>
                  <span className="w-32 text-right text-[11px] text-ink-faint font-mono hidden sm:block">{item.modified}</span>
                  <div className="w-20 flex justify-end gap-1">
                    {!isFolder && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startDownload(item); }}
                        className="p-1 rounded-md text-ink-muted hover:text-brand-primary hover:bg-white/5 transition-colors"
                        title={`Download ${item.name}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setZipTarget(item); }}
                      className="p-1 rounded-md text-ink-muted hover:text-amber-400 hover:bg-white/5 transition-colors"
                      title={`Zip ${item.name}`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-border-subtle text-[10px] text-ink-faint flex-shrink-0">
          <span>{sorted.length} item{sorted.length !== 1 ? 's' : ''}</span>
          {selected && (
            <span className="text-ink-muted">{sorted.find((f) => f.id === selected)?.name} selected</span>
          )}
        </div>
      </div>

      {/* Resize handle */}
      {panelOpen && (
        <div
          onMouseDown={onResizeStart}
          className={cx(
            'w-1 flex-shrink-0 cursor-col-resize bg-border hover:bg-brand-primary transition-colors',
            isDragging && 'bg-brand-primary'
          )}
        />
      )}

      {/* Transfers panel (right side) */}
      {panelOpen && (
        <div style={{ width: `${panelWidth}px` }} className="flex-shrink-0 flex flex-col border-l border-border bg-bg-base/60 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border-subtle flex-shrink-0">
            <Loader2 className={cx('w-3 h-3 text-ink-muted', tasks.some((t) => !t.done) && 'animate-spin text-brand-primary')} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Transfers</span>
            <span className="text-[9px] text-ink-faint ml-1">{tasks.filter((t) => !t.done).length} active · {tasks.filter((t) => t.done).length} done</span>
            {tasks.length > 0 && (
              <button
                onClick={() => setTasks((prev) => prev.filter((t) => !t.done))}
                className="ml-auto text-[9px] text-ink-faint hover:text-ink transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-1.5">
            {tasks.length === 0 ? (
              <p className="text-[10px] text-ink-faint text-center py-4">No active transfers</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex flex-col gap-1 py-1.5 px-1 border-b border-border-subtle/30 last:border-0">
                  <div className="flex items-center gap-1.5">
                    {task.done ? (
                      <CheckCircle2 className="w-3 h-3 text-brand-success flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-3 h-3 text-brand-primary animate-spin flex-shrink-0" />
                    )}
                    <span className="text-[9px] text-ink-muted flex-shrink-0">{task.kind === 'download' ? 'DL' : 'ZIP'}</span>
                    <span className="text-[10px] text-ink flex-1 truncate">{task.name}</span>
                    <span className="text-[9px] text-ink-faint tabular-nums">{Math.round(task.progress)}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-bg-base overflow-hidden">
                    <div
                      className={cx('h-full rounded-full transition-all', task.done ? 'bg-brand-success' : 'bg-brand-primary')}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  {task.done && (
                    <div className="flex items-center gap-1">
                      {task.kind === 'compress' && (
                        <button
                          onClick={() => startDownload({ id: task.id, name: task.name, type: 'archive', size: '—', modified: '' })}
                          className="p-0.5 rounded text-brand-primary hover:bg-white/5 transition-colors"
                          title="Download zip"
                        >
                          <FileDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => clearTask(task.id)}
                        className="p-0.5 rounded text-ink-faint hover:text-ink hover:bg-white/5 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Zip modal */}
      {zipTarget && (
        <ZipModal
          item={zipTarget}
          onClose={() => setZipTarget(null)}
          onConfirm={(level, parts) => { startCompress(zipTarget, level, parts); setZipTarget(null); }}
        />
      )}
    </div>
  );
}

function ZipModal({ item, onClose, onConfirm }: {
  item: FileItem;
  onClose: () => void;
  onConfirm: (level: number, parts: number) => void;
}) {
  const [level, setLevel] = useState(3);
  const [parts, setParts] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-bg-card shadow-[0_24px_80px_rgba(0,0,0,0.7)] p-5 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 ring-1 ring-amber-500/30 flex items-center justify-center">
            <Archive className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Compress "{item.name}"</p>
            <p className="text-[11px] text-ink-muted">Configure compression settings</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink">Compression Level</label>
              <span className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">Level {level}</span>
            </div>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cx(
                    'flex-1 h-9 rounded-lg text-xs font-medium transition-all',
                    level === l
                      ? 'bg-brand-primary text-white ring-1 ring-brand-primary'
                      : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle hover:text-ink hover:ring-border'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-ink-faint">
              <span>Store</span><span>Fast</span><span>Normal</span><span>Good</span><span>Max</span><span>Ultra</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink">Split into parts</label>
              <span className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">{parts} {parts === 1 ? 'file' : 'files'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParts((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg bg-bg-base ring-1 ring-border-subtle text-ink-muted hover:text-ink hover:ring-border transition-all flex items-center justify-center"
              >
                <span className="text-lg">−</span>
              </button>
              <div className="flex-1 h-9 rounded-lg bg-bg-base ring-1 ring-border-subtle flex items-center justify-center text-sm font-mono text-ink">
                {parts}
              </div>
              <button
                onClick={() => setParts((p) => Math.min(10, p + 1))}
                className="w-9 h-9 rounded-lg bg-bg-base ring-1 ring-border-subtle text-ink-muted hover:text-ink hover:ring-border transition-all flex items-center justify-center"
              >
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(level, parts)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors shadow-soft"
          >
            <Archive className="w-3.5 h-3.5" />
            Create Zip
          </button>
        </div>
      </div>
    </div>
  );
}
