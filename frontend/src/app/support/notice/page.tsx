'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface Notice {
  id: number;
  title: string;
  content: string;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isRead: boolean;
}

const MOCK_NOTICES: Notice[] = [
  { id: 1, title: '6월 스터디 일정 공지', content: '6월 스터디 일정을 안내드립니다.\n\n매주 화요일 오후 2시 ~ 4시에 진행됩니다.\n장소: 강남 스터디카페 3층\n\n참석 여부를 미리 알려주세요.', authorNickname: '김철수', createdAt: '2025.06.10', updatedAt: '2025.06.10', isPinned: true, isRead: false },
  { id: 2, title: '자료실 파일 업로드 안내', content: '이번 주 자료가 자료실에 업로드되었습니다.\n강의 자료와 예제 코드를 확인해 주세요.', authorNickname: '김철수', createdAt: '2025.06.08', updatedAt: '2025.06.08', isPinned: false, isRead: false },
  { id: 3, title: '출석 관련 안내사항', content: '출석률이 70% 미만인 멤버는 경고가 부여됩니다.\n지각/결석 시 미리 연락 부탁드립니다.', authorNickname: '김철수', createdAt: '2025.06.01', updatedAt: '2025.06.03', isPinned: false, isRead: true },
  { id: 4, title: '스터디 방향 논의 결과', content: '지난 미팅에서 결정된 사항을 공유합니다.\n\n1. 주 1회 → 주 2회로 변경\n2. 알고리즘 중심 커리큘럼 유지', authorNickname: '김철수', createdAt: '2025.05.25', updatedAt: '2025.05.25', isPinned: false, isRead: true },
];

type FilterType = 'all' | 'pinned' | 'unread';

