'use client';

import { useState, useEffect, useCallback } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface Group {
  id: number;
  name: string;
  color: string;
  memberCount: number;
}

interface MemberStat {
  userId: string;
  nickname: string;
  isLeader: boolean;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  totalSessions: number;
  attendanceRate: number;
}

interface SessionRecord {
  date: string;
  topic: string;
  attendanceRate: number;
  records: Record<string, string>;
}

interface Summary {
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  groupAvgRate: number;
}

const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Python 알고리즘', color: '#7c3aed', memberCount: 5 },
  { id: 2, name: 'Web Developer Study', color: '#0077ff', memberCount: 6 },
  { id: 3, name: '토익 900점', color: '#059669', memberCount: 4 },
];

const MOCK_MEMBER_STATS: MemberStat[] = [
  { userId: '1', nickname: '김철수', isLeader: true,  presentCount: 18, lateCount: 2, absentCount: 0, totalSessions: 20, attendanceRate: 90 },
  { userId: '2', nickname: '이영희', isLeader: false, presentCount: 15, lateCount: 3, absentCount: 2, totalSessions: 20, attendanceRate: 75 },
  { userId: '3', nickname: '박민준', isLeader: false, presentCount: 10, lateCount: 4, absentCount: 6, totalSessions: 20, attendanceRate: 50 },
  { userId: '4', nickname: '최지아', isLeader: false, presentCount: 19, lateCount: 1, absentCount: 0, totalSessions: 20, attendanceRate: 95 },
];

const MOCK_SESSIONS: SessionRecord[] = [
  { date: '2025.06.10', topic: '정렬 알고리즘', attendanceRate: 90, records: { '1': 'present', '2': 'present', '3': 'absent',  '4': 'present' } },
  { date: '2025.06.03', topic: 'DP 기초',       attendanceRate: 75, records: { '1': 'present', '2': 'late',    '3': 'present', '4': 'present' } },
  { date: '2025.05.27', topic: '그래프 탐색',   attendanceRate: 100,records: { '1': 'present', '2': 'present', '3': 'present', '4': 'present' } },
];

const MOCK_SUMMARY: Summary = { totalPresent: 62, totalLate: 10, totalAbsent: 8, groupAvgRate: 77.5 };

type FilterType = 'month' | '3month' | 'all' | 'custom';
type SortKey   = 'rate-desc' | 'rate-asc' | 'absent-desc' | 'name-asc';

