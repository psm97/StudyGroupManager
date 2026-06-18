'use client';

import { useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import Swal from 'sweetalert2';

const myGroups = [
  { id: 1, name: 'Web Developer Study', color: '#1258fc', memberCount: 6, maxMembers: 10, attendanceRate: 92, role: '리더', isPublic: true },
  { id: 2, name: 'Python 스터디', color: '#10b981', memberCount: 4, maxMembers: 8, attendanceRate: 85, role: '멤버', isPublic: false },
  { id: 3, name: 'CS 알고리즘', color: '#f59e0b', memberCount: 5, maxMembers: 8, attendanceRate: 78, role: '멤버', isPublic: true },
];

const publicGroups = [
  { id: 4, name: '토익 스터디 900+', color: '#8b5cf6', memberCount: 7, maxMembers: 10, attendanceRate: 88, tags: ['영어', '토익'] },
  { id: 5, name: '리액트 입문반', color: '#ec4899', memberCount: 5, maxMembers: 8, attendanceRate: 91, tags: ['개발', 'React'] },
  { id: 6, name: '공무원 시험 준비', color: '#f97316', memberCount: 8, maxMembers: 10, attendanceRate: 82, tags: ['자격증'] },
];

export default function GroupsPage() {
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [search, setSearch] = useState('');

  const handleCreate = async () => {
    await Swal.fire({
      title: '새 그룹 만들기',
      html: `<input id="sg-name" class="swal2-input" placeholder="그룹명 (필수)">
             <input id="sg-max" class="swal2-input" type="number" placeholder="최대 인원 (2~20)" min="2" max="20" value="8">
             <select id="sg-public" class="swal2-select">
               <option value="true">공개 그룹</option>
               <option value="false">비공개 그룹</option>
             </select>`,
      confirmButtonText: '만들기',
      cancelButtonText: '취소',
      showCancelButton: true,
      confirmButtonColor: '#1258fc',
      preConfirm: () => {
        const name = (document.getElementById('sg-name') as HTMLInputElement)?.value;
        if (!name) { Swal.showValidationMessage('그룹명을 입력해주세요'); return false; }
        return { name };
      },
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({ title: `"${result.value.name}" 그룹이 생성되었습니다!`, icon: 'success', timer: 2000, showConfirmButton: false });
      }
    });
  };

  const handleJoin = async (name: string) => {
    const result = await Swal.fire({
      title: '그룹 참가 신청',
      text: `"${name}" 그룹에 참가를 신청하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '신청',
      cancelButtonText: '취소',
      confirmButtonColor: '#1258fc',
    });
    if (result.isConfirmed) {
      Swal.fire({ title: '참가 신청 완료!', text: '리더의 승인 후 가입됩니다.', icon: 'success', timer: 2000, showConfirmButton: false });
    }
  };

  const filteredMy = myGroups.filter(g => g.name.includes(search));
  const filteredPublic = publicGroups.filter(g => g.name.includes(search));

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">

          {/* 배너 */}
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#1258fc,#3a74ef)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">스터디 그룹 👥</h2>
                <div className="flex gap-2 flex-wrap">
                  {[['내 그룹', myGroups.length + '개'], ['공개 그룹', publicGroups.length + '개'], ['리더', '1개']].map(([l, v], i) => (
                    <span key={i} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">{l} {v}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">+ 그룹 만들기</button>
                <button onClick={() => handleJoin('그룹')} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">그룹 참가</button>
              </div>
            </div>
          </div>

          {/* 탭 + 검색 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button onClick={() => setTab('my')}
                className={`px-6 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === 'my' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'}`}>
                내 그룹 <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-xs" style={tab === 'my' ? { background: '#dce6fd', color: '#1258fc' } : { background: '#f1f5f9', color: '#64748b' }}>{myGroups.length}</span>
              </button>
              <button onClick={() => setTab('public')}
                className={`px-6 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === 'public' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'}`}>
                공개 그룹 <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-xs" style={tab === 'public' ? { background: '#dce6fd', color: '#1258fc' } : { background: '#f1f5f9', color: '#64748b' }}>{publicGroups.length}</span>
              </button>
            </div>
            <div className="p-4">
              <div className="relative max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="그룹 검색..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* 그룹 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(tab === 'my' ? filteredMy : filteredPublic).map((g: any) => (
              <div key={g.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: g.color }}>
                    {g.name[0]}
                  </div>
                  {tab === 'my'
                    ? <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: g.role === '리더' ? '#dce6fd' : '#f1f5f9', color: g.role === '리더' ? '#1258fc' : '#64748b' }}>{g.role}</span>
                    : !g.isPublic && <span className="text-xs px-2 py-0.5 rounded-lg font-semibold bg-slate-100 text-slate-500">비공개</span>
                  }
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{g.name}</h4>
                <p className="text-xs text-slate-400 mb-3">멤버 {g.memberCount}/{g.maxMembers}명</p>
                {tab === 'public' && (g as any).tags && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {(g as any).tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 rounded-full" style={{ width: `${g.attendanceRate}%`, background: g.color }} />
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">출석 {g.attendanceRate}%</span>
                </div>
                {tab === 'my'
                  ? <a href={`/groups/${g.id}`} className="block text-center text-sm font-semibold py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">입장하기</a>
                  : <button onClick={() => handleJoin(g.name)} className="w-full text-sm font-semibold py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">참가 신청</button>
                }
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
