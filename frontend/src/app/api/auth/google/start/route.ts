import { NextResponse } from 'next/server';

const CLIENT_ID = '649341936915-dtv5p2jcobdurs6pakqbn9i1r4n7gbbc.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

export async function GET() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
