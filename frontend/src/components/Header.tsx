'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DarkMode from './DarkMode';

const ME_CACHE_KEY = 'sgm_user_me';

export default function Header() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);
  const [me, setMe] = useState({ nickname: '', profile_image: '' });

  // 페인트 전에 캐시를 복원 → 페이지 이동 시 깜박임 제거
  useLayoutEffect(() => {
    try {
      const cached = localStorage.getItem(ME_CACHE_KEY);
      if (cached) setMe(JSON.parse(cached));
    } catch {}
  }, []);

  useEffect(() => {
    fetch('/admin/api/me/', { credentials: 'include' })
      .then(r => {
        if (r.ok) return r.json();
        return fetch('/accounts/api/me/', { credentials: 'include' }).then(ur => ur.ok ? ur.json() : null);
      })
      .then(data => {
        if (data) {
          const next = { nickname: data.nickname || '', profile_image: data.profile_image || '' };
          setMe(next);
          try { localStorage.setItem(ME_CACHE_KEY, JSON.stringify(next)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const MOCK_NOTIFS = [
    { id: 1, icon: '✅', msg: 'Web Developer Study 출석이 확인되었습니다.', time: '방금 전', read: false },
    { id: 2, icon: '💰', msg: 'Python 알고리즘 벌금 납부 요청이 도착했습니다.', time: '1시간 전', read: false },
    { id: 3, icon: '📢', msg: '영어 회화 스터디에 새 공지가 등록되었습니다.', time: '3시간 전', read: true },
    { id: 4, icon: '👥', msg: '새로운 그룹 초대가 도착했습니다.', time: '어제', read: true },
  ];
  const unreadCount = MOCK_NOTIFS.filter(n => !n.read).length;

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/groups?q=${encodeURIComponent(value)}`);
    }
  };

  const handleLogout = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '로그아웃',
      text: '정말 로그아웃 하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '로그아웃',
      confirmButtonColor: '#e11d48',
      cancelButtonText: '취소',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all([
        fetch('/accounts/api/logout/', { method: 'POST', credentials: 'include' }),
        fetch('/admin/api/logout/',    { method: 'POST', credentials: 'include' }),
      ]);
    } finally {
      try {
        localStorage.removeItem(ME_CACHE_KEY);
        localStorage.removeItem('sgm_profile');
      } catch {}
      router.push('/accounts/login');
    }
  };

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const openCreateGroupModal = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700">🏫 그룹 만들기</span>',
      width: 500,
      html: `<div style="text-align:left;padding:4px 0">
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">그룹 이름 *</label>
          <input id="swal-gname" type="text" placeholder="그룹 이름을 입력하세요" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box" />
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">설명</label>
          <textarea id="swal-gdesc" rows="3" placeholder="그룹 소개를 입력하세요" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;resize:none;box-sizing:border-box;font-family:inherit"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">카테고리</label>
            <select id="swal-gcat" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;background:#fff;box-sizing:border-box">
              <option value="study">📚 스터디</option>
              <option value="language">🌏 어학</option>
              <option value="algorithm">💻 알고리즘</option>
              <option value="dev">🛠 개발</option>
              <option value="etc">📌 기타</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">최대 인원</label>
            <input id="swal-gmax" type="number" min="2" max="50" value="10" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box" />
          </div>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px">공개 설정</label>
          <div style="display:flex;gap:16px">
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;color:#334155">
              <input type="radio" name="swal-gvis" value="public" checked style="accent-color:#0077ff;width:15px;height:15px" /> 🌐 공개
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;color:#334155">
              <input type="radio" name="swal-gvis" value="private" style="accent-color:#0077ff;width:15px;height:15px" /> 🔒 비공개
            </label>
          </div>
        </div>
      </div>`,
      confirmButtonText: '그룹 만들기',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const name = ((document.getElementById('swal-gname') as HTMLInputElement)?.value || '').trim();
        const desc = ((document.getElementById('swal-gdesc') as HTMLTextAreaElement)?.value || '').trim();
        const category = (document.getElementById('swal-gcat') as HTMLSelectElement)?.value || 'study';
        const maxMembers = parseInt((document.getElementById('swal-gmax') as HTMLInputElement)?.value || '10', 10);
        const visEls = document.querySelectorAll<HTMLInputElement>('input[name="swal-gvis"]');
        const visibility = Array.from(visEls).find(el => el.checked)?.value || 'public';
        if (!name) { Swal.showValidationMessage('그룹 이름을 입력해 주세요.'); return false; }
        if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 50) { Swal.showValidationMessage('최대 인원은 2~50명 사이여야 합니다.'); return false; }
        return { name, desc, category, maxMembers, visibility };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    const { name } = result.value as { name: string; desc: string; category: string; maxMembers: number; visibility: string };
    await Swal.fire({ icon: 'success', title: '그룹이 생성되었습니다!', text: `"${name}" 그룹이 만들어졌습니다.`, timer: 2000, showConfirmButton: false, timerProgressBar: true });
  };

  const openSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.add('open');
    overlay?.classList.add('open');
  };

  return (
    <>
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
            <DarkMode />
          </div>

          {/* 그룹 만들기 버튼 */}
          <button
            onClick={openCreateGroupModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-colors cursor-pointer"
            style={{background:'#0077ff'}}
            onMouseOver={(e) => (e.currentTarget.style.background = '#0d44c4')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#0077ff')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>그룹 만들기
          </button>

          {/* 알림 벨 */}
          <div className="relative cursor-pointer" ref={notiRef} onClick={() => setNotifOpen(prev => !prev)}>
            <svg className="w-6 h-6 text-slate-500 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{background:'#0077ff'}}></span>
            )}

            {/* 알림 드롭다운 */}
            {notifOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: '-8px',
                  width: '320px',
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                  border: '1px solid #e2e8f0',
                  zIndex: 999,
                  overflow: 'hidden',
                }}
              >
                {/* 헤더 */}
                <div style={{padding:'14px 16px 10px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <span style={{fontSize:'14px', fontWeight:700, color:'#1e293b'}}>알림</span>
                  {unreadCount > 0 && (
                    <span style={{fontSize:'11px', fontWeight:600, background:'#0077ff', color:'#fff', borderRadius:'20px', padding:'2px 8px'}}>
                      {unreadCount}개 읽지 않음
                    </span>
                  )}
                </div>

                {/* 알림 목록 */}
                <div style={{maxHeight:'280px', overflowY:'auto'}}>
                  {MOCK_NOTIFS.map(n => (
                    <div
                      key={n.id}
                      style={{
                        display:'flex', alignItems:'flex-start', gap:'10px',
                        padding:'12px 16px',
                        background: n.read ? '#fff' : '#f0f5ff',
                        borderBottom:'1px solid #f8fafc',
                        cursor:'pointer',
                        transition:'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = n.read ? '#fff' : '#f0f5ff')}
                    >
                      <span style={{fontSize:'18px', flexShrink:0, lineHeight:1.3}}>{n.icon}</span>
                      <div style={{flex:1, minWidth:0}}>
                        <p style={{fontSize:'13px', color:'#334155', lineHeight:1.5, margin:0, wordBreak:'keep-all'}}>{n.msg}</p>
                        <p style={{fontSize:'11px', color:'#94a3b8', marginTop:'3px'}}>{n.time}</p>
                      </div>
                      {!n.read && (
                        <span style={{width:'7px', height:'7px', borderRadius:'50%', background:'#0077ff', flexShrink:0, marginTop:'5px'}}></span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 전체 보기 */}
                <div style={{padding:'10px 16px', borderTop:'1px solid #f1f5f9', textAlign:'center'}}>
                  <a href="/support/notice" style={{fontSize:'13px', fontWeight:600, color:'#0077ff', textDecoration:'none'}}>전체 알림 보기</a>
                </div>
              </div>
            )}
          </div>

          {/* 프로필 */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/accounts/profile')}>
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden flex-shrink-0"
              style={{background:'linear-gradient(135deg,#0077ff,#0d44c4)'}}>
              {me.profile_image
                ? <img src={me.profile_image} alt="프로필" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : (me.nickname ? me.nickname[0].toUpperCase() : 'U')}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{me.nickname || '사용자'}</p>
              <p className="text-xs text-slate-400">Welcome back</p>
            </div>
          </div>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="hidden sm:block p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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
