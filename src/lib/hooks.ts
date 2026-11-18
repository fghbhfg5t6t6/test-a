import { useState, useEffect, useCallback, useRef } from 'react';
import { listUsers, getUserStats, getUser, createUser, updateUser, patchUser, deleteUser } from '@/lib/userService';
import { getUserInfo, listCommands, listMedia, listFiles, listProcesses, listLogs, listModuleUsage } from '@/lib/userDetailService';
import { listCompanies, createCompany, updateCompany, deleteCompany, listAdmins, replaceAdminCompanies, addAdminCompany, removeAdminCompany } from '@/lib/companyService';
import {
  adaptCompany,
  adaptAppUser,
  adaptUserInfo,
  adaptCommand,
  adaptMedia,
  adaptFile,
  adaptLog,
  adaptProcess,
  adaptModuleUsage,
  type ApiAppUser,
  type ApiCompany,
  type ApiUserStats,
  type ApiAdmin,
  type ApiUserInfo,
} from '@/lib/apiTypes';
import type { SiteUser, Company } from '@/types';
import { isApiError, isAbortError, type ApiError } from '@/lib/apiClient';

// ---- Generic async state with AbortController ----

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const firstRun = useRef(true);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    // Skip the initial loading flash on subsequent renders (nonce changes)
    // but always show loading on the very first run
    if (firstRun.current) {
      firstRun.current = false;
    }
    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          if (isAbortError(err)) return;
          setError(isApiError(err) ? err.message : 'Failed to load data');
          setLoading(false);
        }
      });

    return () => { controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, refetch };
}

function toErrMsg(err: unknown): string {
  if (isApiError(err)) {
    if (err.status === 403) return 'You do not have permission to perform this action.';
    if (err.status === 404) return 'Record not found.';
    if (err.status >= 500) return 'Server error. Please try again later.';
    return err.message;
  }
  return 'An unexpected error occurred.';
}

// ---- Users ----

export function useUsers(companyId?: number) {
  return useAsync(async (signal) => {
    const raw = await listUsers(companyId, signal);
    return raw.map((u) => adaptAppUser(u));
  }, [companyId]);
}

export function useUser(id: string | null) {
  return useAsync(async (signal) => {
    if (!id) return null;
    const raw = await getUser(Number(id), signal);
    return adaptAppUser(raw);
  }, [id]);
}

export function useUserStats() {
  return useAsync<ApiUserStats>(async (signal) => await getUserStats(signal), []);
}

// ---- Companies ----

export function useCompanies() {
  return useAsync(async (signal) => {
    const raw = await listCompanies(signal);
    return raw.map((c) => adaptCompany(c));
  }, []);
}

export function useAdmins() {
  return useAsync<ApiAdmin[]>(async (signal) => await listAdmins(signal), []);
}

// ---- Mutations ----

export async function createCompanyMutation(data: FormData): Promise<Company> {
  const raw = await createCompany(data);
  return adaptCompany(raw);
}

export async function updateCompanyMutation(id: string, data: FormData): Promise<Company> {
  const raw = await updateCompany(Number(id), data);
  return adaptCompany(raw);
}

export async function deleteCompanyMutation(id: string): Promise<void> {
  await deleteCompany(Number(id));
}

export async function createUserMutation(data: FormData): Promise<SiteUser> {
  const raw = await createUser(data);
  return adaptAppUser(raw);
}

export async function updateUserMutation(id: string, data: FormData): Promise<SiteUser> {
  const raw = await updateUser(Number(id), data);
  return adaptAppUser(raw);
}

export async function patchUserMutation(id: string, body: Record<string, unknown>): Promise<SiteUser> {
  const patched = await patchUser(Number(id), body);
  return adaptAppUser(patched);
}

export async function deleteUserMutation(id: string): Promise<void> {
  await deleteUser(Number(id));
}

export async function replaceAdminCompaniesMutation(adminId: string, companyIds: string[]): Promise<void> {
  await replaceAdminCompanies(Number(adminId), companyIds.map(Number));
}

export async function addAdminCompanyMutation(adminId: string, companyId: string): Promise<void> {
  await addAdminCompany(Number(adminId), Number(companyId));
}

export async function removeAdminCompanyMutation(adminId: string, companyId: string): Promise<void> {
  await removeAdminCompany(Number(adminId), Number(companyId));
}

// ---- User details ----

export function useUserInfo(userId: string | null) {
  return useAsync(async (signal) => {
    if (!userId) return null;
    const info = await getUserInfo(Number(userId), signal);
    return info;
  }, [userId]);
}

export function useUserCommands(userId: string | null, search?: string) {
  return useAsync(async (signal) => {
    if (!userId) return [];
    const raw = await listCommands(Number(userId), search, signal);
    return raw.map(adaptCommand);
  }, [userId, search]);
}

export function useUserMedia(userId: string | null, type?: string) {
  return useAsync(async (signal) => {
    if (!userId) return [];
    const raw = await listMedia(Number(userId), type, signal);
    return raw.map(adaptMedia);
  }, [userId, type]);
}

export function useUserFiles(userId: string | null, opts?: { parent?: number; type?: string; search?: string }) {
  return useAsync(async (signal) => {
    if (!userId) return [];
    const raw = await listFiles(Number(userId), opts, signal);
    return raw.map(adaptFile);
  }, [userId, opts?.parent, opts?.type, opts?.search]);
}

export function useUserProcesses(userId: string | null, search?: string) {
  return useAsync(async (signal) => {
    if (!userId) return [];
    const raw = await listProcesses(Number(userId), search, signal);
    return raw.map(adaptProcess);
  }, [userId, search]);
}

export function useUserLogs(userId: string | null, search?: string) {
  return useAsync(async (signal) => {
    if (!userId) return [];
    const raw = await listLogs(Number(userId), search, signal);
    return raw.map(adaptLog);
  }, [userId, search]);
}

export function useUserModuleUsage(userId: string | null, moduleId?: number) {
  return useAsync(async (signal) => {
    if (!userId) return [];
    const raw = await listModuleUsage(Number(userId), moduleId, signal);
    return raw.map(adaptModuleUsage);
  }, [userId, moduleId]);
}

export { toErrMsg, isApiError, type ApiError };
