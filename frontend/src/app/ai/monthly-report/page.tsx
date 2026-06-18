'use client';

import { useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const groupTabs = [{ id: 1, name: 'Web Developer Study' }, { id: 2, name: 'Python 스터디' }];

const reports = [
  { id: 1, month: '2026-06', label: '2026년 6월', status: 'ready', avgRate: 87, sessions: 4, penalty: 76000 },
  { id: 2, month: '2026-05', label: '2026년 5월', status: 'ready', avgRate: 84, sessions: 5, penalty: 52000 },
  { id: 3, month: '2026-04', label: '2026년 4월', status: 'ready', avgRate: 81, sessions: 4, penalty: 61000 },
  { id: 4, month: '2026-03', label: '2026년 3월', status: 'ready', avgRate: 79, sessions: 5, penalty: 85000 },
];

const memberPerf = [
  { rank: 1, name: '최수아', avatar: 'C', rate: 100, late: 0, absent: 0, penalty: 0, contribution: '최우수', improved: '+5%' },
  { rank: 2, name: '김민수', avatar: 'K', rate: 92, late: 1, absent: 0, penalty: 3000, contribution: '우수', improved: '+2%' },
  { rank: 3, name: '이지연', avatar: 'L', rate: 87, late: 2, absent: 0, penalty: 6000, contribution: '양호', improved: '+1%' },
  { rank: 4, name: '정도현', avatar: 'J', rate: 83, late: 2, absent: 1, penalty: 16000, contribution: '보통', improved: '-3%' },
  { rank: 5, name: '박철수', avatar: 'P', rate: 79, late: 3, absent: 1, penalty: 19000, contribution: '주의', improved: '-1%' },
  { rank: 6, name: '한예진', avatar: 'H', rate: 67, late: 4, absent: 2, penalty: 32000, contribution: '경고', improved: '-5%' },
];

const barData = {
  labels: ['6/1 세션1', '6/8 세션2', '6/15 세션3', '6/22 세션4'],
  datasets: [
    { label: '출석', data: [6, 5, 5, 6], backgroundColor: '#dcfce7', borderColor: '#16a34a', borderWidth: 1 },
    { label: '지각', data: [0, 1, 1, 0], backgroundColor: '#fef3c7', borderColor: '#d97706', borderWidth: 1 },
    { label: '결석', data: [0, 0, 0, 0], backgroundColor: '#fee2e2', borderColor: '#dc2626', borderWidth: 1 },
  ],
};
const barOptions = { responsive: true, plugins: { legend: { position: 'bottom' as const } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: '#f1f5f9' } } } };

type ReportTab = 'attendance' | 'penalty' | 'insight' | 'members';

const contributionStyle = (c: string) => ({
  '최우수': { bg: '#dcfce7', color: '#16a34a' },
  '우수': { bg: '#dce6fd', color: '#1258fc' },
  '양호': { bg: '#ede9fe', color: '#7c3aed' },
  '보통': { bg: '#f1f5f9', color: '#64748b' },
  '주의': { bg: '#fef3c7', color: '#d97706' },
  '경고': { bg: '#fee2e2', color: '#dc2626' },
}[c] || { bg: '#f1f5f9', color: '#64748b' });

