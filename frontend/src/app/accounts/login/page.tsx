'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim()) { alert('아이디를 입력해주세요.'); return; }
    if (!adminPassword) { alert('비밀번호를 입력해주세요.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminId, password: adminPassword }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirect_url || '/admin');
      } else {
        alert(data.message || '이메일 또는 비밀번호를 확인해주세요.');
      }
    } catch {
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 antialiased"
      style={{
        backgroundColor: '#EFF6FF',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 15% 10%, rgba(37,99,235,.13) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 85%, rgba(30,64,175,.10) 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 50% 50%, rgba(96,165,250,.07) 0%, transparent 70%)`
      }}>
      <style>{`
        .glass-card { background: rgba(255,255,255,.92); backdrop-filter: blur(16px); }
        .admin-panel { max-height: 0; overflow: hidden; transition: max-height .45s cubic-bezier(.4,0,.2,1), opacity .3s ease; opacity: 0; }
        .admin-panel.open { max-height: 340px; opacity: 1; }
        .input-field { transition: border-color .2s, box-shadow .2s; }
        .input-field:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,.15); background: #fff; outline: none; }
        .admin-btn { background: linear-gradient(135deg, #334155, #0F172A); transition: box-shadow .2s, transform .15s; }
        .admin-btn:hover { box-shadow: 0 6px 22px rgba(15,23,42,.35); transform: translateY(-1px); }
        .google-btn { transition: background .2s, box-shadow .2s, transform .15s; background: #fff; }
        .google-btn:hover { background: #f1f5f9; box-shadow: 0 4px 18px rgba(15,23,42,.12); transform: translateY(-2px); }
        .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* 장식 배경 원 */}
      <div className="pointer-events-none" style={{position:'fixed', top:'-80px', left:'-96px', width:'384px', height:'384px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.15), transparent 70%)'}}></div>
      <div className="pointer-events-none" style={{position:'fixed', bottom:0, right:0, width:'288px', height:'288px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.15), transparent 70%)', animationDelay:'.8s'}}></div>

      {/* 로그인 카드 */}
      <div className="glass-card rounded-2xl w-full max-w-md p-8 sm:p-10 relative z-10" style={{boxShadow:'0 4px 24px rgba(37,99,235,0.10), 0 1px 4px rgba(15,23,42,0.06)'}}>

        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{background:'linear-gradient(135deg,#2563EB,#1E40AF)', boxShadow:'0 2px 12px rgba(37,99,235,.30)'}}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.966 8.966 0 0 0-6 2.292m0-14.25v14.25"/>
            </svg>
          </div>
          <h1 className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none" style={{color:'#0F172A'}}>
            StudyGroup<span style={{color:'#2563EB'}}>Manager</span>
          </h1>
          <p className="mt-2 text-sm" style={{color:'#94A3B8'}}>스터디 그룹을 더 스마트하게 관리하세요</p>
        </div>

        {/* 구글 로그인 */}
        <div>
          <p className="text-center text-xs font-medium tracking-wide uppercase mb-4" style={{color:'#94A3B8'}}>
            Google 계정으로 시작하기
          </p>
          <a href="/accounts/google/login/"
            className="google-btn w-full flex items-center justify-center gap-3 border rounded-2xl py-4 text-sm font-bold focus:outline-none"
            style={{borderColor:'#E2E8F0', color:'#0F172A', boxShadow:'0 4px 24px rgba(37,99,235,0.10)'}}>
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Google 계정으로 로그인
          </a>
          <p className="text-center text-xs mt-3 flex items-center justify-center gap-1.5" style={{color:'#94A3B8'}}>
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
            Google의 보안 인프라로 안전하게 로그인됩니다
          </p>
        </div>

        {/* 구분선 */}
        <div className="my-7">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{background:'#E2E8F0'}}></div>
            <span className="text-xs font-medium" style={{color:'#94A3B8'}}>회원가입도 Google로</span>
            <div className="flex-1 h-px" style={{background:'#E2E8F0'}}></div>
          </div>
        </div>

        {/* 회원가입 안내 */}
        <div className="rounded-xl p-4 text-center" style={{background:'rgba(219,234,254,0.5)'}}>
          <p className="text-sm font-semibold mb-1" style={{color:'#2563EB'}}>처음 방문하셨나요?</p>
          <p className="text-xs mb-3" style={{color:'rgba(37,99,235,.7)'}}>Google 계정으로 바로 가입하고 스터디를 시작하세요.</p>
          <a href="/accounts/signup"
            className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors" style={{color:'#2563EB'}}>
            회원가입 페이지로 이동
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </a>
        </div>

        {/* 관리자 로그인 토글 */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setAdminPanelOpen(!adminPanelOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed text-xs font-semibold transition-all focus:outline-none"
            style={{borderColor:'#CBD5E1', color:'#94A3B8'}}>
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
              </svg>
              관리자 로그인
            </span>
            <svg className="w-3.5 h-3.5 transition-transform duration-300" style={{transform: adminPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </button>

          <div className={`admin-panel ${adminPanelOpen ? 'open' : ''}`}>
            <div className="mt-3 p-4 rounded-xl border" style={{background:'#F8FAFC', borderColor:'#E2E8F0'}}>
              <div className="flex items-start gap-2 mb-4 p-3 rounded-lg border" style={{background:'#FFFBEB', borderColor:'#FEF3C7'}}>
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{color:'#92400E'}}>
                  이 영역은 <strong>관리자 전용</strong>입니다.<br/>일반 사용자는 Google 계정으로 로그인하세요.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <label htmlFor="adminId" className="block text-xs font-semibold mb-1" style={{color:'#334155'}}>관리자 아이디</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'#94A3B8'}}>
                      <svg style={{width:'16px',height:'16px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                      </svg>
                    </span>
                    <input
                      id="adminId" type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)}
                      placeholder="관리자 아이디를 입력하세요"
                      className="input-field w-full rounded-xl border py-2.5 pr-4 text-sm font-medium"
                      style={{paddingLeft:'42px', borderColor:'#E2E8F0', background:'#fff', color:'#0F172A'}}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="adminPassword" className="block text-xs font-semibold mb-1" style={{color:'#334155'}}>비밀번호</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'#94A3B8'}}>
                      <svg style={{width:'16px',height:'16px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                      </svg>
                    </span>
                    <input
                      id="adminPassword" type={showPassword ? 'text' : 'password'} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className="input-field w-full rounded-xl border py-2.5 text-sm font-medium"
                      style={{paddingLeft:'42px', paddingRight:'48px', borderColor:'#E2E8F0', background:'#fff', color:'#0F172A'}}
                    />
                    <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{color:'#94A3B8'}}
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg style={{width:'16px',height:'16px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      ) : (
                        <svg style={{width:'16px',height:'16px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="admin-btn w-full text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 focus:outline-none mt-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/>
                  </svg>
                  {loading ? <><div className="spinner"></div></> : <span>관리자 로그인</span>}
                </button>
              </form>
            </div>
          </div>
        </div>
        <p className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap z-10" style={{color:'rgba(148,163,184,.7)'}}>
        © {currentYear} StudyGroupManager. All rights reserved.
        </p>
      </div>


    </div>
  );
}
