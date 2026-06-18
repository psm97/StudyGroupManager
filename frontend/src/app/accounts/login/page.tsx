'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Google 로그인 페이지로 이동 중...',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Swal.fire({ title: '입력 오류', text: '이메일과 비밀번호를 입력해주세요.', icon: 'warning', confirmButtonColor: '#1258fc' });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '로그인 성공', timer: 2000, showConfirmButton: false });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#f0f5ff' }}>
      {/* 배경 장식 */}
      <div className="fixed w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 70%)', top: '-80px', right: '-80px' }} />
      <div className="fixed w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(30,64,175,.10) 0%, transparent 70%)', bottom: '-60px', left: '-60px' }} />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* 카드 */}
        <div className="bg-white/80 rounded-3xl shadow-2xl p-8" style={{ backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          {/* 로고 */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#2563EB,#1E40AF)' }}>
              SG
            </div>
            <h1 className="text-xl font-bold text-slate-800">스터디 그룹 매니저</h1>
            <p className="text-sm text-slate-500 mt-1">스마트한 스터디 관리를 시작하세요</p>
          </div>

          {/* Google 로그인 */}
          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4.8 24 4.8 12.2 4.8 2.7 14.3 2.7 26S12.2 47.2 24 47.2 45.3 37.7 45.3 26c0-2-.2-3.9-.7-5.9z"/>
              <path fill="#FF3D00" d="M6.3 15.4l6.6 4.8C14.5 16.5 19 13.2 24 13.2c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 7.7 29.3 5.8 24 5.8c-7.7 0-14.3 4.1-18 10.2-.3.4-.5.9-.7 1.4z"/>
              <path fill="#4CAF50" d="M24 47.2c5.2 0 9.9-1.9 13.5-5l-6.2-5.3C29.5 38.6 26.9 39.6 24 39.6c-5.2 0-9.5-3.3-11.2-7.9l-6.5 5C9.7 43.1 16.4 47.2 24 47.2z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.3 5.6l6.2 5.3C41.1 36.1 44 31.5 44 26c0-2-.2-3.9-.4-5.9z"/>
            </svg>
            Google로 로그인
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">또는</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* 관리자 로그인 토글 */}
          <button onClick={() => setAdminOpen(!adminOpen)}
            className="w-full flex items-center justify-between text-sm text-slate-500 hover:text-slate-700 transition-colors py-1">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              관리자 로그인
            </span>
            <svg className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          <div style={{ maxHeight: adminOpen ? '300px' : '0', overflow: 'hidden', transition: 'max-height .35s cubic-bezier(.4,0,.2,1)' }}>
            <div className="pt-4 space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="관리자 이메일"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors" />
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    }
                  </svg>
                </button>
              </div>
              <button onClick={handleAdminLogin} disabled={loading}
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                관리자 로그인
              </button>
            </div>
          </div>

          {/* 회원가입 링크 */}
          <p className="text-center text-xs text-slate-400 mt-6">
            계정이 없으신가요?{' '}
            <a href="/accounts/signup" className="text-blue-600 font-semibold hover:underline">회원가입</a>
          </p>
        </div>
      </div>
    </div>
  );
}
