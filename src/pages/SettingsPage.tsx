import { useState } from 'react';
import {
  Save, Building2, Package, FileCode, Server, Users,
  Plus, Pencil, Trash2, X, Upload, Key, ChevronRight, Loader2, Check,
  Boxes, FolderOpen, Camera, Terminal, Layers, FileUp, FileCheck2,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import { adminUsers, companies, appVersions, servers, moduleGroups } from '@/mockData';
import type { AppVersion, Module, ServerInfo, ServerKey, ModuleGroup } from '@/types';

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
            {active === 'moduleGroups' && <ModuleGroupsSection />}
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

const moduleSlotIcons = {
  base: FileCode,
  'file-explorer': FolderOpen,
  logger: Camera,
  powershell: Terminal,
} as const;

const moduleSlotLabels = {
  base: 'Base Information',
  'file-explorer': 'File Explorer',
  logger: 'Logger',
  powershell: 'PowerShell',
} as const;

function ModuleGroupsSection() {
  const [groups, setGroups] = useState<ModuleGroup[]>(moduleGroups);
  const [showAdd, setShowAdd] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '' });
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editSlot, setEditSlot] = useState<'base' | 'file-explorer' | 'logger' | 'powershell' | null>(null);
  const [editName, setEditName] = useState('');
  const [uploading, setUploading] = useState(false);

  const addGroup = () => {
    if (!newGroup.name) return;
    const id = `mg${Date.now()}`;
    const now = new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16);
    setGroups((prev) => [...prev, {
      id,
      name: newGroup.name,
      baseModule: { id: `${id}-base`, name: 'Base Information', path: '/etc/app/base.conf', content: '[base]\nusername = user\ndomain = corp.io\ncomputer = WS-01\nkernel = 6.8.0\nos = Linux\nbuild = 246788\nelevation = User', modified: now },
      fileExplorerModule: { id: `${id}-files`, name: 'File Explorer', path: '/etc/app/file-explorer.conf', content: '[files]\nroot = /home/user\nmaxSize = 500MB\nallowZip = true', modified: now },
      loggerModule: { id: `${id}-logger`, name: 'Logger', path: '/etc/app/logger.conf', content: '[logger]\nscreenshot = true\nrecording = true\nmaxFrames = 20\nquality = high', modified: now },
      powershellModule: { id: `${id}-ps`, name: 'PowerShell', path: '/etc/app/powershell.conf', content: '[shell]\nenabled = true\nhistory = 50\ntimeout = 30', modified: now },
      companyIds: [],
    }]);
    setNewGroup({ name: '' });
    setShowAdd(false);
  };

  const deleteGroup = (id: string) => setGroups((prev) => prev.filter((g) => g.id !== id));

  const startEditSlot = (groupId: string, slot: 'base' | 'file-explorer' | 'logger' | 'powershell') => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const mod = slot === 'base' ? group.baseModule : slot === 'file-explorer' ? group.fileExplorerModule : slot === 'logger' ? group.loggerModule : group.powershellModule;
    setEditGroupId(groupId);
    setEditSlot(slot);
    setEditName(mod.name);
  };

  const handleFileUpload = (groupId: string, slot: 'base' | 'file-explorer' | 'logger' | 'powershell', file: File) => {
    setUploading(true);
    const now = new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16);
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const sizeStr = file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      setGroups((prev) => prev.map((g) => {
        if (g.id !== groupId) return g;
        const updatedMod = { ...(slot === 'base' ? g.baseModule : slot === 'file-explorer' ? g.fileExplorerModule : slot === 'logger' ? g.loggerModule : g.powershellModule), content, name: editName || file.name.replace(/\.[^.]+$/, ''), fileName: file.name, fileSize: sizeStr, modified: now };
        if (slot === 'base') return { ...g, baseModule: updatedMod };
        if (slot === 'file-explorer') return { ...g, fileExplorerModule: updatedMod };
        if (slot === 'logger') return { ...g, loggerModule: updatedMod };
        return { ...g, powershellModule: updatedMod };
      }));
      setUploading(false);
    };
    reader.readAsText(file);
  };

  const saveSlot = () => {
    if (!editGroupId || !editSlot) return;
    const now = new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16);
    setGroups((prev) => prev.map((g) => {
      if (g.id !== editGroupId) return g;
      const updatedMod = { ...(editSlot === 'base' ? g.baseModule : editSlot === 'file-explorer' ? g.fileExplorerModule : editSlot === 'logger' ? g.loggerModule : g.powershellModule), name: editName, modified: now };
      if (editSlot === 'base') return { ...g, baseModule: updatedMod };
      if (editSlot === 'file-explorer') return { ...g, fileExplorerModule: updatedMod };
      if (editSlot === 'logger') return { ...g, loggerModule: updatedMod };
      return { ...g, powershellModule: updatedMod };
    }));
    setEditGroupId(null);
    setEditSlot(null);
  };

  const toggleCompany = (groupId: string, companyId: string) => {
    setGroups((prev) => prev.map((g) => {
      // Remove from all other groups first (exclusive: one group per company)
      const filtered = g.companyIds.filter((c) => c !== companyId);
      // Add to the target group only if it wasn't already there
      if (g.id === groupId && !g.companyIds.includes(companyId)) {
        return { ...g, companyIds: [...filtered, companyId] };
      }
      return { ...g, companyIds: filtered };
    }));
  };

  const slots: ('base' | 'file-explorer' | 'logger' | 'powershell')[] = ['base', 'file-explorer', 'logger', 'powershell'];

  return (
    <SectionCard title="Module Groups" desc="Each group contains its own Base, File Explorer, Logger, and PowerShell module files. Each company can only be assigned to one group.">
      <button
        onClick={() => setShowAdd((s) => !s)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 hover:bg-brand-primary/20 transition-all mb-4"
      >
        <Plus className="w-3.5 h-3.5" />Add Module Group
      </button>

      {showAdd && (
        <div className="rounded-lg ring-1 ring-brand-primary/20 bg-brand-primary/5 p-4 mb-4 animate-fade-in">
          <LabeledInput label="Group Name" value={newGroup.name} onChange={(v) => setNewGroup({ ...newGroup, name: v })} placeholder="e.g. Premium Group" />
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors">Cancel</button>
            <button onClick={addGroup} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors">
              <Save className="w-3.5 h-3.5" />Add Group
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.id} className="rounded-xl ring-1 ring-border-subtle bg-bg-base/50 overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/30 flex items-center justify-center flex-shrink-0">
                <Boxes className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="leading-tight flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink">{g.name}</p>
                <p className="text-[10px] text-ink-muted">{g.companyIds.length} companies assigned</p>
              </div>
              <button onClick={() => deleteGroup(g.id)} className="p-1.5 rounded-md text-ink-faint hover:text-red-400 hover:bg-white/5 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-3 pb-3 space-y-1.5">
              {/* Module slots */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {slots.map((slot) => {
                  const Icon = moduleSlotIcons[slot];
                  const mod = slot === 'base' ? g.baseModule : slot === 'file-explorer' ? g.fileExplorerModule : slot === 'logger' ? g.loggerModule : g.powershellModule;
                  const isEditing = editGroupId === g.id && editSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => isEditing ? (setEditGroupId(null), setEditSlot(null)) : startEditSlot(g.id, slot)}
                      className={cx(
                        'flex items-center gap-1.5 px-2 py-2 rounded-lg text-left transition-all ring-1',
                        isEditing ? 'bg-brand-primary/15 ring-brand-primary/40' : 'bg-bg-card ring-border-subtle hover:ring-border'
                      )}
                    >
                      <Icon className={cx('w-3.5 h-3.5 flex-shrink-0', isEditing ? 'text-brand-primary' : mod.fileName ? 'text-emerald-400' : 'text-ink-faint')} />
                      <div className="leading-tight min-w-0">
                        <p className="text-[10px] font-medium text-ink-muted">{moduleSlotLabels[slot]}</p>
                        <p className="text-[10px] text-ink truncate">{mod.fileName ?? mod.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Inline editor */}
              {editGroupId === g.id && editSlot && (
                <div className="rounded-lg ring-1 ring-brand-primary/20 bg-brand-primary/5 p-3 animate-fade-in space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-brand-primary" />
                    <p className="text-[11px] font-semibold text-ink">Edit {moduleSlotLabels[editSlot]}</p>
                  </div>
                  <LabeledInput label="Module Name" value={editName} onChange={setEditName} placeholder="Module name" />
                  <div>
                    <label className="block text-[11px] font-medium text-ink-muted mb-1.5">Module File</label>
                    {(() => {
                      const mod = editSlot === 'base' ? g.baseModule : editSlot === 'file-explorer' ? g.fileExplorerModule : editSlot === 'logger' ? g.loggerModule : g.powershellModule;
                      return (
                        <div className="space-y-2">
                          {mod.fileName ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-base ring-1 ring-border-subtle">
                              <FileCheck2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <div className="leading-tight min-w-0 flex-1">
                                <p className="text-xs font-medium text-ink truncate">{mod.fileName}</p>
                                {mod.fileSize && <p className="text-[10px] text-ink-faint">{mod.fileSize} · {mod.modified}</p>}
                              </div>
                              <button
                                onClick={() => setGroups((prev) => prev.map((gg) => gg.id !== g.id ? gg : (() => {
                                  const cleared = { ...mod, fileName: undefined, fileSize: undefined, content: '' };
                                  if (editSlot === 'base') return { ...gg, baseModule: cleared };
                                  if (editSlot === 'file-explorer') return { ...gg, fileExplorerModule: cleared };
                                  if (editSlot === 'logger') return { ...gg, loggerModule: cleared };
                                  return { ...gg, powershellModule: cleared };
                                })()))}
                                className="p-1 rounded-md text-ink-faint hover:text-red-400 hover:bg-white/5 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : null}
                          <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg-base ring-1 ring-border-subtle hover:ring-brand-primary/40 cursor-pointer transition-all">
                            <FileUp className="w-4 h-4 text-brand-primary flex-shrink-0" />
                            <span className="text-xs text-ink-muted">{mod.fileName ? 'Replace file' : 'Upload module file'}</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(g.id, editSlot, f);
                              }}
                            />
                          </label>
                          {uploading && (
                            <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />Uploading...
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditGroupId(null); setEditSlot(null); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-muted hover:text-ink bg-white/5 transition-colors">Cancel</button>
                    <button onClick={saveSlot} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary text-white hover:bg-blue-600 transition-colors">
                      <Save className="w-3.5 h-3.5" />Save
                    </button>
                  </div>
                </div>
              )}

              {/* Company assignment */}
              <div className="pt-2 border-t border-border-subtle">
                <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-1.5">Assigned Companies <span className="normal-case text-ink-faint/60">(one group per company)</span></p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {companies.map((c) => {
                    const has = g.companyIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCompany(g.id, c.id)}
                        className={cx(
                          'flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                          has
                            ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40'
                            : 'bg-bg-card text-ink-muted ring-1 ring-border-subtle hover:text-ink'
                        )}
                      >
                        <span className={cx('w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ring-1', has ? 'bg-brand-primary ring-brand-primary' : 'ring-gray-600')}>
                          {has && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
  const [newSrv, setNewSrv] = useState({ name: '', dKeyCount: 3, aKeyCount: 3, sKeyCount: 3 });

  const updateKey = (serverId: string, keyType: 'dKeys' | 'aKeys' | 'sKeys', keyId: string, value: string) => {
    setServerList((prev) => prev.map((s) => {
      if (s.id !== serverId) return s;
      return { ...s, [keyType]: s[keyType].map((k) => k.id === keyId ? { ...k, value } : k) };
    }));
  };

  const addKey = (serverId: string, keyType: 'dKeys' | 'aKeys' | 'sKeys') => {
    setServerList((prev) => prev.map((s) => {
      if (s.id !== serverId) return s;
      const keys = s[keyType];
      const prefix = keyType === 'dKeys' ? 'd' : keyType === 'aKeys' ? 'a' : 's';
      const newKey: ServerKey = { id: `${s.id}-${prefix}${keys.length + 1}-${Date.now()}`, label: `${prefix.toUpperCase()}-Key ${keys.length + 1}`, value: `${prefix}-${s.name.toLowerCase()}-${(keys.length + 1).toString().padStart(2, '0')}` };
      return { ...s, [keyType]: [...keys, newKey] };
    }));
  };

  const removeKey = (serverId: string, keyType: 'dKeys' | 'aKeys' | 'sKeys', keyId: string) => {
    setServerList((prev) => prev.map((s) => {
      if (s.id !== serverId) return s;
      return { ...s, [keyType]: s[keyType].filter((k) => k.id !== keyId) };
    }));
  };

  const addServer = () => {
    if (!newSrv.name) return;
    const id = `srv${Date.now()}`;
    const mkKeys = (prefix: string, count: number): ServerKey[] => Array.from({ length: count }, (_, n) => ({ id: `${id}-${prefix}${n + 1}`, label: `${prefix.toUpperCase()}-Key ${n + 1}`, value: `${prefix}-${id.slice(3)}-${(n + 1).toString().padStart(2, '0')}` }));
    setServerList((prev) => [...prev, {
      id, name: newSrv.name,
      dKeys: mkKeys('d', newSrv.dKeyCount),
      aKeys: mkKeys('a', newSrv.aKeyCount),
      sKeys: mkKeys('s', newSrv.sKeyCount),
    }]);
    setNewSrv({ name: '', dKeyCount: 3, aKeyCount: 3, sKeyCount: 3 });
    setShowAdd(false);
    setOpenId(id);
  };

  const deleteServer = (id: string) => {
    setServerList((prev) => prev.filter((s) => s.id !== id));
    if (openId === id) setOpenId(null);
  };

  return (
    <SectionCard title="Servers" desc="Manage servers and their keys. Each server can have a different number of D, A, and S keys.">
      <button
        onClick={() => setShowAdd((s) => !s)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30 hover:bg-brand-primary/20 transition-all mb-4"
      >
        <Plus className="w-3.5 h-3.5" />Add New Server
      </button>

      {showAdd && (
        <div className="rounded-lg ring-1 ring-brand-primary/20 bg-brand-primary/5 p-4 mb-4 animate-fade-in space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <LabeledInput label="Server Name" value={newSrv.name} onChange={(v) => setNewSrv({ ...newSrv, name: v })} placeholder="PROD-WEB-02" />
            <div>
              <label className="block text-[11px] font-medium text-ink-muted mb-1.5">D-Keys Count</label>
              <input type="number" min={1} max={20} value={newSrv.dKeyCount} onChange={(e) => setNewSrv({ ...newSrv, dKeyCount: Math.max(1, Number(e.target.value)) })} className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink focus:outline-none focus:border-brand-primary/60" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-muted mb-1.5">A-Keys Count</label>
              <input type="number" min={1} max={20} value={newSrv.aKeyCount} onChange={(e) => setNewSrv({ ...newSrv, aKeyCount: Math.max(1, Number(e.target.value)) })} className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink focus:outline-none focus:border-brand-primary/60" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-muted mb-1.5">S-Keys Count</label>
              <input type="number" min={1} max={20} value={newSrv.sKeyCount} onChange={(e) => setNewSrv({ ...newSrv, sKeyCount: Math.max(1, Number(e.target.value)) })} className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border text-sm text-ink focus:outline-none focus:border-brand-primary/60" />
            </div>
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
                <p className="text-[10px] text-ink-muted">{srv.dKeys.length} D-keys · {srv.aKeys.length} A-keys · {srv.sKeys.length} S-keys</p>
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
                <KeyGroup label="D-Keys" keys={srv.dKeys} onChange={(keyId, val) => updateKey(srv.id, 'dKeys', keyId, val)} onAdd={() => addKey(srv.id, 'dKeys')} onRemove={(keyId) => removeKey(srv.id, 'dKeys', keyId)} />
                <KeyGroup label="A-Keys" keys={srv.aKeys} onChange={(keyId, val) => updateKey(srv.id, 'aKeys', keyId, val)} onAdd={() => addKey(srv.id, 'aKeys')} onRemove={(keyId) => removeKey(srv.id, 'aKeys', keyId)} />
                <KeyGroup label="S-Keys" keys={srv.sKeys} onChange={(keyId, val) => updateKey(srv.id, 'sKeys', keyId, val)} onAdd={() => addKey(srv.id, 'sKeys')} onRemove={(keyId) => removeKey(srv.id, 'sKeys', keyId)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function KeyGroup({ label, keys, onChange, onAdd, onRemove }: { label: string; keys: ServerKey[]; onChange: (keyId: string, value: string) => void; onAdd: () => void; onRemove: (keyId: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Key className="w-3 h-3 text-ink-faint" />
        <p className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</p>
        <span className="text-[10px] text-ink-faint">({keys.length})</span>
        <button onClick={onAdd} className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors">
          <Plus className="w-2.5 h-2.5" />Add
        </button>
      </div>
      <div className="space-y-1.5">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center gap-2">
            <span className="text-[10px] text-ink-faint w-14 flex-shrink-0">{k.label}</span>
            <input
              value={k.value}
              onChange={(e) => onChange(k.id, e.target.value)}
              className="flex-1 h-8 px-2 rounded-md bg-bg-base border border-border-subtle text-[11px] font-mono text-ink focus:outline-none focus:border-brand-primary/60 transition-colors"
            />
            <button onClick={() => onRemove(k.id)} className="p-1 rounded-md text-ink-faint hover:text-red-400 hover:bg-white/5 transition-colors flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
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
