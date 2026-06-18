'use client';

import { useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const groupTabs = [{ id: 1, name: 'Web Developer Study' }, { id: 2, name: 'Python 스터디' }];

type Stage = 'safe' | 'warning' | 'danger';
const members = [
  { id: 1, name: '최수아', avatar: 'C', color: '#8b5cf6', riskScore: 15, churnProb: 5, stage: 'safe' as Stage },
  { id: 2, name: '김민수', avatar: 'K', color: '#1258fc', riskScore: 22, churnProb: 12, stage: 'safe' as Stage },
  { id: 3, name: '이지연', avatar: 'L', color: '#10b981', riskScore: 45, churnProb: 28, stage: 'warning' as Stage },
  { id: 4, name: '정도현', avatar: 'J', color: '#ec4899', riskScore: 58, churnProb: 41, stage: 'warning' as Stage },
  { id: 5, name: '박철수', avatar: 'P', color: '#f59e0b', riskScore: 72, churnProb: 63, stage: 'danger' as Stage },
  { id: 6, name: '한예진', avatar: 'H', color: '#f97316', riskScore: 89, churnProb: 81, stage: 'danger' as Stage },
];

const churnFactors = [
  { factor: '연속 결석 횟수', weight: 85 },
  { factor: '최근 1개월 출석률', weight: 72 },
  { factor: '그룹 참여도', weight: 58 },
  { factor: '벌금 납부율', weight: 43 },
  { factor: '스터디 기간', weight: 31 },
];

const trendData = {
  labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
  datasets: [{ label: '평균 출석률(%)', data: [88, 84, 79, 76, 71, 73], borderColor: '#1258fc', backgroundColor: 'rgba(18,88,252,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#1258fc', pointRadius: 4 }],
};
const trendOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } };

const stageStyle = (s: Stage) => ({
  safe: { bg: '#dcfce7', color: '#16a34a', label: '안전', riskColor: '#16a34a' },
  warning: { bg: '#fef3c7', color: '#d97706', label: '주의', riskColor: '#d97706' },
  danger: { bg: '#fee2e2', color: '#dc2626', label: '위험', riskColor: '#dc2626' },
}[s]);

export default function AttendanceAnalysisPage() {
  const [activeGroupId, setActiveGroupId] = useState(1);

  const dangerCount = members.filter(m => m.stage === 'danger').length;
  const warningCount = members.filter(m => m.stage === 'warning').length;

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">

          {/* AI 배너 */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#1258fc)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold mb-1">출석 위험도 분석 🔬</h2>
                <p className="text-purple-100 text-sm">ML 모델로 이탈 위험 멤버를 조기에 탐지합니다</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-white/20 text-xs px-3 py-1.5 rounded-full font-semibold">모델 정확도 91.2%</span>
                <span className="bg-red-400/30 text-xs px-3 py-1.5 rounded-full font-semibold">⚠️ 위험 {dangerCount}명</span>
                <span className="bg-yellow-400/30 text-xs px-3 py-1.5 rounded-full font-semibold">🔶 주의 {warningCount}명</span>
              </div>
            </div>
          </div>

          {/* 그룹 탭 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {groupTabs.map(g => (
                <button key={g.id} onClick={() => setActiveGroupId(g.id)}
                  className={`px-5 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${activeGroupId === g.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'}`}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* 멤버 위험도 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {members.map(m => {
              const s = stageStyle(m.stage);
              const doughnutData = {
                datasets: [{ data: [m.riskScore, 100 - m.riskScore], backgroundColor: [s.riskColor, '#e2e8f0'], borderWidth: 0 }],
              };
              return (
                <div key={m.id} className="bg-white rounded-2xl border-2 shadow-sm p-4 flex flex-col items-center text-center"
                  style={{ borderColor: m.stage === 'danger' ? '#fca5a5' : m.stage === 'warning' ? '#fde68a' : '#e2e8f0' }}>
                  <div className="relative w-12 h-12 mb-2">
                    {m.stage === 'danger' && (
                      <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30" />
                    )}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: m.color }}>{m.avatar}</div>
                  </div>
                  <p className="font-semibold text-sm text-slate-800 mb-2">{m.name}</p>
                  <div className="w-14 h-14 relative mb-2">
                    <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { display: false } }, cutout: '68%' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold" style={{ color: s.riskColor }}>{m.riskScore}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <p className="text-xs text-slate-400 mt-1">이탈 {m.churnProb}%</p>
                </div>
              );
            })}
          </div>

          {/* 이탈 위험 + 추이 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top 이탈 위험 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">이탈 위험 순위 Top 5</h3>
              <div className="space-y-3">
                {[...members].sort((a, b) => b.churnProb - a.churnProb).slice(0, 5).map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: m.color }}>{m.avatar}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{m.name}</span>
                        <span className="font-bold" style={{ color: stageStyle(m.stage).riskColor }}>{m.churnProb}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${m.churnProb}%`, background: stageStyle(m.stage).riskColor }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 출석 추이 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">그룹 출석률 추이</h3>
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>

          {/* 이탈 요인 가중치 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">이탈 예측 주요 요인</h3>
            <div className="space-y-3">
              {churnFactors.map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{f.factor}</span>
                    <span className="font-semibold text-blue-600">{f.weight}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 rounded-full" style={{ width: `${f.weight}%`, background: `linear-gradient(90deg,#1258fc,#7c3aed)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 모델 성능 */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#1258fc,#7c3aed)' }}>
            <h3 className="font-bold mb-4">🔬 모델 성능 지표</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[['정확도', '91.2%'], ['재현율', '88.7%'], ['F1 스코어', '89.9%'], ['학습 데이터', '1,847건']].map(([l, v], i) => (
                <div key={i} className="bg-white/15 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-200 mb-1">{l}</p>
                  <p className="text-lg font-bold">{v}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
