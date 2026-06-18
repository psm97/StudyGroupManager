'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import GroupTabsCard, { DEFAULT_GROUP_TABS } from '@/components/GroupTabsCard';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface MemberSummary {
  userId: string;
  nickname: string;
  isLeader: boolean;
  unpaidAmount: number;
  paidAmount: number;
  paidRate: number;
}

interface PenaltyRecord {
  id: number;
  memberId: string;
  memberNickname: string;
  reason: string;
  date: string;
  amount: number;
  isPaid: boolean;
}

interface PenaltyRule {
  absentFee: number;
  lateFee: number;
}

const MOCK_MEMBER_SUMMARIES: MemberSummary[] = [
  { userId: '1', nickname: '김철수', isLeader: true, unpaidAmount: 0, paidAmount: 10000, paidRate: 100 },
  { userId: '2', nickname: '이영희', isLeader: false, unpaidAmount: 5000, paidAmount: 5000, paidRate: 50 },
  { userId: '3', nickname: '박민준', isLeader: false, unpaidAmount: 15000, paidAmount: 0, paidRate: 0 },
  { userId: '4', nickname: '최지아', isLeader: false, unpaidAmount: 2000, paidAmount: 8000, paidRate: 80 },
];

const MOCK_RECORDS: PenaltyRecord[] = [
  { id: 1, memberId: '2', memberNickname: '이영희', reason: '결석 벌금', date: '2025-06-10', amount: 5000, isPaid: false },
  { id: 2, memberId: '3', memberNickname: '박민준', reason: '결석 벌금', date: '2025-06-10', amount: 5000, isPaid: false },
  { id: 3, memberId: '3', memberNickname: '박민준', reason: '지각 벌금', date: '2025-06-03', amount: 2000, isPaid: false },
  { id: 4, memberId: '3', memberNickname: '박민준', reason: '결석 벌금', date: '2025-05-27', amount: 5000, isPaid: false },
  { id: 5, memberId: '3', memberNickname: '박민준', reason: '지각 벌금', date: '2025-05-20', amount: 3000, isPaid: false },
  { id: 6, memberId: '1', memberNickname: '김철수', reason: '결석 벌금', date: '2025-05-13', amount: 5000, isPaid: true },
  { id: 7, memberId: '1', memberNickname: '김철수', reason: '결석 벌금', date: '2025-05-06', amount: 5000, isPaid: true },
  { id: 8, memberId: '2', memberNickname: '이영희', reason: '지각 벌금', date: '2025-05-27', amount: 5000, isPaid: true },
  { id: 9, memberId: '4', memberNickname: '최지아', reason: '지각 벌금', date: '2025-06-03', amount: 2000, isPaid: false },
  { id: 10, memberId: '4', memberNickname: '최지아', reason: '결석 벌금', date: '2025-04-29', amount: 5000, isPaid: true },
];

