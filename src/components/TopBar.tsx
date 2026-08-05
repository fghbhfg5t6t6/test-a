import { Bell, Globe, Building2, Clock } from 'lucide-react';
import type { SiteUser, AdminUser } from '@/types';
import { Badge } from './ui/Badge';
import { cx, flagUrl } from '@/lib/utils';

type Props = {
  user: SiteUser;
  admin: AdminUser;
  loading?: boolean;
};

export function TopBar({ user, admin, loading }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg-base/70 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-20">
        {loading ? (
          <div className="skeleton h-12 w-full max-w-3xl rounded-xl" />
        ) : (
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-bg-card/70 ring-1 ring-border-subtle shadow-soft flex-wrap">
            {/* Avatar + status */}
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-border"
              />
              <span
                className={cx(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-bg-card',
                  user.online ? 'bg-brand-success' : 'bg-gray-500'
                )}
              />
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="text-[11px] text-ink-muted">{user.username}</p>
            </div>

            <Badge variant={user.online ? 'success' : 'muted'} dot>
              {user.online ? 'Online' : 'Offline'}
            </Badge>

            <a
              href={`https://www.iplocation.net/?ip=${user.ip}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-ink-muted hover:text-brand-primary hover:bg-white/5 transition-colors focus-ring"
              title={`View IP info for ${user.ip}`}
            >
              <Globe className="w-3.5 h-3.5" />
              {user.ip}
            </a>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md ring-1 ring-border-subtle">
              <img
                src={flagUrl(user.countryCode)}
                alt={user.countryCode}
                className="w-4 h-3 rounded-sm flex-shrink-0 object-cover ring-1 ring-white/10"
                loading="lazy"
              />
              <span className="text-xs font-medium text-ink">{user.countryCode}</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 ring-1 ring-border-subtle">
              <Building2 className="w-3.5 h-3.5 text-ink-muted" />
              <span className="text-xs text-ink-muted">{user.company}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 ring-1 ring-border-subtle">
              <Clock className="w-3.5 h-3.5 text-ink-muted" />
              <span className="text-xs text-ink-muted">{user.lastSeen}</span>
            </div>
          </div>
        )}

        {/* Admin viewer indicator */}
        <div className="ml-auto flex items-center gap-2.5 px-3 py-2 rounded-xl bg-bg-card/70 ring-1 ring-border-subtle shadow-soft">
          <div className="relative flex-shrink-0">
            <img src={admin.avatar} alt={admin.fullName} className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-success ring-2 ring-bg-card" />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-ink">{admin.fullName}</p>
            <p className="text-[10px] text-ink-muted">{admin.role}</p>
          </div>
          <button className="ml-1 p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors focus-ring relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-danger" />
          </button>
        </div>
      </div>
    </header>
  );
}
