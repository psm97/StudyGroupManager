'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const userNickname: string = '';

  useEffect(() => {
    const saved = localStorage.getItem('sgm-dark-mode');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('sgm-dark-mode', String(checked));
    document.documentElement.setAttribute('data-theme', checked ? 'dark' : '');
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/groups?q=${encodeURIComponent(value)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout/', { method: 'POST' });
      router.push('/accounts/login');
    } catch {
      router.push('/accounts/login');
    }
  };

  const openNotifications = () => {
    // TODO: 알림 패널 구현
  };

  const openCreateGroupModal = () => {
    // TODO: 그룹 만들기 모달 구현
  };

  const openSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.add('open');
    overlay?.classList.add('open');
  };

  return (
    <>
      <style>{`
        html[data-theme="dark"] header p.text-sm.font-semibold { color: var(--text-heading) !important; }
        html[data-theme="dark"] header p.text-xs              { color: var(--text-muted) !important; }
        html[data-theme="dark"] .toggle-slider { background: #334155; }
      `}</style>

      <header className="flex items-center justify-between py-3 px-4 lg:px-8 border-b border-slate-100 bg-white flex-shrink-0 gap-3">
        {/* 햄버거 (모바일) */}
        <button className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={openSidebar}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        {/* 검색창 */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="그룹, 공지 검색..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchValue); }}
            className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm text-slate-600 placeholder-slate-400 border border-slate-200 w-full transition-all focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* 우측 영역 */}
        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
          {/* 다크모드 (데스크탑) */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-slate-500">다크 모드</span>
            <label className="toggle-wrap">
              <input
                type="checkbox"
                id="darkToggle"
                checked={darkMode}
                onChange={(e) => toggleDarkMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* 그룹 만들기 버튼 */}
          <button
            onClick={openCreateGroupModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-colors"
            style={{background:'#0077ff'}}
            onMouseOver={(e) => (e.currentTarget.style.background = '#0d44c4')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#0077ff')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>그룹 만들기
          </button>

          {/* 알림 벨 */}
          <div className="relative cursor-pointer" onClick={openNotifications}>
            <svg className="w-6 h-6 text-slate-500 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span id="notiBadge" className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white hidden" style={{background:'#0077ff'}}></span>
          </div>

          {/* 프로필 */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/accounts/profile')}>
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
              style={{background:'linear-gradient(135deg,#0077ff,#0d44c4)'}}>
              {userNickname ? userNickname[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{userNickname || '사용자'}</p>
              <p className="text-xs text-slate-400">Welcome back</p>
            </div>
          </div>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="hidden sm:block p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            title="로그아웃"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
