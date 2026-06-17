'use client';

import { useEffect, useState } from 'react';

interface Report {
  id: number; title: string; type: string; reporter?: string;
  reported?: string; status: string; created_at: string;
}

export default function AdminReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/admin/api/reports/')
      .then(r=>r.json())
      .then(data => { setReports(data.data || data); setLoading(false); })
      .catch(() => {
        setReports([
          {id:1, title:'부적절한 언행', type:'행동 신고', reporter:'홍길동', reported:'김철수', status:'검토 중', created_at:'2025.06.17'},
          {id:2, title:'스팸 게시물', type:'콘텐츠 신고', reporter:'이영희', reported:'박민준', status:'처리 완료', created_at:'2025.06.15'},
          {id:3, title:'허위 정보 유포', type:'콘텐츠 신고', reporter:'최수진', reported:'이동현', status:'처리 중', created_at:'2025.06.14'},
        ]);
        setLoading(false);
      });
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, {bg:string, color:string}> = {
      '검토 중': {bg:'#fee2e2', color:'#dc2626'},
      '처리 중': {bg:'#fef3c7', color:'#d97706'},
      '처리 완료': {bg:'#dcfce7', color:'#16a34a'},
    };
    return map[s] || {bg:'#f1f5f9', color:'#64748b'};
  };

  const filtered = statusFilter === 'all' ? reports : reports.filter(r => r.status === statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">신고관리</h1>
          <p className="text-sm text-slate-400 mt-0.5">사용자 신고 접수 및 처리 현황</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', '검토 중', '처리 중', '처리 완료'].map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all"
              style={{
                background: statusFilter===s ? '#1d4ed8' : '#fff',
                color: statusFilter===s ? '#fff' : '#64748b',
                borderColor: statusFilter===s ? '#1d4ed8' : '#e2e8f0'
              }}>
              {s === 'all' ? '전체' : s}
            </button>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label:'전체 신고', value: reports.length, color:'#1d4ed8', bg:'#dbeafe'},
          {label:'처리 중', value: reports.filter(r=>r.status!=='처리 완료').length, color:'#d97706', bg:'#fef3c7'},
          {label:'처리 완료', value: reports.filter(r=>r.status==='처리 완료').length, color:'#16a34a', bg:'#dcfce7'},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 text-center" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
            <p className="text-3xl font-bold mb-1" style={{color:s.color}}>{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:'#f8fafc'}}>
                {['#','제목','유형','신고자','피신고자','상태','접수일','처리'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">로딩 중...</td></tr>
              ) : filtered.map(r => {
                const badge = statusBadge(r.status);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-400">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{r.title}</td>
                    <td className="px-4 py-3 text-slate-500">{r.type}</td>
                    <td className="px-4 py-3 text-slate-500">{r.reporter || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{r.reported || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:badge.bg, color:badge.color}}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{r.created_at}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-blue-600 hover:underline font-medium">처리</button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">신고 내역이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
