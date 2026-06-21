import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = new Set(['/accounts/login', '/accounts/signup', '/']);

// 프록시가 개입하지 않는 경로 접두사
const BYPASS_PREFIXES = [
  '/api/',
  '/accounts/api/',
  '/accounts/google/',
  '/admin',   // /admin 및 /admin/* 모두 통과 (관리자 인증은 Django가 담당)
  '/_next/',
  '/favicon',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 및 우회 경로는 그대로 통과
  if (BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix)) || pathname.includes('.')) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has('sessionid');
  const hasAdminSession = request.cookies.has('admin_auth');
  const isAuthenticated = hasSession || hasAdminSession;

  // 이미 로그인된 상태에서 로그인/회원가입 접근 → 대시보드로 이동
  if (isAuthenticated && PUBLIC_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 비로그인 상태에서 보호된 경로 접근 → 로그인 페이지로 이동
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
