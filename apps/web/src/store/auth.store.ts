// Explore Bharat Safar — Client Authentication State Store (Zustand)
// Reference: EBS-DOC-12-AUTH & EBS-DOC-40-SEC-BLUEPRINT Section 5

import { create } from 'zustand';
import type { User } from '@ebs/types';
import { UserRole } from '@ebs/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    }),

  setAccessToken: accessToken =>
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  hasRole: (role: UserRole) => {
    const user = get().user;
    if (!user || !user.roles) return false;
    return user.roles.includes(UserRole.SUPER_ADMIN) || user.roles.includes(role);
  },

  hasAnyRole: (roles: UserRole[]) => {
    const user = get().user;
    if (!user || !user.roles) return false;
    if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;
    return roles.some(role => user.roles.includes(role));
  },
}));
