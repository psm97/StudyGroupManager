'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import GroupTabsCard from '@/components/GroupTabsCard';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface MemberRisk {
  user_id: string;
  nickname: string;
  risk_score: number;
  churn_probability: number;
}

interface ChurnFactor {
  label: string;
  weight: number;
}

interface RiskLog {
  id: number;
  date: string;
  nickname: string;
  user_id: string;
  risk_score: number;
  churn_probability: number;
  main_factor?: string;
}

interface MyRiskData {
  risk_score: number;
  churn_probability: number;
  attendance_rate: number;
  late_count: number;
  absent_count: number;
  main_factor: string;
  trend: number[];
  history: { date: string; risk_score: number; churn_probability: number; main_factor?: string }[];
}

export default function AIAttendanceAnalysisPage() {
  const searchParams = useSearchParams();
  const initialGroupId = parseInt(searchParams.get('group_id') || '1') || 1;

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [memberRisks, setMemberRisks] = useState<MemberRisk[]>([]);
  const [churnFactors, setChurnFactors] = useState<ChurnFactor[]>([]);
  const [riskLogs, setRiskLogs] = useState<RiskLog[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [viewMode, setViewMode] = useState<'personal' | 'group'>('personal');
  const [myData, setMyData] = useState<MyRiskData | null>(null);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [modelRecall, setModelRecall] = useState<number | null>(null);
  const [modelF1, setModelF1] = useState<number | null>(null);
  const [modelDataCount, setModelDataCount] = useState<number | null>(null);
  const [dangerCount, setDangerCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [lastAnalyzed, setLastAnalyzed] = useState('—');
  const [logMemberFilter, setLogMemberFilter] = useState('all');
  const [logRiskFilter, setLogRiskFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const groupId = String(selectedGroupId);

  useEffect(() => {
    fetch(`/api/ai/attendance-analysis/?group_id=${groupId}`)
      .then(r => r.json())
      .then(d => {
        setMemberRisks(d.member_risks || []);
        setChurnFactors(d.churn_factors || []);
        setRiskLogs(d.risk_logs || []);
        setIsLeader(d.is_leader || false);
        setMyData(d.my_data || null);
        setModelAccuracy(d.model_accuracy);
        setModelRecall(d.model_recall);
        setModelF1(d.model_f1);
        setModelDataCount(d.model_data_count);
        setDangerCount(d.danger_count || 0);
        setWarningCount(d.warning_count || 0);
        setGroupName(d.group_name || '');
        setLastAnalyzed(d.last_analyzed || '—');
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [groupId]);

  const riskColor = (s: number) => s >= 70 ? '#ef4444' : s >= 40 ? '#f59e0b' : '#22c55e';
  const riskBg = (s: number) => s >= 70 ? 'from-red-400 to-red-600' : s >= 40 ? 'from-amber-400 to-amber-600' : 'from-green-400 to-green-600';
  const riskLabel = (s: number) => s >= 70 ? '⚠️ 위험' : s >= 40 ? '🟡 주의' : '✅ 안전';
  const riskBadge = (s: number) => s >= 70 ? 'bg-red-50 text-red-600' : s >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600';
  const riskText = (s: number) => s >= 70 ? 'text-red-600' : s >= 40 ? 'text-amber-600' : 'text-green-600';
  const riskClass = (s: number) => s >= 70 ? 'danger' : s >= 40 ? 'warning' : 'safe';

  const filteredLogs = riskLogs.filter(log => {
    const mOk = logMemberFilter === 'all' || log.user_id === logMemberFilter;
    const rOk = logRiskFilter === 'all' || riskClass(log.risk_score) === logRiskFilter;
    return mOk && rOk;
  });

  const groupTrendData = useMemo(() => {
    const weeks = ['5주전', '4주전', '3주전', '2주전', '지난주', '이번주'];
    const base = [88, 85, 82, 79, 76, 73];
    const adj = memberRisks.filter(m => m.risk_score >= 70).length * 2;
    return {
      labels: weeks,
      datasets: [
        { label: '그룹 평균 출석률', data: base.map((v, i) => Math.max(50, v - adj + i)), borderColor: '#0077ff', backgroundColor: 'rgba(0,119,255,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#0077ff' },
        { label: '목표 출석률', data: weeks.map(() => 85), borderColor: '#22c55e', borderDash: [5, 4], backgroundColor: 'transparent', pointRadius: 0, tension: 0 },
      ],
    };
  }, [memberRisks]);

  const myTrendData = useMemo(() => {
    const weeks = ['5주전', '4주전', '3주전', '2주전', '지난주', '이번주'];
    return {
      labels: weeks,
      datasets: [
        { label: '내 출석률', data: myData?.trend ?? [0, 0, 0, 0, 0, 0], borderColor: '#0077ff', backgroundColor: 'rgba(0,119,255,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#0077ff' },
        { label: '목표 출석률', data: weeks.map(() => 85), borderColor: '#22c55e', borderDash: [5, 4], backgroundColor: 'transparent', pointRadius: 0, tension: 0 },
      ],
    };
  }, [myData]);

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const, labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, min: 50, max: 100, ticks: { font: { size: 11 }, callback: (v: unknown) => `${v}%` } },
    },
  };

  return (
    <div className="bg-blue-100 min-h-screen">
      <style>{`
        .model-card{background:#2e8dfa;border-radius:18px;color:#fff}
        .mbar{height:8px;border-radius:99px;background:#e2e8f0;overflow:hidden}
        .mfill{height:100%;border-radius:99px;transition:width .6s ease}
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        .ping{animation:ping 1.2s cubic-bezier(0,0,.2,1) infinite}
        button:not(:disabled){cursor:pointer}
      `}</style>
      <div id="sidebarOverlay" onClick={() => {
        document.getElementById('sidebar')?.classList.remove('open');
        (document.getElementById('sidebarOverlay') as HTMLElement)?.classList.remove('open');
      }} />
      <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{ minHeight: '100vh' }}>
        <LeftMenu />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6 space-y-5">

            {/* 배너 */}
            <div className="rounded-2xl p-5 sm:p-6 text-white" style={{ background: 'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)' }}>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold mb-2" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>🔍 AI Analysis</span>
                  <h1 className="text-2xl sm:text-3xl font-bold">AI 출석 분석</h1>
                  <p className="text-white/60 text-sm mt-1">{groupName} · 최근 분석: {lastAnalyzed}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[{ label: '모델 정확도', value: `${modelAccuracy ?? '—'}%`, color: 'text-green-300' }, { label: '위험 멤버', value: String(dangerCount), color: 'text-red-300' }, { label: '주의 멤버', value: String(warningCount), color: 'text-amber-300' }].map(item => (
                    <div key={item.label} className="border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                      <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs opacity-60 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 탭 + 컨텐츠 */}
            <GroupTabsCard
              activeGroupId={selectedGroupId}
              onGroupsLoaded={gs => { if (gs.length) setSelectedGroupId(gs[0].id); }}
              onSelect={group => { setSelectedGroupId(group.id); setLogMemberFilter('all'); setLogRiskFilter('all'); setViewMode('personal'); }}
            />

            {/* 기준 선택 토글 — 리더만 표시 */}
            {isLeader && (
              <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm p-1 w-fit">
                {(['personal', 'group'] as const).map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl transition-colors"
                    style={{ background: viewMode === mode ? '#0077ff' : 'transparent', color: viewMode === mode ? '#fff' : '#64748b' }}>
                    {mode === 'personal' ? '👤 개인 기준' : '👥 그룹 기준'}
                  </button>
                ))}
              </div>
            )}

            {/* ── 개인 기준 ── */}
            {viewMode === 'personal' && (
              <>
                {loading ? (
                  <div className="bg-white rounded-2xl border border-slate-100 text-center py-12 text-slate-400 text-sm">로딩 중...</div>
                ) : myData ? (
                  <>
                    {/* 내 결석 위험도 */}
                    <section>
                      <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">🎯</span>내 결석 위험도
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 위험도 게이지 */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
                          <div className="relative mb-3">
                            <svg className="w-28 h-28" style={{ transform: 'rotate(-90deg)' }}>
                              <circle fill="none" stroke="#e2e8f0" strokeWidth="8" cx="56" cy="56" r="44" />
                              <circle fill="none" strokeWidth="8" strokeLinecap="round" cx="56" cy="56" r="44"
                                stroke={riskColor(myData.risk_score)} strokeDasharray={`${myData.risk_score * 2.76} 276.46`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-2xl font-bold ${riskText(myData.risk_score)}`}>{myData.risk_score}</span>
                              <span className="text-xs text-slate-400">위험도</span>
                            </div>
                          </div>
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${riskBadge(myData.risk_score)}`}>{riskLabel(myData.risk_score)}</span>
                          <p className="text-xs text-slate-400 mt-2">주요 원인: {myData.main_factor}</p>
                        </div>

                        {/* 내 출석 현황 */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                          <h3 className="text-sm font-bold text-slate-700 mb-3">내 출석 현황</h3>
                          <div className="space-y-2">
                            {[
                              { label: '출석률', value: `${myData.attendance_rate}%`, cls: myData.attendance_rate >= 80 ? 'text-green-600' : myData.attendance_rate >= 60 ? 'text-amber-600' : 'text-red-500' },
                              { label: '지각 횟수', value: `${myData.late_count}회`, cls: myData.late_count > 2 ? 'text-amber-600' : 'text-slate-700' },
                              { label: '결석 횟수', value: `${myData.absent_count}회`, cls: myData.absent_count > 1 ? 'text-red-500' : 'text-slate-700' },
                            ].map(item => (
                              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                <span className="text-sm text-slate-500">{item.label}</span>
                                <span className={`text-sm font-bold ${item.cls}`}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 내 탈퇴 예측 지표 */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center justify-center gap-3">
                          <h3 className="text-sm font-bold text-slate-700 self-start flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-xs">🚪</span>내 탈퇴 예측 지표
                          </h3>
                          <div className="relative">
                            <svg className="w-24 h-24" style={{ transform: 'rotate(-90deg)' }}>
                              <circle fill="none" stroke="#e2e8f0" strokeWidth="8" cx="48" cy="48" r="38" />
                              <circle fill="none" strokeWidth="8" strokeLinecap="round" cx="48" cy="48" r="38"
                                stroke={riskColor(myData.churn_probability)} strokeDasharray={`${myData.churn_probability * 2.39} 238.76`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-xl font-bold ${riskText(myData.churn_probability)}`}>{myData.churn_probability}%</span>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskBadge(myData.churn_probability)}`}>탈퇴 확률</span>
                        </div>
                      </div>
                    </section>

                    {/* 내 출석 패턴 분석 */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                      <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">📈</span>내 출석 패턴 분석
                      </h2>
                      <div className="h-56"><Line data={myTrendData} options={chartOpts} /></div>
                    </div>

                    {/* 내 위험도 변화 이력 */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm">📋</span>내 위험도 변화 이력
                        </h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100" style={{ background: '#f8fafc' }}>
                              {['날짜', '위험 점수', '탈퇴 확률', '단계', '주요 원인'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {myData.history.length === 0 ? (
                              <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">이력 데이터가 없습니다.</td></tr>
                            ) : myData.history.map((log, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.date}</td>
                                <td className="px-4 py-3"><span className={`font-bold text-sm ${riskText(log.risk_score)}`}>{Math.round(log.risk_score)}</span></td>
                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">{Math.round(log.churn_probability)}%</td>
                                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadge(log.risk_score)}`}>{riskLabel(log.risk_score).replace(/^[^\s]+ /, '')}</span></td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{log.main_factor || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 text-center py-12 px-4">
                    <p className="text-2xl mb-2">🤖</p>
                    <p className="font-semibold text-slate-500 mb-1">개인 분석 데이터가 없습니다</p>
                    <p className="text-xs text-slate-400">3개월 이상의 출석 데이터 축적 후 분석이 가능합니다.</p>
                  </div>
                )}
              </>
            )}

            {/* ── 그룹 기준 (리더 전용) ── */}
            {viewMode === 'group' && isLeader && (
              <>
                {/* 결석 위험도 대시보드 */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">🎯</span>결석 위험도 대시보드
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {[{ color: 'bg-red-400', label: '위험 (70~100)' }, { color: 'bg-amber-400', label: '주의 (40~69)' }, { color: 'bg-green-400', label: '안전 (0~39)' }].map(item => (
                        <span key={item.label} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${item.color} inline-block`}></span>{item.label}</span>
                      ))}
                    </div>
                  </div>
                  {loading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 text-center py-12 text-slate-400 text-sm">로딩 중...</div>
                  ) : memberRisks.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 text-center py-12 px-4">
                      <p className="text-2xl mb-2">🤖</p>
                      <p className="font-semibold text-slate-500 mb-1">분석 데이터가 없습니다</p>
                      <p className="text-xs text-slate-400">3개월 이상의 출석 데이터 축적 후 분석이 가능합니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {memberRisks.map(m => (
                        <div key={m.user_id} className="rounded-xl bg-white p-4 cursor-pointer transition-all hover:-translate-y-1"
                          style={{ border: '1px solid #e2e8f0', ...(m.risk_score >= 70 ? { borderLeft: '4px solid #ef4444' } : m.risk_score >= 40 ? { borderLeft: '4px solid #f59e0b' } : { borderLeft: '4px solid #22c55e' }) }}>
                          <div className="relative mx-auto w-12 h-12 mb-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow bg-gradient-to-br ${riskBg(m.risk_score)}`}>{m.nickname[0]}</div>
                            {m.risk_score >= 70 && (
                              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-400 border-2 border-white">
                                <span className="ping absolute inset-0 rounded-full bg-red-400 opacity-75" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-700 text-center truncate mb-2">{m.nickname}</p>
                          <div className="flex justify-center mb-2">
                            <div className="relative">
                              <svg className="w-14 h-14" style={{ transform: 'rotate(-90deg)' }}>
                                <circle fill="none" stroke="#e2e8f0" strokeWidth="7" cx="28" cy="28" r="22" />
                                <circle fill="none" strokeWidth="7" strokeLinecap="round" cx="28" cy="28" r="22"
                                  stroke={riskColor(m.risk_score)} strokeDasharray={`${m.risk_score * 1.38} 138.23`} />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-sm font-bold ${riskText(m.risk_score)}`}>{Math.round(m.risk_score)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadge(m.risk_score)}`}>{riskLabel(m.risk_score)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 출석 패턴 트렌드 + 탈퇴 예측 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">📈</span>출석 패턴 트렌드
                    </h2>
                    <div className="h-56"><Line data={groupTrendData} options={chartOpts} /></div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">🚪</span>탈퇴 예측 지표
                    </h2>
                    <div className="space-y-3">
                      {[...memberRisks].sort((a, b) => b.churn_probability - a.churn_probability).slice(0, 5).map(m => (
                        <div key={m.user_id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br ${riskBg(m.churn_probability)}`}>{m.nickname[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{m.nickname}</p>
                            <div className="mbar mt-1">
                              <div className={`mfill ${m.churn_probability >= 70 ? 'bg-red-400' : m.churn_probability >= 40 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${m.churn_probability}%` }} />
                            </div>
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ${riskText(m.churn_probability)}`}>{Math.round(m.churn_probability)}%</span>
                        </div>
                      ))}
                    </div>
                    {churnFactors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">주요 이탈 원인 분석</p>
                        <div className="space-y-1.5">
                          {churnFactors.map(f => (
                            <div key={f.label} className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">{f.label}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 mbar"><div className="mfill" style={{ width: `${f.weight}%`, background: '#0077ff' }} /></div>
                                <span className="text-slate-400 w-8 text-right">{f.weight}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 모델 성능 */}
                {modelAccuracy !== null && (
                  <div className="model-card p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-xs text-white/50 font-semibold uppercase tracking-widest mb-1">AI Model Performance</p>
                        <h2 className="font-bold text-white text-lg flex items-center gap-2">🧠 예측 모델 성능 지표 <span className="text-xs font-normal text-white/40">관리자 전용</span></h2>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {[{ label: '정확도', val: modelAccuracy, cls: 'text-green-300' }, { label: '재현율', val: modelRecall, cls: 'text-blue-300' }, { label: 'F1 Score', val: modelF1, cls: 'text-purple-300' }, { label: '학습 데이터', val: modelDataCount, cls: 'text-amber-300', noSuffix: true }].map(item => (
                          <div key={item.label} className="text-center bg-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
                            <p className={`text-xl font-bold ${item.cls}`}>{item.val}{item.noSuffix ? '' : '%'}</p>
                            <p className="text-xs text-white/50 mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      {[{ label: '정확도 (Accuracy)', val: modelAccuracy, bar: 'bg-green-400', txt: 'text-green-300' }, { label: '재현율 (Recall)', val: modelRecall, bar: 'bg-blue-400', txt: 'text-blue-300' }, { label: 'F1 Score', val: modelF1, bar: 'bg-purple-400', txt: 'text-purple-300' }].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs text-white/60 mb-1.5"><span>{item.label}</span><span className={`${item.txt} font-semibold`}>{item.val}%</span></div>
                          <div className="mbar" style={{ background: 'rgba(255,255,255,0.12)' }}><div className={`mfill ${item.bar}`} style={{ width: `${item.val ?? 0}%` }} /></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/40">
                      <span>알고리즘: <strong className="text-white/70">RandomForestClassifier</strong></span>
                      <span>학습 데이터: <strong className="text-white/70">{modelDataCount}건</strong></span>
                    </div>
                  </div>
                )}

                {/* 위험도 변화 이력 (전체 멤버) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm">📋</span>위험도 변화 이력
                    </h2>
                    <div className="flex items-center gap-2">
                      <select value={logMemberFilter} onChange={e => setLogMemberFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-slate-600">
                        <option value="all">전체 멤버</option>
                        {memberRisks.map(m => <option key={m.user_id} value={m.user_id}>{m.nickname}</option>)}
                      </select>
                      <select value={logRiskFilter} onChange={e => setLogRiskFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-slate-600">
                        <option value="all">전체 위험도</option>
                        <option value="danger">⚠️ 위험</option>
                        <option value="warning">🟡 주의</option>
                        <option value="safe">✅ 안전</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100" style={{ background: '#f8fafc' }}>
                          {['날짜', '멤버', '위험 점수', '탈퇴 확률', '단계', '주요 원인'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredLogs.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">이력 데이터가 없습니다.</td></tr>
                        ) : filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.date}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{log.nickname[0]}</div>
                                <span className="font-medium text-slate-700">{log.nickname}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><span className={`font-bold text-sm ${riskText(log.risk_score)}`}>{Math.round(log.risk_score)}</span></td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">{Math.round(log.churn_probability)}%</td>
                            <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadge(log.risk_score)}`}>{riskLabel(log.risk_score).replace(/^[^\s]+ /, '')}</span></td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{log.main_factor || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
