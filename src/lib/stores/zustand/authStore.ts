/**
 * Authentication Store
 * Manages user authentication state and Matrix client instance
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { MatrixClient } from 'matrix-js-sdk';

export interface AuthState {
  // Authentication status
  isAuthenticated: boolean;
  isLoading: boolean;

  // User information
  userId: string | null;
  accessToken: string | null;
  deviceId: string | null;
  homeServer: string | null;
  baseUrl: string | null;

  // Matrix client instance
  client: MatrixClient | null;

  // Login flow temporary data
  pendingAuth: {
    homeserver: string;
    baseUrl: string;
  } | null;

  // Actions
  setAuthData: (data: {
    userId: string;
    accessToken: string;
    deviceId: string;
    homeServer: string;
    baseUrl: string;
  }) => void;
  setClient: (client: MatrixClient) => void;
  setLoading: (loading: boolean) => void;
  setPendingAuth: (
    data: {
      homeserver: string;
      baseUrl: string;
    } | null
  ) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    // Initial state
    isAuthenticated: false,
    isLoading: false,
    userId: null,
    accessToken: null,
    deviceId: null,
    homeServer: null,
    baseUrl: null,
    client: null,
    pendingAuth: null,

    // Actions
    setAuthData: (data) =>
      set((state) => {
        state.isAuthenticated = true;
        state.userId = data.userId;
        state.accessToken = data.accessToken;
        state.deviceId = data.deviceId;
        state.homeServer = data.homeServer;
        state.baseUrl = data.baseUrl;
      }),

    setClient: (client) =>
      set((state) => {
        state.client = client;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setPendingAuth: (data) =>
      set((state) => {
        state.pendingAuth = data;
      }),

    clearAuth: () =>
      set((state) => {
        state.isAuthenticated = false;
        state.userId = null;
        state.accessToken = null;
        state.deviceId = null;
        state.homeServer = null;
        state.baseUrl = null;
        state.client = null;
        state.pendingAuth = null;
      }),
  }))
);