export default function AttendanceStatsPage() {
  const [groups, setGroups]               = useState<Group[]>(MOCK_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [summary, setSummary]             = useState<Summary>(MOCK_SUMMARY);
  const [memberStats, setMemberStats]     = useState<MemberStat[]>([]);
  const [sessions, setSessions]           = useState<SessionRecord[]>([]);
  const [filter, setFilter]               = useState<FilterType>('month');
  const [sortKey, setSortKey]             = useState<SortKey>('rate-desc');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [showCustom, setShowCustom]       = useState(false);
  const [loading, setLoading]             = useState(false);

  /* 가입 그룹 목록 로드 */
  useEffect(() => {
    fetch('/groups/api/my-groups/', {credentials:'include'})
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const arr = data?.groups ?? [];
        if (!arr.length) return;
        const gs = arr.map((g: { id: number; name: string; color: string; member_count: number }) => ({ id: g.id, name: g.name, color: g.color || '#0077ff', memberCount: g.member_count }));
        setGroups(gs);
        if (gs.length > 0) setSelectedGroupId(gs[0].id);
      })
      .catch(() => {});
  }, []);

  /* 그룹 통계 로드 */
  const fetchStats = useCallback(async (groupId: number, f: FilterType, from?: string, to?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter: f });
      if (from) params.set('from', from);
      if (to)   params.set('to', to);
      const res = await fetch(`/groups/${groupId}/attendance/stats/api/?${params}`, {credentials:'include'});
      if (!res.ok) throw new Error();
      const d = await res.json();
      setSummary({ totalPresent: d.total_present, totalLate: d.total_late, totalAbsent: d.total_absent, groupAvgRate: d.group_avg_rate });
      setMemberStats(d.member_stats?.map((s: Record<string, unknown>) => ({
        userId:        String(s.user_id),
        nickname:      String(s.nickname),
        isLeader:      Boolean(s.is_leader),
        presentCount:  Number(s.present_count),
        lateCount:     Number(s.late_count),
        absentCount:   Number(s.absent_count),
        totalSessions: Number(s.total_sessions),
        attendanceRate:Number(s.attendance_rate),
      })) || MOCK_MEMBER_STATS);
      setSessions(d.sessions || MOCK_SESSIONS);
    } catch {
      setSummary(MOCK_SUMMARY);
      setMemberStats(MOCK_MEMBER_STATS);
      setSessions(MOCK_SESSIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId !== null) fetchStats(selectedGroupId, 'month');
  }, [selectedGroupId, fetchStats]);

  const handleSelectGroup = (id: number) => {
    if (id === selectedGroupId) return;
    setSelectedGroupId(id);
    setFilter('month');
    setShowCustom(false);
  };

  const handleSetFilter = (f: FilterType) => {
    setFilter(f);
    if (f === 'custom') { setShowCustom(true); return; }
    setShowCustom(false);
    if (selectedGroupId) fetchStats(selectedGroupId, f);
  };

  const applyCustomFilter = () => {
    if (!dateFrom || !dateTo) { alert('시작일과 종료일을 모두 선택해 주세요.'); return; }
    if (dateFrom > dateTo)    { alert('시작일은 종료일보다 이전이어야 합니다.'); return; }
    if (selectedGroupId) fetchStats(selectedGroupId, 'custom', dateFrom, dateTo);
  };

  const sortedStats = [...memberStats].sort((a, b) => {
    if (sortKey === 'rate-desc')   return b.attendanceRate - a.attendanceRate;
    if (sortKey === 'rate-asc')    return a.attendanceRate - b.attendanceRate;
    if (sortKey === 'absent-desc') return b.absentCount   - a.absentCount;
    if (sortKey === 'name-asc')    return a.nickname.localeCompare(b.nickname, 'ko');
    return 0;
  });

  const medal        = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
  const rateColor    = (r: number) => r >= 80 ? 'text-green-600' : r >= 50 ? 'text-amber-600' : 'text-red-600';
  const rateBarColor = (r: number) => r >= 80 ? 'bg-green-400'  : r >= 50 ? 'bg-amber-400'  : 'bg-red-400';
  const cellStyle    = (s: string) => s === 'present' ? 'cell-present' : s === 'late' ? 'cell-late' : s === 'absent' ? 'cell-absent' : 'cell-none';
  const cellSym      = (s: string) => s === 'present' ? '✓' : s === 'late' ? '△' : s === 'absent' ? '✗' : '—';

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <>
      <style>{`
        .filter-tab { transition: all 0.18s ease; }
        .filter-tab.active { background: #0077ff; color: #fff; box-shadow: 0 2px 8px rgba(16,85,232,0.3); }
        .rate-bar  { height: 7px; border-radius: 99px; background: #e2e8f0; overflow: hidden; min-width: 60px; }
        .rate-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .cell-present { background: #dcfce7; color: #16a34a; }
        .cell-late    { background: #fef9c3; color: #b45309; }
        .cell-absent  { background: #fee2e2; color: #dc2626; }
        .cell-none    { background: #f8fafc; color: #cbd5e1; }
        .summary-card { border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .sticky-head th { position: sticky; top: 0; z-index: 10; background: #f8fafc; }
        .group-card { min-width:160px; cursor:pointer; border-radius:16px; padding:16px; border:2px solid #f1f5f9;
          background:#fff; transition:all 0.18s ease; flex-shrink:0; }
        .group-card:hover { border-color:#93aeee; transform:translateY(-2px); box-shadow:0 6px 20px rgba(16,85,232,.1); }
        .group-card.selected { border-color:#0077ff; box-shadow:0 0 0 3px rgba(18,88,252,.1); }
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
          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6 space-y-5">

            {/* 배너 */}
            <div className="rounded-2xl p-5 sm:p-6 text-white" style={{ background: 'linear-gradient(135deg,#0d44c4 0%,#0077ff 50%,#3a74ef 100%)' }}>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <span className="inline-block text-xs font-semibold bg-white/20 rounded-full px-3 py-1 mb-2">출석 관리</span>
                  <h1 className="text-2xl sm:text-3xl font-bold">출석 현황</h1>
                  <p className="text-white/70 text-sm mt-1">가입한 스터디 그룹별 멤버 출석 통계</p>
                </div>
                {selectedGroup && (
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]">
                      <p className="text-lg font-bold">{memberStats.length}</p>
                      <p className="text-xs opacity-70 mt-0.5">멤버</p>
                    </div>
                    <div className="bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]">
                      <p className="text-lg font-bold text-green-300">{summary.groupAvgRate.toFixed(1)}%</p>
                      <p className="text-xs opacity-70 mt-0.5">평균 출석률</p>
                    </div>
                    <div className="bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]">
                      <p className="text-lg font-bold text-red-300">{summary.totalAbsent}</p>
                      <p className="text-xs opacity-70 mt-0.5">누적 결석</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 그룹 선택 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: '#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                내 스터디 그룹
                <span className="text-xs font-normal text-slate-400 ml-1">({groups.length}개)</span>
              </h2>
              {groups.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">가입한 스터디 그룹이 없습니다.</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {groups.map(g => (
                    <div key={g.id}
                      className={`group-card ${selectedGroupId === g.id ? 'selected' : ''}`}
                      onClick={() => handleSelectGroup(g.id)}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base mb-3 flex-shrink-0"
                        style={{ background: g.color }}>
                        {g.name[0]}
                      </div>
                      <p className="font-semibold text-slate-800 text-sm leading-snug mb-1 line-clamp-2">{g.name}</p>
                      <p className="text-xs text-slate-400">멤버 {g.memberCount}명</p>
                      {selectedGroupId === g.id && (
                        <div className="mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block" style={{ background: '#dce6fd', color: '#0077ff' }}>
                          선택됨
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 로딩 */}
            {loading && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">출석 데이터를 불러오는 중...</p>
                </div>
              </div>
            )}

            {/* 선택된 그룹 통계 */}
            {!loading && selectedGroup && (
              <>
                {/* 선택 그룹 헤더 */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: selectedGroup.color }}>
                    {selectedGroup.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{selectedGroup.name}</p>
                    <p className="text-xs text-slate-400">멤버 {selectedGroup.memberCount}명 · 총 {sessions.length}개 세션</p>
                  </div>
                </div>

                {/* 기간 필터 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 mr-1">기간</span>
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                      {(['month', '3month', 'all', 'custom'] as FilterType[]).map(f => (
                        <button key={f} onClick={() => handleSetFilter(f)}
                          className={`filter-tab text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 ${filter === f ? 'active' : ''}`}>
                          {f === 'month' ? '이번 달' : f === '3month' ? '3개월' : f === 'all' ? '전체' : '직접'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {showCustom && (
                      <div className="flex items-center gap-2">
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400" />
                        <span className="text-slate-400 text-xs">~</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400" />
                        <button onClick={applyCustomFilter}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          적용
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 요약 카드 4개 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: '총 출석', value: summary.totalPresent, color: 'text-green-700', bg: 'bg-green-100', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/> },
                    { label: '총 지각', value: summary.totalLate,    color: 'text-amber-700', bg: 'bg-amber-100', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/> },
                    { label: '총 결석', value: summary.totalAbsent,  color: 'text-red-700',   bg: 'bg-red-100',   icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> },
                    { label: '평균 출석률', value: `${summary.groupAvgRate.toFixed(1)}%`, color: 'text-blue-700', bg: 'bg-blue-100', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/> },
                  ].map((card, idx) => (
                    <div key={card.label} className="summary-card bg-white border border-slate-100 shadow-sm fade-up" style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-slate-400 font-medium mb-1">{card.label}</p>
                          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bg}`}>
                          <svg className={`w-5 h-5 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 멤버별 출석률 테이블 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden fade-up" style={{ animationDelay: '280ms' }}>
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <svg className="w-4 h-4" style={{ color: '#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      멤버별 출석 현황
                    </h2>
                    <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-slate-600">
                      <option value="rate-desc">출석률 높은 순</option>
                      <option value="rate-asc">출석률 낮은 순</option>
                      <option value="absent-desc">결석 많은 순</option>
                      <option value="name-asc">이름 순</option>
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky-head">
                        <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                          <th className="text-center px-4 py-3 w-10">순위</th>
                          <th className="text-left px-4 py-3">멤버</th>
                          <th className="text-center px-4 py-3">출석</th>
                          <th className="text-center px-4 py-3">지각</th>
                          <th className="text-center px-4 py-3">결석</th>
                          <th className="text-center px-4 py-3">총 세션</th>
                          <th className="text-right px-4 py-3 min-w-[140px]">출석률</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {sortedStats.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">출석 데이터가 없습니다.</td></tr>
                        ) : sortedStats.map((s, i) => (
                          <tr key={s.userId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-center">
                              {i < 3
                                ? <span className="text-base">{medal(i)}</span>
                                : <span className="text-slate-400 text-xs font-medium">{i + 1}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                  style={{ background: selectedGroup.color }}>
                                  {s.nickname[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm">{s.nickname}</p>
                                  {s.isLeader && <span className="text-xs text-amber-500 font-medium">👑 리더</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center"><span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{s.presentCount}</span></td>
                            <td className="px-4 py-3 text-center"><span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{s.lateCount}</span></td>
                            <td className="px-4 py-3 text-center"><span className="text-xs font-bold text-red-700   bg-red-50   px-2 py-0.5 rounded-full">{s.absentCount}</span></td>
                            <td className="px-4 py-3 text-center text-slate-500 text-xs">{s.totalSessions}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2.5">
                                <div className="rate-bar flex-1 max-w-[80px]">
                                  <div className={`rate-fill ${rateBarColor(s.attendanceRate)}`} style={{ width: `${s.attendanceRate}%` }} />
                                </div>
                                <span className={`text-sm font-bold w-12 text-right ${rateColor(s.attendanceRate)}`}>
                                  {s.attendanceRate.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 세션별 출석 현황 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden fade-up" style={{ animationDelay: '360ms' }}>
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <svg className="w-4 h-4" style={{ color: '#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      세션별 출석 현황
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-present inline-block" />출석</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-late    inline-block" />지각</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-absent  inline-block" />결석</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-none    inline-block" />미입력</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky-head">
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                          <th className="text-left px-4 py-3 min-w-[120px]">날짜</th>
                          <th className="text-left px-4 py-3 min-w-[140px]">주제</th>
                          {sortedStats.map(s => (
                            <th key={s.userId} className="text-center px-3 py-3 min-w-[64px] font-medium">
                              {s.nickname.slice(0, 4)}
                            </th>
                          ))}
                          <th className="text-center px-4 py-3 min-w-[80px]">출석률</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {sessions.length === 0 ? (
                          <tr><td colSpan={20} className="text-center py-12 text-slate-400 text-sm">세션 데이터가 없습니다.</td></tr>
                        ) : sessions.map(sess => (
                          <tr key={sess.date + sess.topic} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{sess.date}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ background: `${selectedGroup.color}20`, color: selectedGroup.color }}>
                                {sess.topic}
                              </span>
                            </td>
                            {sortedStats.map(s => {
                              const r = sess.records[s.userId] || '';
                              return (
                                <td key={s.userId} className="px-3 py-3 text-center">
                                  <span className={`inline-flex items-center justify-center w-8 h-7 rounded-lg text-xs font-bold ${cellStyle(r)}`}>
                                    {cellSym(r)}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold ${rateColor(sess.attendanceRate)}`}>{sess.attendanceRate}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* 그룹 없음 안내 */}
            {groups.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16 px-6">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-100">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <p className="font-bold text-slate-600 mb-1">가입한 스터디 그룹이 없습니다</p>
                <p className="text-sm text-slate-400">그룹에 가입하면 출석 현황이 이곳에 표시됩니다.</p>
              </div>
            )}

          </div>
          </main>
        </div>
      </div>
    </>
  );
}
