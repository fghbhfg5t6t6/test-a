import type {
  SiteUser,
  Company,
  ActivityLog,
  BaseInfo,
  FileItem,
  PowerShellCommand,
  Screenshot,
  ModuleAssignment,
} from '@/types';

// ---- Raw API response shapes (from Django REST Framework) ----

export type ApiAuthUser = {
  id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  profile_picture?: string | null;
};

export type ApiTokenResponse = {
  access: string;
  refresh: string;
  user: ApiAuthUser;
};

export type ApiRefreshResponse = {
  access: string;
  refresh: string;
};

export type ApiCompany = {
  id: number;
  name: string;
  country: string;
  country_name: string;
  logo: string | null;
  module_pack: number;
  module_pack_name: string;
  server: number;
  server_name: string;
  application: number;
  application_name: string;
  created_at: string;
  updated_at: string;
};

export type ApiAdmin = {
  id: number;
  username: string;
  name: string;
  role: string;
  companies: { id: number; name: string }[];
  created_at: string;
};

export type ApiAppUser = {
  id: number;
  name: string;
  company: number;
  company_name: string;
  country: string;
  country_name: string;
  ip: string;
  status: boolean;
  last_seen: string;
  signup_date: string;
  role: string;
  profile: string | null;
  activity_log: string;
};

export type ApiUserStats = {
  total: number;
  active: number;
  inactive: number;
  online_now: number;
  new_last_7_days: number;
  by_company: {
    company: number;
    company_name: string;
    total: number;
    active: number;
  }[];
};

export type ApiUserInfo = {
  id: number;
  user: number;
  username: string;
  domain: string;
  computer_name: string;
  kernel_version: string;
  os_name: string;
  build_number: string;
  elevation: string;
  ip: string;
};

export type ApiMedia = {
  id: number;
  user: number;
  file: string;
  type: string;
  created_at: string;
};

export type ApiCommand = {
  id: number;
  user: number;
  command: string;
  response: string;
  executed_at: string;
};

export type ApiModuleUsage = {
  id: number;
  user: number;
  module: number;
  module_name: string;
  parent_module: number | null;
  parent_module_name: string | null;
  server_conf: string;
  interval: number;
};

export type ApiFile = {
  id: number;
  user: number;
  parent: number | null;
  path: string;
  type: string;
  modified: string;
  size: number | null;
};

export type ApiProcess = {
  id: number;
  user: number;
  process_name: string;
  pid: number;
};

export type ApiLog = {
  id: number;
  user: number;
  entry: string;
  created_at: string;
};

// ---- Paginated response wrapper (DRF) ----

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function isPaginated<T>(data: unknown): data is Paginated<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    'count' in data
  );
}

export function unwrapList<T>(data: T[] | Paginated<T>): T[] {
  return isPaginated<T>(data) ? data.results : data;
}

// ---- Adapters: API → frontend domain types ----

const countryCodeToName: Record<string, string> = {};

export function adaptCompany(c: ApiCompany): Company {
  return {
    id: String(c.id),
    name: c.name,
    country: c.country_name,
    countryCode: c.country,
    serverId: String(c.server),
    appVersionId: String(c.application),
    moduleGroupId: String(c.module_pack),
  };
}

export function adaptAppUser(
  u: ApiAppUser,
  info?: ApiUserInfo | null,
): SiteUser {
  const online = isOnline(u.last_seen);
  const baseInfo: BaseInfo = info
    ? {
        username: info.username,
        domain: info.domain,
        computerName: info.computer_name,
        kernelVersion: info.kernel_version,
        osName: info.os_name,
        buildNumber: info.build_number,
        elevation: info.elevation,
      }
    : {
        username: u.name.toLowerCase().replace(/\s+/g, ''),
        domain: '—',
        computerName: '—',
        kernelVersion: '—',
        osName: '—',
        buildNumber: '—',
        elevation: '—',
      };

  return {
    id: String(u.id),
    fullName: u.name,
    username: u.name,
    avatar: u.profile ?? '',
    company: u.company_name,
    ips: u.ip ? [u.ip] : [],
    ip: u.ip ?? '—',
    countryCode: u.country,
    countryName: u.country_name,
    online,
    lastSeen: formatLastSeen(u.last_seen),
    lastSeenGroup: lastSeenGroup(u.last_seen),
    role: mapRole(u.role),
    baseInfo,
    friends: [],
    logs: parseActivityLog(u.activity_log),
    history: [],
    files: [],
    suspiciousProcesses: [],
    powerShellHistory: [],
    screenshots: [],
    recordings: [],
    moduleAssignments: [],
  };
}

