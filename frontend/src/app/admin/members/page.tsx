'use client';

import { useEffect, useState } from 'react';

interface Member {
  id: number; username: string; email: string; nickname?: string;
  date_joined: string; is_active: boolean; group_count?: number;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/admin/api/members/', {credentials:'include'})
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setMembers(data.users || data.data || []); setLoading(false); })
      .catch(() => {
        setMembers([
          {id:1, username:'홍길동', email:'hong@example.com', nickname:'길동', date_joined:'2025.01.15', is_active:true, group_count:3},
          {id:2, username:'김철수', email:'kim@example.com', nickname:'철수', date_joined:'2025.02.20', is_active:true, group_count:2},
          {id:3, username:'이영희', email:'lee@example.com', nickname:'영희', date_joined:'2025.03.10', is_active:false, group_count:1},
        ]);
        setLoading(false);
      });
  }, []);

  const filtered = members.filter(m =>
    m.username.includes(search) || m.email.includes(search) || (m.nickname||'').includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">회원관리</h1>
          <p className="text-sm text-slate-400 mt-0.5">전체 회원 목록 및 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="회원 검색..." value={search} onChange={e=>setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              style={{background:'#f8fafc', width:'220px'}} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">총 <strong className="text-slate-800">{filtered.length}</strong>명</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:'#f8fafc'}}>
                {['#','이름','이메일','닉네임','가입일','그룹수','상태','관리'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({length:5}).map((_,i)=>(
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                ))
              ) : filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-400">{m.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{background:'linear-gradient(135deg,#333,#555)'}}>{m.username[0]}</div>
                      <span className="font-medium text-slate-700">{m.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{m.email}</td>
                  <td className="px-4 py-3 text-slate-500">{m.nickname || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{m.date_joined}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{m.group_count || 0}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{background: m.is_active?'#dcfce7':'#fee2e2', color: m.is_active?'#16a34a':'#dc2626'}}>
                      {m.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-600 hover:underline font-medium">상세</button>
                      <button className="text-xs text-red-500 hover:underline font-medium">정지</button>
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