export default function NoticePage() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id') || '0';
  const isLeader = true;

  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<Notice | null>(null);
  const [viewModal, setViewModal] = useState<Notice | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPinned, setFormPinned] = useState(false);

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
    fetch(`/groups/${groupId}/notices/${id}/read/`, { method: 'POST' }).catch(() => {});
  }, [groupId]);

  const viewNotice = (n: Notice) => {
    if (!n.isRead) markRead(n.id);
    setViewModal(n);
  };

  const openCreate = () => {
    setFormTitle(''); setFormContent(''); setFormPinned(false);
    setCreateModal(true);
  };

  const submitCreate = async () => {
    if (!formTitle.trim()) { alert('제목을 입력해 주세요.'); return; }
    if (!formContent.trim()) { alert('내용을 입력해 주세요.'); return; }
    try {
      await fetch(`/groups/${groupId}/notices/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formTitle, content: formContent, is_pinned: formPinned }) });
    } catch { /* ignore */ }
    const newNotice: Notice = { id: Date.now(), title: formTitle, content: formContent, authorNickname: '김철수', createdAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', ''), updatedAt: '', isPinned: formPinned, isRead: true };
    setNotices(prev => [newNotice, ...prev]);
    setCreateModal(false);
    alert('공지 작성 완료');
  };

  const openEdit = (n: Notice) => {
    setFormTitle(n.title); setFormContent(n.content); setFormPinned(n.isPinned);
    setEditModal(n);
    setViewModal(null);
  };

  const submitEdit = async () => {
    if (!editModal) return;
    if (!formTitle.trim()) { alert('제목을 입력해 주세요.'); return; }
    if (!formContent.trim()) { alert('내용을 입력해 주세요.'); return; }
    try {
      await fetch(`/groups/${groupId}/notices/${editModal.id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formTitle, content: formContent, is_pinned: formPinned }) });
    } catch { /* ignore */ }
    setNotices(prev => prev.map(n => n.id === editModal.id ? { ...n, title: formTitle, content: formContent, isPinned: formPinned } : n));
    setEditModal(null);
    alert('수정 완료');
  };

  const deleteNotice = async (id: number, title: string) => {
    if (!confirm(`"${title}" 공지를 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`)) return;
    try {
      await fetch(`/groups/${groupId}/notices/${id}/`, { method: 'DELETE' });
    } catch { /* ignore */ }
    setNotices(prev => prev.filter(n => n.id !== id));
    setViewModal(null);
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
        .action-btn { opacity:0;transition:opacity .15s ease; }
        .notice-card:hover .action-btn { opacity:1; }
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
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Notice Board</p>
              <h1 className="text-2xl sm:text-3xl font-bold">공지사항</h1>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                스터디 그룹
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
              {isLeader && (
                <button onClick={openCreate}
                  className="flex items-center gap-2 bg-white text-blue-600 text-sm font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-blue-50 hover:shadow-lg transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  공지 작성
                </button>
              )}
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
              <p className="font-bold text-slate-600 mb-1">{searchQuery ? '검색 결과가 없습니다' : '아직 공지사항이 없습니다'}</p>
              <p className="text-sm text-slate-400 mb-5">{searchQuery ? '다른 검색어를 시도해 보세요.' : '그룹 리더가 공지를 작성하면 이곳에 표시됩니다.'}</p>
              {isLeader && !searchQuery && (
                <button onClick={openCreate} className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm" style={{ background: '#0077ff' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  첫 공지 작성하기
                </button>
              )}
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
                      {n.updatedAt && n.updatedAt !== n.createdAt && <><span className="text-slate-300">·</span><span className="italic text-slate-400">수정됨</span></>}
                    </div>
                  </div>
                  {isLeader && (
                    <div className="action-btn flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(n)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="수정">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => deleteNotice(n.id, n.title)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="삭제">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  )}
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
              <h2 className="text-lg font-bold text-slate-800 mb-4">{viewModal.isPinned ? '📌 ' : ''}{viewModal.title}</h2>
              <div className="rounded-xl px-3 py-2.5 mb-4 flex items-center gap-3 flex-wrap text-xs text-slate-400" style={{ background: '#f8fafc' }}>
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#3a74ef,#0d44c4)', fontSize: '9px' }}>{viewModal.authorNickname[0]?.toUpperCase()}</div>
                  {viewModal.authorNickname}
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-mono">{viewModal.createdAt}</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto px-1">{viewModal.content}</div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setViewModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">닫기</button>
              {isLeader && <>
                <button onClick={() => openEdit(viewModal)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#0077ff' }}>수정</button>
                <button onClick={() => deleteNotice(viewModal.id, viewModal.title)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">삭제</button>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* 공지 작성 모달 */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">공지사항 작성</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">제목 <span className="text-red-400">*</span></label>
                <input type="text" maxLength={100} placeholder="공지 제목을 입력하세요" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                <p className="text-right text-xs text-slate-300 mt-0.5">{formTitle.length}/100자</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">내용 <span className="text-red-400">*</span></label>
                <textarea rows={6} placeholder="공지 내용을 입력하세요" value={formContent} onChange={e => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 leading-relaxed" />
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <input type="checkbox" id="pin-cb" checked={formPinned} onChange={e => setFormPinned(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#f59e0b' }} />
                <label htmlFor="pin-cb" className="text-sm font-semibold cursor-pointer select-none" style={{ color: '#92400e' }}>📌 중요 공지로 설정 (상단 고정)</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setCreateModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={submitCreate} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#0077ff' }}>작성 완료</button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 수정 모달 */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">공지사항 수정</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">제목</label>
                <input type="text" maxLength={100} value={formTitle} onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">내용</label>
                <textarea rows={6} value={formContent} onChange={e => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 leading-relaxed" />
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <input type="checkbox" id="pin-edit-cb" checked={formPinned} onChange={e => setFormPinned(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#f59e0b' }} />
                <label htmlFor="pin-edit-cb" className="text-sm font-semibold cursor-pointer select-none" style={{ color: '#92400e' }}>📌 중요 공지 (상단 고정)</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={submitEdit} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#0077ff' }}>수정 완료</button>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 FAB */}
      {isLeader && (
        <button onClick={openCreate}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-105"
          style={{ background: '#0077ff' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
        </button>
      )}
    </>
  );
}
