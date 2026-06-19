'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface Resource {
  id: number;
  fileName: string;
  fileExt: string;
  category: string;
  uploaderNickname: string;
  date: string;
  fileSize: string;
  downloadCount: number;
  canDelete: boolean;
}

const MOCK_RESOURCES: Resource[] = [
  { id: 1, fileName: '정렬알고리즘_강의자료.pdf', fileExt: 'pdf', category: '강의자료', uploaderNickname: '김철수', date: '2025-06-10', fileSize: '2.4 MB', downloadCount: 12, canDelete: true },
  { id: 2, fileName: '6월_기출문제_모음.pdf', fileExt: 'pdf', category: '기출문제', uploaderNickname: '이영희', date: '2025-06-08', fileSize: '1.8 MB', downloadCount: 8, canDelete: false },
  { id: 3, fileName: '알고리즘_요약노트.docx', fileExt: 'docx', category: '요약노트', uploaderNickname: '박민준', date: '2025-06-01', fileSize: '512 KB', downloadCount: 5, canDelete: false },
  { id: 4, fileName: '스터디_발표자료.pptx', fileExt: 'pptx', category: '강의자료', uploaderNickname: '최지아', date: '2025-05-27', fileSize: '5.1 MB', downloadCount: 15, canDelete: true },
  { id: 5, fileName: '과제_제출양식.xlsx', fileExt: 'xlsx', category: '기타', uploaderNickname: '김철수', date: '2025-05-20', fileSize: '256 KB', downloadCount: 20, canDelete: true },
  { id: 6, fileName: '참고이미지.png', fileExt: 'png', category: '기타', uploaderNickname: '이영희', date: '2025-05-15', fileSize: '800 KB', downloadCount: 3, canDelete: false },
];

type ViewType = 'list' | 'grid';
type CategoryType = 'all' | '강의자료' | '기출문제' | '요약노트' | '기타';
type SortCol = 'name' | 'uploader' | 'date' | 'downloads';
type SortDir = 'asc' | 'desc';

const fileIcon = (ext: string) => {
  if (ext === 'pdf') return '📄';
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️';
  if (['doc','docx'].includes(ext)) return '📝';
  if (['ppt','pptx'].includes(ext)) return '📊';
  if (['xls','xlsx'].includes(ext)) return '📈';
  if (['zip','rar','7z'].includes(ext)) return '🗜️';
  return '📎';
};

const fileIconClass = (ext: string) => {
  if (ext === 'pdf') return 'icon-pdf';
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'icon-img';
  if (['doc','docx'].includes(ext)) return 'icon-doc';
  if (['ppt','pptx'].includes(ext)) return 'icon-ppt';
  if (['xls','xlsx'].includes(ext)) return 'icon-xls';
  if (['zip','rar','7z'].includes(ext)) return 'icon-zip';
  return 'icon-etc';
};

