import type { NextConfig } from "next";

const DJANGO_URL = process.env.DJANGO_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // beforeFiles: 파일시스템/페이지 체크 이전에 실행 → 가장 안정적
      beforeFiles: [
        // 관리자 인증 — source에 trailing slash 없음 (Next.js가 정규화 후 매칭)
        { source: "/admin/login",      destination: `${DJANGO_URL}/admin/login/` },
        { source: "/admin/logout",     destination: `${DJANGO_URL}/admin/logout/` },
        // 관리자 REST API
        { source: "/admin/api/:path*", destination: `${DJANGO_URL}/admin/api/:path*` },
        // Google OAuth
        { source: "/accounts/google/:path*", destination: `${DJANGO_URL}/accounts/google/:path*` },
        // 기타 Django API
        { source: "/api/:path*",       destination: `${DJANGO_URL}/api/:path*` },
      ],
    };
  },
};

export default nextConfig;
