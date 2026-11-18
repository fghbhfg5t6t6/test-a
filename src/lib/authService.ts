import type { ApiAuthUser, ApiTokenResponse } from './apiTypes';
import {
  getOne,
  postOne,
  clearTokens,
  setTokens,
  hasTokens,
  getAccessToken,
  getRefreshToken,
} from './apiClient';

export type CurrentUser = {
  id: number;
  username: string;
  isStaff: boolean;
  isSuperuser: boolean;
  profilePicture: string | null;
};

export async function login(username: string, password: string): Promise<CurrentUser> {
  const res = await postOne<ApiTokenResponse>(
    '/auth/login/',
    { username, password },
    undefined,
    true, // skipAuth — login doesn't need a token
  );

  setTokens(res.access, res.refresh);
  return fetchCurrentUser();
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const me = await getOne<ApiAuthUser>('/auth/me/');
  return {
    id: me.id,
    username: me.username,
    isStaff: me.is_staff,
    isSuperuser: me.is_superuser,
    profilePicture: me.profile_picture ?? null,
  };
}

export async function logout(): Promise<void> {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (access && refresh) {
    try {
      await postOne('/auth/logout/', { refresh });
    } catch {
      // Even if logout API fails, clear local tokens
    }
  }
  clearTokens();
}

export function isAuthenticated(): boolean {
  return hasTokens();
}

export function isSuperAdmin(user: CurrentUser | null): boolean {
  return user?.isSuperuser ?? false;
}