export function adaptUserInfo(info: ApiUserInfo): Partial<SiteUser> {
  return {
    baseInfo: {
      username: info.username,
      domain: info.domain,
      computerName: info.computer_name,
      kernelVersion: info.kernel_version,
      osName: info.os_name,
      buildNumber: info.build_number,
      elevation: info.elevation,
    },
    ip: info.ip,
    ips: info.ip ? [info.ip] : [],
  };
}

export function adaptCommand(c: ApiCommand): PowerShellCommand {
  return {
    id: String(c.id),
    input: c.command,
    output: c.response,
    timestamp: c.executed_at,
  };
}

export function adaptMedia(m: ApiMedia): Screenshot {
  return {
    id: String(m.id),
    timestamp: m.created_at,
    thumbnail: m.file,
    width: 1920,
    height: 1080,
  };
}

export function adaptFile(f: ApiFile): FileItem {
  const name = f.path.split('/').pop() || f.path;
  const isDir = f.type === 'directory';
  return {
    id: String(f.id),
    name,
    type: isDir ? 'folder' : fileTypeFromName(name),
    size: f.size ? formatFileSize(f.size) : '—',
    modified: f.modified,
  };
}

export function adaptLog(l: ApiLog): ActivityLog {
  return {
    id: String(l.id),
    type: 'login',
    description: l.entry,
    datetime: l.created_at,
    actor: 'system',
    status: 'info',
  };
}

export function adaptProcess(p: ApiProcess) {
  return {
    id: String(p.id),
    name: p.process_name,
    pid: String(p.pid),
    cpu: '—',
    memory: '—',
    path: '',
    detected: '',
  };
}

export function adaptModuleUsage(m: ApiModuleUsage): ModuleAssignment {
  return {
    id: String(m.id),
    moduleId: String(m.module),
    kind: 'base',
    parentId: m.parent_module ? String(m.parent_module) : '',
    keyType: 'd',
    keyIndex: 0,
    interval: m.interval,
    loaded: true,
  };
}

// ---- Helpers ----

function isOnline(lastSeen: string): boolean {
  const d = new Date(lastSeen).getTime();
  if (isNaN(d)) return false;
  return Date.now() - d < 5 * 60 * 1000;
}

function formatLastSeen(lastSeen: string): string {
  const d = new Date(lastSeen).getTime();
  if (isNaN(d)) return '—';
  const diff = Date.now() - d;
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} minutes ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)} hours ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} days ago`;
  return new Date(lastSeen).toLocaleDateString();
}

function lastSeenGroup(lastSeen: string): SiteUser['lastSeenGroup'] {
  const d = new Date(lastSeen).getTime();
  if (isNaN(d)) return 'older';
  const diff = Date.now() - d;
  if (diff < 60_000) return 'just now';
  if (diff < 86_400_000) return 'today';
  if (diff < 7 * 86_400_000) return 'this week';
  return 'older';
}

function mapRole(role: string): SiteUser['role'] {
  const r = role.toLowerCase();
  if (r.includes('admin')) return 'Admin';
  if (r.includes('editor')) return 'Editor';
  if (r.includes('guest')) return 'Guest';
  return 'Member';
}

function parseActivityLog(raw: string): ActivityLog[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not JSON — split by newlines as simple log entries
    return raw
      .split('\n')
      .filter((l) => l.trim())
      .map((line, i) => ({
        id: `log-${i}`,
        type: 'login' as const,
        description: line,
        datetime: new Date().toLocaleString('sv-SE'),
        actor: 'system',
        status: 'info' as const,
      }));
  }
  return [];
}

function fileTypeFromName(name: string): FileItem['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return 'archive';
  if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return 'video';
  if (['ts', 'js', 'py', 'go', 'rs', 'java', 'c', 'cpp'].includes(ext)) return 'code';
  return 'text';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
