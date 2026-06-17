'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

/* TODO: CDN 스크립트 → npm 패키지로 교체 필요 (Chart.js) */

interface Report {
  id: number;
  year: number;
  month: number;
  status: 'done' | 'pending' | 'generating';
  avg_attendance: number;
  session_count: number;
  total_penalty: number;
  created_at: string;
  ai_insight?: string;
  total_late?: number;
  total_absent?: number;
  paid_penalty?: number;
  unpaid_penalty?: number;
  paid_rate?: number;
  penalty_count?: number;
  paid_count?: number;
  key_findings?: { type: 'positive' | 'negative' | 'info'; text: string }[];
  member_performance?: MemberPerf[];
  penalty_members?: PenaltyMember[];
}

interface MemberPerf {
  nickname: string;
  attendance_rate: number;
  late_count: number;
  absent_count: number;
  penalty: number;
  contribution: number;
  improvement_item?: string;
}

interface PenaltyMember {
  nickname: string;
  total: number;
  paid: number;
  unpaid: number;
  paid_rate: number;
}

export default function AIMonthlyReportPage() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group_id') || '1';
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [activeRTab, setActiveRTab] = useState<'attendance' | 'penalty' | 'insight' | 'member'>('attendance');
  const [groupName, setGroupName] = useState('');
  const [nextReportDate, setNextReportDate] = useState('—');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/ai/monthly-report/?group_id=${groupId}`)
      .then(r => r.json())
      .then(d => {
        setReports(d.reports || []);
        setCurrentReport(d.current_report || (d.reports?.[0] ?? null));
        setIsLeader(d.is_leader || false);
        setGroupName(d.group_name || '');
        setNextReportDate(d.next_report_date || '—');
        setLoading(false);
      })
      .catch(() => {
        const mock: Report[] = [
          {id:1, year:2025, month:6, status:'done', avg_attendance:88, session_count:8, total_penalty:15000, created_at:'2025.06.30',
           ai_insight:'전반적으로 출석률이 양호합니다. 특히 이번 달은 목표 대비 높은 참여율을 보여주었습니다.',
           total_late:3, total_absent:2, paid_penalty:10000, unpaid_penalty:5000, paid_rate:67,
           key_findings:[
             {type:'positive', text:'출석률이 전월 대비 5% 향상되었습니다.'},
             {type:'negative', text:'2명의 멤버가 연속 결석 위험에 있습니다.'},
           ],
           member_performance:[
             {nickname:'홍길동', attendance_rate:95, late_count:0, absent_count:0, penalty:0, contribution:92},
             {nickname:'김철수', attendance_rate:80, late_count:1, absent_count:1, penalty:5000, contribution:75, improvement_item:'출석 개선 필요'},
           ],
           penalty_members:[
             {nickname:'홍길동', total:0, paid:0, unpaid:0, paid_rate:100},
             {nickname:'김철수', total:5000, paid:3000, unpaid:2000, paid_rate:60},
           ],
          },
        ];
        setReports(mock);
        setCurrentReport(mock[0]);
        setIsLeader(true);
        setGroupName('Web Developer Study');
        setLoading(false);
      });
  }, [groupId]);

  const selectReport = async (id: number) => {
    try {
      const res = await fetch(`/ai/monthly-report/${id}/`);
      const d = await res.json();
      setCurrentReport(d);
    } catch { /* keep current */ }
  };

  const statusBadge = (s: string) => {
    if (s === 'done') return { bg: '#dce6fd', color: '#1258fc', text: '완료' };
    if (s === 'pending') return { bg: '#fef3c7', color: '#b45309', text: '대기' };
    return { bg: '#f0fdf4', color: '#15803d', text: '생성중' };
  };

  const medalIcon = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return String(i + 1);
  };

  const findingStyle = (type: string) => {
    if (type === 'positive') return { bg: 'bg-green-50', border: 'border-green-100', icon: '✅' };
    if (type === 'negative') return { bg: 'bg-red-50', border: 'border-red-100', icon: '⚠️' };
    return { bg: 'bg-blue-50', border: 'border-blue-100', icon: '💡' };
  };

  const rTabLabels = [
    { key: 'attendance' as const, label: '📋 출석 통계' },
    { key: 'penalty' as const, label: '💰 벌금 정산' },
    { key: 'insight' as const, label: '🤖 AI 인사이트' },
    { key: 'member' as const, label: '👥 멤버 성과' },
  ];

  return (
    <div className="bg-blue-100 min-h-screen">
      <div id="sidebarOverlay" onClick={() => {
        document.getElementById('sidebar')?.classList.remove('open');
        (document.getElementById('sidebarOverlay') as HTMLElement)?.classList.remove('open');
      }} />
      <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{minHeight:'100vh'}}>
        <LeftMenu />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6">

            {/* 배너 */}
            <div className="rounded-2xl p-5 sm:p-6 text-white mb-5" style={{background:'linear-gradient(135deg,#0d52f3 0%,#286af8 55%,#3a74ef 100%)'}}>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold" style={{background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)'}}>
                      📊 Monthly Report
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">AI 월간 보고서</h1>
                  <p className="text-white/60 text-sm mt-1">{groupName} · 총 {reports.length}개 리포트</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
                    <p className="text-sm font-bold text-blue-200">{nextReportDate}</p>
                    <p className="text-xs opacity-60 mt-0.5">다음 자동 생성</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="flex flex-col lg:flex-row gap-5">
              {/* 리포트 목록 */}
              <div className="lg:w-72 flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-700 text-sm">리포트 목록</h2>
                  <span className="text-xs text-slate-400">{reports.length}개</span>
                </div>
                {loading ? (
                  <div className="bg-white rounded-2xl border border-slate-100 text-center py-8 text-slate-400 text-sm">로딩 중...</div>
                ) : reports.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 text-center py-10 px-4">
                    <p className="text-2xl mb-2">📊</p>
                    <p className="text-sm font-semibold text-slate-500 mb-1">생성된 리포트 없음</p>
                    <p className="text-xs text-slate-400">매월 말일 자동 생성되거나<br/>직접 생성할 수 있습니다.</p>
                  </div>
                ) : reports.map((r, idx) => {
                  const badge = statusBadge(r.status);
                  return (
                    <div key={r.id} onClick={() => { selectReport(r.id); setCurrentReport(r); }}
                      className={`rounded-2xl border p-4 cursor-pointer transition-all ${idx === 0 && currentReport?.id === r.id ? 'border-blue-500' : 'border-slate-200'}`}
                      style={{background:'#fff', transition:'transform .18s ease, box-shadow .18s ease, border-color .18s ease'}}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{r.year}년 {r.month}월</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">{r.created_at} 생성</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{background:badge.bg, color:badge.color}}>{badge.text}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{r.avg_attendance}%</p>
                          <p className="text-xs text-slate-400">출석률</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{r.session_count}회</p>
                          <p className="text-xs text-slate-400">세션</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-red-500">{r.total_penalty.toLocaleString()}원</p>
                          <p className="text-xs text-slate-400">벌금</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 리포트 미리보기 */}
              <div className="flex-1 min-w-0">
                {currentReport ? (
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:'0 4px 24px rgba(0,0,0,.06)'}}>
                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">{currentReport.year}년 {currentReport.month}월 리포트</h2>
                          <p className="text-xs text-slate-400 mt-0.5">{currentReport.created_at} 생성 · {groupName}</p>
                        </div>
                      </div>
                      <div className="flex gap-0 mt-4 border-b border-slate-100 overflow-x-auto">
                        {rTabLabels.map(t => (
                          <button key={t.key} onClick={() => setActiveRTab(t.key)}
                            className="flex-shrink-0 px-4 py-2.5 text-sm text-slate-500 hover:text-blue-600 transition-colors border-b-2"
                            style={{
                              color: activeRTab === t.key ? '#1258fc' : '#64748b',
                              borderBottomColor: activeRTab === t.key ? '#1258fc' : 'transparent',
                              fontWeight: activeRTab === t.key ? 700 : 400,
                            }}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 출석 통계 */}
                    {activeRTab === 'attendance' && (
                      <div className="p-5 sm:p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                          <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                            <p className="text-xs text-blue-400 font-semibold mb-1">평균 출석률</p>
                            <p className="text-2xl font-bold" style={{color:'#1258fc'}}>{currentReport.avg_attendance}%</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                            <p className="text-xs text-slate-400 font-semibold mb-1">총 세션</p>
                            <p className="text-2xl font-bold text-slate-700">{currentReport.session_count}회</p>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                            <p className="text-xs text-amber-400 font-semibold mb-1">누적 지각</p>
                            <p className="text-2xl font-bold text-amber-700">{currentReport.total_late ?? 0}회</p>
                          </div>
                          <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                            <p className="text-xs text-red-400 font-semibold mb-1">누적 결석</p>
                            <p className="text-2xl font-bold text-red-600">{currentReport.total_absent ?? 0}회</p>
                          </div>
                        </div>
                        {/* TODO: 세션별 출석률 차트 (Chart.js → recharts 교체 예정) */}
                        <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                          <p className="text-sm text-slate-400">출석률 차트 영역 (npm 패키지로 교체 예정)</p>
                        </div>
                      </div>
                    )}

                    {/* 벌금 정산 */}
                    {activeRTab === 'penalty' && (
                      <div className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                            <p className="text-xs text-red-400 font-semibold mb-1">총 발생</p>
                            <p className="text-2xl font-bold text-red-600">{(currentReport.total_penalty ?? 0).toLocaleString()}원</p>
                            <p className="text-xs text-slate-400 mt-1">{currentReport.penalty_count ?? 0}건</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <p className="text-xs text-green-400 font-semibold mb-1">납부 완료</p>
                            <p className="text-2xl font-bold text-green-600">{(currentReport.paid_penalty ?? 0).toLocaleString()}원</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-xs text-slate-400 font-semibold mb-1">미납</p>
                            <p className="text-2xl font-bold text-slate-700">{(currentReport.unpaid_penalty ?? 0).toLocaleString()}원</p>
                            <p className="text-xs text-slate-400 mt-1">납부율 <strong>{currentReport.paid_rate ?? 0}%</strong></p>
                          </div>
                        </div>
                        {currentReport.penalty_members && currentReport.penalty_members.length > 0 && (
                          <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100" style={{background:'#f8fafc'}}>
                                  {['멤버','발생','납부','미납','납부율'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {currentReport.penalty_members.map((m, i) => (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                          {m.nickname[0]}
                                        </div>
                                        <span className="font-medium text-slate-700 text-sm">{m.nickname}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-700">{m.total.toLocaleString()}원</td>
                                    <td className="px-4 py-3 text-right text-green-600 font-semibold">{m.paid.toLocaleString()}원</td>
                                    <td className="px-4 py-3 text-right text-red-500 font-semibold">{m.unpaid.toLocaleString()}원</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                          <div className="h-full rounded-full" style={{width:`${m.paid_rate}%`, background:'#1258fc'}} />
                                        </div>
                                        <span className="text-xs font-bold w-8 text-right" style={{color:'#1258fc'}}>{m.paid_rate}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI 인사이트 */}
                    {activeRTab === 'insight' && (
                      <div className="p-5 sm:p-6">
                        <div className="rounded-2xl p-5 mb-5" style={{background:'linear-gradient(135deg,#0d44c4,#1258fc)'}}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🤖</span>
                            <p className="text-sm font-bold text-white/90">AI 종합 평가</p>
                            <span className="text-xs text-white/40 ml-auto">GPT-4o 생성</span>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed">
                            {currentReport.ai_insight || 'AI 인사이트를 불러오는 중...'}
                          </p>
                        </div>
                        <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs">🔍</span>
                          주요 발견 사항
                        </h3>
                        <div className="space-y-2.5">
                          {(currentReport.key_findings || []).map((f, i) => {
                            const fs = findingStyle(f.type);
                            return (
                              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${fs.bg} ${fs.border}`}>
                                <span className="flex-shrink-0 text-base mt-0.5">{fs.icon}</span>
                                <p className="text-sm text-slate-700 leading-relaxed">{f.text}</p>
                              </div>
                            );
                          })}
                          {(!currentReport.key_findings || currentReport.key_findings.length === 0) && (
                            <div className="text-center py-6 text-slate-400 text-sm">분석 데이터가 없습니다.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 멤버 성과 */}
                    {activeRTab === 'member' && (
                      <div className="p-5 sm:p-6">
                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100" style={{background:'#f8fafc'}}>
                                {['순위','멤버','출석률','지각','결석','벌금','기여도','개선 항목'].map(h => (
                                  <th key={h} className="px-4 py-3 text-center">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {(currentReport.member_performance || []).map((m, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 text-center">{medalIcon(i)}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                        {m.nickname[0]}
                                      </div>
                                      <span className="font-semibold text-slate-800 text-sm">{m.nickname}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`font-bold text-sm ${m.attendance_rate >= 80 ? 'text-green-600' : m.attendance_rate >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                                      {m.attendance_rate}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-slate-500">{m.late_count}</td>
                                  <td className="px-4 py-3 text-center text-slate-500">{m.absent_count}</td>
                                  <td className="px-4 py-3 text-right text-slate-600 font-semibold">{m.penalty.toLocaleString()}원</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.contribution >= 80 ? 'bg-green-50 text-green-700' : m.contribution >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                                      {m.contribution}점
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-xs text-slate-500">{m.improvement_item || '—'}</td>
                                </tr>
                              ))}
                              {(!currentReport.member_performance || currentReport.member_performance.length === 0) && (
                                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">데이터 없음</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center" style={{boxShadow:'0 4px 24px rgba(0,0,0,.06)'}}>
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="font-bold text-slate-700 text-lg mb-2">아직 생성된 리포트가 없습니다</h3>
                    <p className="text-slate-400 text-sm">매월 말일 자동으로 생성되거나, 직접 생성 버튼을 눌러 만들 수 있습니다.</p>
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