const catBadgeClass = (cat: string) => {
  if (cat === '강의자료') return 'cat-badge-lecture';
  if (cat === '기출문제') return 'cat-badge-exam';
  if (cat === '요약노트') return 'cat-badge-note';
  return 'cat-badge-etc';
};

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id') || '0';
  const isLeader = true;

  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [view, setView] = useState<ViewType>('list');
  const [category, setCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({ col: 'date', dir: 'desc' });
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('기타');
  const [uploading, setUploading] = useState(false);

  const filtered = resources
    .filter(r => category === 'all' || r.category === category)
    .filter(r => !searchQuery || r.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.col === 'downloads') return (a.downloadCount - b.downloadCount) * dir;
      if (sort.col === 'name') return a.fileName.localeCompare(b.fileName) * dir;
      if (sort.col === 'uploader') return a.uploaderNickname.localeCompare(b.uploaderNickname) * dir;
      if (sort.col === 'date') return a.date.localeCompare(b.date) * dir;
      return 0;
    });

  const handleSort = (col: SortCol) => {
    setSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'desc' });
  };

  const sortIcon = (col: SortCol) => sort.col === col ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '';

  const recordDownload = async (id: number) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloadCount: r.downloadCount + 1 } : r));
    try { await fetch(`/groups/${groupId}/resources/${id}/download/`, { method: 'POST' }); } catch { /* ignore */ }
  };

  const handleDownload = async (r: Resource) => {
    const triggerSave = (blob: Blob, fileName: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    try {
      const res = await fetch(`/groups/${groupId}/resources/${r.id}/file/`);
      if (res.ok) {
        const blob = await res.blob();
        triggerSave(blob, r.fileName);
      } else {
        triggerSave(new Blob([`${r.fileName} placeholder`], { type: 'application/octet-stream' }), r.fileName);
      }
    } catch {
      triggerSave(new Blob([`${r.fileName} placeholder`], { type: 'application/octet-stream' }), r.fileName);
    }

    await recordDownload(r.id);
  };

  const deleteResource = async (id: number, name: string) => {
    if (!confirm(`"${name}" 파일을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`)) return;
    try { await fetch(`/groups/${groupId}/resources/${id}/`, { method: 'DELETE' }); } catch { /* ignore */ }
    setResources(prev => prev.filter(r => r.id !== id));
    alert('삭제 완료');
  };

  const submitUpload = async () => {
    if (!uploadFile) { alert('파일을 선택해 주세요.'); return; }
    if (uploadFile.size > 10 * 1024 * 1024) { alert('파일 크기는 10MB 이하여야 합니다.'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadCategory);
    try {
      await fetch(`/groups/${groupId}/resources/`, { method: 'POST', body: formData });
      const ext = uploadFile.name.split('.').pop()?.toLowerCase() || '';
      const newRes: Resource = { id: Date.now(), fileName: uploadFile.name, fileExt: ext, category: uploadCategory, uploaderNickname: '나', date: new Date().toISOString().slice(0, 10), fileSize: formatSize(uploadFile.size), downloadCount: 0, canDelete: true };
      setResources(prev => [newRes, ...prev]);
      alert('업로드 완료');
      setUploadModal(false);
      setUploadFile(null);
    } catch { alert('업로드 중 오류가 발생했습니다.'); }
    finally { setUploading(false); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const totalCount = resources.length;
  const totalDownloads = resources.reduce((s, r) => s + r.downloadCount, 0);

  return (
    <>
      <style>{`
        .cat-tab { transition: all .15s ease; white-space: nowrap; cursor: pointer; }
        .cat-tab.active { background: #CED4DA; color: #495057; }
        .view-btn { transition: all .15s ease; cursor: pointer; color: #94a3b8; }
        .view-btn.active { background: #CED4DA; color: #495057; }
        .res-row { transition: background .12s ease; }
        .res-row:hover { background: #f8fafc; }
        .action-btn { opacity: 0; transition: opacity .15s ease; }
        .res-row:hover .action-btn { opacity: 1; }
        .grid-card { background:#fff;border:1px solid #f1f5f9;border-radius:16px;padding:18px;transition:transform .18s ease,box-shadow .18s ease; }
        .grid-card:hover { transform:translateY(-3px);box-shadow:0 8px 24px rgba(16,85,232,.1); }
        .icon-pdf { background:#fff1f1;color:#e53e3e; }
        .icon-img { background:#f5f0ff;color:#7c3aed; }
        .icon-doc { background:#eff6ff;color:#2563eb; }
        .icon-ppt { background:#fff8f0;color:#dd6b20; }
        .icon-xls { background:#f0fff4;color:#16a34a; }
        .icon-zip { background:#fefce8;color:#ca8a04; }
        .icon-etc { background:#f8fafc;color:#64748b; }
        .cat-badge-lecture { background:#eff6ff;color:#2563eb; }
        .cat-badge-exam { background:#faf5ff;color:#7c3aed; }
        .cat-badge-note { background:#f0fdf4;color:#16a34a; }
        .cat-badge-etc { background:#f8fafc;color:#64748b; }
        .drop-zone { border:2px dashed #93aeee;border-radius:16px;background:#f0f5fe;transition:all .2s ease; }
        .drop-zone:hover, .drop-zone.drag-over { border-color:#0077ff;background:#dce6fd; }
        .sticky-head th { position:sticky;top:0;z-index:10;background:#f8fafc; }
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
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Resource Room</p>
              <h1 className="text-2xl sm:text-3xl font-bold">자료실</h1>
              <p className="text-white/70 text-sm mt-1">스터디 그룹</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]" style={{ background: 'rgba(255,255,255,.1)' }}>
                <p className="text-lg font-bold">{totalCount}</p>
                <p className="text-xs text-white/70 mt-0.5">전체 파일</p>
              </div>
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]" style={{ background: 'rgba(255,255,255,.1)' }}>
                <p className="text-lg font-bold text-green-300">{totalDownloads}</p>
                <p className="text-xs text-white/70 mt-0.5">총 다운로드</p>
              </div>
              <button onClick={() => setUploadModal(true)}
                className="flex items-center gap-2 bg-white text-blue-600 text-sm font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-blue-50 hover:shadow-lg transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                파일 업로드
              </button>
            </div>
          </div>
        </div>

        {/* 툴바 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 fade-up" style={{ animationDelay: '40ms' }}>
          <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5 overflow-x-auto flex-shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {(['all', '강의자료', '기출문제', '요약노트', '기타'] as CategoryType[]).map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`cat-tab text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 ${category === cat ? 'active' : ''}`}>
                {cat === 'all' ? `전체 ${totalCount}` : cat === '강의자료' ? '📚 강의자료' : cat === '기출문제' ? '📝 기출문제' : cat === '요약노트' ? '🗒️ 요약노트' : '📎 기타'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input type="text" placeholder="파일명 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="text-sm rounded-xl pl-9 pr-8 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 bg-white transition-all w-40 sm:w-48" />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-lg leading-none w-6 h-6 flex items-center justify-center">×</button>}
            </div>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
              <button onClick={() => setView('list')} title="목록 보기" className={`view-btn w-8 h-7 flex items-center justify-center rounded-lg ${view === 'list' ? 'active' : ''}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              </button>
              <button onClick={() => setView('grid')} title="카드 보기" className={`view-btn w-8 h-7 flex items-center justify-center rounded-lg ${view === 'grid' ? 'active' : ''}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* 목록 뷰 */}
        {view === 'list' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-up" style={{ animationDelay: '80ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky-head">
                  <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                    <th className="text-left px-5 py-3 min-w-[200px]">
                      <button className="font-semibold hover:text-blue-600 transition-colors" onClick={() => handleSort('name')}>파일명{sortIcon('name')}</button>
                    </th>
                    <th className="text-left px-4 py-3">카테고리</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">
                      <button className="font-semibold hover:text-blue-600 transition-colors" onClick={() => handleSort('uploader')}>업로더{sortIcon('uploader')}</button>
                    </th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">
                      <button className="font-semibold hover:text-blue-600 transition-colors" onClick={() => handleSort('date')}>날짜{sortIcon('date')}</button>
                    </th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">크기</th>
                    <th className="text-center px-4 py-3">
                      <button className="font-semibold hover:text-blue-600 transition-colors" onClick={() => handleSort('downloads')}>다운로드{sortIcon('downloads')}</button>
                    </th>
                    <th className="text-center px-4 py-3">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 px-6">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/></svg>
                        </div>
                        <p className="font-bold text-slate-500 mb-1">{searchQuery ? '검색 결과가 없습니다' : '업로드된 파일이 없습니다'}</p>
                        <p className="text-xs text-slate-400 mb-5">파일을 업로드하면 멤버 모두와 공유됩니다.</p>
                        <button onClick={() => setUploadModal(true)} className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm" style={{ background: '#0077ff' }}>파일 업로드</button>
                      </td>
                    </tr>
                  ) : filtered.map(r => (
                    <tr key={r.id} className="res-row">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${fileIconClass(r.fileExt)}`}>{fileIcon(r.fileExt)}</div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-[220px]" title={r.fileName}>{r.fileName}</p>
                            <p className="text-xs text-slate-400 uppercase font-mono">.{r.fileExt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catBadgeClass(r.category)}`}>{r.category}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#3a74ef,#0d44c4)', fontSize: '10px' }}>{r.uploaderNickname[0]?.toUpperCase()}</div>
                          <span className="text-sm text-slate-600">{r.uploaderNickname}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs hidden md:table-cell">{r.date}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{r.fileSize}</td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => handleDownload(r)} className="inline-flex items-center gap-1.5 text-sm font-bold hover:text-blue-700 transition-colors" style={{ color: '#0077ff' }}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          {r.downloadCount}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {(isLeader || r.canDelete) ? (
                          <button className="action-btn w-8 h-8 flex items-center justify-center mx-auto rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => deleteResource(r.id, r.fileName)} title="삭제">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        ) : <span className="text-slate-200 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">{filtered.length}개 표시 중</p>
              <p className="text-xs text-slate-400">최대 업로드 크기: <span className="font-semibold">10MB</span></p>
            </div>
          </div>
        )}

        {/* 그리드 뷰 */}
        {view === 'grid' && (
          <div className="fade-up" style={{ animationDelay: '80ms' }}>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 text-center py-12 text-slate-400 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                {searchQuery ? '검색 결과가 없습니다.' : '파일이 없습니다.'}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map(r => (
                  <div key={r.id} className="grid-card">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 ${fileIconClass(r.fileExt)}`}>{fileIcon(r.fileExt)}</div>
                    <p className="font-semibold text-slate-800 text-sm truncate mb-1" title={r.fileName}>{r.fileName}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catBadgeClass(r.category)}`}>{r.category}</span>
                      <span className="text-xs text-slate-400">{r.fileSize}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleDownload(r)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        {r.downloadCount}
                      </button>
                      {(isLeader || r.canDelete) && (
                        <button onClick={() => deleteResource(r.id, r.fileName)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
          </main>
        </div>
      </div>

      {/* 업로드 모달 */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">파일 업로드</h2>
            <div className="space-y-4">
              <div className="drop-zone p-8 text-center cursor-pointer"
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const f = e.dataTransfer.files[0]; if (f) setUploadFile(f); }}
                onClick={() => document.getElementById('file-input-modal')?.click()}>
                <svg className="w-10 h-10 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <p className="text-sm font-semibold text-slate-600 mb-1">파일을 드래그하거나 클릭하여 선택</p>
                <p className="text-xs text-slate-400 mb-3">PDF, 이미지, 문서, 압축 파일 · 최대 10MB</p>
                <input id="file-input-modal" type="file" className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setUploadFile(f); }} />
                <button type="button" className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition-colors">파일 선택</button>
              </div>
              {uploadFile && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <span className="text-2xl flex-shrink-0">{fileIcon(uploadFile.name.split('.').pop()?.toLowerCase() || '')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{uploadFile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatSize(uploadFile.size)}</p>
                  </div>
                  <button onClick={() => setUploadFile(null)} className="text-slate-400 hover:text-red-500 transition-colors text-xl leading-none flex-shrink-0">×</button>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">카테고리 <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {['강의자료', '기출문제', '요약노트', '기타'].map(cat => (
                    <label key={cat} className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 cursor-pointer hover:border-blue-300 transition-colors ${uploadCategory === cat ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
                      <input type="radio" name="up-category" value={cat} checked={uploadCategory === cat} onChange={() => setUploadCategory(cat)} className="text-blue-500" />
                      <span className="text-sm">{cat === '강의자료' ? '📚 강의자료' : cat === '기출문제' ? '📝 기출문제' : cat === '요약노트' ? '🗒️ 요약노트' : '📎 기타'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setUploadModal(false); setUploadFile(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={submitUpload} disabled={uploading} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-70" style={{ background: '#0077ff' }}>
                {uploading ? '업로드 중...' : '업로드'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 FAB */}
      <button onClick={() => setUploadModal(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-105"
        style={{ background: '#0077ff' }}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
      </button>
    </>
  );
}
