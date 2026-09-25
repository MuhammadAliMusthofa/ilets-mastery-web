import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

const buildRequest = (pathname: string, cookies: Record<string, string> = {}) => {
  const request = new NextRequest(new URL(`http://localhost:3000${pathname}`));
  Object.entries(cookies).forEach(([name, value]) => request.cookies.set(name, value));
  return request;
};

describe('middleware', () => {
  it('melempar pengunjung tanpa token dari rute terproteksi ke /login', () => {
    const response = middleware(buildRequest('/ielts'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('membiarkan siswa yang sudah login masuk ke /ielts', () => {
    const response = middleware(
      buildRequest('/ielts', { accessToken: 'jwt', role: 'STUDENT' })
    );

    expect(response.headers.get('location')).toBeNull();
  });

  it('melempar siswa yang mencoba masuk /admin ke /dashboard', () => {
    const response = middleware(
      buildRequest('/admin/questions', { accessToken: 'jwt', role: 'STUDENT' })
    );

    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('mengizinkan SUPER_ADMIN masuk /admin', () => {
    const response = middleware(
      buildRequest('/admin/questions', { accessToken: 'jwt', role: 'SUPER_ADMIN' })
    );

    expect(response.headers.get('location')).toBeNull();
  });

  it('melempar user yang sudah login dari /login ke tujuan sesuai rolenya', () => {
    const student = middleware(buildRequest('/login', { accessToken: 'jwt', role: 'STUDENT' }));
    const admin = middleware(buildRequest('/login', { accessToken: 'jwt', role: 'ADMIN' }));

    expect(student.headers.get('location')).toBe('http://localhost:3000/dashboard');
    expect(admin.headers.get('location')).toBe('http://localhost:3000/admin');
  });
});
