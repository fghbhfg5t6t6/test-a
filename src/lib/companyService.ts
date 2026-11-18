import type { ApiCompany, ApiAdmin } from './apiTypes';
import { getList, getOne, postOne, putOne, patchOne, deleteOne } from './apiClient';

export async function listCompanies(signal?: AbortSignal): Promise<ApiCompany[]> {
  return getList<ApiCompany>('/companies/', undefined, signal);
}

export async function getCompany(id: number, signal?: AbortSignal): Promise<ApiCompany> {
  return getOne<ApiCompany>(`/companies/${id}/`, undefined, signal);
}

export async function createCompany(data: FormData): Promise<ApiCompany> {
  return postOne<ApiCompany>('/companies/', undefined, data);
}

export async function updateCompany(id: number, data: FormData): Promise<ApiCompany> {
  return putOne<ApiCompany>(`/companies/${id}/`, undefined, data);
}

export async function patchCompany(id: number, body: Record<string, unknown>): Promise<ApiCompany> {
  return patchOne<ApiCompany>(`/companies/${id}/`, body);
}

export async function deleteCompany(id: number): Promise<void> {
  await deleteOne(`/companies/${id}/`);
}

// Superadmin-only assignments
export async function assignModulePack(id: number, modulePack: number): Promise<ApiCompany> {
  return putOne<ApiCompany>(`/companies/${id}/module-pack/`, { module_pack: modulePack });
}

export async function assignServer(id: number, server: number): Promise<ApiCompany> {
  return putOne<ApiCompany>(`/companies/${id}/server/`, { server });
}

export async function assignApplication(id: number, application: number): Promise<ApiCompany> {
  return putOne<ApiCompany>(`/companies/${id}/application/`, { application });
}

// ---- Admin management (superadmin only) ----

export async function listAdmins(signal?: AbortSignal): Promise<ApiAdmin[]> {
  return getList<ApiAdmin>('/companies/admins/', undefined, signal);
}

export async function getAdmin(id: number, signal?: AbortSignal): Promise<ApiAdmin> {
  return getOne<ApiAdmin>(`/companies/admins/${id}/`, undefined, signal);
}

export async function getAdminCompanies(id: number, signal?: AbortSignal): Promise<{ id: number; name: string }[]> {
  return getOne<{ id: number; name: string }[]>(`/companies/admins/${id}/companies/`, undefined, signal);
}

export async function replaceAdminCompanies(id: number, companyIds: number[]): Promise<void> {
  await putOne(`/companies/admins/${id}/companies/`, { company_ids: companyIds });
}

export async function addAdminCompany(id: number, companyId: number): Promise<void> {
  await postOne(`/companies/admins/${id}/companies/add/`, { company_id: companyId });
}

export async function removeAdminCompany(id: number, companyId: number): Promise<void> {
  await postOne(`/companies/admins/${id}/companies/remove/`, { company_id: companyId });
}
