import { describe, it, expect, beforeEach } from 'vitest';
import axiosInstance from './axios';
import { useAuthStore } from '@/src/store/authStore';

type RequestHandlers = {
  handlers: Array<{
    fulfilled: (config: { headers: Record<string, string> }) => { headers: Record<string, string> };
  }>;
};

const runRequestInterceptor = () => {
  const interceptor = axiosInstance.interceptors.request as unknown as RequestHandlers;
  return interceptor.handlers[0].fulfilled({ headers: {} });
};

describe('axiosInstance', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('menunjuk ke backend di port 9000', () => {
    expect(axiosInstance.defaults.baseURL).toBe('http://localhost:9000/api');
  });

  it('mengirim cookie lintas origin', () => {
    expect(axiosInstance.defaults.withCredentials).toBe(true);
  });

  it('menyisipkan header Authorization saat ada token', () => {
    useAuthStore.setState({ token: 'abc123' });

    const config = runRequestInterceptor();

    expect(config.headers.Authorization).toBe('Bearer abc123');
  });

  it('tidak menyisipkan header Authorization saat token kosong', () => {
    const config = runRequestInterceptor();

    expect(config.headers.Authorization).toBeUndefined();
  });
});
