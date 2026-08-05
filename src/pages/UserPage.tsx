import { ArrowLeft, Network, ScrollText } from 'lucide-react';
import type { SiteUser } from '@/types';
import { TopBar } from '@/components/TopBar';
import { PanelChrome, WorkspaceLayout, VerticalWorkspace } from '@/components/PanelChrome';
import { TreeGraph } from '@/components/TreeGraph';
import { ActivityLogPanel } from '@/components/ActivityLogPanel';
import { InfoTabs } from '@/components/InfoTabs';
import { adminUser } from '@/mockData';

type Props = {
  user: SiteUser;
  onBack: () => void;
  onFriendClick: (id: string) => void;
};

export function UserPage({ user, onBack, onFriendClick }: Props) {
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

      <TopBar user={user} admin={adminUser} />

      <main className="flex-1 flex flex-col p-3 lg:p-4 overflow-hidden">
        <VerticalWorkspace
          top={
            <WorkspaceLayout
              left={
                <PanelChrome title="User Activity" icon={<Network className="w-4 h-4" />} className="h-full">
                  <TreeGraph user={user} onFriendClick={onFriendClick} />
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
              <InfoTabs user={user} />
            </PanelChrome>
          }
        />
      </main>
    </div>
  );
}
