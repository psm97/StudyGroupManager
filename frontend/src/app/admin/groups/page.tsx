'use client';

import { useEffect, useState } from 'react';

interface Group {
  id: number; name: string; leader?: string; member_count: number;
  created_at: string; is_public: boolean; attendance_rate?: number;
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/admin/api/groups/')
      .then(r=>r.json())
      .then(data => { setGroups(data.data || data); setLoading(false); })
      .catch(() => {
        setGroups([
          {id:1, name:'Web Developer Study', leader:'홍길동', member_count:6, created_at:'2025.01.10', is_public:true, attendance_rate:92},
          {id:2, name:'Python 알고리즘', leader:'김철수', member_count:8, created_at:'2025.02.15', is_public:false, attendance_rate:75},
          {id:3, name:'영어 회화 스터디', leader:'이영희', member_count:5, created_at:'2025.03.20', is_public:true, attendance_rate:88},
        ]);
        setLoading(false);
      });
  }, []);

  const filtered = groups.filter(g => g.name.includes(search) || (g.leader||'').includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">그룹관리</h1>
          <p className="text-sm text-slate-400 mt-0.5">전체 스터디 그룹 목록 및 관리</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="그룹 검색..." value={search} onChange={e=>setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            style={{background:'#f8fafc', width:'220px'}} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
        <div className="px-5 py-4 border-b border-slate-100">
          <span className="text-sm text-slate-500">총 <strong className="text-slate-800">{filtered.length}</strong>개 그룹</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:'#f8fafc'}}>
                {['#','그룹명','리더','멤버수','출석률','개설일','공개','관리'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({length:3}).map((_,i)=>(
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                ))
              ) : filtered.map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-400">{g.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{g.name}</td>
                  <td className="px-4 py-3 text-slate-500">{g.leader || '-'}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{g.member_count}명</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-sm" style={{color:'#1d4ed8'}}>{g.attendance_rate || 0}%</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{g.created_at}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{background: g.is_public?'#dbeafe':'#f1f5f9', color: g.is_public?'#1d4ed8':'#64748b'}}>
                      {g.is_public ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-600 hover:underline font-medium">상세</button>
                      <button className="text-xs text-red-500 hover:underline font-medium">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
