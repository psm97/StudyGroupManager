'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const DAU_BASE = [72,68,75,80,77,65,69,83,88,79,71,85,90,87,76,69,74,82,89,84,78,73,81,86,92,88,76,80,85,89];
const DAU_EXT  = [...DAU_BASE, ...DAU_BASE.map(v=>Math.min(100,v+3)), ...DAU_BASE.slice(0,30).map(v=>Math.max(50,v-5))];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'>('30d');

  const dauChartData = useMemo(() => {
    const count = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const values = period === '7d' ? DAU_BASE.slice(-7) : period === '30d' ? DAU_BASE : DAU_EXT;
    const labels = Array.from({length: count}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (count - 1 - i));
      return `${d.getMonth()+1}/${d.getDate()}`;
    });
    return {
      labels,
      datasets: [{
        label: 'DAU',
        data: values.slice(0, count),
        borderColor: '#0077ff',
        backgroundColor: 'rgba(0,119,255,0.07)',
        fill: true,
        tension: 0.4,
        pointRadius: count > 30 ? 2 : 3,
        pointBackgroundColor: '#0077ff',
      }],
    };
  }, [period]);

  const categoryChartData = {
    labels: ['IT/개발', '외국어', '자격증', '취업/면접', '기타'],
    datasets: [{
      data: [35, 22, 18, 15, 10],
      backgroundColor: ['#0077ff','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'],
      borderWidth: 0,
    }],
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">서비스통계</h1>
          <p className="text-sm text-slate-400 mt-0.5">서비스 이용 현황 및 분석</p>
        </div>
        <div className="flex items-center gap-2">
          {([['7d','7일'],['30d','30일'],['90d','90일']] as [typeof period, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setPeriod(key)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all"
              style={{background: period===key?'#111111':'#fff', color: period===key?'#fff':'#64748b', borderColor: period===key?'#111111':'#e2e8f0'}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {label:'DAU (일 활성)', value:'89', change:'+12%', positive:true},
          {label:'신규 가입', value:'24', change:'+5%', positive:true},
          {label:'그룹 생성', value:'8', change:'-2%', positive:false},
          {label:'평균 출석률', value:'84%', change:'+3%', positive:true},
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
            <p className="text-xs text-slate-400 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 mb-1">{s.value}</p>
            <span className="text-xs font-semibold" style={{color: s.positive?'#16a34a':'#dc2626'}}>
              {s.change} 전월 대비
            </span>
          </div>
        ))}
      </div>

      {/* 차트 영역 (플레이스홀더) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <h2 className="font-bold text-slate-800 mb-4">일별 활성 사용자</h2>
          <div className="h-48">
            <Line
              data={dauChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
                  y: { grid: { color: '#f1f5f9' }, beginAtZero: false, ticks: { font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <h2 className="font-bold text-slate-800 mb-4">카테고리별 그룹 분포</h2>
          <div className="h-48 flex items-center justify-center">
            <Doughnut
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
                  tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } },
                },
                cutout: '65%',
              }}
            />
          </div>
        </div>
      </div>

      {/* 상위 그룹 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
        <h2 className="font-bold text-slate-800 mb-4">출석률 상위 그룹</h2>
        <div className="space-y-3">
          {[
            {name:'Web Developer Study', rate:96, members:6},
            {name:'영어 회화 스터디', rate:92, members:5},
            {name:'Python 알고리즘', rate:88, members:8},
            {name:'토익 900+ 스터디', rate:85, members:10},
            {name:'자격증 스터디', rate:80, members:7},
          ].map((g,i) => (
            <div key={g.name} className="flex items-center gap-3">
              <span className="w-5 text-xs text-slate-400 font-bold">{i+1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{g.name}</span>
                  <span className="font-bold text-slate-600">{g.rate}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${g.rate}%`, background:'linear-gradient(135deg,#333333,#555555)'}}></div>
                </div>
              </div>
              <span className="text-xs text-slate-400 w-10 text-right">{g.members}명</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
