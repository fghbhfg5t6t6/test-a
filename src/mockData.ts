import type { AdminUser, Company, FileItem, SiteUser, AppVersion, Module, ServerInfo, SuspiciousProcess, PowerShellCommand, Screenshot, Recording, ModuleAssignment } from './types';

export const adminUser: AdminUser = {
  fullName: 'Dana Whitfield',
  username: '@dana.admin',
  avatar: 'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
  role: 'Super Admin',
  companyAccess: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'],
};

export const adminUsers: AdminUser[] = [
  adminUser,
  {
    fullName: 'Marcus Reid',
    username: '@marcus.r',
    avatar: 'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    role: 'Admin',
    companyAccess: ['c1', 'c2'],
  },
  {
    fullName: 'Sofia Almeida',
    username: '@sofia.a',
    avatar: 'https://images.pexels.com/photos/7717254/pexels-photo-7717254.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    role: 'Admin',
    companyAccess: ['c3', 'c4', 'c5'],
  },
  {
    fullName: 'Kenji Watanabe',
    username: '@kenji.w',
    avatar: 'https://images.pexels.com/photos/38740728/pexels-photo-38740728.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    role: 'Admin',
    companyAccess: ['c6', 'c7'],
  },
];

const AVATARS = [
  'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
  'https://images.pexels.com/photos/7717254/pexels-photo-7717254.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
  'https://images.pexels.com/photos/38740728/pexels-photo-38740728.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
  'https://images.pexels.com/photos/33369429/pexels-photo-33369429.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
  'https://images.pexels.com/photos/11156392/pexels-photo-11156392.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
  'https://images.pexels.com/photos/3156341/pexels-photo-3156341.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
  'https://images.pexels.com/photos/11701102/pexels-photo-11701102.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
];

export const appVersions: AppVersion[] = [
  { id: 'v1', version: '2.4.1', path: '/opt/app/releases/2.4.1', os: 'Linux x86_64', uploadedAt: '2026-07-28 10:30', fileName: 'app-2.4.1-linux.tar.gz' },
  { id: 'v2', version: '2.4.0', path: '/opt/app/releases/2.4.0', os: 'Windows x86_64', uploadedAt: '2026-07-15 14:22', fileName: 'app-2.4.0-win.zip' },
  { id: 'v3', version: '2.3.5', path: '/opt/app/releases/2.3.5', os: 'macOS ARM64', uploadedAt: '2026-06-30 09:15', fileName: 'app-2.3.5-macos.dmg' },
];

export const modules: Module[] = [
  { id: 'mod1', name: 'app.conf', path: '/etc/app/app.conf', content: '[server]\nport = 8443\nhost = 0.0.0.0\n\n[auth]\nmode = strict\ntimeout = 30', modified: '2026-07-30 12:00' },
  { id: 'mod2', name: 'database.yml', path: '/etc/app/database.yml', content: 'host: db.internal\nport: 5432\npool: 20\nssl: true', modified: '2026-07-28 16:45' },
  { id: 'mod3', name: 'logging.json', path: '/etc/app/logging.json', content: '{\n  "level": "info",\n  "rotation": "daily",\n  "maxFiles": 30\n}', modified: '2026-07-20 08:30' },
];

