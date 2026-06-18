'use client';

import Swal from 'sweetalert2';

const steps = [
  { num: 1, label: 'Google 로그인', done: false },
  { num: 2, label: '닉네임 설정', done: false },
  { num: 3, label: '완료', done: false },
];

export default function SignupPage() {
  const handleTerms = () => {
    Swal.fire({
      title: '이용약관',
      html: '<div style="text-align:left;font-size:13px;line-height:1.7;max-height:300px;overflow-y:auto"><p><b>제1조 (목적)</b></p><p>이 약관은 StudyGroupManager 서비스 이용 조건 및 절차를 규정합니다.</p><br><p><b>제2조 (서비스 이용)</b></p><p>회원은 스터디 그룹을 생성하고 참여할 수 있으며, 출석 관리 및 벌금 정산 기능을 이용할 수 있습니다.</p><br><p><b>제3조 (회원의 의무)</b></p><p>회원은 타인의 권리를 침해하거나 법령을 위반하는 행위를 해서는 안 됩니다.</p></div>',
      confirmButtonText: '확인',
      confirmButtonColor: '#1258fc',
    });
  };

  const handlePrivacy = () => {
    Swal.fire({
      title: '개인정보처리방침',
      html: '<div style="text-align:left;font-size:13px;line-height:1.7;max-height:300px;overflow-y:auto"><p><b>수집 항목</b></p><p>이메일, 닉네임, 프로필 사진(Google 계정 정보)</p><br><p><b>수집 목적</b></p><p>서비스 제공, 출석 관리, 그룹 커뮤니케이션</p><br><p><b>보유 기간</b></p><p>회원 탈퇴 후 즉시 삭제</p></div>',
      confirmButtonText: '확인',
      confirmButtonColor: '#1258fc',
    });
  };

  const handleGoogleSignup = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Google 회원가입 페이지로 이동 중...',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#f0f5ff' }}>
      <div className="fixed w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,.13) 0%, transparent 70%)', top: '-80px', right: '-80px' }} />
      <div className="fixed w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(30,64,175,.10) 0%, transparent 70%)', bottom: '-60px', left: '-60px' }} />

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white/80 rounded-3xl shadow-2xl p-8" style={{ backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          {/* 로고 */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#2563EB,#1E40AF)' }}>
              SG
            </div>
            <h1 className="text-xl font-bold text-slate-800">회원가입</h1>
            <p className="text-sm text-slate-500 mt-1">스터디 그룹 매니저에 오신 걸 환영합니다</p>
          </div>

          {/* Google 회원가입 */}
          <button onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 transition-all mb-6">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4.8 24 4.8 12.2 4.8 2.7 14.3 2.7 26S12.2 47.2 24 47.2 45.3 37.7 45.3 26c0-2-.2-3.9-.7-5.9z"/>
              <path fill="#FF3D00" d="M6.3 15.4l6.6 4.8C14.5 16.5 19 13.2 24 13.2c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 7.7 29.3 5.8 24 5.8c-7.7 0-14.3 4.1-18 10.2z"/>
              <path fill="#4CAF50" d="M24 47.2c5.2 0 9.9-1.9 13.5-5l-6.2-5.3C29.5 38.6 26.9 39.6 24 39.6c-5.2 0-9.5-3.3-11.2-7.9l-6.5 5C9.7 43.1 16.4 47.2 24 47.2z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.3 5.6l6.2 5.3C41.1 36.1 44 31.5 44 26c0-2-.2-3.9-.4-5.9z"/>
            </svg>
            Google로 회원가입
          </button>

          {/* 가입 안내 3단계 */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 mb-2">가입 절차</p>
            {[
              { num: '1', label: 'Google 로그인', desc: '구글 계정으로 간편 가입', color: '#1258fc', bg: '#dce6fd' },
              { num: '2', label: '닉네임 설정', desc: '사용할 닉네임을 입력해요', color: '#10b981', bg: '#d1fae5' },
              { num: '✓', label: '가입 완료', desc: '스터디 그룹을 시작해요!', color: '#64748b', bg: '#f1f5f9' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,.6)' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}>{s.num}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{s.label}</p>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 약관 */}
          <p className="text-center text-xs text-slate-400 mb-5">
            가입 시{' '}
            <button onClick={handleTerms} className="text-blue-600 hover:underline font-medium">이용약관</button>
            {' '}및{' '}
            <button onClick={handlePrivacy} className="text-blue-600 hover:underline font-medium">개인정보처리방침</button>
            에 동의하는 것으로 간주됩니다.
          </p>

          <p className="text-center text-xs text-slate-400">
            이미 계정이 있으신가요?{' '}
            <a href="/accounts/login" className="text-blue-600 font-semibold hover:underline">로그인</a>
          </p>
        </div>
      </div>
    </div>
  );
}
