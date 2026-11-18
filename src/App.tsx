import { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Settings, LogOut, ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { OverviewPage } from '@/pages/OverviewPage';
import { UserPage } from '@/pages/UserPage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { EditUserPage } from '@/pages/EditUserPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { useAuth, AuthLoadingScreen } from '@/lib/AuthContext';
import type { ViewId } from '@/types';
import { cx } from '@/lib/utils';

type Route =
  | { name: 'overview' }
  | { name: 'user'; id: string }
  | { name: 'companies' }
  | { name: 'edit-user'; id: string }
  | { name: 'settings' };

const menuItems: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function Shell() {
  const { user, logout, isSuperAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [route, setRoute] = useState<Route>({ name: 'overview' });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const navigate = (v: ViewId) => {
    if (v === 'logout') {
      logout();
      return;
    }
    if (v === 'overview') setRoute({ name: 'overview' });
    else if (v === 'companies') setRoute({ name: 'companies' });
    else if (v === 'settings') setRoute({ name: 'settings' });
  };

  const handleManage = (id: string) => {
    setSelectedUserId(id);
    setRoute({ name: 'user', id });
  };

  const handleEdit = (id: string) => {
    setEditUserId(id);
    setRoute({ name: 'edit-user', id });
  };

  const activeMenu: ViewId =
    route.name === 'user' || route.name === 'overview'
      ? 'overview'
      : route.name === 'companies'
      ? 'companies'
      : route.name === 'edit-user'
      ? 'overview'
      : 'settings';

  return (
    <div className="h-screen bg-bg-base text-ink flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cx(
          'flex flex-col border-r border-border bg-bg-card/80 backdrop-blur-sm transition-[width] duration-300 ease-in-out flex-shrink-0',
          collapsed ? 'w-[68px]' : 'w-60'
        )}
      >
        <div className="flex items-center h-14 px-3 gap-2 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-brand-primary/15 ring-1 ring-brand-primary/40 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
          </div>
          {!collapsed && (
            <div className="leading-tight animate-slide-in">
              <p className="text-sm font-semibold text-ink">Admin Console</p>
              <p className="text-[10px] text-ink-muted">User Monitoring</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={cx(
                  'group relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all focus-ring',
                  isActive
                    ? 'bg-brand-primary/15 text-ink ring-1 ring-brand-primary/40'
                    : 'text-ink-muted hover:text-ink hover:bg-white/5'
                )}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-primary" />}
                <Icon className={cx('w-5 h-5 flex-shrink-0', isActive && 'text-brand-primary')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-border space-y-1">
          {/* Current user badge */}
          {!collapsed && user && (
            <div className="px-2.5 py-1.5 mb-1">
              <p className="text-[10px] text-ink-faint truncate">{user.username}</p>
              <p className="text-[10px] text-brand-primary font-medium">{isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
            </div>
          )}
          <button
            onClick={() => navigate('logout')}
            title={collapsed ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-ink-muted hover:text-brand-danger hover:bg-red-500/10 transition-all focus-ring"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cx('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {route.name === 'overview' && (
          <OverviewPage onManage={handleManage} onEdit={handleEdit} />
        )}
        {route.name === 'user' && selectedUserId && (
          <UserPage
            userId={selectedUserId}
            onBack={() => { setSelectedUserId(null); setRoute({ name: 'overview' }); }}
            onFriendClick={(id) => { setSelectedUserId(id); setRoute({ name: 'user', id }); }}
          />
        )}
        {route.name === 'companies' && (
          <CompaniesPage onSave={() => setRoute({ name: 'overview' })} onCancel={() => setRoute({ name: 'overview' })} />
        )}
        {route.name === 'edit-user' && editUserId && (
          <EditUserPage
            editId={editUserId}
            onSave={() => { setEditUserId(null); setRoute({ name: 'overview' }); }}
            onCancel={() => { setEditUserId(null); setRoute({ name: 'overview' }); }}
          />
        )}
        {route.name === 'settings' && (
          <SettingsPage onBack={() => setRoute({ name: 'overview' })} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <LoginPage />;

  return <Shell />;
}
