import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { AuthUser } from '@/src/models/auth';

const user: AuthUser = {
  id: 7,
  email: 'siswa@example.com',
  full_name: 'Siswa Satu',
  role: 'STUDENT',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('setAuth menyimpan user dan menandai sesi aktif', () => {
    useAuthStore.getState().setAuth(user, 'token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('clearAuth mengosongkan sesi tanpa memanggil backend', () => {
    useAuthStore.getState().setAuth(user, 'token-123');

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
