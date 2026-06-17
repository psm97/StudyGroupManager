'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

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

const MOCK_MEMBER_STATS: MemberStat[] = [
  { userId: '1', nickname: '김철수', isLeader: true, presentCount: 18, lateCount: 2, absentCount: 0, totalSessions: 20, attendanceRate: 90 },
  { userId: '2', nickname: '이영희', isLeader: false, presentCount: 15, lateCount: 3, absentCount: 2, totalSessions: 20, attendanceRate: 75 },
  { userId: '3', nickname: '박민준', isLeader: false, presentCount: 10, lateCount: 4, absentCount: 6, totalSessions: 20, attendanceRate: 50 },
  { userId: '4', nickname: '최지아', isLeader: false, presentCount: 19, lateCount: 1, absentCount: 0, totalSessions: 20, attendanceRate: 95 },
];

const MOCK_SESSIONS: SessionRecord[] = [
  { date: '2025.06.10', topic: '정렬 알고리즘', attendanceRate: 90, records: { '1': 'present', '2': 'present', '3': 'absent', '4': 'present' } },
  { date: '2025.06.03', topic: 'DP 기초', attendanceRate: 75, records: { '1': 'present', '2': 'late', '3': 'present', '4': 'present' } },
  { date: '2025.05.27', topic: '그래프 탐색', attendanceRate: 100, records: { '1': 'present', '2': 'present', '3': 'present', '4': 'present' } },
];

const MOCK_SUMMARY: Summary = { totalPresent: 62, totalLate: 10, totalAbsent: 8, groupAvgRate: 77.5 };

type FilterType = 'month' | '3month' | 'all' | 'custom';
type SortKey = 'rate-desc' | 'rate-asc' | 'absent-desc' | 'name-asc';