export default function MonthlyReportPage() {
  const [activeGroupId, setActiveGroupId] = useState(1);
  const [selectedReport, setSelectedReport] = useState(reports[0]);
  const [reportTab, setReportTab] = useState<ReportTab>('attendance');

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">

          {/* 배너 */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#1258fc,#3a74ef)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold mb-1">AI 월간 리포트 📋</h2>
                <p className="text-blue-100 text-sm">AI가 매월 자동으로 스터디 현황을 분석합니다</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-white/20 text-xs px-3 py-1.5 rounded-full font-semibold">총 {reports.length}개 리포트</span>
                <span className="bg-white/20 text-xs px-3 py-1.5 rounded-full font-semibold">다음 생성: 2026-07-01</span>
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

          {/* 2-col 레이아웃 */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* 리포트 목록 */}
            <div className="lg:w-72 flex-shrink-0 space-y-3">
              {reports.map(r => (
                <button key={r.id} onClick={() => setSelectedReport(r)}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all ${selectedReport.id === r.id ? 'border-blue-500 shadow-md' : 'border-slate-100 hover:border-blue-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">{r.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">완료</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    {[['출석률', `${r.avgRate}%`, '#1258fc'], ['세션', `${r.sessions}회`, '#10b981'], ['벌금', `₩${(r.penalty / 1000).toFixed(0)}k`, '#dc2626']].map(([l, v, c], i) => (
                      <div key={i} className="bg-slate-50 rounded-lg py-1.5">
                        <p className="text-xs text-slate-400">{l}</p>
                        <p className="text-xs font-bold" style={{ color: c }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* 리포트 상세 */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* 리포트 탭 */}
              <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {([
                  { key: 'attendance', label: '출석 통계' },
                  { key: 'penalty', label: '벌금 정산' },
                  { key: 'insight', label: 'AI 인사이트' },
                  { key: 'members', label: '멤버 성과' },
                ] as { key: ReportTab; label: string }[]).map(t => (
                  <button key={t.key} onClick={() => setReportTab(t.key)}
                    className={`px-5 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${reportTab === t.key ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* 출석 통계 */}
                {reportTab === 'attendance' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[['평균 출석률', `${selectedReport.avgRate}%`, '#1258fc', '#dce6fd'], ['총 세션', `${selectedReport.sessions}회`, '#10b981', '#d1fae5'], ['지각', '6회', '#d97706', '#fef3c7'], ['결석', '2회', '#dc2626', '#fee2e2']].map(([l, v, c, bg], i) => (
                        <div key={i} className="rounded-xl p-3 text-center" style={{ background: bg }}>
                          <p className="text-xs mb-1" style={{ color: c }}>{l}</p>
                          <p className="text-xl font-bold" style={{ color: c }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <Bar data={barData} options={barOptions} />
                  </div>
                )}

                {/* 벌금 정산 */}
                {reportTab === 'penalty' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[['총 발생', `₩${selectedReport.penalty.toLocaleString()}`, '#1258fc', '#dce6fd'], ['납부완료', '₩81,000', '#16a34a', '#dcfce7'], ['미납', '₩76,000', '#dc2626', '#fee2e2']].map(([l, v, c, bg], i) => (
                        <div key={i} className="rounded-xl p-3 text-center" style={{ background: bg }}>
                          <p className="text-xs mb-1" style={{ color: c }}>{l}</p>
                          <p className="text-base font-bold" style={{ color: c }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <table className="w-full text-sm">
                        <thead><tr className="text-xs text-slate-400 border-b border-slate-100">
                          <th className="pb-2 text-left">멤버</th><th className="pb-2 text-center">결석</th><th className="pb-2 text-center">지각</th><th className="pb-2 text-right">벌금</th><th className="pb-2 text-center">상태</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-50">
                          {memberPerf.map(m => (
                            <tr key={m.rank} className="hover:bg-slate-50">
                              <td className="py-2.5 font-medium text-slate-700">{m.name}</td>
                              <td className="py-2.5 text-center text-red-500">{m.absent}</td>
                              <td className="py-2.5 text-center text-amber-600">{m.late}</td>
                              <td className="py-2.5 text-right font-semibold text-slate-700">₩{m.penalty.toLocaleString()}</td>
                              <td className="py-2.5 text-center">
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: m.penalty === 0 ? '#dcfce7' : '#fef3c7', color: m.penalty === 0 ? '#16a34a' : '#d97706' }}>
                                  {m.penalty === 0 ? '없음' : '미납'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* AI 인사이트 */}
                {reportTab === 'insight' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#1258fc)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🤖</span>
                        <h4 className="font-bold">{selectedReport.label} AI 분석</h4>
                      </div>
                      <p className="text-sm text-purple-100 leading-relaxed">
                        이번 달 평균 출석률 87%로 전월 대비 3% 향상되었습니다. Web Developer Study 그룹의 출석률이 안정적으로 유지되고 있으며, 최수아 멤버가 100% 출석으로 그룹에 긍정적인 영향을 주고 있습니다. 한예진 멤버의 지속적인 출석 감소에 주의가 필요합니다.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { icon: '✅', text: '출석률이 전월 대비 3% 향상되었습니다', type: 'positive' },
                        { icon: '✅', text: '최수아 멤버가 이달 100% 출석 달성했습니다', type: 'positive' },
                        { icon: '⚠️', text: '한예진 멤버의 출석률이 3개월 연속 하락 중입니다', type: 'negative' },
                        { icon: '⚠️', text: '미납 벌금이 전월 대비 46% 증가했습니다', type: 'negative' },
                        { icon: 'ℹ️', text: '다음 달 총 5회의 세션이 예정되어 있습니다', type: 'info' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                          style={{ background: item.type === 'positive' ? '#f0fdf4' : item.type === 'negative' ? '#fff7ed' : '#f0f9ff' }}>
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                          <p className="text-sm text-slate-700">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 멤버 성과 */}
                {reportTab === 'members' && (
                  <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-slate-400 border-b border-slate-100">
                        <th className="pb-3 text-left">순위</th>
                        <th className="pb-3 text-left">멤버</th>
                        <th className="pb-3 text-center">출석률</th>
                        <th className="pb-3 text-center">지각</th>
                        <th className="pb-3 text-center">결석</th>
                        <th className="pb-3 text-right">벌금</th>
                        <th className="pb-3 text-center">기여도</th>
                        <th className="pb-3 text-center">변화</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50">
                        {memberPerf.map(m => {
                          const cs = contributionStyle(m.contribution);
                          return (
                            <tr key={m.rank} className="hover:bg-slate-50">
                              <td className="py-3">{m.rank < 4 ? ['🥇', '🥈', '🥉'][m.rank - 1] : <span className="text-slate-400 pl-1">{m.rank}</span>}</td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1258fc' }}>{m.avatar}</div>
                                  <span className="font-medium text-slate-700">{m.name}</span>
                                </div>
                              </td>
                              <td className="py-3 text-center font-bold text-blue-600">{m.rate}%</td>
                              <td className="py-3 text-center text-amber-600">{m.late}</td>
                              <td className="py-3 text-center text-red-500">{m.absent}</td>
                              <td className="py-3 text-right text-slate-600">₩{m.penalty.toLocaleString()}</td>
                              <td className="py-3 text-center"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={cs}>{m.contribution}</span></td>
                              <td className="py-3 text-center text-xs font-semibold" style={{ color: m.improved.startsWith('+') ? '#16a34a' : '#dc2626' }}>{m.improved}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
