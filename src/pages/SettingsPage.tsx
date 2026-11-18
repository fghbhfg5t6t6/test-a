import { useState, useEffect } from 'react';
import {
  Save, Building2, Package, FileCode, Server, Users,
  Plus, Pencil, Trash2, X, Check,
  Boxes, FolderOpen, Camera, Terminal, Key, ChevronRight, Loader2,
  AlertCircle,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useAdmins, useCompanies, replaceAdminCompaniesMutation, toErrMsg } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AdminUser, Company } from '@/types';

type Props = { onBack: () => void };

const sections = [
  { id: 'access', label: 'Admin Access', icon: Users },
  { id: 'versions', label: 'App Versions', icon: Package },
  { id: 'moduleGroups', label: 'Module Groups', icon: Boxes },
  { id: 'servers', label: 'Servers', icon: Server },
] as const;

type SectionId = (typeof sections)[number]['id'];

export function SettingsPage({ onBack }: Props) {
  const [active, setActive] = useState<SectionId>('access');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-base font-semibold text-ink">Dashboard Settings</h1>
          <p className="text-[11px] text-ink-muted">Manage access, versions, module groups, and servers</p>
        </div>
        <button
          onClick={onBack}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors shadow-soft"
        >
          <Save className="w-3.5 h-3.5" />Back to Dashboard
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-48 flex-shrink-0 border-r border-border p-3 space-y-1 hidden md:block">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                  active === s.id
                    ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40'
                    : 'text-ink-muted hover:text-ink hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />{s.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-3xl space-y-6">
            {active === 'access' && <AdminAccessSection />}
            {active === 'versions' && <UnavailableSection title="Application Versions" desc="The backend does not yet provide a list endpoint for application versions." icon={Package} />}
            {active === 'moduleGroups' && <UnavailableSection title="Module Groups" desc="The backend does not yet provide list endpoints for Module Packs. Company module pack assignments are managed via the Companies page." icon={Boxes} />}
            {active === 'servers' && <UnavailableSection title="Servers" desc="The backend does not yet provide a dedicated server list endpoint. Server assignments are managed via the Companies page." icon={Server} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminAccessSection() {
  const { isSuperAdmin } = useAuth();
  const { data: admins, loading: adminsLoading, error: adminsError, refetch: refetchAdmins } = useAdmins();
  const { data: companies, loading: companiesLoading } = useCompanies();
  const [editAdminId, setEditAdminId] = useState<string | null>(null);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEdit = (adminId: string, currentCompanyIds: string[]) => {
    setEditAdminId(adminId);
    setSelectedCompanyIds(new Set(currentCompanyIds));
    setSaveError(null);
  };

  const toggleCompany = (companyId: string) => {
    setSelectedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
  };

  const saveAccess = async () => {
    if (!editAdminId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await replaceAdminCompaniesMutation(editAdminId, [...selectedCompanyIds]);
      setEditAdminId(null);
      refetchAdmins();
    } catch (err) {
      setSaveError(toErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <SectionCard title="Admin Access" desc="Manage which companies each admin can see.">
        <div className="flex items-center gap-3 px-3 py-4 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 text-xs text-amber-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Only superadmins can manage admin access and company assignments.</span>
        </div>
      </SectionCard>
    );
  }

  if (adminsLoading || companiesLoading) {
    return (
      <SectionCard title="Admin Access" desc="Manage which companies each admin can see.">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg ring-1 ring-border-subtle bg-bg-base/50 px-3 py-3 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (adminsError) {
    return (
      <SectionCard title="Admin Access" desc="Manage which companies each admin can see.">
        <div className="flex flex-col items-center py-8 text-center">
          <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-xs text-ink">Failed to load admins</p>
          <p className="text-[11px] text-ink-muted mt-1">{adminsError}</p>
          <button onClick={refetchAdmins} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary/15 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
            Retry
          </button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Admin Access" desc="Manage which companies each admin can see.">
      {saveError && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{saveError}
        </div>
      )}
      <div className="space-y-2">
        {(admins ?? []).map((admin) => {
          const companyIds = admin.companies.map((c) => String(c.id));
          const isEditing = editAdminId === String(admin.id);
          return (
            <div key={admin.id} className="rounded-lg ring-1 ring-border-subtle bg-bg-base/50 overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-primary/15 ring-1 ring-brand-primary/30 flex items-center justify-center text-[10px] font-semibold text-brand-primary flex-shrink-0">
                  {admin.name?.slice(0, 2).toUpperCase() ?? admin.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-ink">{admin.name || admin.username}</p>
                  <p className="text-[10px] text-ink-muted">{admin.role} · {admin.companies.length} companies</p>
                </div>
                <button
                  onClick={() => isEditing ? setEditAdminId(null) : startEdit(String(admin.id), companyIds)}
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                >
                  <Pencil className="w-3 h-3" />{isEditing ? 'Close' : 'Edit Access'}
                </button>
              </div>
              {isEditing && (
                <div className="px-3 pb-3 pt-1 border-t border-border-subtle animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(companies ?? []).map((c: Company) => {
                      const has = selectedCompanyIds.has(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleCompany(c.id)}
                          className={cx(
                            'flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all',
                            has
                              ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40'
                              : 'bg-bg-base text-ink-muted ring-1 ring-border-subtle hover:text-ink'
                          )}
                        >
                          <span className={cx('w-4 h-4 rounded flex items-center justify-center flex-shrink-0', has ? 'bg-brand-primary' : 'bg-gray-700')}>
                            {has && <Check className="w-3 h-3 text-white" />}
                          </span>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button onClick={() => setEditAdminId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors">Cancel</button>
                    <button
                      onClick={saveAccess}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Access
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {(admins ?? []).length === 0 && (
          <p className="text-xs text-ink-muted text-center py-6">No admins found.</p>
        )}
      </div>
    </SectionCard>
  );
}

function UnavailableSection({ title, desc, icon: Icon }: { title: string; desc: string; icon: typeof Package }) {
  return (
    <SectionCard title={title} desc={desc}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-bg-base ring-1 ring-border-subtle flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-ink-faint" />
        </div>
        <p className="text-sm text-ink">Backend endpoint not yet available</p>
        <p className="text-xs text-ink-muted mt-1 max-w-sm">
          This feature's backend API has not been implemented yet. It will be connected once the endpoint is available.
        </p>
      </div>
    </SectionCard>
  );
}

function SectionCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card shadow-soft p-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="text-[11px] text-ink-muted mb-4">{desc}</p>
      {children}
    </div>
  );
}
