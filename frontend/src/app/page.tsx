import { redirect } from "next/navigation";

export default function RootPage() {
  // Django root_redirect 동일 로직: 인증 상태는 서버에서 판단
  // 현재는 미인증 기본값으로 로그인 페이지로 이동
  redirect("/accounts/login");
}
