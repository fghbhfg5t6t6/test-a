import { useState, useEffect } from 'react';
import { Save, X, Upload, ArrowLeft, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useUser, useCompanies, updateUserMutation, toErrMsg } from '@/lib/hooks';
import { useAuth } from '@/lib/AuthContext';
import { cx, flagUrl, allCountries } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SiteUser } from '@/types';

type Props = {
  editId: string;
  onSave: () => void;
  onCancel: () => void;
};

const roles: SiteUser['role'][] = ['Admin', 'Editor', 'Member', 'Guest'];

export function EditUserPage({ editId, onSave, onCancel }: Props) {
  const { data: user, loading: userLoading, error: userError } = useUser(editId);
  const { data: companies } = useCompanies();
  const { isSuperAdmin } = useAuth();

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [role, setRole] = useState<SiteUser['role']>('Member');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      setFullName(user.fullName);
      setCompany(user.company);
      setCountryCode(user.countryCode || 'US');
      setRole(user.role);
      setAvatar(user.avatar ?? '');
      setInitialized(true);
    }
  }, [user, initialized]);

  const ip = user?.ip ?? '';
  const extraIps = user?.ips.slice(1) ?? [];

  const inputCls =
    'w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 transition-colors';

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const fd = new FormData();
      fd.append('name', fullName);
      fd.append('country', countryCode);
      fd.append('role', role);
      if (avatar) fd.append('profile', avatar);
      await updateUserMutation(editId, fd);
      onSave();
    } catch (err) {
      setSaveError(toErrMsg(err));
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-border">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
        <div className="p-4 lg:p-6 max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <div className="flex-1 space-y-2"><Skeleton className="h-3 w-48" /><Skeleton className="h-9 w-full max-w-xs" /></div>
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-10 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 ring-1 ring-red-500/30 flex items-center justify-center mb-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-ink">Failed to load user</p>
        <p className="text-xs text-ink-muted mt-1 max-w-sm">{userError ?? 'User not found'}</p>
        <button onClick={onCancel} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-ink-muted hover:text-ink transition-colors">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-border sticky top-0 bg-bg-card/80 backdrop-blur-sm z-10">
        <button onClick={onCancel} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-ink">Edit User</h1>
          <p className="text-[11px] text-ink-muted">Editing {user.fullName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onCancel} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 hover:bg-white/10 transition-colors focus-ring">
            <X className="w-3.5 h-3.5" />Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !fullName.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors focus-ring shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-3xl mx-auto w-full">
        {saveError && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 ring-1 ring-red-500/30 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{saveError}
          </div>
        )}

        {/* Photo */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-20 h-20 rounded-xl object-cover ring-1 ring-border" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-bg-base ring-1 ring-border flex items-center justify-center">
                <Upload className="w-5 h-5 text-ink-faint" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Profile Photo</p>
            <p className="text-[11px] text-ink-muted mb-2">Paste an image URL for the user's avatar</p>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" className={cx(inputCls, 'max-w-xs')} />
          </div>
        </div>

        {/* Identity */}
        <Section title="Identity">
          <Field label="Full Name"><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Morgan" className={inputCls} /></Field>
          <Field label="Username"><input value={user.username} readOnly className={cx(inputCls, 'opacity-70 cursor-not-allowed')} /></Field>
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value as SiteUser['role'])} className={inputCls}>
              {roles.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
          </Field>
        </Section>

        {/* Location & network */}
        <Section title="Location & Network">
          <Field label="Company">
            <select value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls}>
              {(companies ?? []).map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>
          </Field>
          <Field label="Public IP Address">
            {ip && ip !== '—' ? (
              <a
                href={`https://www.iplocation.net/?ip=${ip}`}
                target="_blank"
                rel="noreferrer"
                className={cx(inputCls, 'opacity-70 flex items-center hover:opacity-100 hover:border-brand-primary/60 transition-all')}
                title={`View IP info for ${ip}`}
              >
                <span className="font-mono truncate">{ip}</span>
              </a>
            ) : (
              <input value="—" readOnly className={cx(inputCls, 'opacity-70 cursor-not-allowed')} />
            )}
          </Field>
          <Field label="Country">
            <div className="relative">
              <img src={flagUrl(countryCode)} alt={countryCode} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-3 rounded-sm object-cover ring-1 ring-white/10 pointer-events-none" />
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={cx(inputCls, 'pl-9 appearance-none')}>
                {allCountries.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}
              </select>
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
            </div>
          </Field>
        </Section>

        <Section title="Known IP Addresses">
          <p className="col-span-full text-[11px] text-ink-muted -mt-1">Addresses this user has connected from (read-only). The main IP shows in the overview.</p>
          {extraIps.length > 0 ? (
            extraIps.map((addr) => (
              <a
                key={addr}
                href={`https://www.iplocation.net/?ip=${addr}`}
                target="_blank"
                rel="noreferrer"
                className={cx(inputCls, 'opacity-70 flex items-center hover:opacity-100 hover:border-brand-primary/60 transition-all')}
                title={`View IP info for ${addr}`}
              >
                <span className="font-mono truncate">{addr}</span>
              </a>
            ))
          ) : (
            <p className="col-span-full text-[11px] text-ink-faint">No additional IP addresses recorded.</p>
          )}
        </Section>

        {!isSuperAdmin && (
          <div className="mt-2 px-3 py-2.5 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 text-xs text-amber-400">
            As a normal admin, you cannot delete users. Only superadmins can delete AppUsers.
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-ink mb-3 uppercase tracking-wide">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-ink-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}
