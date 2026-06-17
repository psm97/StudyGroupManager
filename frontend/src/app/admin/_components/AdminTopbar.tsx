'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [clock, setClock] = useState('--:--:--');
  const [dbStatus, setDbStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const username = '관리자';
  const email = '';

  const getPageTitle = () => {
    if (pathname === '/admin') return '대시보드';
    if (pathname === '/admin/members') return '회원관리';
    if (pathname === '/admin/groups') return '그룹관리';
    if (pathname === '/admin/report') return '신고관리';
    if (pathname === '/admin/files') return '파일관리';
    if (pathname === '/admin/analytics') return '서비스통계';
    if (pathname === '/admin/logs') return '시스템로그';
    if (pathname === '/admin/config') return '시스템설정';
    if (pathname === '/admin/profile') return '관리자 정보';
    return '관리자';
  };

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit', second:'2-digit'}));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const checkDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/admin/api/system-status/');
      const data = await res.json();
      setDbStatus(data?.data?.db_status === 'ok' ? 'ok' : 'error');
    } catch {
      setDbStatus('error');
    }
  }, []);

  useEffect(() => { checkDbStatus(); }, [checkDbStatus]);

  const toggleSidebar = () => {
    const sb = document.getElementById('adminSidebar');
    const ov = document.getElementById('sidebarOverlay');
    sb?.classList.toggle('open');
    ov?.classList.toggle('show');
  };

  return (
    <header id="adminTopbar"
      className="sticky top-0 z-20 flex items-center gap-4 px-5 py-3 border-b"
      style={{background:'#ffffff', borderColor:'#e2e8f0', minHeight:'60px'}}>

      {/* 햄버거 (모바일) */}
      <button
        className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        onClick={toggleSidebar}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
        </svg>
      </button>

      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <a href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors font-medium whitespace-nowrap">관리자</a>
        <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
        </svg>
        <span className="font-semibold text-slate-700 truncate">{getPageTitle()}</span>
      </nav>

      {/* 오른쪽 영역 */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* DB 상태 */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          dbStatus === 'ok'
            ? 'border-green-100 bg-green-50 text-green-700'
            : 'border-red-100 bg-red-50 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${dbStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {dbStatus === 'ok' ? 'DB 정상' : 'DB 오류'}
        </div>

        {/* 시간 */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{clock}</span>
        </div>

        {/* 알림 */}
        <div className="relative">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative"
            onClick={() => { setNotifPanelOpen(!notifPanelOpen); setProfileMenuOpen(false); }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
            </svg>
          </button>
          {notifPanelOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50" style={{background:'#fff'}}>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">알림</p>
                <button className="text-xs font-medium hover:underline" style={{color:'#1258fc'}} onClick={() => setNotifPanelOpen(false)}>모두 읽음</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-6 text-center text-sm text-slate-400">알림이 없습니다.</div>
              </div>
            </div>
          )}
        </div>

        {/* 관리자 프로필 */}
        <div className="relative">
          <button
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifPanelOpen(false); }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 style={{background:'linear-gradient(135deg,#222222,#555555)'}}>
              {username[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-slate-700">{username}</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </button>
          {profileMenuOpen && (
            <div className="absolute right-0 top-12 w-52 rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50" style={{background:'#fff'}}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">{username}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
              <div className="py-1.5">
                <a href="/admin/profile"
                   className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                   onClick={() => setProfileMenuOpen(false)}>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                  관리자 정보
                </a>
              </div>
              <div className="py-1.5 border-t border-slate-100">
                <a href="/admin/logout"
                   className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
                  </svg>
                  로그아웃
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
