'use client';

import { useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const groups = [
  { id: 1, name: 'Web Developer Study', color: '#1258fc', memberCount: 6 },
  { id: 2, name: 'Python 스터디', color: '#10b981', memberCount: 4 },
  { id: 3, name: 'CS 알고리즘', color: '#f59e0b', memberCount: 5 },
];

const memberStats = [
  { id: 1, name: '최수아', avatar: 'C', present: 23, late: 1, absent: 0, rate: 95 },
  { id: 2, name: '김민수', avatar: 'K', present: 22, late: 1, absent: 1, rate: 92 },
  { id: 3, name: '이지연', avatar: 'L', present: 20, late: 2, absent: 2, rate: 87 },
  { id: 4, name: '정도현', avatar: 'J', present: 19, late: 2, absent: 3, rate: 83 },
  { id: 5, name: '박철수', avatar: 'P', present: 18, late: 3, absent: 3, rate: 79 },
  { id: 6, name: '한예진', avatar: 'H', present: 16, late: 4, absent: 4, rate: 71 },
];

const sessionMatrix = [
  { date: '06/15', topic: 'React Hooks', statuses: ['present', 'present', 'late', 'present', 'absent', 'present'] },
  { date: '06/08', topic: 'TypeScript', statuses: ['present', 'late', 'present', 'present', 'present', 'absent'] },
  { date: '06/01', topic: 'Next.js', statuses: ['present', 'present', 'present', 'present', 'present', 'present'] },
  { date: '05/25', topic: 'Redux', statuses: ['late', 'present', 'absent', 'present', 'present', 'late'] },
];

const rateColor = (r: number) => r >= 90 ? '#16a34a' : r >= 75 ? '#d97706' : '#dc2626';
const statusStyle = (s: string) => ({
  present: { bg: '#dcfce7', color: '#16a34a', symbol: '✓' },
  late: { bg: '#fef3c7', color: '#b45309', symbol: '△' },
  absent: { bg: '#fee2e2', color: '#dc2626', symbol: '✗' },
}[s] || { bg: '#f8fafc', color: '#cbd5e1', symbol: '—' });

type Period = '이번달' | '3개월' | '전체';

const lineChartData = {
  labels: ['3월', '4월', '5월', '6월'],
  datasets: [{
    label: '출석률(%)',
    data: [80, 83, 86, 87],
    borderColor: '#1258fc',
    backgroundColor: 'rgba(18,88,252,0.08)',
    tension: 0.4,
    fill: true,
    pointBackgroundColor: '#1258fc',
    pointRadius: 5,
  }],
};

const barChartData = {
  labels: memberStats.map(m => m.name),
  datasets: [
    { label: '출석', data: memberStats.map(m => m.present), backgroundColor: '#dcfce7', borderColor: '#16a34a', borderWidth: 1 },
    { label: '지각', data: memberStats.map(m => m.late), backgroundColor: '#fef3c7', borderColor: '#d97706', borderWidth: 1 },
    { label: '결석', data: memberStats.map(m => m.absent), backgroundColor: '#fee2e2', borderColor: '#dc2626', borderWidth: 1 },
  ],
};
const barOptions = { responsive: true, plugins: { legend: { position: 'bottom' as const } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: '#f1f5f9' } } } };
const lineOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } };

export default function AttendanceStatsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState(1);
  const [period, setPeriod] = useState<Period>('이번달');

  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">

          {/* 배너 */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#1258fc,#3a74ef)' }}>
            <h2 className="text-xl font-bold mb-1">출석 통계 📊</h2>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">총 24회 진행</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">평균 출석률 84.7%</span>
            </div>
          </div>

          {/* 그룹 카드 선택 */}
          <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {groups.map(g => (
              <button key={g.id} onClick={() => setSelectedGroupId(g.id)}
                className="flex-shrink-0 bg-white rounded-xl border-2 p-3 text-left transition-all"
                style={{ borderColor: selectedGroupId === g.id ? g.color : '#e2e8f0', minWidth: 160 }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2" style={{ background: g.color }}>{g.name[0]}</div>
                <p className="text-sm font-semibold text-slate-800 mb-0.5 truncate">{g.name}</p>
                <p className="text-xs text-slate-400">멤버 {g.memberCount}명</p>
              </button>
            ))}
          </div>

          {/* 기간 필터 */}
          <div className="flex gap-1">
            {(['이번달', '3개월', '전체'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${period === p ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {p}
              </button>
            ))}
          </div>

          {/* 요약 카드 4개 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '총 출석', value: `${memberStats.reduce((s, m) => s + m.present, 0)}회`, color: '#16a34a', bg: '#dcfce7' },
              { label: '지각', value: `${memberStats.reduce((s, m) => s + m.late, 0)}회`, color: '#d97706', bg: '#fef3c7' },
              { label: '결석', value: `${memberStats.reduce((s, m) => s + m.absent, 0)}회`, color: '#dc2626', bg: '#fee2e2' },
              { label: '평균 출석률', value: `${Math.round(memberStats.reduce((s, m) => s + m.rate, 0) / memberStats.length)}%`, color: '#1258fc', bg: '#dce6fd' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* 멤버 랭킹 + 추이 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 멤버 순위 테이블 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">멤버 출석 순위</h3>
              <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-100">
                      <th className="pb-2 text-left">순위</th>
                      <th className="pb-2 text-left">이름</th>
                      <th className="pb-2 text-center">출석</th>
                      <th className="pb-2 text-center">지각</th>
                      <th className="pb-2 text-center">결석</th>
                      <th className="pb-2 text-left">출석률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {memberStats.map((m, i) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 pl-1">
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : <span className="text-slate-400 text-sm ml-1">{i + 1}</span>}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: selectedGroup.color }}>{m.avatar}</div>
                            <span className="font-medium text-slate-700">{m.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center text-green-600 font-semibold">{m.present}</td>
                        <td className="py-2.5 text-center text-amber-600 font-semibold">{m.late}</td>
                        <td className="py-2.5 text-center text-red-500 font-semibold">{m.absent}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${m.rate}%`, background: rateColor(m.rate) }} /></div>
                            <span className="text-xs font-bold" style={{ color: rateColor(m.rate) }}>{m.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 추이 차트 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">월별 출석률 추이</h3>
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </div>

          {/* 누적 출석 현황 바 차트 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">멤버별 출석 현황</h3>
            <Bar data={barChartData} options={barOptions} />
          </div>

          {/* 세션 매트릭스 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">세션별 출석 현황</h3>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100">
                    <th className="pb-2 pr-4 text-left whitespace-nowrap">날짜 · 주제</th>
                    {memberStats.map(m => <th key={m.id} className="pb-2 px-3 text-center">{m.avatar}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sessionMatrix.map((sess, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{sess.date}</span>
                        <span className="text-slate-400 text-xs ml-2">{sess.topic}</span>
                      </td>
                      {sess.statuses.map((s, j) => {
                        const style = statusStyle(s);
                        return (
                          <td key={j} className="py-2.5 px-3 text-center">
                            <span className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-xs font-bold"
                              style={{ background: style.bg, color: style.color }}>
                              {style.symbol}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
