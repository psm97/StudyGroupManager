'use client';

import { useEffect, useState } from 'react';

/* TODO: CDN 스크립트 → npm 패키지로 교체 필요 (Chart.js) */

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'>('30d');

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
          {/* TODO: CDN 스크립트 → npm 패키지로 교체 필요 (Chart.js recharts 등) */}
          <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
            <p className="text-sm text-slate-400">Chart.js 차트 (recharts 등 npm 패키지로 교체 예정)</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <h2 className="font-bold text-slate-800 mb-4">카테고리별 그룹 분포</h2>
          <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
            <p className="text-sm text-slate-400">차트 영역 (npm 패키지로 교체 예정)</p>
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
