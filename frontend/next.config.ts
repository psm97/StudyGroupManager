import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// 저장소 루트 .env를 읽어 process.env에 주입 (이미 설정된 값은 덮어쓰지 않음)
const rootEnvPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(rootEnvPath)) {
  for (const line of fs.readFileSync(rootEnvPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

const DJANGO_URL = process.env.DJANGO_URL ?? "http://127.0.0.1:8000";

// Next.js는 기본적으로 trailing slash를 제거(308)하고,
// Django는 trailing slash를 요구(301)해서 무한 리다이렉트가 발생함.
// 해결: destination에 trailing slash를 명시해서 Django로 직접 전달.
const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // 관리자 인증
        { source: "/admin/login",  destination: `${DJANGO_URL}/admin/login/` },
        { source: "/admin/logout", destination: `${DJANGO_URL}/admin/logout/` },
        // 관리자 REST API
        { source: "/admin/api/:path*", destination: `${DJANGO_URL}/admin/api/:path*/` },
        // Google OAuth
        { source: "/accounts/google/:path*", destination: `${DJANGO_URL}/accounts/google/:path*/` },
        // groups 앱 API
        { source: "/groups/api/:path*",              destination: `${DJANGO_URL}/groups/api/:path*/` },
        { source: "/groups/:id/sessions/:rest*",     destination: `${DJANGO_URL}/groups/:id/sessions/:rest*/` },
        { source: "/groups/:id/attendance/:rest*",   destination: `${DJANGO_URL}/groups/:id/attendance/:rest*/` },
        { source: "/groups/:id/penalty/:rest*",      destination: `${DJANGO_URL}/groups/:id/penalty/:rest*/` },
        { source: "/groups/:id/resources/:rest*",    destination: `${DJANGO_URL}/groups/:id/resources/:rest*/` },
        // accounts API
        { source: "/accounts/api/:path*", destination: `${DJANGO_URL}/accounts/api/:path*/` },
        // penalty API
        { source: "/penalty/api/:path*",  destination: `${DJANGO_URL}/penalty/api/:path*/` },
        // calendar API
        { source: "/calendar/api/:path*", destination: `${DJANGO_URL}/calendar/api/:path*/` },
        // support API
        { source: "/support/api/:path*",  destination: `${DJANGO_URL}/support/api/:path*/` },
        // AI monthly-report
        {
          source: "/ai/monthly-report",
          has: [{ type: "query", key: "group_id" }],
          destination: `${DJANGO_URL}/ai/monthly-report/`,
        },
        { source: "/ai/monthly-report/:id", destination: `${DJANGO_URL}/ai/monthly-report/:id/` },
        // AI planner
        { source: "/ai/planner/init", destination: `${DJANGO_URL}/api/ai/planner/init/` },
        { source: "/ai/planner/chat", destination: `${DJANGO_URL}/api/ai/planner/chat/` },
      ],
      afterFiles: [
        { source: "/api/:path*", destination: `${DJANGO_URL}/api/:path*/` },
      ],
    };
  },
};

export default nextConfig;