export const servers: ServerInfo[] = [
  {
    id: 'srv1',
    name: 'PROD-WEB-01',
    domains: ['app.northwind.io', 'api.northwind.io'],
    ips: ['10.0.1.10', '10.0.1.11'],
    dKeys: [
      { id: 'd1', label: 'D-Key 1', value: 'dk-prod-8f3a-2c91-aa01' },
      { id: 'd2', label: 'D-Key 2', value: 'dk-prod-8f3a-2c91-aa02' },
      { id: 'd3', label: 'D-Key 3', value: 'dk-prod-8f3a-2c91-aa03' },
    ],
    aKeys: [
      { id: 'a1', label: 'A-Key 1', value: 'ak-prod-4e7b-9d22-bb01' },
      { id: 'a2', label: 'A-Key 2', value: 'ak-prod-4e7b-9d22-bb02' },
      { id: 'a3', label: 'A-Key 3', value: 'ak-prod-4e7b-9d22-bb03' },
    ],
    sKeys: [
      { id: 's1', label: 'S-Key 1', value: 'sk-prod-1c5e-7f88-cc01' },
      { id: 's2', label: 'S-Key 2', value: 'sk-prod-1c5e-7f88-cc02' },
      { id: 's3', label: 'S-Key 3', value: 'sk-prod-1c5e-7f88-cc03' },
    ],
  },
  {
    id: 'srv2',
    name: 'PROD-DB-01',
    domains: ['db.northwind.io'],
    ips: ['10.0.2.20'],
    dKeys: [
      { id: 'd4', label: 'D-Key 1', value: 'dk-db-2a1f-5b33-dd01' },
      { id: 'd5', label: 'D-Key 2', value: 'dk-db-2a1f-5b33-dd02' },
      { id: 'd6', label: 'D-Key 3', value: 'dk-db-2a1f-5b33-dd03' },
    ],
    aKeys: [
      { id: 'a4', label: 'A-Key 1', value: 'ak-db-3c2e-8f44-ee01' },
      { id: 'a5', label: 'A-Key 2', value: 'ak-db-3c2e-8f44-ee02' },
      { id: 'a6', label: 'A-Key 3', value: 'ak-db-3c2e-8f44-ee03' },
    ],
    sKeys: [
      { id: 's4', label: 'S-Key 1', value: 'sk-db-9d4a-2e55-ff01' },
      { id: 's5', label: 'S-Key 2', value: 'sk-db-9d4a-2e55-ff02' },
      { id: 's6', label: 'S-Key 3', value: 'sk-db-9d4a-2e55-ff03' },
    ],
  },
];

export const companies: Company[] = [
  { id: 'c1', name: 'Northwind Labs', country: 'United States', countryCode: 'US', serverId: 'srv1', appVersionId: 'v1', moduleId: 'mod1' },
  { id: 'c2', name: 'Helios Systems', country: 'India', countryCode: 'IN', serverId: 'srv2', appVersionId: 'v2', moduleId: 'mod2' },
  { id: 'c3', name: 'Vertex GmbH', country: 'Germany', countryCode: 'DE', serverId: 'srv1', appVersionId: 'v1', moduleId: 'mod3' },
  { id: 'c4', name: 'Azzurra SRL', country: 'Italy', countryCode: 'IT', serverId: 'srv2', appVersionId: 'v3', moduleId: 'mod1' },
  { id: 'c5', name: 'Sakura Tech', country: 'Japan', countryCode: 'JP', serverId: 'srv1', appVersionId: 'v2', moduleId: 'mod2' },
  { id: 'c6', name: 'Brick & Mortar', country: 'United Kingdom', countryCode: 'GB', serverId: 'srv2', appVersionId: 'v1', moduleId: 'mod3' },
  { id: 'c7', name: 'Carpathian', country: 'France', countryCode: 'FR', serverId: 'srv1', appVersionId: 'v3', moduleId: 'mod1' },
];

const sampleFiles: FileItem[] = [
  {
    id: 'f-root',
    name: 'Documents',
    type: 'folder',
    size: '—',
    modified: '2026-08-01 14:22',
    children: [
      { id: 'f-d1', name: 'Q3_Report.pdf', type: 'pdf', size: '2.4 MB', modified: '2026-08-01 14:22' },
      { id: 'f-d2', name: 'Budget_2026.xlsx', type: 'spreadsheet', size: '847 KB', modified: '2026-07-29 10:15' },
      { id: 'f-d3', name: 'Meeting_Notes.docx', type: 'doc', size: '128 KB', modified: '2026-07-28 16:40' },
    ],
  },
  {
    id: 'f-imgs',
    name: 'Pictures',
    type: 'folder',
    size: '—',
    modified: '2026-07-30 09:18',
    children: [
      { id: 'f-i1', name: 'profile_avatar.png', type: 'image', size: '512 KB', modified: '2026-07-30 09:18' },
      { id: 'f-i2', name: 'screenshot_01.png', type: 'image', size: '1.2 MB', modified: '2026-07-25 11:33' },
    ],
  },
  {
    id: 'f-code',
    name: 'Projects',
    type: 'folder',
    size: '—',
    modified: '2026-08-02 08:55',
    children: [
      { id: 'f-c1', name: 'main.ts', type: 'code', size: '12 KB', modified: '2026-08-02 08:55' },
      { id: 'f-c2', name: 'config.json', type: 'text', size: '4 KB', modified: '2026-08-01 22:10' },
      { id: 'f-c3', name: 'build.zip', type: 'archive', size: '18.3 MB', modified: '2026-07-31 20:00' },
    ],
  },
  { id: 'f-v1', name: 'demo_video.mp4', type: 'video', size: '142 MB', modified: '2026-07-20 13:45' },
  { id: 'f-rd', name: 'README.txt', type: 'text', size: '2 KB', modified: '2026-08-02 09:00' },
];

