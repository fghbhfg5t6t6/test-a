import { useState } from 'react';
import { Save, X, Upload, ArrowLeft } from 'lucide-react';
import type { SiteUser } from '@/types';
import { getUser } from '@/mockData';
import { cx } from '@/lib/utils';

type Props = {
  editId: string;
  onSave: () => void;
  onCancel: () => void;
};

const roles: SiteUser['role'][] = ['Admin', 'Editor', 'Member', 'Guest'];

export function EditUserPage({ editId, onSave, onCancel }: Props) {
  const existing = getUser(editId);
  const isEdit = !!existing;

  const [fullName, setFullName] = useState(existing?.fullName ?? '');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [company, setCompany] = useState(existing?.company ?? '');
  const [ip, setIp] = useState(existing?.ip ?? '');
  const [countryCode, setCountryCode] = useState(existing?.countryCode ?? '');
  const [role, setRole] = useState<SiteUser['role']>(existing?.role ?? 'Member');
  const [avatar, setAvatar] = useState(existing?.avatar ?? '');

  const inputCls =
    'w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 transition-colors';

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-border sticky top-0 bg-bg-card/80 backdrop-blur-sm z-10">
        <button onClick={onCancel} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-ink">Edit User</h1>
          <p className="text-[11px] text-ink-muted">
            {isEdit ? `Editing ${existing?.fullName}` : 'Edit user details'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onCancel} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 hover:bg-white/10 transition-colors focus-ring">
            <X className="w-3.5 h-3.5" />Cancel
          </button>
          <button onClick={onSave} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors focus-ring shadow-soft">
            <Save className="w-3.5 h-3.5" />Save Changes
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-3xl mx-auto w-full">
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
          <Field label="Username"><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@alexm" className={inputCls} /></Field>
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value as SiteUser['role'])} className={inputCls}>
              {roles.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
          </Field>
        </Section>

        {/* Location & network */}
        <Section title="Location & Network">
          <Field label="Company"><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Northwind Labs" className={inputCls} /></Field>
          <Field label="Public IP Address"><input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="203.0.113.42" className={inputCls} /></Field>
          <Field label="Country Code"><input value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} placeholder="US" maxLength={2} className={inputCls} /></Field>
        </Section>
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
