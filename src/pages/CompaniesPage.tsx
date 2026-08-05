import { useState } from 'react';
import {
  Save, X, ArrowLeft, Building2, Loader2, CheckCircle2, Plus,
  Server, Package, FileCode, Search, Pencil,
} from 'lucide-react';
import { cx, flagUrl } from '@/lib/utils';
import { companies, servers, appVersions, modules } from '@/mockData';
import type { Company } from '@/types';

type Props = {
  onSave: () => void;
  onCancel: () => void;
};

const countryOptions = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BR', name: 'Brazil' },
];

type View = 'list' | 'add' | 'edit';
type Phase = 'form' | 'creating' | 'done';

export function CompaniesPage({ onSave, onCancel }: Props) {
  const [view, setView] = useState<View>('list');
  const [companyList, setCompanyList] = useState<Company[]>(companies);
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Company | null>(null);

  const filtered = companyList.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const addCompany = (company: Company) => {
    setCompanyList((prev) => [...prev, company]);
    setView('list');
  };

  const updateCompany = (company: Company) => {
    setCompanyList((prev) => prev.map((c) => (c.id === company.id ? company : c)));
    setView('list');
  };

  if (view === 'add') {
    return <CompanyForm mode="add" onAdd={addCompany} onBack={() => setView('list')} />;
  }
  if (view === 'edit' && editTarget) {
    return (
      <CompanyForm
        mode="edit"
        initial={editTarget}
        onAdd={updateCompany}
        onBack={() => setView('list')}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-border">
        <button onClick={onCancel} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-ink">Companies</h1>
          <p className="text-[11px] text-ink-muted">{companyList.length} companies registered</p>
        </div>
        <button
          onClick={() => setView('add')}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors shadow-soft"
        >
          <Plus className="w-3.5 h-3.5" />Add Company
        </button>
      </div>

      <div className="px-4 lg:px-6 py-3 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies…"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-bg-card border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
          {filtered.map((c) => {
            const srv = servers.find((s) => s.id === c.serverId);
            const ver = appVersions.find((v) => v.id === c.appVersionId);
            const cfg = modules.find((cf) => cf.id === c.moduleId);
            return (
              <div key={c.id} className="group relative rounded-xl border border-border bg-bg-card shadow-soft p-4 hover:ring-1 hover:ring-brand-primary/30 transition-all">
                <button
                  onClick={() => { setEditTarget(c); setView('edit'); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-ink-faint hover:text-brand-primary hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit company"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/40 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
                    <p className="text-[10px] text-ink-muted flex items-center gap-1"><img src={flagUrl(c.countryCode)} alt={c.countryCode} className="w-3.5 h-2.5 rounded-sm flex-shrink-0 object-cover ring-1 ring-white/10" loading="lazy" />{c.country}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Server className="w-3 h-3 text-sky-400" />
                    <span className="truncate">{srv?.name ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Package className="w-3 h-3 text-brand-primary" />
                    <span className="truncate">v{ver?.version ?? '—'} · {ver?.os ?? ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <FileCode className="w-3 h-3 text-emerald-400" />
                    <span className="truncate">{cfg?.name ?? '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-8 h-8 text-ink-faint mb-2" />
            <p className="text-sm text-ink">No companies found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyForm({ mode, initial, onAdd, onBack }: {
  mode: 'add' | 'edit';
  initial?: Company;
  onAdd: (c: Company) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [country, setCountry] = useState(initial?.countryCode ?? '');
  const [serverId, setServerId] = useState(initial?.serverId ?? '');
  const [appVersionId, setAppVersionId] = useState(initial?.appVersionId ?? '');
  const [moduleId, setModuleId] = useState(initial?.moduleId ?? '');
  const [phase, setPhase] = useState<Phase>('form');

  const canSubmit = name.trim() && country && serverId && appVersionId && moduleId && phase === 'form';

  const handleSubmit = () => {
    if (!canSubmit) return;
    setPhase('creating');
    setTimeout(() => setPhase('done'), 1600);
    setTimeout(() => {
      const countryObj = countryOptions.find((c) => c.code === country);
      onAdd({
        id: initial?.id ?? `c${Date.now()}`,
        name: name.trim(),
        country: countryObj?.name ?? country,
        countryCode: country,
        serverId,
        appVersionId,
        moduleId,
      });
    }, 3000);
  };

  const inputCls = 'w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 transition-colors';

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-900/30 ring-1 ring-emerald-500/40 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-brand-success" />
        </div>
        <p className="text-base font-semibold text-ink">
          {mode === 'edit' ? 'Company updated successfully' : 'Company added successfully'}
        </p>
        <p className="text-xs text-ink-muted mt-1">Redirecting to companies list…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-border sticky top-0 bg-bg-card/80 backdrop-blur-sm z-10">
        <button onClick={onBack} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-ink">
            {mode === 'edit' ? `Edit ${initial?.name ?? 'Company'}` : 'Add New Company'}
          </h1>
          <p className="text-[11px] text-ink-muted">Set company details, server, application version, and module</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 hover:bg-white/10 transition-colors">
            <X className="w-3.5 h-3.5" />Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cx(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors shadow-soft',
              canSubmit ? 'bg-brand-primary text-white hover:bg-blue-600' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            {phase === 'creating' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {mode === 'edit' ? 'Save Changes' : 'Add Company'}
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-2xl mx-auto w-full">
        <div className="rounded-xl border border-border bg-bg-card shadow-soft p-6 space-y-5">
          {/* Company details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/40 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-sm font-semibold text-ink">Company Details</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Company Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Northwind Labs" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                  <option value="">Select a country…</option>
                  {countryOptions.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Server assignment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 ring-1 ring-sky-500/30 flex items-center justify-center">
                <Server className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-sm font-semibold text-ink">Server Assignment</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServerId(s.id)}
                  className={cx(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all',
                    serverId === s.id
                      ? 'bg-sky-500/15 ring-1 ring-sky-400'
                      : 'bg-bg-base ring-1 ring-border-subtle hover:ring-border'
                  )}
                >
                  <Server className={cx('w-4 h-4', serverId === s.id ? 'text-sky-400' : 'text-ink-faint')} />
                  <div className="leading-tight min-w-0">
                    <p className={cx('text-xs font-medium truncate', serverId === s.id ? 'text-ink' : 'text-ink-muted')}>{s.name}</p>
                    <p className="text-[10px] text-ink-faint truncate">{s.domains[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Application version */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/40 flex items-center justify-center">
                <Package className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-sm font-semibold text-ink">Application Version</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {appVersions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setAppVersionId(v.id)}
                  className={cx(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all',
                    appVersionId === v.id
                      ? 'bg-brand-primary/15 ring-1 ring-brand-primary/40'
                      : 'bg-bg-base ring-1 ring-border-subtle hover:ring-border'
                  )}
                >
                  <Package className={cx('w-4 h-4', appVersionId === v.id ? 'text-brand-primary' : 'text-ink-faint')} />
                  <div className="leading-tight min-w-0">
                    <p className={cx('text-xs font-medium', appVersionId === v.id ? 'text-ink' : 'text-ink-muted')}>v{v.version}</p>
                    <p className="text-[10px] text-ink-faint truncate">{v.os}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Module */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center">
                <FileCode className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-ink">Module</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {modules.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setModuleId(c.id)}
                  className={cx(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all',
                    moduleId === c.id
                      ? 'bg-emerald-500/15 ring-1 ring-emerald-400'
                      : 'bg-bg-base ring-1 ring-border-subtle hover:ring-border'
                  )}
                >
                  <FileCode className={cx('w-4 h-4', moduleId === c.id ? 'text-emerald-400' : 'text-ink-faint')} />
                  <div className="leading-tight min-w-0">
                    <p className={cx('text-xs font-medium truncate', moduleId === c.id ? 'text-ink' : 'text-ink-muted')}>{c.name}</p>
                    <p className="text-[10px] text-ink-faint truncate">{c.path}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
