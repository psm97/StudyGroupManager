'use client';

import { useState, useMemo } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import Swal from 'sweetalert2';

const groupTabs = [
  { id: 1, name: 'Web Developer Study' },
  { id: 2, name: 'Python 스터디' },
  { id: 3, name: 'CS 알고리즘' },
];

const sessionInfo = { date: '2026-06-18', topic: 'React Hooks 심화', location: '온라인 (Zoom)' };

const initialMembers = [
  { id: 1, name: '김민수', role: '리더', attendanceRate: 92, avatar: 'K', color: '#1258fc' },
  { id: 2, name: '이지연', role: '멤버', attendanceRate: 87, avatar: 'L', color: '#10b981' },
  { id: 3, name: '박철수', role: '멤버', attendanceRate: 79, avatar: 'P', color: '#f59e0b' },
  { id: 4, name: '최수아', role: '멤버', attendanceRate: 95, avatar: 'C', color: '#8b5cf6' },
  { id: 5, name: '정도현', role: '멤버', attendanceRate: 83, avatar: 'J', color: '#ec4899' },
  { id: 6, name: '한예진', role: '멤버', attendanceRate: 71, avatar: 'H', color: '#f97316' },
];

type AttStatus = 'present' | 'late' | 'absent' | null;
type StatusFilter = 'all' | 'present' | 'late' | 'absent' | 'unset';

const rateColor = (r: number) => r >= 90 ? '#16a34a' : r >= 75 ? '#d97706' : '#dc2626';

