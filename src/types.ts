export type ViewId = 'overview' | 'companies' | 'settings' | 'logout';

export type ActivityLogType =
  | 'login'
  | 'logout'
  | 'password'
  | 'profile'
  | 'task-assigned'
  | 'task-completed'
  | 'user-created'
  | 'permission'
  | 'failed-login'
  | 'warning';

export type ActivityLog = {
  id: string;
  type: ActivityLogType;
  description: string;
  datetime: string;
  actor: string;
  status: 'success' | 'warning' | 'danger' | 'info';
};

export type BaseInfo = {
  username: string;
  domain: string;
  computerName: string;
  kernelVersion: string;
  osName: string;
  buildNumber: string;
  elevation: string;
};

export type BaseInfoRecord = {
  id: string;
  label: string;
  timestamp: string;
  data: BaseInfo;
};

export type SuspiciousProcess = {
  id: string;
  name: string;
  pid: string;
  cpu: string;
  memory: string;
  path: string;
  detected: string;
};

export type Friend = {
  id: string;
  name: string;
  avatar: string;
  username: string;
  online: boolean;
};

export type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'archive' | 'video' | 'code' | 'text';
  size: string;
  modified: string;
  children?: FileItem[];
};

export type PowerShellCommand = {
  id: string;
  input: string;
  output: string;
  timestamp: string;
};

export type Screenshot = {
  id: string;
  timestamp: string;
  thumbnail: string;
  width: number;
  height: number;
};

export type RecordingFrame = {
  id: string;
  timestamp: string;
  thumbnail: string;
};

export type Recording = {
  id: string;
  timestamp: string;
  duration: string;
  frames: RecordingFrame[];
  videoUrl: string;
  size: string;
};

export type Module = {
  id: string;
  name: string;
  path: string;
  content: string;
  modified: string;
};

export type ModuleAssignment = {
  id: string;
  moduleId: string;
  serverId: string;
  keyType: 'd' | 'a' | 's';
  keyIndex: number;
  interval: number;
  loaded: boolean;
};

export type SiteUser = {
  id: string;
  fullName: string;
  username: string;
  avatar: string;
  company: string;
  ip: string;
  countryCode: string;
  countryName: string;
  online: boolean;
  lastSeen: string;
  lastSeenGroup: 'just now' | 'today' | 'this week' | 'older';
  role: 'Admin' | 'Editor' | 'Member' | 'Guest';
  baseInfo: BaseInfo;
  friends: Friend[];
  logs: ActivityLog[];
  history: BaseInfoRecord[];
  files: FileItem[];
  suspiciousProcesses: SuspiciousProcess[];
  powerShellHistory: PowerShellCommand[];
  screenshots: Screenshot[];
  recordings: Recording[];
  moduleAssignments: ModuleAssignment[];
};

export type Company = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  serverId: string;
  appVersionId: string;
  moduleId: string;
};

export type AdminUser = {
  fullName: string;
  username: string;
  avatar: string;
  role: string;
  companyAccess: string[];
};

export type AppVersion = {
  id: string;
  version: string;
  path: string;
  os: string;
  uploadedAt: string;
  fileName: string;
};

export type ServerKey = {
  id: string;
  label: string;
  value: string;
};

export type ServerInfo = {
  id: string;
  name: string;
  domains: string[];
  ips: string[];
  dKeys: ServerKey[];
  aKeys: ServerKey[];
  sKeys: ServerKey[];
};
