import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = '649341936915-dtv5p2jcobdurs6pakqbn9i1r4n7gbbc.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';
const DJANGO_URL = process.env.DJANGO_URL ?? 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/accounts/login', request.url));
  }

  // 1) Authorization code → Access token 교환
  let accessToken: string;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error('token exchange failed');
    const tokens = await tokenRes.json() as { access_token: string };
    accessToken = tokens.access_token;
  } catch {
    return NextResponse.redirect(new URL('/accounts/login?error=token', request.url));
  }

  // 2) Google 사용자 정보 취득
  let googleUser: { id: string; email: string; name: string; picture: string };
  try {
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!infoRes.ok) throw new Error('userinfo failed');
    googleUser = await infoRes.json() as typeof googleUser;
  } catch {
    return NextResponse.redirect(new URL('/accounts/login?error=userinfo', request.url));
  }

  // 3) Django 백엔드에 사용자 생성/조회 + 세션 발급 요청
  let djangoRes: Response;
  try {
    djangoRes = await fetch(`${DJANGO_URL}/accounts/api/google-login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      }),
    });
    if (!djangoRes.ok) throw new Error('django login failed');
  } catch {
    return NextResponse.redirect(new URL('/accounts/login?error=server', request.url));
  }

  const result = await djangoRes.json() as { needs_nickname: boolean };

  // 4) Django 세션 쿠키를 브라우저로 전달하여 인증 상태 유지
  const redirectUrl = result.needs_nickname
    ? new URL('/accounts/nickname', request.url)
    : new URL('/dashboard', request.url);

  const response = NextResponse.redirect(redirectUrl);

  // Set-Cookie 헤더(sessionid, csrftoken 등)를 그대로 전달
  const rawCookies: string[] = typeof (djangoRes.headers as { getSetCookie?: () => string[] }).getSetCookie === 'function'
    ? ((djangoRes.headers as { getSetCookie: () => string[] }).getSetCookie())
    : (djangoRes.headers.get('set-cookie') ?? '').split(/,(?=\s*\w+=)/).filter(Boolean);

  for (const cookie of rawCookies) {
    response.headers.append('set-cookie', cookie);
  }

  return response;
}
