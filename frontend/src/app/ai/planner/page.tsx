'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

interface WeekSchedule {
  week_label: string;
  topic: string;
  description: string;
  hours: number;
  difficulty: '상' | '중' | '하';
  materials_count: number;
  completion_rate: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'typing';
  text: string;
}

interface Suggestion {
  text: string;
}

interface ResourceItem {
  title: string;
  type: string;
  difficulty: string;
  description: string;
  keywords: string[];
  url?: string;
}

export default function AIPlannerPage() {
  const searchParams = useSearchParams();
  const initialGroupId = parseInt(searchParams.get('group_id') || '1') || 1;

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [achievementProb, setAchievementProb] = useState(0);
  const [progressRate, setProgressRate] = useState(0);
  const [expectedDate, setExpectedDate] = useState('—');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [schedule, setSchedule] = useState<WeekSchedule[]>([]);
  const [scheduleMeta, setScheduleMeta] = useState('AI가 생성한 주간 일정입니다.');
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'resources'>('schedule');
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const groupId = String(selectedGroupId);
  const selectedGroup = DEFAULT_GROUP_TABS.find(g => g.id === selectedGroupId) || DEFAULT_GROUP_TABS[0];

  useEffect(() => {
    fetch(`/ai/planner/init/?group_id=${groupId}`)
      .then(r => r.json())
      .then(d => {
        setAchievementProb(d.achievement_prob || 0);
        setProgressRate(d.progress_rate || 0);
        setExpectedDate(d.expected_date || '—');
        setDaysRemaining(d.days_remaining || 0);
        setSuggestions((d.ai_suggestions || []).map((s: string) => ({ text: s })));
      })
      .catch(() => {
        setAchievementProb(72);
        setProgressRate(45);
        setExpectedDate('2025.09.30');
        setDaysRemaining(15);
      });
  }, [groupId]);

  const scrollChat = useCallback(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, []);

  const addMessage = useCallback((type: 'user' | 'ai' | 'typing', text: string) => {
    const id = `msg-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { id, type, text }]);
    setTimeout(scrollChat, 50);
    return id;
  }, [scrollChat]);

  const sendChat = async (text?: string) => {
    const msg = text || chatInput.trim();
    if (!msg || isSending) return;
    setChatInput('');
    setIsSending(true);
    addMessage('user', msg);
    const typingId = addMessage('typing', '');
    try {
      const res = await fetch('/ai/planner/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, group_id: groupId }),
      });
      const d = await res.json();
      setMessages(prev => prev.filter(m => m.id !== typingId));
      addMessage('ai', d.message || '일정을 생성했습니다.');
      if (d.schedule?.length > 0) {
        setSchedule(d.schedule);
        setScheduleMeta(d.meta || `AI가 ${d.schedule.length}주 일정을 생성했습니다.`);
        setScheduleVisible(true);
      }
      if (d.resources?.length > 0) setResources(d.resources);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== typingId));
      addMessage('ai', '죄송합니다. 일정 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSending(false);
    }
  };

  const diffClass = (d: string) =>
    d === '상' ? 'bg-red-100 text-red-600' : d === '중' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  const typeIcon: Record<string, string> = { '영상': '🎬', '문서': '📄', '사이트': '🌐', '도서': '📚' };

  const probLabel = achievementProb >= 70 ? '🟢 달성 가능' : achievementProb >= 40 ? '🟡 개선 필요' : '🔴 위험';
  const probBadgeClass = achievementProb >= 70 ? 'bg-emerald-50 text-emerald-700' : achievementProb >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600';

  const suggestIcons = ['🎯', '📅', '👥', '📈', '💪', '🔥'];

  const weeklyChartData = useMemo(() => {
    if (schedule.length > 0) {
      return {
        labels: schedule.map(w => w.week_label),
        datasets: [{
          label: '달성률',
          data: schedule.map(w => w.completion_rate),
          borderColor: '#0077ff',
          backgroundColor: 'rgba(0,119,255,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#0077ff',
        }],
      };
    }
    const mockWeeks = ['1주차','2주차','3주차','4주차','5주차','6주차','7주차','8주차'];
    const mockData = [0, 25, 40, 55, 45, 62, 72, progressRate];
    return {
      labels: mockWeeks,
      datasets: [{
        label: '달성률',
        data: mockData,
        borderColor: '#0077ff',
        backgroundColor: 'rgba(0,119,255,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#0077ff',
      }],
    };
  }, [schedule, progressRate]);

  return (
    <div className="bg-blue-100 min-h-screen">
      <style>{`
        :root { --bg-body:#dbeafe; --bg-main:#f8fafc; --bg-card:#ffffff; --border-card:#e2e8f0; --text-primary:#1e293b; --text-secondary:#64748b; --text-muted:#94a3b8; }
        html[data-theme="dark"] { --bg-body:#0c1120; --bg-main:#1e293b; --bg-card:#1e293b; --border-card:#334155; --text-primary:#f1f5f9; --text-secondary:#94a3b8; --text-muted:#64748b; }
        body { background: var(--bg-body); color: var(--text-primary); }
        .bubble-user { background:#0077ff; color:#fff; border-radius:18px 18px 4px 18px; padding:10px 16px; max-width:80%; align-self:flex-end; font-size:14px; }
        .bubble-ai { background:var(--bg-card); border:1px solid var(--border-card); border-radius:18px 18px 18px 4px; padding:12px 16px; max-width:85%; align-self:flex-start; font-size:14px; box-shadow:0 2px 8px rgba(0,0,0,.06); color:var(--text-primary); }
        .suggest-chip { display:inline-flex; align-items:center; gap:4px; background:#eef3ff; border:1px solid #bacefc; color:#0077ff; border-radius:99px; padding:5px 12px; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; }
        .suggest-chip:hover { background:#dce6fd; border-color:#88a8f8; }
        .mbar { height:7px; border-radius:99px; background:#e2e8f0; overflow:hidden; }
        .mbar-fill { height:100%; border-radius:99px; transition:width .6s ease; }
        @keyframes blink { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
        .typing-dot { display:inline-block; width:6px; height:6px; background:#94a3b8; border-radius:50%; margin:0 2px; animation:blink 1.2s infinite; }
        button:not(:disabled) { cursor: pointer; }
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
                      ⏱ AI Planner
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">AI 플래너</h1>
                  <p className="text-white/60 text-sm mt-1">{selectedGroup.name} · 목표 달성 예측 및 최적 스터디 일정 생성</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-blue-200">{achievementProb}%</p>
                    <p className="text-xs opacity-60 mt-0.5">달성 확률</p>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-yellow-200">{expectedDate}</p>
                    <p className="text-xs opacity-60 mt-0.5">예상 완료일</p>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                    <p className="text-lg font-bold text-white">{progressRate}%</p>
                    <p className="text-xs opacity-60 mt-0.5">진행률</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 탭 + 컨텐츠 */}
            <GroupTabsCard
              activeGroupId={selectedGroupId}
              onSelect={group => {
                setSelectedGroupId(group.id);
                setActiveTab('schedule');
                setScheduleVisible(false);
                setMessages([]);
              }}
            />

            {/* 달성 확률 + AI 제안 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Arc 카드 */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">목표 달성 확률</p>
                <div className="relative mb-4">
                  <svg className="w-36 h-36" style={{transform:'rotate(-90deg)'}}>
                    <circle fill="none" stroke="#e2e8f0" strokeWidth="10" cx="72" cy="72" r="58"/>
                    <circle fill="none" strokeWidth="10" strokeLinecap="round" cx="72" cy="72" r="58"
                      stroke="#0077ff"
                      strokeDasharray={`${achievementProb * 3.64} 364`}
                      style={{transition:'stroke-dashoffset .9s ease'}}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{color:'#0077ff'}}>{achievementProb}%</span>
                    <span className="text-xs text-slate-400 mt-0.5">달성 가능성</span>
                  </div>
                </div>
                <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${probBadgeClass}`}>{probLabel}</span>
                <div className="w-full mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>예상 완료일</span><span className="font-bold text-slate-700">{expectedDate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>목표 기간 대비</span>
                    <span className={`font-bold ${daysRemaining > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {daysRemaining > 0 ? `D-${daysRemaining}` : '기간 초과'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>현재 진행률</span><span className="font-bold" style={{color:'#0077ff'}}>{progressRate}%</span>
                  </div>
                </div>
              </div>

              {/* AI 제안 + 차트 자리 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">💡</span>
                    AI 개선 제안
                    <span className="text-xs font-normal text-slate-400 ml-1">GPT-4o 생성</span>
                  </h2>
                  <div className="space-y-2">
                    {suggestions.length > 0 ? suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="mt-0.5 flex-shrink-0" style={{color:'#0077ff'}}>{suggestIcons[i] || '💡'}</span>
                        <p className="text-sm text-slate-700 leading-relaxed">{s.text}</p>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-slate-400 text-sm">
                        <p>아직 개선 제안이 없습니다.</p>
                        <p className="text-xs mt-1">예측 갱신을 실행하면 AI가 제안을 생성합니다.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h2 className="font-bold text-slate-800 mb-4">주차별 성과 추이</h2>
                  <div className="h-44">
                    <Line
                      data={weeklyChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: { callbacks: { label: (ctx) => ` 달성률: ${ctx.parsed.y}%` } },
                        },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                          y: { grid: { color: '#f1f5f9' }, min: 0, max: 100, ticks: { font: { size: 11 }, callback: (v) => `${v}%` } },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 챗봇 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">🤖</span>
                  AI 스터디 플래너 챗봇
                  <span className="text-xs font-normal text-slate-400">목표를 입력하면 최적 일정을 생성합니다</span>
                </h2>
                <button onClick={() => setMessages([])} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">초기화</button>
              </div>
              <div ref={chatRef} className="flex flex-col gap-3 p-5 overflow-y-auto" style={{maxHeight:'320px', minHeight:'200px'}}>
                {/* 웰컴 메시지 */}
                <div className="bubble-ai">
                  안녕하세요! 👋 AI 스터디 플래너입니다.<br/>
                  <strong>학습 목표, 준비 기간, 주간 가용 시간</strong>을 알려주시면 최적의 스터디 일정을 만들어 드립니다.
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button className="suggest-chip" onClick={() => sendChat('토익 900점, 3개월, 주 10시간')}>토익 900점 준비</button>
                    <button className="suggest-chip" onClick={() => sendChat('정보처리기사 합격, 2개월, 주 15시간')}>정처기 합격</button>
                    <button className="suggest-chip" onClick={() => sendChat('파이썬 기초 완성, 1개월, 주 8시간')}>파이썬 기초</button>
                  </div>
                </div>
                {messages.map(m => (
                  <div key={m.id} className={m.type === 'user' ? 'bubble-user' : 'bubble-ai'}>
                    {m.type === 'typing'
                      ? <><span className="typing-dot" /><span className="typing-dot" style={{animationDelay:'.2s'}} /><span className="typing-dot" style={{animationDelay:'.4s'}} /></>
                      : m.text}
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} rows={1}
                    placeholder="목표, 기간, 주간 시간을 입력하세요 (예: 토익 900점, 3개월, 주 10시간)"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    style={{maxHeight:'120px', background:'#f8fafc'}} />
                  <button onClick={() => sendChat()} disabled={isSending}
                    className="flex-shrink-0 w-10 h-10 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm self-end"
                    style={{background:'#0077ff'}}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Shift+Enter로 줄바꿈, Enter로 전송</p>
              </div>
            </div>

            {/* 생성된 일정 */}
            {scheduleVisible && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 flex">
                  {(['schedule', 'resources'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className="flex-shrink-0 px-5 sm:px-6 py-4 text-sm transition-colors"
                      style={{
                        color: activeTab === tab ? '#0077ff' : '#64748b',
                        borderBottom: activeTab === tab ? '2.5px solid #0077ff' : '2px solid transparent',
                        fontWeight: activeTab === tab ? 700 : 400,
                      }}>
                      {tab === 'schedule' ? '📅 생성된 일정' : '📚 학습 자료 추천'}
                    </button>
                  ))}
                </div>
                {activeTab === 'schedule' && (
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-bold text-slate-800">생성된 스터디 일정</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{scheduleMeta}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {schedule.map((w, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4" style={{transition:'transform .18s ease'}}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50" style={{color:'#0077ff'}}>{w.week_label}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffClass(w.difficulty)}`}>난이도 {w.difficulty}</span>
                          </div>
                          <p className="font-bold text-slate-800 text-sm mb-1.5">{w.topic}</p>
                          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{w.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>⏱ {w.hours}시간</span>
                            <span>📎 {w.materials_count}개 자료</span>
                          </div>
                          <div className="mt-3 mbar">
                            <div className="mbar-fill" style={{width:`${w.completion_rate}%`, background:'#0077ff'}} />
                          </div>
                          <p className="text-right text-xs text-slate-400 mt-1">달성 {w.completion_rate}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'resources' && (
                  <div className="p-5 sm:p-6">
                    <h2 className="font-bold text-slate-800 mb-4">AI 학습 자료 추천</h2>
                    {resources.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-sm">
                        <p className="text-2xl mb-2">📚</p>
                        <p>일정이 생성되면 AI가 자료를 추천합니다.</p>
                      </div>
                    ) : resources.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-3 hover:border-blue-200 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                          {typeIcon[item.type] || '🔗'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{item.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${diffClass(item.difficulty)}`}>{item.difficulty}</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.keywords.map(k => (
                              <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100" style={{color:'#0077ff'}}>#{k}</span>
                            ))}
                          </div>
                        </div>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noreferrer"
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
