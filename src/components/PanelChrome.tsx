import { useState, useRef, useCallback, type ReactNode } from 'react';
import { Minimize2, Maximize2, Expand, X } from 'lucide-react';
import { cx } from '@/lib/utils';
import { Tooltip } from './ui/Tooltip';

type Props = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  defaultHeight?: number;
};

export function PanelChrome({ title, icon, children, className }: Props) {
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleFullscreen = useCallback(() => {
    setFullscreen((f) => {
      const next = !f;
      if (!next) setMaximized(false);
      return next;
    });
  }, []);

  return (
    <div
      className={cx(
        'flex flex-col rounded-xl border border-border bg-bg-card shadow-soft transition-all duration-300 overflow-hidden',
        fullscreen &&
          'fixed inset-4 z-50 shadow-[0_24px_80px_rgba(0,0,0,0.7)] rounded-2xl',
        !fullscreen && maximized && 'flex-1 h-full',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border flex-shrink-0 select-none">
        {icon && <span className="text-ink-muted">{icon}</span>}
        <span className="text-sm font-semibold text-ink flex-1 truncate">{title}</span>
        <div className="flex items-center gap-0.5">
          <Tooltip label={minimized ? 'Restore' : 'Minimize'} side="top">
            <button
              onClick={() => { setMinimized((m) => !m); setMaximized(false); }}
              className="p-1.5 rounded-md text-ink-faint hover:text-ink hover:bg-white/5 transition-colors focus-ring"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip label={maximized ? 'Restore' : 'Maximize'} side="top">
            <button
              onClick={() => { setMaximized((m) => !m); setMinimized(false); }}
              className="p-1.5 rounded-md text-ink-faint hover:text-ink hover:bg-white/5 transition-colors focus-ring"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} side="top">
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-md text-ink-faint hover:text-ink hover:bg-white/5 transition-colors focus-ring"
            >
              {fullscreen ? <X className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Body */}
      <div
        className={cx(
          'flex-1 overflow-hidden transition-[max-height,opacity] duration-300',
          minimized ? 'max-h-0 opacity-0' : 'max-h-[9999px] opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  );
}

type WorkspaceProps = {
  left: ReactNode;
  right: ReactNode;
  sidebar?: ReactNode;
};

export function WorkspaceLayout({ left, right, sidebar }: WorkspaceProps) {
  const [leftPct, setLeftPct] = useState(58);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(80, Math.max(20, pct)));
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
    <div ref={containerRef} className="flex gap-0 flex-1 overflow-hidden min-h-0">
      {/* Left panel */}
      <div style={{ width: `${leftPct}%` }} className="flex flex-col min-w-0 pr-2">
        {left}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        className={cx(
          'resize-handle w-1.5 flex-shrink-0 cursor-col-resize rounded-full my-2 bg-border hover:bg-brand-primary transition-colors',
          isDragging && 'bg-brand-primary active'
        )}
        title="Drag to resize"
      />

      {/* Right panel */}
      <div style={{ width: `${100 - leftPct}%` }} className="flex flex-col min-w-0 pl-2">
        {right}
      </div>
    </div>
  );
}

type VerticalWorkspaceProps = {
  top: ReactNode;
  bottom: ReactNode;
  minTopPct?: number;
  maxTopPct?: number;
};

export function VerticalWorkspace({ top, bottom, minTopPct = 30, maxTopPct = 80 }: VerticalWorkspaceProps) {
  const [topPct, setTopPct] = useState(62);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setTopPct(Math.min(maxTopPct, Math.max(minTopPct, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [minTopPct, maxTopPct]);

  return (
    <div ref={containerRef} className="flex flex-col flex-1 overflow-hidden min-h-0 gap-0">
      <div style={{ height: `${topPct}%` }} className="flex min-h-0 pb-1.5">
        {top}
      </div>
      <div
        onMouseDown={onMouseDown}
        className={cx(
          'resize-handle h-1.5 flex-shrink-0 cursor-row-resize rounded-full mx-4 bg-border hover:bg-brand-primary transition-colors',
          isDragging && 'bg-brand-primary active'
        )}
        title="Drag to resize"
      />
      <div style={{ height: `${100 - topPct}%` }} className="flex min-h-0 pt-1.5">
        {bottom}
      </div>
    </div>
  );
}
