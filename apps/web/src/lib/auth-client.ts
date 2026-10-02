import type {
  AuthResponseData,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  RecoverAccountDto,
  MfaVerifyDto,
  User,
  SessionInfo,
} from '@ebs/types';
import { fetchApi } from './api-client';

export async function apiRegister(dto: RegisterDto): Promise<AuthResponseData> {
  return fetchApi<AuthResponseData>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
    credentials: 'include',
  });
}

export async function apiLogin(dto: LoginDto): Promise<AuthResponseData> {
  return fetchApi<AuthResponseData>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
    credentials: 'include',
  });
}

export async function apiRefresh(): Promise<AuthResponseData> {
  return fetchApi<AuthResponseData>('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function apiLogout(): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function apiLogoutAll(
  accessToken?: string,
): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/api/v1/auth/logout-all', {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    credentials: 'include',
  });
}

export async function apiListSessions(accessToken?: string): Promise<SessionInfo[]> {
  return fetchApi<SessionInfo[]>('/api/v1/auth/sessions', {
    method: 'GET',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    credentials: 'include',
  });
}

export async function apiRevokeSession(
  sessionId: string,
  accessToken?: string,
): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>(`/api/v1/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    credentials: 'include',
  });
}

export async function apiVerifyEmail(
  token: string,
): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/api/v1/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(
  dto: ResetPasswordDto,
): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function apiRecoverAccount(
  dto: RecoverAccountDto,
): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/api/v1/auth/recover-account', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function apiVerifyMfa(dto: MfaVerifyDto): Promise<AuthResponseData> {
  return fetchApi<AuthResponseData>('/api/v1/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify(dto),
    credentials: 'include',
  });
}

export async function apiGetMe(accessToken: string): Promise<User> {
  return fetchApi<User>('/api/v1/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
}
