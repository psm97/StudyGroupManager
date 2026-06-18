'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LeftMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout/', { method: 'POST' });
      router.push('/accounts/login');
    } catch {
      router.push('/accounts/login');
    }
  };

  const closeSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  };

  return (
    <>
      <style>{`
        :root {
          --bg-sidebar: #ffffff; --bg-nav-hover: #dce6fd;
          --text-heading: #0f172a; --text-nav: #475569;
          --text-nav-hover: #0077ff; --border-sidebar: #f1f5f9; --text-muted: #94a3b8;
        }
        html[data-theme="dark"] {
          --bg-sidebar: #111827; --bg-nav-hover: #1a2d52;
          --text-heading: #f1f5f9; --text-nav: #94a3b8;
          --text-nav-hover: #93c5fd; --border-sidebar: #1e293b; --text-muted: #64748b;
        }
        #sidebar { background: var(--bg-sidebar) !important; border-color: var(--border-sidebar) !important; transition: transform .3s ease; }
        .nav-link { transition: all .2s ease; }
        .nav-link.active { background: #0077ff !important; color: #fff !important; }
        .nav-link:not(.active) { color: var(--text-nav) !important; }
        .nav-link:not(.active):hover { background: var(--bg-nav-hover) !important; color: var(--text-nav-hover) !important; }
        #sidebar p.font-bold, #sidebar p.text-sm.leading-tight { color: var(--text-heading) !important; }
        #sidebar p.text-xs.text-slate-400 { color: var(--text-muted) !important; }
        .toggle-wrap { position: relative; display: inline-block; width: 40px; height: 22px; }
        .toggle-wrap input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #e2e8f0; border-radius: 22px; transition: .3s; }
        .toggle-slider::before { content: ""; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .3s; }
        .toggle-wrap input:checked + .toggle-slider { background: #0077ff; }
        .toggle-wrap input:checked + .toggle-slider::before { transform: translateX(18px); }
        html[data-theme="dark"] .toggle-slider { background: #334155; }
        html[data-theme="dark"] #sidebar .mx-4.mb-5 { background: #1a2d52 !important; border-color: #2a4080 !important; }
        html[data-theme="dark"] #sidebar .mx-4.mb-5 p { color: #c7d7fb !important; }
        #sidebarOverlay { transition: opacity .3s ease; }
        @media (max-width: 1024px) {
          #sidebar { position: fixed; top: 0; left: 0; height: 100vh; z-index: 50; transform: translateX(-100%); }
          #sidebar.open { transform: translateX(0); }
          #sidebarOverlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 40; }
          #sidebarOverlay.open { display: block; }
        }
      `}</style>

      <aside id="sidebar" className="w-[260px] flex-shrink-0 border-r border-slate-100 flex flex-col" style={{minHeight:'100vh'}}>

        {/* 로고 */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-3 group" title="대시보드로 이동">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow transition-transform group-hover:scale-105" style={{background:'#0077ff'}}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors" style={{fontSize:'14px'}}>StudyGroup</p>
              <p className="font-semibold transition-colors" style={{fontSize:'12px', color:'#0077ff'}}>Manager</p>
            </div>
          </a>
          <button className="lg:hidden text-slate-400 hover:text-slate-600 p-1" onClick={closeSidebar}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="px-4 py-5 flex-1 overflow-y-auto">

          {/* 메인 섹션 */}
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-3">메인</p>
          <ul className="space-y-1 mb-6">
            <li>
              <a href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>대시보드
              </a>
            </li>
            <li>
              <a href="/support/calendar" className={`nav-link ${isActive('/support/calendar') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>캘린더
              </a>
            </li>
          </ul>

          {/* 스터디 섹션 */}
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-3">스터디</p>
          <ul className="space-y-1 mb-6">
            <li>
              <a href="/groups" className={`nav-link ${isActive('/groups') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>내 그룹
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:'#dce6fd',color:'#0077ff'}}>0</span>
              </a>
            </li>
            <li>
              <a href="/attendance/check" className={`nav-link ${isActive('/attendance/check') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>출석 관리
              </a>
            </li>
            <li>
              <a href="/penalty" className={`nav-link ${isActive('/penalty') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>벌금 관리
              </a>
            </li>
            <li>
              <a href="/support/notice" className={`nav-link ${isActive('/support/notice') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                </svg>공지사항
              </a>
            </li>
            <li>
              <a href="/support/resources" className={`nav-link ${isActive('/support/resources') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44z" />
                </svg>자료실
              </a>
            </li>
          </ul>

          {/* AI 섹션 */}
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-3">AI</p>
          <ul className="space-y-1 mb-6">
            <li>
              <a href="/ai/attendance-analysis" className={`nav-link ${isActive('/ai/attendance-analysis') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v11.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V7.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 1.5l.4 1.2c.1.3.3.5.6.6l1.2.4-1.2.4c-.3.1-.5.3-.6.6l-.4 1.2-.4-1.2c-.1-.3-.3-.5-.6-.6l-1.2-.4 1.2-.4c.3-.1.5-.3.6-.6l.4-1.2z" />
                </svg>AI 출석 분석
              </a>
            </li>
            <li>
              <a href="/ai/monthly-report" className={`nav-link ${isActive('/ai/monthly-report') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>AI 월간 보고서
              </a>
            </li>
            <li>
              <a href="/ai/planner" className={`nav-link ${isActive('/ai/planner') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>AI 플래너
              </a>
            </li>
          </ul>

          {/* 계정 섹션 */}
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest px-2 mb-3">계정</p>
          <ul className="space-y-1">
            <li>
              <a href="/accounts/profile" className={`nav-link ${isActive('/accounts/profile') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>프로필
              </a>
            </li>
            <li>
              <a href="/accounts/profile-settings" className={`nav-link ${isActive('/accounts/profile-settings') ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>설정
              </a>
            </li>
            <li>
              <button onClick={handleLogout} className="w-full nav-link text-slate-600 flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-left">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>로그아웃
              </button>
            </li>
          </ul>
        </nav>

        {/* AI 월간 리포트 위젯 */}
        <div className="mx-4 mb-5 p-4 rounded-2xl border" style={{background:'#eef2fd', borderColor:'#c7d7fb'}}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'#0077ff'}}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <p className="font-bold text-sm" style={{color:'#0077ff'}}>AI 월간 리포트</p>
          </div>
          <p className="text-xs mb-3 leading-relaxed" style={{color:'#0077ff'}}>출석·벌금 데이터를 AI가 분석하여 리포트를 자동 생성합니다.</p>
          <a href="/ai/monthly-report"
            className="block w-full text-center text-white text-xs font-bold py-2 rounded-lg transition-colors"
            style={{background:'#0077ff'}}
            onMouseOver={(e) => (e.currentTarget.style.background = '#0d44c4')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#0077ff')}>
            시작하기 →
          </a>
        </div>
      </aside>
    </>
  );
}
