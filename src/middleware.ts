import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/basic', '/ielts', '/plan', '/admin'];
const AUTH_PAGES = ['/login', '/register'];
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('role')?.value?.toUpperCase();
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdmin = role !== undefined && ADMIN_ROLES.includes(role);
  const homeForRole = isAdmin ? '/admin' : '/dashboard';

  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && role) {
    if (AUTH_PAGES.includes(pathname)) {
      return NextResponse.redirect(new URL(homeForRole, request.url));
    }

    // Siswa tidak boleh masuk area admin. Sebaliknya admin tetap boleh
    // membuka halaman siswa untuk memeriksa konten yang ia buat.
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
