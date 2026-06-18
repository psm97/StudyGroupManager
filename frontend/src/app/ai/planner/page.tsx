'use client';

import { useState, useRef } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const groupTabs = [{ id: 1, name: 'Web Developer Study' }, { id: 2, name: 'Python 스터디' }];

const schedule = [
  { week: 1, topic: 'React 기초', description: '컴포넌트, Props, State 마스터', hours: 8, difficulty: '입문', color: '#10b981', resources: 3, progress: 100 },
  { week: 2, topic: 'React Hooks', description: 'useState, useEffect, 커스텀 훅', hours: 10, difficulty: '초급', color: '#1258fc', resources: 4, progress: 60 },
  { week: 3, topic: '상태 관리', description: 'Redux, Context API, Zustand', hours: 12, difficulty: '중급', color: '#f59e0b', resources: 5, progress: 0 },
  { week: 4, topic: '실전 프로젝트', description: '포트폴리오 프로젝트 완성', hours: 16, difficulty: '중급', color: '#8b5cf6', resources: 2, progress: 0 },
];

const chips = ['📅 학습 일정 생성', '📊 진도 확인', '📚 자료 추천', '⚡ 약점 분석'];

type Message = { role: 'ai' | 'user'; text: string };

const initMessages: Message[] = [
  { role: 'ai', text: '안녕하세요! AI 플래너입니다 🤖\n오늘 어떤 도움이 필요하신가요?' },
  { role: 'user', text: 'React 공부 계획을 세워줘' },
  { role: 'ai', text: 'React 학습 계획을 세워드리겠습니다! 📋\n\n**1주차:** React 기초 (컴포넌트, Props, State)\n**2주차:** 생명주기, Hooks (useState, useEffect)\n**3주차:** 상태관리 (Redux, Context)\n**4주차:** 실전 프로젝트\n\n일 2시간씩 투자하면 4주 안에 충분히 가능합니다! 💪' },
];

const progressData = {
  datasets: [{ data: [42, 58], backgroundColor: ['#1258fc', '#e2e8f0'], borderWidth: 0 }],
};
const progressOptions = { responsive: true, plugins: { legend: { display: false } }, cutout: '75%' };

const perfData = {
  labels: ['1주', '2주', '3주', '4주', '5주', '6주'],
  datasets: [{ label: '달성률(%)', data: [65, 70, 68, 75, 80, 78], borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#7c3aed', pointRadius: 4 }],
};
const perfOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } };

