'use client';

import { useEffect, useState } from 'react';

/* TODO: CDN 스크립트 → npm 패키지로 교체 필요 (Chart.js, SweetAlert2) */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({total_users:0, total_groups:0, active_users:0, reports:0});

  useEffect(() => {
    fetch('/admin/api/dashboard/')
      .then(r=>r.json())
      .then(data => setStats(data.data || data))
      .catch(() => setStats({total_users:128, total_groups:24, active_users:89, reports:3}));
  }, []);

  const kpiCards = [
    {label:'총 회원수', value: stats.total_users, unit:'명', color:'#1d4ed8', bg:'#dbeafe', icon:'👥'},
    {label:'총 그룹수', value: stats.total_groups, unit:'개', color:'#16a34a', bg:'#dcfce7', icon:'📚'},
    {label:'활성 사용자', value: stats.active_users, unit:'명', color:'#d97706', bg:'#fef3c7', icon:'⚡'},
    {label:'신고 건수', value: stats.reports, unit:'건', color:'#dc2626', bg:'#fee2e2', icon:'🚨'},
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">대시보드</h1>
        <p className="text-sm text-slate-400 mt-0.5">StudyGroupManager 서비스 현황</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 transition-all hover:-translate-y-0.5"
            style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:card.bg}}>
                <div className="w-3 h-3 rounded-full" style={{background:card.color}}></div>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{color:card.color}}>{card.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{card.label} <span className="text-xs text-slate-400">({card.unit})</span></p>
          </div>
        ))}
      </div>

      {/* 차트 / 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* 최근 가입 회원 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <h2 className="font-bold text-slate-800 mb-4">최근 가입 회원</h2>
          <div className="space-y-3">
            {[
              {name:'홍길동', email:'hong@example.com', date:'2025.06.17'},
              {name:'김철수', email:'kim@example.com', date:'2025.06.16'},
              {name:'이영희', email:'lee@example.com', date:'2025.06.15'},
            ].map(u => (
              <div key={u.email} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{background:'linear-gradient(135deg,#333333,#555555)'}}>{u.name[0]}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className="text-xs text-slate-400">{u.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 신고 현황 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">최근 신고</h2>
            <a href="/admin/report" className="text-xs font-semibold hover:underline" style={{color:'#1d4ed8'}}>전체 보기</a>
          </div>
          <div className="space-y-3">
            {[
              {title:'부적절한 언행', type:'행동 신고', status:'처리 중', badgeColor:'#fef3c7', textColor:'#d97706'},
              {title:'스팸 게시물', type:'콘텐츠 신고', status:'처리 완료', badgeColor:'#dcfce7', textColor:'#16a34a'},
              {title:'허위 정보 유포', type:'콘텐츠 신고', status:'검토 중', badgeColor:'#fee2e2', textColor:'#dc2626'},
            ].map((r,i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">{r.title}</p>
                  <p className="text-xs text-slate-400">{r.type}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{background:r.badgeColor, color:r.textColor}}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 시스템 상태 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
        <h2 className="font-bold text-slate-800 mb-4">시스템 상태</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:'DB 상태', value:'정상', color:'#16a34a', bg:'#dcfce7'},
            {label:'서버 응답', value:'정상', color:'#16a34a', bg:'#dcfce7'},
            {label:'API 오류율', value:'0.1%', color:'#d97706', bg:'#fef3c7'},
            {label:'디스크 사용', value:'42%', color:'#1d4ed8', bg:'#dbeafe'},
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{background:s.bg}}>
              <p className="text-lg font-bold mb-1" style={{color:s.color}}>{s.value}</p>
              <p className="text-xs" style={{color:s.color}}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