const LEADER_GROUP_IDS = new Set([1]); // 현재 사용자가 리더인 그룹 ID

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function PenaltyPage() {
  const searchParams = useSearchParams();
  const initialGroupId = parseInt(searchParams.get('group_id') || '1') || 1;

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [records, setRecords] = useState<PenaltyRecord[]>(MOCK_RECORDS);
  const [penaltyRule, setPenaltyRule] = useState<PenaltyRule>({ absentFee: 5000, lateFee: 2000 });
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('date-desc');
  const [ruleModal, setRuleModal] = useState(false);
  const [newAbsentFee, setNewAbsentFee] = useState(String(penaltyRule.absentFee));
  const [newLateFee, setNewLateFee] = useState(String(penaltyRule.lateFee));
  const isLeader = LEADER_GROUP_IDS.has(selectedGroupId);
  const groupId = String(selectedGroupId);
  const selectedGroup = DEFAULT_GROUP_TABS.find(g => g.id === selectedGroupId) || DEFAULT_GROUP_TABS[0];

  const totalUnpaid = records.filter(r => !r.isPaid).reduce((s, r) => s + r.amount, 0);
  const totalPaid = records.filter(r => r.isPaid).reduce((s, r) => s + r.amount, 0);
  const totalPenalty = totalUnpaid + totalPaid;
  const unpaidCount = records.filter(r => !r.isPaid).length;
  const paidCount = records.filter(r => r.isPaid).length;
  const paidRate = totalPenalty > 0 ? Math.round((totalPaid / totalPenalty) * 100) : 0;

  const penaltyTrendData = useMemo(() => {
    const map = new Map<string, {발생: number; 납부: number; 미납: number}>();
    records.forEach(r => {
      const [y, m] = r.date.split('-');
      const key = `${y}-${m}`;
      if (!map.has(key)) map.set(key, {발생: 0, 납부: 0, 미납: 0});
      const entry = map.get(key)!;
      entry.발생 += r.amount;
      if (r.isPaid) entry.납부 += r.amount; else entry.미납 += r.amount;
    });
    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([k]) => { const [y, m] = k.split('-'); return `${y}.${m}`; }),
      datasets: [
        { label: '발생', data: sorted.map(([,v]) => v.발생), borderColor: '#94a3b8', backgroundColor: 'rgba(148,163,184,0.1)', tension: 0.4, pointRadius: 4 },
        { label: '납부', data: sorted.map(([,v]) => v.납부), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)',  tension: 0.4, pointRadius: 4 },
        { label: '미납', data: sorted.map(([,v]) => v.미납), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',   tension: 0.4, pointRadius: 4 },
      ],
    };
  }, [records]);

  const filteredRecords = records
    .filter(r => !unpaidOnly || !r.isPaid)
    .filter(r => !activeMemberId || r.memberId === activeMemberId)
    .sort((a, b) => {
      if (sortKey === 'date-desc') return b.date.localeCompare(a.date);
      if (sortKey === 'date-asc') return a.date.localeCompare(b.date);
      if (sortKey === 'amount-desc') return b.amount - a.amount;
      if (sortKey === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  const markPaid = async (id: number, nickname: string, amount: number) => {
    if (!confirm(`${nickname} 님의 벌금 ${amount.toLocaleString()}원을 납부 완료로 처리하시겠습니까?`)) return;
    try {
      await fetch(`/groups/${groupId}/penalty/${id}/pay/`, { method: 'POST' });
    } catch { /* ignore */ }
    setRecords(prev => prev.map(r => r.id === id ? { ...r, isPaid: true } : r));
  };

  const markAllPaid = async () => {
    const unpaidRows = filteredRecords.filter(r => !r.isPaid);
    if (!unpaidRows.length) { alert('미납 내역이 없습니다.'); return; }
    if (!confirm(`현재 표시된 미납 건수 ${unpaidRows.length}건을 모두 납부 처리하시겠습니까?`)) return;
    try {
      await fetch(`/groups/${groupId}/penalty/pay-all/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_ids: unpaidRows.map(r => r.id) }),
      });
    } catch { /* ignore */ }
    const ids = new Set(unpaidRows.map(r => r.id));
    setRecords(prev => prev.map(r => ids.has(r.id) ? { ...r, isPaid: true } : r));
    alert('완료');
  };

  const saveRule = async () => {
    const af = parseInt(newAbsentFee);
    const lf = parseInt(newLateFee);
    if (isNaN(af) || isNaN(lf) || af < 0 || lf < 0) { alert('0원 이상이어야 합니다.'); return; }
    try {
      await fetch(`/groups/${groupId}/penalty/rule/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ absent_fee: af, late_fee: lf }) });
    } catch { /* ignore */ }
    setPenaltyRule({ absentFee: af, lateFee: lf });
    setRuleModal(false);
    alert('규칙 저장 완료');
  };

  const filterByMember = (uid: string) => {
    if (activeMemberId === uid) setActiveMemberId(null);
    else setActiveMemberId(uid);
  };

  const memberSummaries = MOCK_MEMBER_SUMMARIES;

  const rateBarColor = (r: number) => r >= 80 ? 'bg-green-400' : r >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const paidRateColor = (r: number) => r >= 80 ? 'text-green-600' : r >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <>
      <style>{`
        .member-penalty-card { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
        .member-penalty-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(16,85,232,0.1); }
        .member-penalty-card.active-card { box-shadow: 0 0 0 2px #0077ff, 0 6px 20px rgba(16,85,232,0.15); }
        .badge-paid   { background: #dcfce7; color: #15803d; }
        .badge-unpaid { background: #fee2e2; color: #dc2626; }
        .rate-bar { height: 5px; border-radius: 99px; background: #f1f5f9; overflow: hidden; }
        .rate-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.38s ease forwards; }
        .sticky-head th { position: sticky; top: 0; z-index: 10; background: #f8fafc; }
        .toggle-track { width:40px;height:22px;background:#e2e8f0;border-radius:99px;position:relative;transition:background 0.2s ease;cursor:pointer; }
        .toggle-thumb { width:18px;height:18px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;box-shadow:0 1px 4px rgba(0,0,0,0.2);transition:left 0.2s ease; }
        .toggle-on .toggle-track { background:#ef4444; }
        .toggle-on .toggle-thumb { left:20px; }
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
          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6 space-y-5">

        {/* 배너 */}
        <div className="rounded-2xl p-5 sm:p-6 text-white" style={{ background: 'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)' }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">벌금 관리</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white/70 text-sm">{selectedGroup.name}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: isLeader ? 'rgba(253,230,138,0.25)' : 'rgba(255,255,255,0.15)', color: isLeader ? '#fde68a' : 'rgba(255,255,255,0.7)' }}>
                  {isLeader ? '👑 리더' : '멤버'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                <p className="text-lg font-bold text-red-200">{totalUnpaid.toLocaleString()}원</p>
                <p className="text-xs opacity-70 mt-0.5">총 미납</p>
              </div>
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                <p className="text-lg font-bold text-green-200">{totalPaid.toLocaleString()}원</p>
                <p className="text-xs opacity-70 mt-0.5">납부 완료</p>
              </div>
              <div className="border border-white/25 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                <p className="text-lg font-bold">{totalPenalty.toLocaleString()}원</p>
                <p className="text-xs opacity-70 mt-0.5">총 발생</p>
              </div>
              {isLeader ? (
                <button onClick={() => { setNewAbsentFee(String(penaltyRule.absentFee)); setNewLateFee(String(penaltyRule.lateFee)); setRuleModal(true); }}
                  className="flex items-center gap-2 border border-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:bg-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  결석 <strong>{penaltyRule.absentFee.toLocaleString()}원</strong> · 지각 <strong>{penaltyRule.lateFee.toLocaleString()}원</strong>
                </button>
              ) : (
                <div className="flex items-center gap-2 border border-white/20 text-white/80 text-sm px-4 py-2.5 rounded-xl">
                  결석 <strong>{penaltyRule.absentFee.toLocaleString()}원</strong> · 지각 <strong>{penaltyRule.lateFee.toLocaleString()}원</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 탭 + 컨텐츠 */}
        <GroupTabsCard
          activeGroupId={selectedGroupId}
          onSelect={group => {
            setSelectedGroupId(group.id);
            setActiveMemberId(null);
            setUnpaidOnly(false);
          }}
        />

        {/* 요약 카드 3개 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-up">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-8 translate-x-8 opacity-60" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">총 미납 금액</p>
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{totalUnpaid.toLocaleString()}원</p>
              <p className="text-xs text-slate-400 mt-1">{unpaidCount}건 미납</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-8 translate-x-8 opacity-60" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">납부 완료</p>
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{totalPaid.toLocaleString()}원</p>
              <p className="text-xs text-slate-400 mt-1">{paidCount}건 납부</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -translate-y-8 translate-x-8 opacity-60" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">총 벌금 발생</p>
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-700">{totalPenalty.toLocaleString()}원</p>
              <p className="text-xs text-slate-400 mt-1">납부율 <strong className={paidRateColor(paidRate)}>{paidRate}%</strong></p>
            </div>
          </div>
        </div>

        {/* 멤버별 카드 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-up" style={{ animationDelay: '80ms' }}>
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: '#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              멤버별 벌금 현황
            </h2>
            <span className="text-xs text-slate-400">카드 클릭 시 해당 멤버 내역 필터</span>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {memberSummaries.map(ms => (
                <div key={ms.userId}
                  className={`member-penalty-card bg-slate-50 rounded-xl p-3.5 border border-slate-100 ${activeMemberId === ms.userId ? 'active-card' : ''}`}
                  onClick={() => filterByMember(ms.userId)}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                      style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>
                      {ms.nickname[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{ms.nickname}</p>
                      {ms.isLeader && <p className="text-xs text-amber-500">👑 리더</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">미납</span><span className="font-bold text-red-600">{ms.unpaidAmount.toLocaleString()}원</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">납부</span><span className="font-semibold text-green-600">{ms.paidAmount.toLocaleString()}원</span></div>
                    <div className="rate-bar mt-2"><div className={`rate-fill ${rateBarColor(ms.paidRate)}`} style={{ width: `${ms.paidRate}%` }} /></div>
                    <p className="text-xs text-slate-400 text-right">납부율 {ms.paidRate}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 월별 추이 차트 (TODO) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 fade-up" style={{ animationDelay: '160ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: '#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                월별 벌금 추이
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">발생 / 납부 / 미납 금액 월별 추이</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-400 inline-block rounded" />발생</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-green-400 inline-block rounded" />납부</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" />미납</span>
            </div>
          </div>
          <div className="h-60">
            <Line
              data={penaltyTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                  tooltip: { mode: 'index', intersect: false, callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ₩${(ctx.parsed.y as number).toLocaleString()}` } },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                  y: { grid: { color: '#f1f5f9' }, beginAtZero: true, ticks: { font: { size: 11 }, callback: (v) => `₩${(v as number).toLocaleString()}` } },
                },
              }}
            />
          </div>
        </div>

        {/* 벌금 내역 테이블 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-up" style={{ animationDelay: '240ms' }}>
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: '#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              벌금 내역
              <span className="text-xs font-normal text-slate-400 ml-1">({filteredRecords.length}/{records.length}건)</span>
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {activeMemberId && (
                <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                  <span>{memberSummaries.find(m => m.userId === activeMemberId)?.nickname} 필터 중</span>
                  <button onClick={() => setActiveMemberId(null)} className="text-blue-400 hover:text-blue-600 ml-0.5">✕</button>
                </div>
              )}
              <div className={`flex items-center gap-2 cursor-pointer ${unpaidOnly ? 'toggle-on' : ''}`} onClick={() => setUnpaidOnly(v => !v)}>
                <div className="toggle-track"><div className="toggle-thumb" /></div>
                <span className="text-xs font-medium text-slate-600">미납만 보기</span>
              </div>
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-slate-600">
                <option value="date-desc">최신순</option>
                <option value="date-asc">오래된 순</option>
                <option value="amount-desc">금액 높은 순</option>
                <option value="amount-asc">금액 낮은 순</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky-head">
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-4 sm:px-5 py-3">멤버</th>
                  <th className="text-left px-4 py-3">사유</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">날짜</th>
                  <th className="text-right px-4 py-3">금액</th>
                  <th className="text-center px-4 py-3">상태</th>
                  {isLeader && <th className="text-center px-4 py-3">처리</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isLeader ? 6 : 5} className="text-center py-14 text-slate-400 text-sm">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      벌금 내역이 없습니다.
                    </td>
                  </tr>
                ) : filteredRecords.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>{r.memberNickname[0]?.toUpperCase()}</div>
                        <span className="font-medium text-slate-800">{r.memberNickname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">
                      <span className="inline-flex items-center gap-1">
                        {r.reason.includes('결석') ? <span className="text-red-400">✗</span> : r.reason.includes('지각') ? <span className="text-amber-400">△</span> : null}
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-xs hidden sm:table-cell">{r.date}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-800">{r.amount.toLocaleString()}원</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                        {r.isPaid ? '납부' : '미납'}
                      </span>
                    </td>
                    {isLeader && (
                      <td className="px-4 py-3.5 text-center">
                        {!r.isPaid ? (
                          <button onClick={() => markPaid(r.id, r.memberNickname, r.amount)}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm">
                            납부 처리
                          </button>
                        ) : <span className="text-xs text-slate-300">완료</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLeader && (
            <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-slate-500">미납 건수: <strong className="text-red-600">{records.filter(r => !r.isPaid).length}건</strong></p>
              <button onClick={markAllPaid} className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm">미납 전체 납부 처리</button>
            </div>
          )}
        </div>

      </div>
          </main>
        </div>
      </div>

      {/* 벌금 규칙 수정 모달 */}
      {ruleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">벌금 규칙 설정</h2>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-red-700 mb-2">✗ 결석 벌금 (원)</label>
                <input type="number" min="0" step="100" value={newAbsentFee} onChange={e => setNewAbsentFee(e.target.value)} placeholder="예) 5000"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400" />
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-amber-700 mb-2">△ 지각 벌금 (원)</label>
                <input type="number" min="0" step="100" value={newLateFee} onChange={e => setNewLateFee(e.target.value)} placeholder="예) 2000"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <p className="text-xs text-slate-400">변경 이후 생성되는 출석 기록부터 적용됩니다.</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRuleModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={saveRule} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#0077ff' }}>저장</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