export default function AttendanceCheckPage() {
  const [selectedGroupId, setSelectedGroupId] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [statuses, setStatuses] = useState<Record<number, AttStatus>>({});
  const [penaltyRules, setPenaltyRules] = useState({ absent: 10000, late: 3000 });

  const setStatus = (id: number, s: AttStatus) => setStatuses(prev => ({ ...prev, [id]: prev[id] === s ? null : s }));

  const counts = useMemo(() => ({
    present: initialMembers.filter(m => statuses[m.id] === 'present').length,
    late: initialMembers.filter(m => statuses[m.id] === 'late').length,
    absent: initialMembers.filter(m => statuses[m.id] === 'absent').length,
    unset: initialMembers.filter(m => !statuses[m.id]).length,
  }), [statuses]);

  const totalPenalty = counts.absent * penaltyRules.absent + counts.late * penaltyRules.late;
  const progress = Math.round(((initialMembers.length - counts.unset) / initialMembers.length) * 100);

  const filteredMembers = initialMembers.filter(m => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'unset') return !statuses[m.id];
    return statuses[m.id] === statusFilter;
  });

  const bulkSet = async (s: AttStatus, label: string) => {
    const result = await Swal.fire({ title: `전체 ${label}으로 설정하시겠습니까?`, icon: 'question', showCancelButton: true, confirmButtonText: '확인', cancelButtonText: '취소', confirmButtonColor: '#1258fc' });
    if (result.isConfirmed) {
      const newStatuses: Record<number, AttStatus> = {};
      initialMembers.forEach(m => { newStatuses[m.id] = s; });
      setStatuses(newStatuses);
    }
  };

  const handleEditRules = async () => {
    const result = await Swal.fire({
      title: '벌금 규칙 변경',
      html: `<label style="display:block;text-align:left;font-size:13px;font-weight:600;margin-bottom:4px;color:#64748b">결석 벌금 (원)</label>
             <input id="swal-absent" class="swal2-input" type="number" value="${penaltyRules.absent}" style="margin-top:0">
             <label style="display:block;text-align:left;font-size:13px;font-weight:600;margin-bottom:4px;color:#64748b;margin-top:12px">지각 벌금 (원)</label>
             <input id="swal-late" class="swal2-input" type="number" value="${penaltyRules.late}" style="margin-top:0">`,
      confirmButtonText: '저장',
      cancelButtonText: '취소',
      showCancelButton: true,
      confirmButtonColor: '#1258fc',
      preConfirm: () => ({
        absent: parseInt((document.getElementById('swal-absent') as HTMLInputElement)?.value) || 0,
        late: parseInt((document.getElementById('swal-late') as HTMLInputElement)?.value) || 0,
      }),
    });
    if (result.isConfirmed) setPenaltyRules(result.value);
  };

  const handleSave = async () => {
    if (counts.unset > 0) {
      const confirm = await Swal.fire({ title: '미설정 멤버가 있습니다', text: `${counts.unset}명의 출석이 설정되지 않았습니다. 계속 저장하시겠습니까?`, icon: 'warning', showCancelButton: true, confirmButtonText: '저장', cancelButtonText: '취소', confirmButtonColor: '#d97706' });
      if (!confirm.isConfirmed) return;
    }
    const result = await Swal.fire({
      title: '출석을 저장하시겠습니까?',
      html: `<div style="text-align:left;padding:8px 0;font-size:14px">
        <p style="font-weight:600;color:#334155">📅 ${sessionInfo.date} · ${sessionInfo.topic}</p>
        <div style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap">
          <span style="padding:4px 10px;background:#dcfce7;color:#16a34a;border-radius:8px;font-weight:600">출석 ${counts.present}명</span>
          <span style="padding:4px 10px;background:#fef3c7;color:#d97706;border-radius:8px;font-weight:600">지각 ${counts.late}명</span>
          <span style="padding:4px 10px;background:#fee2e2;color:#dc2626;border-radius:8px;font-weight:600">결석 ${counts.absent}명</span>
        </div>
        <p style="margin-top:12px;color:#dc2626;font-weight:600">예상 벌금: ₩${totalPenalty.toLocaleString()}</p>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '저장',
      cancelButtonText: '취소',
      confirmButtonColor: '#1258fc',
    });
    if (result.isConfirmed) Swal.fire({ title: '출석이 저장되었습니다!', icon: 'success', timer: 1800, showConfirmButton: false });
  };

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: `전체 ${initialMembers.length}` },
    { key: 'present', label: `출석 ${counts.present}` },
    { key: 'late', label: `지각 ${counts.late}` },
    { key: 'absent', label: `결석 ${counts.absent}` },
    { key: 'unset', label: `미설정 ${counts.unset}` },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 pb-24 space-y-5">

          {/* 세션 배너 */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#1258fc,#3a74ef)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold mb-1">출석 체크 ✅</h2>
                <p className="text-blue-100 text-sm">{sessionInfo.date} · {sessionInfo.topic} · {sessionInfo.location}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: '출석', value: counts.present, bg: 'rgba(220,252,231,.25)', color: '#bbf7d0' },
                  { label: '지각', value: counts.late, bg: 'rgba(254,243,199,.25)', color: '#fde68a' },
                  { label: '결석', value: counts.absent, bg: 'rgba(254,226,226,.25)', color: '#fca5a5' },
                  { label: '출석률', value: `${counts.unset < initialMembers.length ? Math.round(((counts.present + counts.late * 0.5) / initialMembers.length) * 100) : 0}%`, bg: 'rgba(255,255,255,.2)', color: '#fff' },
                  { label: '예상벌금', value: `₩${totalPenalty.toLocaleString()}`, bg: 'rgba(254,226,226,.2)', color: '#fca5a5' },
                ].map((pill, i) => (
                  <div key={i} className="text-center px-3 py-1.5 rounded-xl" style={{ background: pill.bg }}>
                    <p className="text-xs opacity-75">{pill.label}</p>
                    <p className="text-sm font-bold" style={{ color: pill.color }}>{pill.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 그룹 탭 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {groupTabs.map(g => (
                <button key={g.id} onClick={() => { setSelectedGroupId(g.id); setStatusFilter('all'); }}
                  className={`px-5 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${selectedGroupId === g.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'}`}>
                  {g.name}
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-xs" style={selectedGroupId === g.id ? { background: '#dce6fd', color: '#1258fc' } : { background: '#f1f5f9', color: '#64748b' }}>{initialMembers.length}명</span>
                </button>
              ))}
            </div>

            {/* 일괄 처리 */}
            <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-slate-50">
              <span className="text-xs text-slate-400 mr-1">일괄 처리:</span>
              {[['전체 출석', 'present', '#16a34a', '#dcfce7'], ['전체 지각', 'late', '#d97706', '#fef3c7'], ['전체 결석', 'absent', '#dc2626', '#fee2e2']].map(([label, s, color, bg]) => (
                <button key={s} onClick={() => bulkSet(s as AttStatus, label.replace('전체 ', ''))}
                  className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                  style={{ background: bg, color: color }}>
                  {label}
                </button>
              ))}
              <button onClick={() => setStatuses({})} className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">초기화</button>
              <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                결석 ₩{penaltyRules.absent.toLocaleString()} / 지각 ₩{penaltyRules.late.toLocaleString()}
                <button onClick={handleEditRules} className="text-blue-500 hover:underline">변경</button>
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="px-5 py-3 flex gap-1 border-b border-slate-50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {filterTabs.map(ft => (
                <button key={ft.key} onClick={() => setStatusFilter(ft.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === ft.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {ft.label}
                </button>
              ))}
            </div>

            {/* 진행 바 */}
            <div className="px-5 py-2 border-b border-slate-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{initialMembers.length - counts.unset}/{initialMembers.length}명 입력 완료</span>
                <span className="text-xs font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>

            {/* 멤버 카드 */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMembers.map(m => {
                const st = statuses[m.id] || null;
                return (
                  <div key={m.id} className="border rounded-xl p-4 transition-all"
                    style={{ borderColor: st === 'present' ? '#86efac' : st === 'late' ? '#fde68a' : st === 'absent' ? '#fca5a5' : '#f1f5f9', borderLeftWidth: 3, background: '#fff' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: m.color }}>{m.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-slate-800">{m.name}</span>
                          {m.role === '리더' && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-semibold">리더</span>}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-12 h-1 bg-slate-100 rounded-full"><div className="h-1 rounded-full" style={{ width: `${m.attendanceRate}%`, background: rateColor(m.attendanceRate) }} /></div>
                          <span className="text-xs text-slate-400">{m.attendanceRate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {([['present', '출석', '#16a34a', '#dcfce7'], ['late', '지각', '#d97706', '#fef3c7'], ['absent', '결석', '#dc2626', '#fee2e2']] as const).map(([s, label, color, bg]) => (
                        <button key={s} onClick={() => setStatus(m.id, s)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: st === s ? bg : '#f8fafc', color: st === s ? color : '#94a3b8', border: `1px solid ${st === s ? color + '50' : '#e2e8f0'}` }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </main>

        {/* 하단 저장 바 */}
        <div className="fixed bottom-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between shadow-lg" style={{ left: '260px' }}>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-semibold">출석 {counts.present}명</span>
            <span className="text-amber-600 font-semibold">지각 {counts.late}명</span>
            <span className="text-red-500 font-semibold">결석 {counts.absent}명</span>
            <span className="text-slate-500">예상벌금 <strong className="text-red-500">₩{totalPenalty.toLocaleString()}</strong></span>
          </div>
          <div className="flex gap-2">
            <button className="border border-slate-200 text-slate-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">취소</button>
            <button onClick={handleSave} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors">저장</button>
          </div>
        </div>

      </div>
    </div>
  );
}
