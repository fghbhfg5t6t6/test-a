import { Search, ChevronDown, Pencil, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { users, adminUser, companies } from '@/mockData';
import { Badge } from '@/components/ui/Badge';
import { cx, flagUrl } from '@/lib/utils';

type Props = {
  onManage: (id: string) => void;
  onEdit: (id: string) => void;
};

const lastSeenOptions = ['All', 'just now', 'today', 'this week', 'older'] as const;
const lastSeenLabels: Record<string, string> = {
  'just now': 'Just now',
  today: 'Today',
  'this week': 'This week',
  older: 'Older',
};

export function OverviewPage({ onManage, onEdit }: Props) {
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [lastSeenFilter, setLastSeenFilter] = useState<string>('All');

  const countries = useMemo(() => {
    const set = new Map<string, string>();
    users.forEach((u) => set.set(u.countryCode, u.countryName));
    return [...set.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        !query ||
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.company.toLowerCase().includes(query.toLowerCase());
      const matchesCompany = companyFilter === 'All' || u.company === companyFilter;
      const matchesCountry = countryFilter === 'All' || u.countryCode === countryFilter;
      const matchesLastSeen = lastSeenFilter === 'All' || u.lastSeenGroup === lastSeenFilter;
      return matchesQuery && matchesCompany && matchesCountry && matchesLastSeen;
    });
  }, [query, companyFilter, countryFilter, lastSeenFilter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Admin header */}
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-border bg-bg-card/40">
        <div className="relative flex-shrink-0">
          <img src={adminUser.avatar} alt={adminUser.fullName} className="w-9 h-9 rounded-full object-cover ring-1 ring-border" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-success ring-2 ring-bg-card" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">{adminUser.fullName}</p>
          <p className="text-[11px] text-ink-muted">{adminUser.role} · viewing overview</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-ink-muted">
          <span className="px-2 py-0.5 rounded-md bg-white/5 ring-1 ring-border-subtle">{users.length} users</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/30">
            {users.filter((u) => u.online).length} online
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-4 lg:px-6 py-3 border-b border-border flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, companies…"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-bg-card border border-border text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 transition-colors"
          />
        </div>

        <FilterDropdown label="Company" value={companyFilter} onChange={setCompanyFilter} options={['All', ...companies.map((c) => c.name)]} />
        <FilterDropdown
          label="Country"
          value={countryFilter}
          onChange={setCountryFilter}
          options={['All', ...countries.map(([code]) => code)]}
          renderOption={(opt) => opt === 'All' ? 'All countries' : `${opt} ${countries.find(([c]) => c === opt)?.[1] ?? opt}`}
        />
        <FilterDropdown
          label="Last seen"
          value={lastSeenFilter}
          onChange={setLastSeenFilter}
          options={[...lastSeenOptions]}
          renderOption={(opt) => opt === 'All' ? 'All time' : (lastSeenLabels[opt] ?? opt)}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-bg-card">
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="px-4 lg:px-6 py-2.5 font-medium">User</th>
              <th className="px-3 py-2.5 font-medium hidden md:table-cell">Company</th>
              <th className="px-3 py-2.5 font-medium hidden lg:table-cell">IP Address</th>
              <th className="px-3 py-2.5 font-medium">Country</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium hidden md:table-cell">Last seen</th>
              <th className="px-3 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border-subtle hover:bg-white/[0.02] transition-colors">
                <td className="px-4 lg:px-6 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
                      <span className={cx('absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-bg-base', u.online ? 'bg-brand-success' : 'bg-gray-500')} />
                    </div>
                    <div className="leading-tight min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{u.fullName}</p>
                      <p className="text-[10px] text-ink-muted truncate">{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell text-xs text-ink-muted">{u.company}</td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <a href={`https://www.iplocation.net/?ip=${u.ip}`} target="_blank" rel="noreferrer" className="text-xs text-ink-muted hover:text-brand-primary transition-colors font-mono">{u.ip}</a>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                    <img src={flagUrl(u.countryCode)} alt={u.countryCode} className="w-4 h-3 rounded-sm flex-shrink-0 object-cover ring-1 ring-white/10" loading="lazy" />
                    <span className="hidden xl:inline">{u.countryName}</span>
                    <span className="xl:hidden">{u.countryCode}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant={u.online ? 'success' : 'muted'} dot>{u.online ? 'Online' : 'Offline'}</Badge>
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell text-xs text-ink-muted">{u.lastSeen}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => onManage(u.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-primary/15 text-brand-primary hover:bg-brand-primary hover:text-white transition-all focus-ring">
                      <Settings2 className="w-3 h-3" />Manage
                    </button>
                    <button onClick={() => onEdit(u.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/5 text-ink-muted hover:bg-white/10 hover:text-ink transition-all focus-ring">
                      <Pencil className="w-3 h-3" />Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-bg-card flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-ink-faint" />
            </div>
            <p className="text-sm text-ink">No users found</p>
            <p className="text-xs text-ink-muted mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({
  label, value, onChange, options, renderOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderOption?: (opt: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const display = renderOption ? renderOption(value) : value === 'All' ? `All ${label.toLowerCase()}s` : value;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-bg-card border border-border text-xs font-medium text-ink-muted hover:text-ink hover:border-brand-primary/40 transition-colors focus-ring"
      >
        {display}
        <ChevronDown className={cx('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 min-w-[160px] max-h-64 overflow-y-auto rounded-lg bg-bg-elevated border border-border shadow-soft py-1 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cx(
                'w-full text-left px-3 py-1.5 text-xs transition-colors',
                value === opt ? 'text-brand-primary bg-brand-primary/10' : 'text-ink-muted hover:text-ink hover:bg-white/5'
              )}
            >
              {renderOption ? renderOption(opt) : opt === 'All' ? `All ${label.toLowerCase()}s` : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

