import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const REDIRECT_URI = `${SITE_URL}/api/auth/callback/google`;

export async function GET() {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  // CSRF 방지: state를 HttpOnly 쿠키에 저장, 콜백에서 검증
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  });

  return response;
}
