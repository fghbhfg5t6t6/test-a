import type {
  ApiUserInfo,
  ApiMedia,
  ApiCommand,
  ApiModuleUsage,
  ApiFile,
  ApiProcess,
  ApiLog,
} from './apiTypes';
import { getList, getOne, putOne, patchOne, isAbortError } from './apiClient';

// ---- User Info ----

export async function getUserInfo(userId: number, signal?: AbortSignal): Promise<ApiUserInfo | null> {
  try {
    return await getOne<ApiUserInfo>(`/users/${userId}/info/`, undefined, signal);
  } catch (err) {
    if (isAbortError(err)) throw err;
    // 404 is expected if no UserInfo record exists yet
    if (typeof err === 'object' && err !== null && 'status' in err && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function updateUserInfo(
  userId: number,
  body: Record<string, unknown>,
): Promise<ApiUserInfo> {
  return putOne<ApiUserInfo>(`/users/${userId}/info/`, body);
}

export async function patchUserInfo(
  userId: number,
  body: Record<string, unknown>,
): Promise<ApiUserInfo> {
  return patchOne<ApiUserInfo>(`/users/${userId}/info/`, body);
}

// ---- Media ----

export async function listMedia(userId: number, type?: string, signal?: AbortSignal): Promise<ApiMedia[]> {
  return getList<ApiMedia>(`/users/${userId}/media/`, type ? { type } : undefined, signal);
}

// ---- Commands ----

export async function listCommands(userId: number, search?: string, signal?: AbortSignal): Promise<ApiCommand[]> {
  return getList<ApiCommand>(`/users/${userId}/commands/`, search ? { search } : undefined, signal);
}

// ---- Module Usage ----

export async function listModuleUsage(userId: number, moduleId?: number, signal?: AbortSignal): Promise<ApiModuleUsage[]> {
  return getList<ApiModuleUsage>(
    `/users/${userId}/module-usage/`,
    moduleId ? { module: moduleId } : undefined,
    signal,
  );
}

// ---- Files ----

export async function listFiles(
  userId: number,
  opts?: { parent?: number; type?: string; search?: string },
  signal?: AbortSignal,
): Promise<ApiFile[]> {
  const params: Record<string, string | number | boolean | undefined> = {};
  if (opts?.parent !== undefined) params.parent = opts.parent;
  if (opts?.type) params.type = opts.type;
  if (opts?.search) params.search = opts.search;
  return getList<ApiFile>(`/users/${userId}/files/`, params, signal);
}

// ---- Processes ----

export async function listProcesses(userId: number, search?: string, signal?: AbortSignal): Promise<ApiProcess[]> {
  return getList<ApiProcess>(`/users/${userId}/processes/`, search ? { search } : undefined, signal);
}

// ---- Logs ----

export async function listLogs(userId: number, search?: string, signal?: AbortSignal): Promise<ApiLog[]> {
  return getList<ApiLog>(`/users/${userId}/logs/`, search ? { search } : undefined, signal);
}
