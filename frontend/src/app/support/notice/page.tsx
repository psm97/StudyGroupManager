'use client';

import { useState, useCallback } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface Notice {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  createdAt: string;
  isPinned: boolean;
  isRead: boolean;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: 1,
    title: '[중요] 서비스 이용약관 개정 안내',
    content: 'StudyGroupManager 서비스 이용약관이 2026년 7월 1일부로 개정됩니다.\n\n주요 변경 사항:\n1. 개인정보 처리 방침 명확화\n2. 서비스 중단 시 사전 고지 의무 추가\n3. 환불 정책 세부 조항 변경\n\n변경된 약관은 홈페이지 하단 이용약관 페이지에서 확인하실 수 있습니다.\n시행일 이후 서비스 이용 시 개정 약관에 동의한 것으로 간주됩니다.',
    authorNickname: '운영팀',
    createdAt: '2026.06.15',
    isPinned: true,
    isRead: false,
  },
  {
    id: 2,
    title: 'StudyGroupManager v2.1 업데이트 안내',
    content: '안녕하세요, StudyGroupManager 운영팀입니다.\n\nv2.1 업데이트 내용을 안내드립니다.\n\n✅ 신규 기능\n- 스터디 자료 공유 기능 추가\n- 댓글 Thread 기능 추가\n- AI 월간 리포트 개선\n\n🔧 개선 사항\n- 출석 체크 UI 개선\n- 다크 모드 안정성 향상\n- 모바일 반응형 최적화\n\n이용해 주셔서 감사합니다.',
    authorNickname: '운영팀',
    createdAt: '2026.06.10',
    isPinned: false,
    isRead: false,
  },
  {
    id: 3,
    title: '6월 정기 서버 점검 완료 안내',
    content: '안녕하세요.\n\n아래와 같이 정기 서버 점검이 완료되었습니다.\n\n■ 점검 일시: 2026년 6월 5일(화) 02:00 ~ 04:00\n■ 점검 내용: 데이터베이스 최적화, 보안 패치 적용\n\n점검 중 불편을 드려 죄송합니다.\n이용해 주셔서 감사합니다.',
    authorNickname: '운영팀',
    createdAt: '2026.06.05',
    isPinned: false,
    isRead: true,
  },
  {
    id: 4,
    title: '개인정보 처리방침 변경 안내',
    content: '2026년 5월 1일부로 개인정보 처리방침이 아래와 같이 변경됩니다.\n\n주요 변경 내용:\n- 수집 항목: 이메일 추가 수집\n- 보유 기간: 회원 탈퇴 후 30일 → 7일로 단축\n\n자세한 내용은 서비스 내 개인정보 처리방침 페이지를 확인해 주세요.',
    authorNickname: '운영팀',
    createdAt: '2026.04.28',
    isPinned: false,
    isRead: true,
  },
];

