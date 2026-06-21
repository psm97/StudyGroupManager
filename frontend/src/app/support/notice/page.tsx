'use client';

import { useState, useCallback, useEffect } from 'react';
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

type FilterType = 'all' | 'pinned' | 'unread';

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchNotices = useCallback(() => {
    fetch('/support/api/notices/', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.items) return;
        setNotices(prev => {
          const readSet = new Set(prev.filter(n => n.isRead).map(n => n.id));
          return data.items.map((n: { id: number; title: string; content: string; author: string; created_at: string; is_pinned: boolean }) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            authorNickname: n.author,
            createdAt: n.created_at,
            isPinned: n.is_pinned,
            isRead: readSet.has(n.id),
          }));
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotices();
    fetch('/admin/api/me/', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.is_admin) setIsAdmin(true); })
      .catch(() => {});
  }, [fetchNotices]);

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

  const handleCreate = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700">📢 공지 작성</span>',
      width: 540,
      html: `
        <div style="text-align:left;padding:4px 0;display:flex;flex-direction:column;gap:12px">
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">제목 *</label>
            <input id="swal-ntitle" type="text" placeholder="공지 제목을 입력하세요"
              style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box"/>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">내용 *</label>
            <textarea id="swal-ncontent" rows="6" placeholder="공지 내용을 입력하세요"
              style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;resize:none;font-family:inherit;box-sizing:border-box"></textarea>
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#334155;cursor:pointer">
            <input id="swal-npinned" type="checkbox"
              style="width:16px;height:16px;accent-color:#f59e0b;cursor:pointer"/>
            <span>📌 중요 공지로 고정</span>
          </label>
        </div>`,
      confirmButtonText: '공지 등록',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const title   = ((document.getElementById('swal-ntitle') as HTMLInputElement)?.value || '').trim();
        const content = ((document.getElementById('swal-ncontent') as HTMLTextAreaElement)?.value || '').trim();
        const pinned  = (document.getElementById('swal-npinned') as HTMLInputElement)?.checked ?? false;
        if (!title)   { Swal.showValidationMessage('제목을 입력해주세요.'); return false; }
        if (!content) { Swal.showValidationMessage('내용을 입력해주세요.'); return false; }
        return { title, content, is_pinned: pinned };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      const res = await fetch('/admin/api/notices/create/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value),
      });
      const data = await res.json();
      if (!res.ok) { Swal.fire({ icon: 'error', title: '오류', text: data.error || '공지 등록에 실패했습니다.' }); return; }

      await Swal.fire({ icon: 'success', title: '공지가 등록되었습니다!', timer: 1500, showConfirmButton: false, timerProgressBar: true });
      fetchNotices();
    } catch {
      Swal.fire({ icon: 'error', title: '오류', text: '서버 오류가 발생했습니다.' });
    }
  };

  const handleDelete = async (n: Notice, e: React.MouseEvent) => {
    e.stopPropagation();
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '공지 삭제',
      text: `"${n.title}" 공지를 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      confirmButtonColor: '#e11d48',
      cancelButtonText: '취소',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/admin/api/notices/${n.id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) { Swal.fire({ icon: 'error', title: '오류', text: '삭제에 실패했습니다.' }); return; }
      if (viewModal?.id === n.id) setViewModal(null);
      fetchNotices();
    } catch {
      Swal.fire({ icon: 'error', title: '오류', text: '서버 오류가 발생했습니다.' });
    }
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
        button:not(:disabled) { cursor: pointer; }
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
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <input type="text" placeholder="공지 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm rounded-xl pl-9 pr-8 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 bg-white transition-all" />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-lg leading-none w-6 h-6 flex items-center justify-center">×</button>}
            </div>
            {isAdmin && (
              <button onClick={handleCreate}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white flex-shrink-0 transition-colors"
                style={{ background: '#0077ff' }}
                onMouseOver={e => (e.currentTarget.style.background = '#0d44c4')}
                onMouseOut={e => (e.currentTarget.style.background = '#0077ff')}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                공지 작성
              </button>
            )}
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
                  <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                    {isAdmin && (
                      <button
                        onClick={e => handleDelete(n, e)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="공지 삭제">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    )}
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                    </svg>
                  </div>
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
            <div className="px-6 pb-6 flex gap-2">
              {isAdmin && (
                <button
                  onClick={e => { handleDelete(viewModal, e); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ background: '#e11d48' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#be123c')}
                  onMouseOut={e => (e.currentTarget.style.background = '#e11d48')}>
                  삭제
                </button>
              )}
              <button onClick={() => setViewModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
