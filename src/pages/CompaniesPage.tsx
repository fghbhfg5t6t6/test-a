import { useState } from 'react';
import {
  Save, X, ArrowLeft, Building2, Loader2, CheckCircle2, Plus,
  Server, Package, Boxes, Search, Pencil, AlertCircle, Trash2,
} from 'lucide-react';
import { cx, flagUrl } from '@/lib/utils';
import { useCompanies, useUserStats, deleteCompanyMutation, createCompanyMutation, updateCompanyMutation, toErrMsg } from '@/lib/hooks';
import { useAuth } from '@/lib/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Company } from '@/types';

type Props = {
  onSave: () => void;
  onCancel: () => void;
};

const countryOptions = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' }, { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' }, { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }, { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' }, { code: 'BR', name: 'Brazil' },
];

type View = 'list' | 'add' | 'edit';
type Phase = 'form' | 'saving' | 'done';

export function CompaniesPage({ onSave, onCancel }: Props) {
  const { isSuperAdmin } = useAuth();
  const { data: companies, loading, error, refetch } = useCompanies();
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = (companies ?? []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const addCompany = (company: Company) => {
    refetch();
    setView('list');
  };

  const updateCompany = (company: Company) => {
    refetch();
    setView('list');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteCompanyMutation(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setActionError(toErrMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  if (view === 'add') {
    return <CompanyForm mode="add" onAdd={addCompany} onBack={() => setView('list')} isSuperAdmin={isSuperAdmin} />;
  }
  if (view === 'edit' && editTarget) {
    return (
      <CompanyForm
        mode="edit"
        initial={editTarget}
        onAdd={updateCompany}
        onBack={() => setView('list')}
        isSuperAdmin={isSuperAdmin}
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
          <p className="text-[11px] text-ink-muted">{companies?.length ?? 0} companies registered</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setView('add')}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" />Add Company
          </button>
        )}
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
        {actionError && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{actionError}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-bg-card p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-2.5 w-full" />
                  <Skeleton className="h-2.5 w-3/4" />
                  <Skeleton className="h-2.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 ring-1 ring-red-500/30 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-ink">Failed to load companies</p>
            <p className="text-xs text-ink-muted mt-1 max-w-sm">{error}</p>
            <button onClick={refetch} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary/15 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
            {filtered.map((c) => (
              <div key={c.id} className="group relative rounded-xl border border-border bg-bg-card shadow-soft p-4 hover:ring-1 hover:ring-brand-primary/30 transition-all">
                <div className="flex items-center gap-1 absolute top-3 right-3">
                  {isSuperAdmin && (
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 rounded-lg text-ink-faint hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => { setEditTarget(c); setView('edit'); }}
                    className="p-1.5 rounded-lg text-ink-faint hover:text-brand-primary hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit company"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                    <span className="truncate">{c.serverId !== '0' ? `Server #${c.serverId}` : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Package className="w-3 h-3 text-brand-primary" />
                    <span className="truncate">App #{c.appVersionId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Boxes className="w-3 h-3 text-emerald-400" />
                    <span className="truncate">Module Pack #{c.moduleGroupId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-8 h-8 text-ink-faint mb-2" />
            <p className="text-sm text-ink">No companies found</p>
            <p className="text-xs text-ink-muted mt-1">{isSuperAdmin ? 'Add a company to get started.' : 'No companies have been assigned to you yet.'}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setActionError(null); }}
      />
    </div>
  );
}

function CompanyForm({ mode, initial, onAdd, onBack, isSuperAdmin }: {
  mode: 'add' | 'edit';
  initial?: Company;
  onAdd: (c: Company) => void;
  onBack: () => void;
  isSuperAdmin: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [country, setCountry] = useState(initial?.countryCode ?? '');
  const [serverId, setServerId] = useState(initial?.serverId ?? '');
  const [appVersionId, setAppVersionId] = useState(initial?.appVersionId ?? '');
  const [moduleGroupId, setModuleGroupId] = useState(initial?.moduleGroupId ?? '');
  const [phase, setPhase] = useState<Phase>('form');
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit = name.trim() && country && phase === 'form';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPhase('saving');
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('country', country);
      if (serverId) fd.append('server', serverId);
      if (appVersionId) fd.append('application', appVersionId);
      if (moduleGroupId) fd.append('module_pack', moduleGroupId);

      const company = mode === 'edit' && initial
        ? await updateCompanyMutation(initial.id, fd)
        : await createCompanyMutation(fd);
      setPhase('done');
      setTimeout(() => onAdd(company), 1200);
    } catch (err) {
      setFormError(toErrMsg(err));
      setPhase('form');
    }
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
          <p className="text-[11px] text-ink-muted">Set company details</p>
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
            {phase === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {mode === 'edit' ? 'Save Changes' : 'Add Company'}
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-2xl mx-auto w-full">
        {formError && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{formError}
          </div>
        )}
        <div className="rounded-xl border border-border bg-bg-card shadow-soft p-6 space-y-5">
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

          {!isSuperAdmin && mode === 'edit' && (
            <div className="px-3 py-2.5 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 text-xs text-amber-400">
              As a normal admin, you can update company details but cannot change module pack, server, or application assignments.
            </div>
          )}

          {/* Server / App / Module pack — text inputs since backend has no list endpoints yet */}
          {isSuperAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Server ID</label>
                <input value={serverId} onChange={(e) => setServerId(e.target.value)} placeholder="e.g. 1" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Application ID</label>
                <input value={appVersionId} onChange={(e) => setAppVersionId(e.target.value)} placeholder="e.g. 1" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Module Pack ID</label>
                <input value={moduleGroupId} onChange={(e) => setModuleGroupId(e.target.value)} placeholder="e.g. 1" className={inputCls} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