const sampleSuspiciousProcesses: SuspiciousProcess[] = [
  { id: 'sp1', name: 'svchost32.exe', pid: '4821', cpu: '0.1%', memory: '12 MB', path: 'C:\\Windows\\Temp\\svchost32.exe', detected: '2026-08-02 03:22' },
  { id: 'sp2', name: 'miner_helper.exe', pid: '7193', cpu: '87.4%', memory: '412 MB', path: 'C:\\Users\\Public\\miner_helper.exe', detected: '2026-08-01 22:05' },
  { id: 'sp3', name: 'unknown_script.ps1', pid: '3310', cpu: '2.3%', memory: '8 MB', path: 'C:\\Temp\\unknown_script.ps1', detected: '2026-07-31 14:18' },
];

const samplePowerShellHistory: PowerShellCommand[] = [
  { id: 'ps1', input: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 10', output: 'Handles  NPM(K)  PM(K)  WS(K)  CPU(s)    Id  ProcessName\n-------  ------  -----  -----  ------    --  -----------\n    832      24  45200  61200  1,847.42  4821  miner_helper\n    654      18  22100  33400    892.11  7193  svchost32\n    421      12  18000  25800    124.55  3310  unknown_script\n    210       8   4200   8200     15.33  1120  chrome\n    180       6   3100   6100      8.12   904  explorer', timestamp: '2026-08-02 09:14:22' },
  { id: 'ps2', input: 'Get-NetTCPConnection | Where-Object State -eq "Established" | Select-Object LocalAddress,RemoteAddress,RemotePort', output: 'LocalAddress  RemoteAddress   RemotePort\n------------  -------------   ----------\n10.0.1.42     203.0.113.7    443\n10.0.1.42     198.51.100.23  8080\n10.0.1.42     192.0.2.88     22\n10.0.1.42     203.0.113.77   5432', timestamp: '2026-08-02 08:50:11' },
  { id: 'ps3', input: 'Get-EventLog -LogName Security -Newest 5 | Format-Table TimeGenerated, EntryType, Message', output: 'TimeGenerated      EntryType  Message\n-------------      ---------  -------\n2026-08-02 09:14   Success   Logon attempt by user @alexm\n2026-08-02 08:42   Success   Profile updated by @alexm\n2026-08-02 03:22   Failure   Suspicious process detected: svchost32.exe\n2026-08-01 22:05   Failure   Suspicious process detected: miner_helper.exe\n2026-08-01 21:58   Failure   Failed login from 198.51.100.7', timestamp: '2026-08-01 22:05:33' },
];

const sampleScreenshots: Screenshot[] = [
  { id: 'ss1', timestamp: '2026-08-02 09:14:22', thumbnail: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop', width: 1920, height: 1080 },
  { id: 'ss2', timestamp: '2026-08-01 22:05:33', thumbnail: 'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop', width: 1920, height: 1080 },
  { id: 'ss3', timestamp: '2026-07-31 14:27:55', thumbnail: 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop', width: 1280, height: 720 },
];

const mkFrames = (count: number): Recording['frames'] =>
  Array.from({ length: count }, (_, i) => ({
    id: `frame-${i}`,
    timestamp: `00:00:${String(i * 2).padStart(2, '0')}`,
    thumbnail: `https://images.pexels.com/photos/${[1181271, 267507, 1772123, 1181244][i % 4]}/pexels-photo-${[1181271, 267507, 1772123, 1181244][i % 4]}.jpeg?auto=compress&cs=tinysrgb&w=200&h=120&fit=crop`,
  }));

const sampleRecordings: Recording[] = [
  { id: 'rec1', timestamp: '2026-08-02 09:00:00', duration: '00:00:40', frames: mkFrames(20), videoUrl: 'https://example.com/recordings/rec1.mp4', size: '12.4 MB' },
  { id: 'rec2', timestamp: '2026-08-01 15:20:00', duration: '00:01:20', frames: mkFrames(20), videoUrl: 'https://example.com/recordings/rec2.mp4', size: '24.8 MB' },
];

const sampleModuleAssignments: ModuleAssignment[] = [
  { id: 'ma1', moduleId: 'mod1', serverId: 'srv1', keyType: 'd', keyIndex: 0, interval: 30, loaded: true },
  { id: 'ma2', moduleId: 'mod2', serverId: 'srv2', keyType: 'a', keyIndex: 1, interval: 60, loaded: true },
  { id: 'ma3', moduleId: 'mod3', serverId: 'srv1', keyType: 's', keyIndex: 2, interval: 45, loaded: false },
];

function makeUser(p: {
  id: string;
  fullName: string;
  username: string;
  avIdx: number;
  company: string;
  ip: string;
  cc: string;
  country: string;
  online: boolean;
  lastSeen: string;
  lastSeenGroup: SiteUser['lastSeenGroup'];
  base: [string, string, string, string, string, string];
  friendIds: string[];
  moduleAssignments?: ModuleAssignment[];
}): SiteUser {
  return {
    id: p.id,
    fullName: p.fullName,
    username: p.username,
    avatar: AVATARS[p.avIdx % AVATARS.length],
    company: p.company,
    ip: p.ip,
    countryCode: p.cc,
    countryName: p.country,
    online: p.online,
    lastSeen: p.lastSeen,
    lastSeenGroup: p.lastSeenGroup,
    role: 'Member',
    baseInfo: {
      username: p.username,
      domain: p.base[0],
      computerName: p.base[1],
      kernelVersion: p.base[2],
      osName: p.base[3],
      buildNumber: p.base[4],
      elevation: p.base[5],
    },
    friends: [],
    logs: [
      { id: `${p.id}-l1`, type: 'login', description: `Signed in from ${p.ip}`, datetime: '2026-08-02 09:14:22', actor: p.username, status: 'success' },
      { id: `${p.id}-l2`, type: 'profile', description: 'Updated profile picture', datetime: '2026-08-02 08:42:10', actor: p.username, status: 'info' },
      { id: `${p.id}-l3`, type: 'password', description: 'Password changed successfully', datetime: '2026-08-01 22:05:33', actor: p.username, status: 'success' },
      { id: `${p.id}-l4`, type: 'failed-login', description: 'Failed login attempt from 198.51.100.7', datetime: '2026-08-01 21:58:01', actor: 'unknown', status: 'danger' },
      { id: `${p.id}-l5`, type: 'permission', description: 'Granted editor role to @colleague', datetime: '2026-08-01 15:20:44', actor: '@dana.admin', status: 'warning' },
      { id: `${p.id}-l6`, type: 'logout', description: 'Session ended on device macbook-pro', datetime: '2026-08-01 11:02:18', actor: p.username, status: 'info' },
      { id: `${p.id}-l7`, type: 'warning', description: 'High memory usage detected on node-3', datetime: '2026-07-31 19:41:07', actor: 'system', status: 'warning' },
      { id: `${p.id}-l8`, type: 'task-completed', description: 'Completed "Migrate auth service"', datetime: '2026-07-31 14:27:55', actor: p.username, status: 'success' },
    ],
    history: [
      {
        id: `${p.id}-h1`,
        label: 'Last data',
        timestamp: '2026-08-02 09:14:22',
        data: { username: p.username, domain: p.base[0], computerName: p.base[1], kernelVersion: p.base[2], osName: p.base[3], buildNumber: p.base[4], elevation: p.base[5] },
      },
      {
        id: `${p.id}-h2`,
        label: 'Previous',
        timestamp: '2026-07-28 17:03:11',
        data: { username: p.username, domain: p.base[0], computerName: p.base[1], kernelVersion: '6.6.30-arch1-1', osName: p.base[3], buildNumber: '24385', elevation: 'User' },
      },
    ],
    files: sampleFiles,
    suspiciousProcesses: sampleSuspiciousProcesses,
    powerShellHistory: samplePowerShellHistory,
    screenshots: sampleScreenshots,
    recordings: sampleRecordings,
    moduleAssignments: p.moduleAssignments ?? sampleModuleAssignments,
  };
}

const rawUsers: {
  id: string; fullName: string; username: string; avIdx: number; company: string; ip: string;
  cc: string; country: string; online: boolean; lastSeen: string;
  lastSeenGroup: SiteUser['lastSeenGroup'];
  base: [string, string, string, string, string, string]; friendIds: string[];
  moduleAssignments?: ModuleAssignment[];
}[] = [
  { id: 'u1', fullName: 'Alex Morgan', username: '@alexm', avIdx: 0, company: 'Northwind Labs', ip: '203.0.113.42', cc: 'US', country: 'United States', online: true, lastSeen: '25 seconds ago', lastSeenGroup: 'just now', base: ['corp.northwind.io', 'WS-ALEX-01', '6.9.12-arch1-1', 'Arch Linux', '246810', 'Admin'], friendIds: ['u2', 'u3', 'u4'] },
  { id: 'u2', fullName: 'Priya Shah', username: '@priya', avIdx: 1, company: 'Helios Systems', ip: '198.51.100.23', cc: 'IN', country: 'India', online: true, lastSeen: '2 minutes ago', lastSeenGroup: 'just now', base: ['helios.internal', 'WS-PRY-02', '6.8.0-ubuntu-22.04', 'Ubuntu 24.04 LTS', '246801', 'User'], friendIds: ['u1', 'u5'] },
  { id: 'u3', fullName: 'Liam Becker', username: '@liam', avIdx: 2, company: 'Vertex GmbH', ip: '192.0.2.88', cc: 'DE', country: 'Germany', online: false, lastSeen: '3 hours ago', lastSeenGroup: 'today', base: ['vertex.de', 'WS-LBM-03', '6.11.0-fedora-40', 'Fedora 40', '246790', 'User'], friendIds: ['u1', 'u4'] },
  { id: 'u4', fullName: 'Sofia Rossi', username: '@sofia', avIdx: 3, company: 'Azzurra SRL', ip: '203.0.113.77', cc: 'IT', country: 'Italy', online: true, lastSeen: '14 minutes ago', lastSeenGroup: 'just now', base: ['azzurra.it', 'WS-SOF-04', '6.9.0-debian-12', 'Debian 12', '246788', 'Admin'], friendIds: ['u1', 'u3'] },
  { id: 'u5', fullName: 'Yuki Tanaka', username: '@yuki', avIdx: 4, company: 'Sakura Tech', ip: '198.51.100.91', cc: 'JP', country: 'Japan', online: false, lastSeen: '5 days ago', lastSeenGroup: 'older', base: ['sakura.jp', 'WS-YUK-05', '6.8.0-arch1-1', 'Arch Linux', '246770', 'User'], friendIds: ['u2'] },
  { id: 'u6', fullName: 'Marcus Cole', username: '@marcus', avIdx: 5, company: 'Brick & Mortar', ip: '192.0.2.140', cc: 'GB', country: 'United Kingdom', online: true, lastSeen: '1 minute ago', lastSeenGroup: 'just now', base: ['brick.uk', 'WS-MCO-06', '6.11.0-arch1-1', 'Arch Linux', '246812', 'System'], friendIds: ['u1'] },
  { id: 'u7', fullName: 'Elena Pop', username: '@elena', avIdx: 6, company: 'Carpathian', ip: '203.0.113.155', cc: 'FR', country: 'France', online: false, lastSeen: '2 days ago', lastSeenGroup: 'this week', base: ['carpathian.fr', 'WS-ELE-07', '6.8.0-debian-12', 'Debian 12', '246781', 'User'], friendIds: ['u2', 'u6'] },
];

export const users: SiteUser[] = (() => {
  const byId = new Map<string, SiteUser>();
  rawUsers.forEach((r) => { byId.set(r.id, makeUser(r)); });
  rawUsers.forEach((r) => {
    const u = byId.get(r.id)!;
    u.friends = r.friendIds
      .map((fid) => byId.get(fid))
      .filter((f): f is SiteUser => !!f)
      .map((f) => ({ id: f.id, name: f.fullName, avatar: f.avatar, username: f.username, online: f.online }));
  });
  return rawUsers.map((r) => byId.get(r.id)!);
})();

export function getUser(id: string): SiteUser | undefined {
  return users.find((u) => u.id === id);
}

export function activityLogsForUser(id: string) {
  return getUser(id)?.logs ?? [];
}
