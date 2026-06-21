import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const REDIRECT_URI = `${SITE_URL}/api/auth/callback/google`;
const DJANGO_URL = process.env.DJANGO_URL ?? 'http://127.0.0.1:8000';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY!;

const ALLOWED_COOKIES = new Set(['sessionid', 'csrftoken']);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateParam = searchParams.get('state');

  // Vuln 1: state 검증 — 불일치 시 CSRF 공격으로 간주하고 차단
  const stateCookie = request.cookies.get('oauth_state')?.value;
  if (!stateParam || !stateCookie || stateParam !== stateCookie) {
    return NextResponse.redirect(new URL('/accounts/login?error=state', SITE_URL));
  }

  if (error || !code) {
    return NextResponse.redirect(new URL('/accounts/login', SITE_URL));
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
    return NextResponse.redirect(new URL('/accounts/login?error=token', SITE_URL));
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
    return NextResponse.redirect(new URL('/accounts/login?error=userinfo', SITE_URL));
  }

  // 3) Django 백엔드에 사용자 생성/조회 + 세션 발급 요청
  let djangoRes: Response;
  try {
    djangoRes = await fetch(`${DJANGO_URL}/accounts/api/google-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': INTERNAL_API_KEY,  // Vuln 4: 서버 간 인증 키
      },
      body: JSON.stringify({
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      }),
    });
    if (!djangoRes.ok) throw new Error('django login failed');
  } catch {
    return NextResponse.redirect(new URL('/accounts/login?error=server', SITE_URL));
  }

  const result = await djangoRes.json() as { needs_nickname: boolean };

  const redirectUrl = result.needs_nickname
    ? new URL('/accounts/nickname', SITE_URL)
    : new URL('/dashboard', SITE_URL);

  const response = NextResponse.redirect(redirectUrl);

  // 사용한 state 쿠키 삭제
  response.cookies.delete('oauth_state');

  // Vuln 2: sessionid·csrftoken 만 허용, getSetCookie()로 안전하게 파싱
  const setCookies = (djangoRes.headers as Headers & { getSetCookie(): string[] }).getSetCookie();
  for (const raw of setCookies) {
    const cookieName = raw.split('=')[0].trim();
    if (!ALLOWED_COOKIES.has(cookieName)) continue;
    response.headers.append('set-cookie', raw);
  }

  return response;
}
