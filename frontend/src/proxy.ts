import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set(['/accounts/login', '/accounts/signup', '/']);

const BYPASS_PREFIXES = [
  '/api/',
  '/accounts/api/',
  '/accounts/google/',
  '/admin',
  '/_next/',
  '/favicon',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix)) || pathname.includes('.')) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has('sessionid');
  const hasAdminSession = request.cookies.has('admin_auth');
  const isAuthenticated = hasSession || hasAdminSession;

  if (isAuthenticated && PUBLIC_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
    const loginUrl = new URL('/accounts/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