export default function PlannerPage() {
  const [activeGroupId, setActiveGroupId] = useState(1);
  const [scheduleTab, setScheduleTab] = useState<'schedule' | 'resources'>('schedule');
  const [messages, setMessages] = useState<Message[]>(initMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: `"${userMsg}"에 대해 분석했습니다. 현재 학습 진행률을 고려할 때, 해당 부분의 학습 시간을 20% 늘리는 것을 권장합니다. 구체적인 자료가 필요하시면 📚 자료 추천을 눌러주세요!` }]);
    setTimeout(() => chatRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 100);
  };

  const difficultyStyle = (d: string) => ({ '입문': { bg: '#dcfce7', color: '#16a34a' }, '초급': { bg: '#dce6fd', color: '#1258fc' }, '중급': { bg: '#fef3c7', color: '#d97706' }, '고급': { bg: '#fee2e2', color: '#dc2626' } }[d] || { bg: '#f1f5f9', color: '#64748b' });

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
                <h2 className="text-xl font-bold mb-1">AI 스터디 플래너 🤖</h2>
                <p className="text-purple-100 text-sm">AI가 맞춤형 학습 계획을 생성하고 최적화해드립니다</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-white/20 text-xs px-3 py-1.5 rounded-full font-semibold">달성 확률 78%</span>
                <span className="bg-white/20 text-xs px-3 py-1.5 rounded-full font-semibold">예상 완료 2026-08-15</span>
                <span className="bg-white/20 text-xs px-3 py-1.5 rounded-full font-semibold">진행률 42%</span>
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

          {/* 진행률 + 제안 + 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 진행률 도넛 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center">
              <h3 className="font-bold text-slate-800 mb-4 self-start">학습 진행률</h3>
              <div className="relative w-36 h-36">
                <Doughnut data={progressData} options={progressOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">42%</span>
                  <span className="text-xs text-slate-400">완료</span>
                </div>
              </div>
              <div className="mt-4 space-y-2 w-full">
                {[['달성 확률', '78%', '#16a34a'], ['예상 완료', '08/15', '#1258fc'], ['남은 일수', '58일', '#d97706']].map(([l, v, c], i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-400">{l}</span>
                    <span className="font-bold" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 제안 + 성과 차트 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-3">AI 제안 💡</h3>
                <div className="space-y-2">
                  {[
                    { emoji: '📚', text: 'React 심화 학습 자료 3개를 추가하는 것을 권장합니다' },
                    { emoji: '⏰', text: '주 3회 → 주 4회로 학습 빈도를 늘리면 목표 달성 확률이 15% 향상됩니다' },
                    { emoji: '🎯', text: '현재 TypeScript 이해도가 낮습니다. 집중 학습이 필요합니다' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(18,88,252,0.04)' }}>
                      <span className="text-lg flex-shrink-0">{s.emoji}</span>
                      <p className="text-sm text-slate-700">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-3">주간 달성률</h3>
                <Line data={perfData} options={perfOptions} />
              </div>
            </div>
          </div>

          {/* AI 챗봇 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#1258fc)' }}>AI</div>
              <h3 className="font-bold text-slate-800">AI 플래너 채팅</h3>
              <span className="ml-auto text-xs text-green-500 font-semibold">● 온라인</span>
            </div>
            <div ref={chatRef} className="h-56 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm`}
                    style={m.role === 'user'
                      ? { background: '#1258fc', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: '#f8fafc', color: '#334155', borderBottomLeftRadius: 4, border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-4 py-3 flex gap-1">
                    {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 px-3 py-2 border-t border-slate-50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {chips.map((c, i) => (
                <button key={i} onClick={() => setInput(c.replace(/^[^\s]+ /, ''))}
                  className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap hover:bg-blue-100 transition-colors flex-shrink-0">
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="AI 플래너에게 질문하세요..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors" />
              <button onClick={sendMessage} className="bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>

          {/* 생성된 일정 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              {(['schedule', 'resources'] as const).map(t => (
                <button key={t} onClick={() => setScheduleTab(t)}
                  className={`px-5 py-3.5 text-sm font-medium border-b-2 -mb-px ${scheduleTab === t ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'}`}>
                  {t === 'schedule' ? '📅 학습 일정' : '📚 자료 목록'}
                </button>
              ))}
            </div>
            <div className="p-5">
              {scheduleTab === 'schedule' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schedule.map(s => {
                    const ds = difficultyStyle(s.difficulty);
                    return (
                      <div key={s.week} className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400">Week {s.week}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={ds}>{s.difficulty}</span>
                        </div>
                        <p className="font-bold text-slate-800 mb-0.5">{s.topic}</p>
                        <p className="text-xs text-slate-500 mb-3">{s.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                          <span>⏱ {s.hours}시간</span>
                          <span>📚 자료 {s.resources}개</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${s.progress}%`, background: s.color }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: s.color }}>{s.progress}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { title: 'React 공식 문서', type: '공식문서', difficulty: '초급', url: '#', desc: 'React의 핵심 개념을 공식 문서로 학습합니다' },
                    { title: 'Hooks 완벽 가이드', type: '아티클', difficulty: '중급', url: '#', desc: 'Dan Abramov의 useEffect 완벽 가이드' },
                    { title: 'Redux Toolkit 튜토리얼', type: '튜토리얼', difficulty: '중급', url: '#', desc: 'Redux Toolkit을 사용한 상태 관리' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#dce6fd' }}>📄</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm text-slate-800">{r.title}</p>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{r.type}</span>
                        </div>
                        <p className="text-xs text-slate-400">{r.desc}</p>
                      </div>
                      <a href={r.url} className="text-blue-500 hover:text-blue-700 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
