'use client';

import { useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const stats = { groups: 3, attendanceRate: 87, totalAttendance: 58, unpaidPenalty: 25000 };

const myGroups = [
  { id: 1, name: 'Web Developer Study', color: '#1258fc', memberCount: 6, role: '리더', attendanceRate: 92, nextSession: '2026-06-20' },
  { id: 2, name: 'Python 스터디', color: '#10b981', memberCount: 4, role: '멤버', attendanceRate: 85, nextSession: '2026-06-19' },
  { id: 3, name: 'CS 알고리즘', color: '#f59e0b', memberCount: 5, role: '멤버', attendanceRate: 78, nextSession: '2026-06-22' },
];

const recentActivity = [
  { type: 'present', text: 'Web Developer Study 출석 완료', time: '오늘 10:00', color: '#16a34a', bg: '#dcfce7' },
  { type: 'late', text: 'Python 스터디 지각 처리', time: '어제 14:00', color: '#d97706', bg: '#fef3c7' },
  { type: 'absent', text: 'CS 알고리즘 결석', time: '3일 전', color: '#dc2626', bg: '#fee2e2' },
  { type: 'present', text: 'Web Developer Study 출석 완료', time: '4일 전', color: '#16a34a', bg: '#dcfce7' },
];

const chartData = {
  labels: ['5/18', '5/25', '6/1', '6/8', '6/15', '6/18'],
  datasets: [{
    label: '출석률(%)',
    data: [80, 85, 90, 82, 88, 87],
    borderColor: '#1258fc',
    backgroundColor: 'rgba(18,88,252,0.08)',
    tension: 0.4,
    fill: true,
    pointBackgroundColor: '#1258fc',
    pointRadius: 4,
  }],
};
const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } } },
};

export default function DashboardPage() {
  const [, setRefresh] = useState(0);

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">

          {/* 환영 배너 */}
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#1258fc,#3a74ef)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">안녕하세요, 김민수님! 👋</h2>
                <p className="text-blue-100 text-sm">오늘도 스터디를 열심히 해봐요. 지금까지 출석률 87%를 달성했어요!</p>
              </div>
              <div className="flex gap-3">
                <a href="/attendance/check" className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors backdrop-blur-sm">출석 체크</a>
                <a href="/groups" className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">그룹 보기</a>
              </div>
            </div>
          </div>

          {/* KPI 카드 4개 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '내 그룹', value: `${stats.groups}개`, icon: '👥', color: '#1258fc', bg: '#dce6fd' },
              { label: '출석률', value: `${stats.attendanceRate}%`, icon: '📊', color: '#10b981', bg: '#d1fae5' },
              { label: '총 출석', value: `${stats.totalAttendance}회`, icon: '✅', color: '#8b5cf6', bg: '#ede9fe' },
              { label: '미납 벌금', value: `₩${stats.unpaidPenalty.toLocaleString()}`, icon: '💰', color: '#dc2626', bg: '#fee2e2' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: item.bg }}>{item.icon}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* 그룹 목록 + 출석 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 내 그룹 목록 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">내 그룹 목록</h3>
                <a href="/groups" className="text-xs text-blue-600 hover:underline">전체 보기</a>
              </div>
              <div className="space-y-3">
                {myGroups.map(g => (
                  <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: g.color }}>
                      {g.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-800 truncate">{g.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0" style={{ background: g.role === '리더' ? '#dce6fd' : '#f1f5f9', color: g.role === '리더' ? '#1258fc' : '#64748b' }}>{g.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full"><div className="h-1 rounded-full" style={{ width: `${g.attendanceRate}%`, background: g.color }} /></div>
                        <span className="text-xs text-slate-500 flex-shrink-0">{g.attendanceRate}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">다음 세션</p>
                      <p className="text-xs font-medium text-slate-600">{g.nextSession}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 출석 추이 차트 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">출석률 추이</h3>
                <span className="text-xs text-slate-400">최근 6주</span>
              </div>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* 최근 활동 + AI 요약 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 최근 활동 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">최근 활동</h3>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: a.bg, color: a.color }}>
                      {a.type === 'present' ? '✓' : a.type === 'late' ? '△' : '✗'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{a.text}</p>
                      <p className="text-xs text-slate-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 리포트 요약 */}
            <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#1258fc)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold">AI 리포트 요약</h3>
              </div>
              <p className="text-sm text-purple-100 mb-4 leading-relaxed">
                이번 달 평균 출석률 87%로 전월 대비 3% 향상되었습니다. Web Developer Study 그룹의 출석률이 가장 높으며, CS 알고리즘 그룹의 출석률 개선이 필요합니다.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[['출석률', '87%', '↑3%'], ['미납금', '₩25,000', '↓20%'], ['활성 그룹', '3개', '→'], ].map(([l, v, c], i) => (
                  <div key={i} className="bg-white/15 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-purple-200">{l}</p>
                    <p className="text-sm font-bold">{v}</p>
                    <p className="text-xs text-purple-300">{c}</p>
                  </div>
                ))}
              </div>
              <a href="/ai/monthly-report" className="block text-center bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 rounded-xl transition-colors">
                전체 리포트 보기 →
              </a>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