export default function AttendanceStatsPage() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id') || '0';

  const [summary, setSummary] = useState<Summary>(MOCK_SUMMARY);
  const [memberStats, setMemberStats] = useState<MemberStat[]>(MOCK_MEMBER_STATS);
  const [sessions] = useState<SessionRecord[]>(MOCK_SESSIONS);
  const [filter, setFilter] = useState<FilterType>('month');
  const [sortKey, setSortKey] = useState<SortKey>('rate-desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const fetchData = useCallback(async (f: FilterType, from?: string, to?: string) => {
    try {
      const params = new URLSearchParams({ filter: f });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/groups/${groupId}/attendance/stats/api/?${params}`);
      const d = await res.json();
      setSummary({ totalPresent: d.total_present, totalLate: d.total_late, totalAbsent: d.total_absent, groupAvgRate: d.group_avg_rate });
      setMemberStats(d.member_stats?.map((s: Record<string, number | string>) => ({
        userId: String(s.user_id),
        nickname: String(s.nickname),
        isLeader: Boolean(s.is_leader),
        presentCount: Number(s.present_count),
        lateCount: Number(s.late_count),
        absentCount: Number(s.absent_count),
        totalSessions: Number(s.total_sessions),
        attendanceRate: Number(s.attendance_rate),
      })) || MOCK_MEMBER_STATS);
    } catch {
      // use mock data
    }
  }, [groupId]);

  useEffect(() => { fetchData('month'); }, [fetchData]);

  const handleSetFilter = (f: FilterType) => {
    setFilter(f);
    if (f === 'custom') { setShowCustom(true); return; }
    setShowCustom(false);
    fetchData(f);
  };

  const applyCustomFilter = () => {
    if (!dateFrom || !dateTo) { alert('시작일과 종료일을 모두 선택해 주세요.'); return; }
    if (dateFrom > dateTo) { alert('시작일은 종료일보다 이전이어야 합니다.'); return; }
    fetchData('custom', dateFrom, dateTo);
  };

  const sortedStats = [...memberStats].sort((a, b) => {
    if (sortKey === 'rate-desc') return b.attendanceRate - a.attendanceRate;
    if (sortKey === 'rate-asc') return a.attendanceRate - b.attendanceRate;
    if (sortKey === 'absent-desc') return b.absentCount - a.absentCount;
    if (sortKey === 'name-asc') return a.nickname.localeCompare(b.nickname, 'ko');
    return 0;
  });

  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
  const rateColor = (r: number) => r >= 80 ? 'text-green-600' : r >= 50 ? 'text-amber-600' : 'text-red-600';
  const rateBarColor = (r: number) => r >= 80 ? 'bg-green-400' : r >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const cellStyle = (status: string) => status === 'present' ? 'cell-present' : status === 'late' ? 'cell-late' : status === 'absent' ? 'cell-absent' : 'cell-none';
  const cellSym = (status: string) => status === 'present' ? '✓' : status === 'late' ? '△' : status === 'absent' ? '✗' : '—';

  const filterLabel = filter === 'month' ? '이번 달' : filter === '3month' ? '3개월' : filter === 'all' ? '전체' : '직접 설정';

  const downloadCSV = (type: 'member' | 'session' | 'all') => {
    if (type === 'member' || type === 'all') {
      const lines = [['순위', '멤버', '출석', '지각', '결석', '총 세션', '출석률']];
      sortedStats.forEach((s, i) => lines.push([String(i + 1), s.nickname, String(s.presentCount), String(s.lateCount), String(s.absentCount), String(s.totalSessions), `${s.attendanceRate.toFixed(1)}%`]));
      triggerCSV(lines, '멤버별_출석통계.csv');
    }
    if (type === 'session' || type === 'all') {
      const headers = ['날짜', '세션 주제', ...sortedStats.map(s => s.nickname), '출석률'];
      const lines = [headers];
      sessions.forEach(sess => {
        const cells = sortedStats.map(s => cellSym(sess.records[s.userId] || ''));
        lines.push([sess.date, sess.topic, ...cells, `${sess.attendanceRate}%`]);
      });
      triggerCSV(lines, '세션별_출석현황.csv');
    }
    alert('CSV 파일이 다운로드됩니다.');
  };

  const triggerCSV = (rows: string[][], filename: string) => {
    const BOM = '﻿';
    const csv = BOM + rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        .filter-tab { transition: all 0.18s ease; }
        .filter-tab.active { background: #1258fc; color: #fff; box-shadow: 0 2px 8px rgba(16,85,232,0.3); }
        .rate-bar { height: 7px; border-radius: 99px; background: #e2e8f0; overflow: hidden; min-width: 60px; }
        .rate-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        .cell-present { background: #dcfce7; color: #16a34a; }
        .cell-late    { background: #fef9c3; color: #b45309; }
        .cell-absent  { background: #fee2e2; color: #dc2626; }
        .cell-none    { background: #f8fafc; color: #cbd5e1; }
        .summary-card { border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .sticky-head th { position: sticky; top: 0; z-index: 10; background: #f8fafc; }
      `}</style>

      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6 space-y-5">

        {/* 배너 */}
        <div className="rounded-2xl p-5 sm:p-6 text-white" style={{ background: 'linear-gradient(135deg,#0d44c4 0%,#1258fc 50%,#3a74ef 100%)' }}>
          <nav className="text-xs mb-3 opacity-80 flex items-center gap-1.5 flex-wrap">
            <span className="hover:underline cursor-pointer">홈</span><span>/</span>
            <span className="hover:underline cursor-pointer">그룹 목록</span><span>/</span>
            <span className="hover:underline cursor-pointer">그룹명</span><span>/</span>
            <span>출석 통계</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-semibold bg-white/20 rounded-full px-3 py-1 mb-2">스터디</span>
              <h1 className="text-2xl sm:text-3xl font-bold">출석 통계</h1>
              <p className="text-white/70 text-sm mt-1">그룹명 · 총 {sessions.length}개 세션</p>
            </div>
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
                <p className="text-lg font-bold text-amber-300">{summary.totalLate}</p>
                <p className="text-xs opacity-70 mt-0.5">누적 지각</p>
              </div>
              <div className="bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[72px]">
                <p className="text-lg font-bold text-red-300">{summary.totalAbsent}</p>
                <p className="text-xs opacity-70 mt-0.5">누적 결석</p>
              </div>
            </div>
          </div>
        </div>

        {/* 기간 필터 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">기간 필터</span>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['month', '3month', 'all', 'custom'] as FilterType[]).map(f => (
                <button key={f} onClick={() => handleSetFilter(f)}
                  className={`filter-tab text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 ${filter === f ? 'active' : ''}`}>
                  {f === 'month' ? '이번 달' : f === '3month' ? '3개월' : f === 'all' ? '전체 기간' : '직접 설정'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showCustom && (
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400" />
                <span className="text-slate-400 text-xs">~</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400" />
                <button onClick={applyCustomFilter} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">적용</button>
              </div>
            )}
            <button onClick={() => {
              const choice = prompt('내보낼 데이터:\n1 = 멤버별\n2 = 세션별\n3 = 전체', '1');
              if (choice === '1') downloadCSV('member');
              else if (choice === '2') downloadCSV('session');
              else if (choice === '3') downloadCSV('all');
            }} className="flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              CSV 내보내기
            </button>
          </div>
        </div>

        {/* 요약 카드 4개 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="summary-card bg-white border border-slate-100 shadow-sm fade-up">
            <div className="flex items-start justify-between">
              <div><p className="text-xs text-slate-400 font-medium mb-1">총 출석 횟수</p><p className="text-2xl font-bold text-slate-800">{summary.totalPresent}</p><p className="text-xs text-slate-400 mt-1">전체 기록 중</p></div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
            </div>
          </div>
          <div className="summary-card bg-white border border-slate-100 shadow-sm fade-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-start justify-between">
              <div><p className="text-xs text-slate-400 font-medium mb-1">총 지각 횟수</p><p className="text-2xl font-bold text-amber-600">{summary.totalLate}</p><p className="text-xs text-slate-400 mt-1">누적 합산</p></div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
          </div>
          <div className="summary-card bg-white border border-slate-100 shadow-sm fade-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-start justify-between">
              <div><p className="text-xs text-slate-400 font-medium mb-1">총 결석 횟수</p><p className="text-2xl font-bold text-red-600">{summary.totalAbsent}</p><p className="text-xs text-slate-400 mt-1">누적 합산</p></div>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </div>
            </div>
          </div>
          <div className="summary-card bg-white border border-slate-100 shadow-sm fade-up" style={{ animationDelay: '240ms' }}>
            <div className="flex items-start justify-between">
              <div><p className="text-xs text-slate-400 font-medium mb-1">그룹 평균 출석률</p><p className="text-2xl font-bold" style={{ color: '#1258fc' }}>{summary.groupAvgRate.toFixed(1)}%</p><p className="text-xs text-slate-400 mt-1">전 세션 기준</p></div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" style={{ color: '#1258fc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* 월별 추이 차트 (TODO: Chart.js 통합) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 fade-up" style={{ animationDelay: '300ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: '#1258fc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                월별 출석률 추이
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">그룹 전체 월별 평균 출석률 변화</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-600 inline-block rounded" />출석률</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400 inline-block rounded" />지각률</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" />결석률</span>
            </div>
          </div>
          {/* TODO: CDN 스크립트 → npm 패키지로 교체 필요 (Chart.js monthly-chart) */}
          <div className="relative h-64 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-sm border border-slate-100">
            월별 출석률 라인 차트 (Chart.js 통합 필요)
          </div>
        </div>

        {/* 멤버별 출석률 테이블 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden fade-up" style={{ animationDelay: '360ms' }}>
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: '#1258fc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              멤버별 출석 현황
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">정렬:</span>
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-slate-600">
                <option value="rate-desc">출석률 높은 순</option>
                <option value="rate-asc">출석률 낮은 순</option>
                <option value="absent-desc">결석 많은 순</option>
                <option value="name-asc">이름 순</option>
              </select>
            </div>
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
                      {i < 3 ? <span className="text-base">{medal(i)}</span> : <span className="text-slate-400 text-xs font-medium">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>
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
                    <td className="px-4 py-3 text-center"><span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">{s.absentCount}</span></td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">{s.totalSessions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="rate-bar flex-1 max-w-[80px]"><div className={`rate-fill ${rateBarColor(s.attendanceRate)}`} style={{ width: `${s.attendanceRate}%` }} /></div>
                        <span className={`text-sm font-bold w-12 text-right ${rateColor(s.attendanceRate)}`}>{s.attendanceRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 세션별 출석 현황 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden fade-up" style={{ animationDelay: '420ms' }}>
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: '#1258fc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              세션별 출석 현황
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-present inline-block" />출석</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-late inline-block" />지각</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-absent inline-block" />결석</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cell-none inline-block" />미입력</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky-head">
                <tr className="text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left px-4 py-3 min-w-[120px]">날짜</th>
                  <th className="text-left px-4 py-3 min-w-[140px]">세션 주제</th>
                  {sortedStats.map(s => <th key={s.userId} className="text-center px-3 py-3 min-w-[72px] font-medium">{s.nickname.slice(0, 4)}</th>)}
                  <th className="text-center px-4 py-3 min-w-[80px]">출석률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.length === 0 ? (
                  <tr><td colSpan={20} className="text-center py-12 text-slate-400 text-sm">세션 데이터가 없습니다.</td></tr>
                ) : sessions.map(sess => (
                  <tr key={sess.date} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{sess.date}</td>
                    <td className="px-4 py-3"><span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{sess.topic}</span></td>
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

      </div>
    </>
  );
}
