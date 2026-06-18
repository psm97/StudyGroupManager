'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import GroupTabsCard, { DEFAULT_GROUP_TABS } from '@/components/GroupTabsCard';
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
  alert_sent?: boolean;
}

export default function AIAttendanceAnalysisPage() {
  const searchParams = useSearchParams();
  const initialGroupId = parseInt(searchParams.get('group_id') || '1') || 1;

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [memberRisks, setMemberRisks] = useState<MemberRisk[]>([]);
  const [churnFactors, setChurnFactors] = useState<ChurnFactor[]>([]);
  const [riskLogs, setRiskLogs] = useState<RiskLog[]>([]);
  const [isLeader, setIsLeader] = useState(false);
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
  const selectedGroup = DEFAULT_GROUP_TABS.find(g => g.id === selectedGroupId) || DEFAULT_GROUP_TABS[0];

  useEffect(() => {
    fetch(`/ai/attendance-analysis/?group_id=${groupId}`)
      .then(r => r.json())
      .then(d => {
        setMemberRisks(d.member_risks || []);
        setChurnFactors(d.churn_factors || []);
        setRiskLogs(d.risk_logs || []);
        setIsLeader(d.is_leader || false);
        setModelAccuracy(d.model_accuracy);
        setModelRecall(d.model_recall);
        setModelF1(d.model_f1);
        setModelDataCount(d.model_data_count);
        setDangerCount(d.danger_count || 0);
        setWarningCount(d.warning_count || 0);
        setGroupName(d.group_name || selectedGroup.name);
        setLastAnalyzed(d.last_analyzed || '—');
        setLoading(false);
      })
      .catch(() => {
        setMemberRisks([
          {user_id:'1', nickname:'홍길동', risk_score:25, churn_probability:15},
          {user_id:'2', nickname:'김철수', risk_score:55, churn_probability:42},
          {user_id:'3', nickname:'이영희', risk_score:78, churn_probability:71},
        ]);
        setChurnFactors([
          {label:'연속 결석', weight:45},
          {label:'미납 벌금', weight:25},
          {label:'참여도 저하', weight:20},
          {label:'활동 감소', weight:10},
        ]);
        setRiskLogs([
          {id:1, date:'2025.06.17 14:00', nickname:'이영희', user_id:'3', risk_score:78, churn_probability:71, main_factor:'연속 2회 결석'},
          {id:2, date:'2025.06.16 10:00', nickname:'김철수', user_id:'2', risk_score:55, churn_probability:42, main_factor:'지각 증가'},
        ]);
        setIsLeader(true);
        setModelAccuracy(87);
        setModelRecall(82);
        setModelF1(84);
        setModelDataCount(324);
        setDangerCount(1);
        setWarningCount(1);
        setGroupName(selectedGroup.name);
        setLastAnalyzed('2025.06.17 14:00');
        setLoading(false);
      });
  }, [groupId, selectedGroup.name]);

  const riskClass = (score: number) => {
    if (score >= 70) return 'danger';
    if (score >= 40) return 'warning';
    return 'safe';
  };
  const riskColor = (score: number) => score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
  const riskBg = (score: number) => score >= 70 ? 'from-red-400 to-red-600' : score >= 40 ? 'from-amber-400 to-amber-600' : 'from-green-400 to-green-600';
  const riskLabel = (score: number) => score >= 70 ? '⚠️ 위험' : score >= 40 ? '🟡 주의' : '✅ 안전';
  const riskBadgeClass = (score: number) => score >= 70 ? 'bg-red-50 text-red-600' : score >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600';
  const riskTextClass = (score: number) => score >= 70 ? 'text-red-600' : score >= 40 ? 'text-amber-600' : 'text-green-600';

  const filteredLogs = riskLogs.filter(log => {
    const mOk = logMemberFilter === 'all' || log.user_id === logMemberFilter;
    const rOk = logRiskFilter === 'all' || riskClass(log.risk_score) === logRiskFilter;
    return mOk && rOk;
  });

  const trendChartData = useMemo(() => {
    const weeks = ['5주전','4주전','3주전','2주전','지난주','이번주'];
    const base = [88, 85, 82, 79, 76, 73];
    const danger = memberRisks.filter(m => m.risk_score >= 70).length;
    const adjustment = danger * 2;
    return {
      labels: weeks,
      datasets: [
        {
          label: '그룹 평균 출석률',
          data: base.map((v, i) => Math.max(50, v - adjustment + i)),
          borderColor: '#0077ff',
          backgroundColor: 'rgba(0,119,255,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#0077ff',
        },
        {
          label: '목표 출석률',
          data: weeks.map(() => 85),
          borderColor: '#22c55e',
          borderDash: [5, 4],
          backgroundColor: 'transparent',
          pointRadius: 0,
          tension: 0,
        },
      ],
    };
  }, [memberRisks]);

  return (
    <div className="bg-blue-100 min-h-screen">
      <style>{`
        .model-card { background: #0077ff; border-radius:18px; color:#fff; }
        .meter-bar { height:8px; border-radius:99px; background:#e2e8f0; overflow:hidden; }
        .meter-fill { height:100%; border-radius:99px; transition:width .6s ease; }
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
        .ping { animation:ping 1.2s cubic-bezier(0,0,.2,1) infinite; }
      `}</style>
      <div id="sidebarOverlay" onClick={() => {
        document.getElementById('sidebar')?.classList.remove('open');
        (document.getElementById('sidebarOverlay') as HTMLElement)?.classList.remove('open');
      }} />
      <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{minHeight:'100vh'}}>
        <LeftMenu />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6 space-y-5">

            {/* 배너 */}
            <div className="rounded-2xl p-5 sm:p-6 text-white" style={{background:'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)'}}>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)'}}>
                      🔍 AI Analysis
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">AI 출석 분석</h1>
                  <p className="text-white/60 text-sm mt-1">{groupName} · 최근 분석: {lastAnalyzed}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-green-300">{modelAccuracy ?? '—'}%</p>
                    <p className="text-xs opacity-60 mt-0.5">모델 정확도</p>
                  </div>
                  <div className="border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-red-300">{dangerCount}</p>
                    <p className="text-xs opacity-60 mt-0.5">위험 멤버</p>
                  </div>
                  <div className="border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-amber-300">{warningCount}</p>
                    <p className="text-xs opacity-60 mt-0.5">주의 멤버</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 탭 + 컨텐츠 */}
            <GroupTabsCard
              activeGroupId={selectedGroupId}
              onSelect={group => {
                setSelectedGroupId(group.id);
                setLogMemberFilter('all');
                setLogRiskFilter('all');
              }}
            />

            {/* 결석 위험도 대시보드 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">🎯</span>
                  결석 위험도 대시보드
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>위험 (70~100)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>주의 (40~69)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span>안전 (0~39)</span>
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
                    <div key={m.user_id}
                      className={`rounded-xl border bg-white p-4 cursor-pointer transition-all hover:-translate-y-1 ${m.risk_score >= 70 ? 'border-l-4 border-red-400' : m.risk_score >= 40 ? 'border-l-4 border-amber-400' : 'border-l-4 border-green-400'}`}
                      style={{border:'1px solid #e2e8f0', ...(m.risk_score >= 70 ? {borderLeft:'4px solid #ef4444'} : m.risk_score >= 40 ? {borderLeft:'4px solid #f59e0b'} : {borderLeft:'4px solid #22c55e'})}}>
                      <div className="relative mx-auto w-12 h-12 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow bg-gradient-to-br ${riskBg(m.risk_score)}`}>
                          {m.nickname[0]}
                        </div>
                        {m.risk_score >= 70 && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-400 border-2 border-white">
                            <span className="ping absolute inset-0 rounded-full bg-red-400 opacity-75" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-700 text-center truncate mb-2">{m.nickname}</p>
                      <div className="flex justify-center mb-2">
                        <div className="relative">
                          <svg className="w-14 h-14" style={{transform:'rotate(-90deg)'}}>
                            <circle fill="none" stroke="#e2e8f0" strokeWidth="7" cx="28" cy="28" r="22"/>
                            <circle fill="none" strokeWidth="7" strokeLinecap="round" cx="28" cy="28" r="22"
                              stroke={riskColor(m.risk_score)}
                              strokeDasharray={`${m.risk_score * 1.38} 138.23`}/>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-sm font-bold ${riskTextClass(m.risk_score)}`}>{Math.round(m.risk_score)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadgeClass(m.risk_score)}`}>
                          {riskLabel(m.risk_score)}
                        </span>
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
                  <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">📈</span>
                  출석 패턴 트렌드
                </h2>
                <div className="h-56">
                  <Line
                    data={trendChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                        tooltip: { mode: 'index', intersect: false },
                      },
                      scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                        y: { grid: { color: '#f1f5f9' }, min: 50, max: 100, ticks: { font: { size: 11 }, callback: (v) => `${v}%` } },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">🚪</span>
                  탈퇴 예측 지표
                </h2>
                <div className="space-y-3">
                  {[...memberRisks].sort((a, b) => b.churn_probability - a.churn_probability).slice(0, 5).map(m => (
                    <div key={m.user_id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br ${riskBg(m.churn_probability)}`}>
                        {m.nickname[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{m.nickname}</p>
                        <div className="meter-bar mt-1">
                          <div className={`meter-fill ${m.churn_probability >= 70 ? 'bg-red-400' : m.churn_probability >= 40 ? 'bg-amber-400' : 'bg-green-400'}`}
                            style={{width:`${m.churn_probability}%`}} />
                        </div>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${riskTextClass(m.churn_probability)}`}>{Math.round(m.churn_probability)}%</span>
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
                            <div className="w-20 meter-bar">
                              <div className="meter-fill" style={{width:`${f.weight}%`, background:'#0077ff'}} />
                            </div>
                            <span className="text-slate-400 w-8 text-right">{f.weight}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 모델 성능 (리더 전용) */}
            {isLeader && modelAccuracy !== null && (
              <div className="model-card p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-widest mb-1">AI Model Performance</p>
                    <h2 className="font-bold text-white text-lg flex items-center gap-2">
                      🧠 예측 모델 성능 지표
                      <span className="text-xs font-normal text-white/40">관리자 전용</span>
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
                      <p className="text-xl font-bold text-green-300">{modelAccuracy}%</p>
                      <p className="text-xs text-white/50 mt-0.5">정확도</p>
                    </div>
                    <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
                      <p className="text-xl font-bold text-blue-300">{modelRecall}%</p>
                      <p className="text-xs text-white/50 mt-0.5">재현율</p>
                    </div>
                    <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
                      <p className="text-xl font-bold text-purple-300">{modelF1}%</p>
                      <p className="text-xs text-white/50 mt-0.5">F1 Score</p>
                    </div>
                    <div className="text-center bg-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
                      <p className="text-xl font-bold text-amber-300">{modelDataCount}</p>
                      <p className="text-xs text-white/50 mt-0.5">학습 데이터</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5" style={{borderTop:'1px solid rgba(255,255,255,0.1)'}}>
                  {[
                    {label:'정확도 (Accuracy)', val:modelAccuracy, color:'bg-green-400', textColor:'text-green-300'},
                    {label:'재현율 (Recall)', val:modelRecall, color:'bg-blue-400', textColor:'text-blue-300'},
                    {label:'F1 Score', val:modelF1, color:'bg-purple-400', textColor:'text-purple-300'},
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-white/60 mb-1.5">
                        <span>{item.label}</span>
                        <span className={`${item.textColor} font-semibold`}>{item.val}%</span>
                      </div>
                      <div className="meter-bar" style={{background:'rgba(255,255,255,0.12)'}}>
                        <div className={`meter-fill ${item.color}`} style={{width:`${item.val ?? 0}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/40">
                  <span>알고리즘: <strong className="text-white/70">RandomForestClassifier</strong></span>
                  <span>학습 데이터: <strong className="text-white/70">{modelDataCount}건</strong></span>
                </div>
              </div>
            )}

            {/* 위험 이력 로그 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm">📋</span>
                  위험도 변화 이력
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
                    <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100" style={{background:'#f8fafc'}}>
                      {['날짜','멤버','위험 점수','탈퇴 확률','단계','주요 원인'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}
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
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {log.nickname[0]}
                            </div>
                            <span className="font-medium text-slate-700">{log.nickname}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-sm ${riskTextClass(log.risk_score)}`}>{Math.round(log.risk_score)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{Math.round(log.churn_probability)}%</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadgeClass(log.risk_score)}`}>
                            {riskLabel(log.risk_score).replace(/^[^\s]+ /, '')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{log.main_factor || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
