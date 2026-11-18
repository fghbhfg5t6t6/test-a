import type { ApiAppUser, ApiUserStats } from './apiTypes';
import { getList, getOne, postOne, putOne, patchOne, deleteOne } from './apiClient';

export async function listUsers(companyId?: number, signal?: AbortSignal): Promise<ApiAppUser[]> {
  return getList<ApiAppUser>('/users/', companyId ? { company: companyId } : undefined, signal);
}

export async function getUser(id: number, signal?: AbortSignal): Promise<ApiAppUser> {
  return getOne<ApiAppUser>(`/users/${id}/`, undefined, signal);
}

export async function createUser(data: FormData): Promise<ApiAppUser> {
  return postOne<ApiAppUser>('/users/', undefined, data);
}

export async function updateUser(id: number, data: FormData): Promise<ApiAppUser> {
  return putOne<ApiAppUser>(`/users/${id}/`, undefined, data);
}

export async function patchUser(id: number, body: Record<string, unknown>): Promise<ApiAppUser> {
  return patchOne<ApiAppUser>(`/users/${id}/`, body);
}

export async function deleteUser(id: number): Promise<void> {
  await deleteOne(`/users/${id}/`);
}

export async function getUserStats(signal?: AbortSignal): Promise<ApiUserStats> {
  return getOne<ApiUserStats>('/users/stats/', undefined, signal);
}
