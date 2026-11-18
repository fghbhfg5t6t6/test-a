import { useState, useEffect } from 'react';
import { ArrowLeft, Network, ScrollText, AlertCircle, Loader2 } from 'lucide-react';
import { useUser, useUserInfo, useUserLogs, toErrMsg } from '@/lib/hooks';
import { useAuth } from '@/lib/AuthContext';
import { TopBar } from '@/components/TopBar';
import { PanelChrome, WorkspaceLayout, VerticalWorkspace } from '@/components/PanelChrome';
import { TreeGraph } from '@/components/TreeGraph';
import { ActivityLogPanel } from '@/components/ActivityLogPanel';
import { InfoTabs } from '@/components/InfoTabs';
import type { SiteUser, ModuleAssignment, AdminUser, ActivityLog } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

type Props = {
  userId: string;
  onBack: () => void;
  onFriendClick: (id: string) => void;
};

export function UserPage({ userId, onBack, onFriendClick }: Props) {
  const { user: currentUser } = useAuth();
  const { data: apiUser, loading, error, refetch } = useUser(userId);
  const [assignments, setAssignments] = useState<ModuleAssignment[]>([]);

  const admin: AdminUser = {
    fullName: currentUser?.username ?? '',
    username: currentUser?.username ?? '',
    avatar: currentUser?.profilePicture ?? '',
    role: currentUser?.isSuperuser ? 'Super Admin' : 'Admin',
    companyAccess: [],
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 px-4 lg:px-6 py-2 border-b border-border bg-bg-card/40">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !apiUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 ring-1 ring-red-500/30 flex items-center justify-center mb-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-ink">Failed to load user</p>
        <p className="text-xs text-ink-muted mt-1 max-w-sm">{error ?? 'User not found'}</p>
        <button onClick={refetch} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-primary/15 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const user: SiteUser = apiUser;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back bar */}
      <div className="flex items-center gap-2 px-4 lg:px-6 py-2 border-b border-border bg-bg-card/40">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </button>
        <span className="text-xs text-ink-faint">/</span>
        <span className="text-xs font-medium text-ink">{user.fullName}</span>
      </div>

      <TopBar user={user} admin={admin} />

      <main className="flex-1 flex flex-col p-3 lg:p-4 overflow-hidden">
        <VerticalWorkspace
          top={
            <WorkspaceLayout
              left={
                <PanelChrome title="User Activity" icon={<Network className="w-4 h-4" />} className="h-full">
                  <TreeGraph
                    user={user}
                    assignments={assignments}
                    setAssignments={setAssignments}
                    onFriendClick={onFriendClick}
                  />
                </PanelChrome>
              }
              right={
                <PanelChrome title="Activity Log" icon={<ScrollText className="w-4 h-4" />} className="h-full">
                  <ActivityLogPanel user={user} />
                </PanelChrome>
              }
            />
          }
          bottom={
            <PanelChrome title="Details" className="h-full">
              <InfoTabs user={user} assignments={assignments} setAssignments={setAssignments} />
            </PanelChrome>
          }
        />
      </main>
    </div>
  );
}
