import { useState } from 'react';
import {
  Save, Building2, Package, FileCode, Server, Users,
  Plus, Pencil, Trash2, X, Upload, Globe, Key, ChevronRight, Loader2, Check,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import { adminUsers, companies, appVersions, modules, servers } from '@/mockData';
import type { AppVersion, Module, ServerInfo, ServerKey } from '@/types';

type Props = { onBack: () => void };

const sections = [
  { id: 'access', label: 'Admin Access', icon: Users },
  { id: 'versions', label: 'App Versions', icon: Package },
  { id: 'configs', label: 'Modules', icon: FileCode },
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
          <p className="text-[11px] text-ink-muted">Manage access, versions, configs, and servers</p>
        </div>
        <button
          onClick={onBack}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors shadow-soft"
        >
          <Save className="w-3.5 h-3.5" />Save Changes
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
            {active === 'versions' && <AppVersionsSection />}
            {active === 'configs' && <ModulesSection />}
            {active === 'servers' && <ServersSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminAccessSection() {
  const [admins, setAdmins] = useState(adminUsers.map((a) => ({ ...a, companyAccess: [...a.companyAccess] })));
  const [editAdmin, setEditAdmin] = useState<string | null>(null);

  const toggleCompany = (adminIdx: number, companyId: string) => {
    setAdmins((prev) => prev.map((a, i) => {
      if (i !== adminIdx) return a;
      const has = a.companyAccess.includes(companyId);
      return { ...a, companyAccess: has ? a.companyAccess.filter((c) => c !== companyId) : [...a.companyAccess, companyId] };
    }));
  };

  return (
    <SectionCard title="Admin Access" desc="Super admin can edit which companies each admin can see.">
      <div className="space-y-2">
        {admins.map((admin, i) => (
          <div key={i} className="rounded-lg ring-1 ring-border-subtle bg-bg-base/50 overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <img src={admin.avatar} alt={admin.fullName} className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-ink">{admin.fullName}</p>
                <p className="text-[10px] text-ink-muted">{admin.role} · {admin.companyAccess.length} companies</p>
              </div>
              {admin.role === 'Super Admin' ? (
                <span className="ml-auto text-[10px] text-ink-faint px-2 py-1 rounded-md bg-white/5">Full access</span>
              ) : (
                <button
                  onClick={() => setEditAdmin(editAdmin === admin.username ? null : admin.username)}
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                >
                  <Pencil className="w-3 h-3" />Edit Access
                </button>
              )}
            </div>
            {editAdmin === admin.username && admin.role !== 'Super Admin' && (
              <div className="px-3 pb-3 pt-1 border-t border-border-subtle animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {companies.map((c) => {
                    const has = admin.companyAccess.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCompany(i, c.id)}
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
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function AppVersionsSection() {
  const [versions, setVersions] = useState<AppVersion[]>(appVersions);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newVer, setNewVer] = useState({ version: '', path: '', os: 'Linux x86_64', fileName: '' });

  const addVersion = () => {
    if (!newVer.version || !newVer.path) return;
    setVersions((prev) => [{
      id: `v${Date.now()}`,
      version: newVer.version,
      path: newVer.path,
      os: newVer.os,
      uploadedAt: new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16),
      fileName: newVer.fileName || `app-${newVer.version}-${newVer.os.split(' ')[0].toLowerCase()}.tar.gz`,
    }, ...prev]);
    setNewVer({ version: '', path: '', os: 'Linux x86_64', fileName: '' });
    setShowAdd(false);
  };

  const deleteVersion = (id: string) => setVersions((prev) => prev.filter((v) => v.id !== id));

  return (
    <SectionCard title="Application Versions" desc="Manage application versions, paths, and OS targets.">
      <button
        onClick={() => setShowAdd((s) => !s)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 hover:bg-brand-primary/20 transition-all mb-4"
      >
        <Plus className="w-3.5 h-3.5" />Add New Version
      </button>

      {showAdd && (
        <div className="rounded-lg ring-1 ring-brand-primary/20 bg-brand-primary/5 p-4 mb-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LabeledInput label="Version Number" value={newVer.version} onChange={(v) => setNewVer({ ...newVer, version: v })} placeholder="e.g. 2.5.0" />
            <LabeledInput label="Install Path" value={newVer.path} onChange={(v) => setNewVer({ ...newVer, path: v })} placeholder="/opt/app/releases/2.5.0" />
            <div>
              <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Target OS</label>
              <select
                value={newVer.os}
                onChange={(e) => setNewVer({ ...newVer, os: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink focus:outline-none focus:border-brand-primary/60"
              >
                {['Linux x86_64', 'Windows x86_64', 'macOS ARM64', 'macOS x86_64'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Upload File</label>
              <div className="h-10 rounded-lg bg-bg-base border border-border flex items-center px-3 gap-2">
                <Upload className="w-4 h-4 text-ink-faint" />
                <input
                  value={newVer.fileName}
                  onChange={(e) => setNewVer({ ...newVer, fileName: e.target.value })}
                  placeholder="app-2.5.0-linux.tar.gz"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors">Cancel</button>
            <button onClick={addVersion} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors">
              <Save className="w-3.5 h-3.5" />Add Version
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {versions.map((v) => (
          <div key={v.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-base/50 ring-1 ring-border-subtle">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/30 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="leading-tight min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink">v{v.version} <span className="text-ink-faint font-normal">· {v.os}</span></p>
              <p className="text-[10px] text-ink-muted font-mono truncate">{v.path}</p>
            </div>
            <span className="text-[10px] text-ink-faint hidden sm:block">{v.uploadedAt}</span>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setEditId(editId === v.id ? null : v.id)} className="p-1.5 rounded-md text-ink-faint hover:text-brand-primary hover:bg-white/5 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteVersion(v.id)} className="p-1.5 rounded-md text-ink-faint hover:text-red-400 hover:bg-white/5 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ModulesSection() {
  const [mods, setMods] = useState<Module[]>(modules);
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCfg, setNewCfg] = useState({ name: '', path: '', content: '' });
  const [editContent, setEditContent] = useState('');

  const addConfig = () => {
    if (!newCfg.name) return;
    setMods((prev) => [...prev, {
      id: `cfg${Date.now()}`,
      name: newCfg.name,
      path: newCfg.path || `/etc/app/${newCfg.name}`,
      content: newCfg.content,
      modified: new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16),
    }]);
    setNewCfg({ name: '', path: '', content: '' });
    setShowAdd(false);
  };

  const saveEdit = (id: string) => {
    setMods((prev) => prev.map((c) => c.id === id ? { ...c, content: editContent, modified: new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16) } : c));
    setEditId(null);
  };

  const deleteConfig = (id: string) => setMods((prev) => prev.filter((c) => c.id !== id));

  return (
    <SectionCard title="Modules" desc="View, edit, add, or remove modules.">
      <button
        onClick={() => setShowAdd((s) => !s)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 hover:bg-brand-primary/20 transition-all mb-4"
      >
        <Plus className="w-3.5 h-3.5" />Add Module
      </button>

      {showAdd && (
        <div className="rounded-lg ring-1 ring-brand-primary/20 bg-brand-primary/5 p-4 mb-4 animate-fade-in space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LabeledInput label="File Name" value={newCfg.name} onChange={(v) => setNewCfg({ ...newCfg, name: v })} placeholder="app.conf" />
            <LabeledInput label="File Path" value={newCfg.path} onChange={(v) => setNewCfg({ ...newCfg, path: v })} placeholder="/etc/app/app.conf" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Content</label>
            <textarea
              value={newCfg.content}
              onChange={(e) => setNewCfg({ ...newCfg, content: e.target.value })}
              placeholder="[server]\nport = 8443"
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border text-sm text-ink font-mono placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 resize-y"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors">Cancel</button>
            <button onClick={addConfig} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors">
              <Save className="w-3.5 h-3.5" />Add Module
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {mods.map((c) => (
          <div key={c.id} className="rounded-lg bg-bg-base/50 ring-1 ring-border-subtle overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <FileCode className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="leading-tight min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink">{c.name}</p>
                <p className="text-[10px] text-ink-muted font-mono truncate">{c.path}</p>
              </div>
              <span className="text-[10px] text-ink-faint hidden sm:block">{c.modified}</span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => { setEditId(editId === c.id ? null : c.id); setEditContent(c.content); }}
                  className="p-1.5 rounded-md text-ink-faint hover:text-brand-primary hover:bg-white/5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteConfig(c.id)} className="p-1.5 rounded-md text-ink-faint hover:text-red-400 hover:bg-white/5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {editId === c.id && (
              <div className="px-3 pb-3 pt-1 border-t border-border-subtle animate-fade-in">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg bg-bg-base border border-border text-sm text-ink font-mono focus:outline-none focus:border-brand-primary/60 resize-y"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors">Cancel</button>
                  <button onClick={() => saveEdit(c.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors">
                    <Save className="w-3.5 h-3.5" />Save
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ServersSection() {
  const [serverList, setServerList] = useState<ServerInfo[]>(servers);
  const [openId, setOpenId] = useState<string | null>(servers[0]?.id ?? null);
  const [showAdd, setShowAdd] = useState(false);
  const [newSrv, setNewSrv] = useState({ name: '', domains: '', ips: '' });

  const updateKey = (serverId: string, keyType: 'dKeys' | 'aKeys' | 'sKeys', keyId: string, value: string) => {
    setServerList((prev) => prev.map((s) => {
      if (s.id !== serverId) return s;
      return { ...s, [keyType]: s[keyType].map((k) => k.id === keyId ? { ...k, value } : k) };
    }));
  };

  const addServer = () => {
    if (!newSrv.name) return;
    const id = `srv${Date.now()}`;
    const domains = newSrv.domains.split(',').map((d) => d.trim()).filter(Boolean);
    const ips = newSrv.ips.split(',').map((d) => d.trim()).filter(Boolean);
    const mkKeys = (prefix: string): ServerKey[] => [1, 2, 3].map((n) => ({ id: `${id}-${prefix}${n}`, label: `${prefix.toUpperCase()}-Key ${n}`, value: `${prefix}-${id.slice(3)}-${n.toString().padStart(2, '0')}` }));
    setServerList((prev) => [...prev, {
      id, name: newSrv.name, domains, ips,
      dKeys: mkKeys('d'), aKeys: mkKeys('a'), sKeys: mkKeys('s'),
    }]);
    setNewSrv({ name: '', domains: '', ips: '' });
    setShowAdd(false);
    setOpenId(id);
  };

  const deleteServer = (id: string) => {
    setServerList((prev) => prev.filter((s) => s.id !== id));
    if (openId === id) setOpenId(null);
  };

  return (
    <SectionCard title="Servers" desc="View server details: domains, IPs, and keys (3 D-keys, 3 A-keys, 3 S-keys).">
      <button
        onClick={() => setShowAdd((s) => !s)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 hover:bg-brand-primary/20 transition-all mb-4"
      >
        <Plus className="w-3.5 h-3.5" />Add New Server
      </button>

      {showAdd && (
        <div className="rounded-lg ring-1 ring-brand-primary/20 bg-brand-primary/5 p-4 mb-4 animate-fade-in space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LabeledInput label="Server Name" value={newSrv.name} onChange={(v) => setNewSrv({ ...newSrv, name: v })} placeholder="PROD-WEB-02" />
            <LabeledInput label="Domains (comma-separated)" value={newSrv.domains} onChange={(v) => setNewSrv({ ...newSrv, domains: v })} placeholder="app.example.io, api.example.io" />
            <LabeledInput label="IP Addresses (comma-separated)" value={newSrv.ips} onChange={(v) => setNewSrv({ ...newSrv, ips: v })} placeholder="10.0.1.20, 10.0.1.21" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors">Cancel</button>
            <button onClick={addServer} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors">
              <Save className="w-3.5 h-3.5" />Add Server
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {serverList.map((srv) => (
          <div key={srv.id} className="rounded-lg ring-1 ring-border-subtle bg-bg-base/50 overflow-hidden">
            <button
              onClick={() => setOpenId(openId === srv.id ? null : srv.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 ring-1 ring-sky-500/30 flex items-center justify-center flex-shrink-0">
                <Server className="w-4 h-4 text-sky-400" />
              </div>
              <div className="leading-tight text-left flex-1">
                <p className="text-xs font-semibold text-ink">{srv.name}</p>
                <p className="text-[10px] text-ink-muted">{srv.domains.length} domains · {srv.ips.length} IPs</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteServer(srv.id); }}
                className="p-1.5 rounded-md text-ink-faint hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className={cx('w-4 h-4 text-ink-faint transition-transform', openId === srv.id && 'rotate-90')} />
            </button>

            {openId === srv.id && (
              <div className="px-3 pb-3 pt-1 border-t border-border-subtle animate-fade-in space-y-4">
                {/* Domains */}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" />Domains</p>
                  <div className="flex flex-wrap gap-1.5">
                    {srv.domains.map((d) => (
                      <span key={d} className="text-[11px] font-mono text-ink-muted px-2 py-1 rounded-md bg-bg-base ring-1 ring-border-subtle">{d}</span>
                    ))}
                  </div>
                </div>

                {/* IPs */}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-1.5 flex items-center gap-1"><Server className="w-3 h-3" />IP Addresses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {srv.ips.map((ip) => (
                      <span key={ip} className="text-[11px] font-mono text-ink-muted px-2 py-1 rounded-md bg-bg-base ring-1 ring-border-subtle">{ip}</span>
                    ))}
                  </div>
                </div>

                {/* Keys */}
                <KeyGroup label="D-Keys" keys={srv.dKeys} onChange={(keyId, val) => updateKey(srv.id, 'dKeys', keyId, val)} />
                <KeyGroup label="A-Keys" keys={srv.aKeys} onChange={(keyId, val) => updateKey(srv.id, 'aKeys', keyId, val)} />
                <KeyGroup label="S-Keys" keys={srv.sKeys} onChange={(keyId, val) => updateKey(srv.id, 'sKeys', keyId, val)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function KeyGroup({ label, keys, onChange }: { label: string; keys: ServerKey[]; onChange: (keyId: string, value: string) => void }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-1.5 flex items-center gap-1"><Key className="w-3 h-3" />{label}</p>
      <div className="space-y-1.5">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center gap-2">
            <span className="text-[10px] text-ink-faint w-14 flex-shrink-0">{k.label}</span>
            <input
              value={k.value}
              onChange={(e) => onChange(k.id, e.target.value)}
              className="flex-1 h-8 px-2 rounded-md bg-bg-base border border-border-subtle text-[11px] font-mono text-ink focus:outline-none focus:border-brand-primary/60 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
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

function LabeledInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-ink-muted mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 transition-colors"
      />
    </div>
  );
}