type FilterType = 'all' | 'pinned' | 'unread';

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewModal, setViewModal] = useState<Notice | null>(null);

  const totalCount = notices.length;
  const pinnedCount = notices.filter(n => n.isPinned).length;
  const unreadCount = notices.filter(n => !n.isRead).length;

  const filteredNotices = notices
    .filter(n => {
      if (filter === 'pinned') return n.isPinned;
      if (filter === 'unread') return !n.isRead;
      return true;
    })
    .filter(n => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    });

  const markRead = useCallback((id: number) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const viewNotice = (n: Notice) => {
    if (!n.isRead) markRead(n.id);
    setViewModal(n);
  };

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
  };

  return (
    <>
      <style>{`
        .notice-card { background:#fff;border:1px solid #f1f5f9;border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease; }
        .notice-card:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(16,85,232,.08);border-color:#93aeee; }
        .notice-card.pinned { border-left:3px solid #f59e0b; }
        .notice-card.unread { border-left:3px solid #0077ff; }
        .notice-card.pinned.unread { border-left:3px solid #f59e0b; }
        .unread-dot { display:inline-block;width:8px;height:8px;border-radius:50%;background:#0077ff;flex-shrink:0;margin-top:3px; }
        .filter-tab { transition:all .15s ease;white-space:nowrap;cursor:pointer; }
        .filter-tab.active { background:#CED4DA;color:#495057; }
        mark { background:#fef08a;border-radius:2px;padding:0 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation:fadeUp .35s ease forwards; }
      `}</style>

      <div className="bg-blue-100 min-h-screen">
      <div id="sidebarOverlay" onClick={() => {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('open');
      }}></div>
      <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{minHeight:'100vh'}}>
        <LeftMenu />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6 space-y-4">

        {/* 배너 */}
        <div className="rounded-2xl p-5 sm:p-6 text-white fade-up" style={{ background: 'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)' }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Service Notice</p>
              <h1 className="text-2xl sm:text-3xl font-bold">서비스 공지사항</h1>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                StudyGroupManager 운영팀 공식 공지
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]" style={{ background: 'rgba(255,255,255,.1)' }}>
                <p className="text-lg font-bold">{totalCount}</p>
                <p className="text-xs text-white/70 mt-0.5">전체</p>
              </div>
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]" style={{ background: 'rgba(255,255,255,.1)' }}>
                <p className="text-lg font-bold text-amber-300">{pinnedCount}</p>
                <p className="text-xs text-white/70 mt-0.5">중요</p>
              </div>
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]" style={{ background: 'rgba(255,255,255,.1)' }}>
                <p className="text-lg font-bold text-blue-200">{unreadCount}</p>
                <p className="text-xs text-white/70 mt-0.5">읽지 않음</p>
              </div>
            </div>
          </div>
        </div>

        {/* 툴바 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 fade-up" style={{ animationDelay: '40ms' }}>
          <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5 overflow-x-auto flex-shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {(['all', 'pinned', 'unread'] as FilterType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`filter-tab text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 ${filter === f ? 'active' : ''}`}>
                {f === 'all' ? `전체 ${totalCount}` : f === 'pinned' ? `📌 중요 ${pinnedCount}` : `🔵 읽지 않음 ${unreadCount}`}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <input type="text" placeholder="공지 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-sm rounded-xl pl-9 pr-8 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 bg-white transition-all" />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-lg leading-none w-6 h-6 flex items-center justify-center">×</button>}
          </div>
        </div>

        {/* 공지 목록 */}
        <div className="space-y-2.5">
          {filteredNotices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16 px-6 fade-up">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              </div>
              <p className="font-bold text-slate-600 mb-1">{searchQuery ? '검색 결과가 없습니다' : '현재 공지사항이 없습니다'}</p>
              <p className="text-sm text-slate-400">{searchQuery ? '다른 검색어를 시도해 보세요.' : '새로운 공지가 등록되면 이곳에 표시됩니다.'}</p>
            </div>
          ) : filteredNotices.map((n, idx) => (
            <article key={n.id}
              className={`notice-card fade-up ${n.isPinned ? 'pinned' : ''} ${!n.isRead ? 'unread' : ''}`}
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => viewNotice(n)}>
              <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {!n.isRead ? (
                      <span className="unread-dot" />
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#e2e8f0', color: '#94a3b8' }}>{idx + 1}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {n.isPinned && <span className="text-amber-500 text-sm flex-shrink-0">📌</span>}
                      {!n.isRead && <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ color: '#0077ff', background: '#eff6ff' }}>NEW</span>}
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug"
                        dangerouslySetInnerHTML={{ __html: highlight(n.title, searchQuery) }} />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: highlight(n.content.slice(0, 120), searchQuery) }} />
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#3a74ef,#0d44c4)', fontSize: '9px' }}>{n.authorNickname[0]?.toUpperCase()}</div>
                        <span className="font-medium">{n.authorNickname}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">{n.createdAt}</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
          </main>
        </div>
      </div>

      {/* 공지 보기 모달 */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto">
            <div className="p-6">
              <div className="mb-4">
                {viewModal.isPinned && (
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3" style={{ background: '#fef3c7', color: '#d97706' }}>📌 중요 공지</span>
                )}
                <h2 className="text-lg font-bold text-slate-800 leading-snug">{viewModal.title}</h2>
              </div>
              <div className="rounded-xl px-3 py-2.5 mb-4 flex items-center gap-3 flex-wrap text-xs text-slate-400" style={{ background: '#f8fafc' }}>
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#3a74ef,#0d44c4)', fontSize: '9px' }}>{viewModal.authorNickname[0]?.toUpperCase()}</div>
                  {viewModal.authorNickname}
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-mono">{viewModal.createdAt}</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto px-1 bg-slate-50 rounded-xl p-4">{viewModal.content}</div>
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setViewModal(null)} className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
