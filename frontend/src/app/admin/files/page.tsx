'use client';

import { useEffect, useState } from 'react';

interface FileItem {
  id: number; name: string; size: string; uploaded_by?: string; uploaded_at: string; type: string;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/admin/api/files/')
      .then(r=>r.json())
      .then(data => { setFiles(data.data || data); setLoading(false); })
      .catch(() => {
        setFiles([
          {id:1, name:'스터디_자료_06월.pdf', size:'2.4 MB', uploaded_by:'홍길동', uploaded_at:'2025.06.17', type:'PDF'},
          {id:2, name:'알고리즘_문제집.zip', size:'8.1 MB', uploaded_by:'김철수', uploaded_at:'2025.06.15', type:'ZIP'},
          {id:3, name:'영어_단어장.xlsx', size:'1.2 MB', uploaded_by:'이영희', uploaded_at:'2025.06.12', type:'Excel'},
        ]);
        setLoading(false);
      });
  }, []);

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const typeColor = (type: string) => {
    const map: Record<string, {bg:string, color:string}> = {
      PDF: {bg:'#fee2e2', color:'#dc2626'},
      ZIP: {bg:'#fef3c7', color:'#d97706'},
      Excel: {bg:'#dcfce7', color:'#16a34a'},
    };
    return map[type] || {bg:'#f1f5f9', color:'#64748b'};
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">파일관리</h1>
          <p className="text-sm text-slate-400 mt-0.5">업로드된 파일 목록 및 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="파일 검색..." value={search} onChange={e=>setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
              style={{background:'#f8fafc', width:'220px'}} />
          </div>
        </div>
      </div>

      {/* 용량 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label:'총 파일', value:`${files.length}개`, color:'#1d4ed8', bg:'#dbeafe'},
          {label:'총 용량', value:'11.7 MB', color:'#d97706', bg:'#fef3c7'},
          {label:'이번 달 업로드', value:`${files.length}개`, color:'#16a34a', bg:'#dcfce7'},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
            <p className="text-xl font-bold" style={{color:s.color}}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:'#f8fafc'}}>
                {['#','파일명','유형','크기','업로드한 사람','업로드일','관리'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">로딩 중...</td></tr>
              ) : filtered.map(f => {
                const badge = typeColor(f.type);
                return (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-400">{f.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span className="font-medium text-slate-700 truncate max-w-[200px]">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:badge.bg, color:badge.color}}>
                        {f.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{f.size}</td>
                    <td className="px-4 py-3 text-slate-500">{f.uploaded_by || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{f.uploaded_at}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline font-medium">다운로드</button>
                        <button className="text-xs text-red-500 hover:underline font-medium">삭제</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">파일이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
