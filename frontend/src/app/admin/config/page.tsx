'use client';

import { useState } from 'react';

export default function AdminConfigPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'StudyGroupManager',
    max_group_members: '20',
    max_groups_per_user: '5',
    penalty_amount: '5000',
    attendance_deadline: '23:59',
    maintenance_mode: false,
    email_notifications: true,
    auto_penalty: true,
  });

  const handleSave = () => {
    // TODO: API 연동
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">시스템설정</h1>
        <p className="text-sm text-slate-400 mt-0.5">서비스 전체 설정을 관리합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 기본 설정 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <h2 className="font-bold text-slate-800 mb-5">기본 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">서비스 이름</label>
              <input type="text" value={settings.site_name}
                onChange={e=>setSettings({...settings, site_name:e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                style={{background:'#f8fafc'}} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">그룹 최대 인원</label>
              <input type="number" value={settings.max_group_members}
                onChange={e=>setSettings({...settings, max_group_members:e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                style={{background:'#f8fafc'}} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">사용자당 최대 그룹 수</label>
              <input type="number" value={settings.max_groups_per_user}
                onChange={e=>setSettings({...settings, max_groups_per_user:e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                style={{background:'#f8fafc'}} />
            </div>
          </div>
        </div>

        {/* 출석/벌금 설정 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <h2 className="font-bold text-slate-800 mb-5">출석 / 벌금 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">기본 벌금액 (원)</label>
              <input type="number" value={settings.penalty_amount}
                onChange={e=>setSettings({...settings, penalty_amount:e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                style={{background:'#f8fafc'}} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">출석 마감 시간</label>
              <input type="time" value={settings.attendance_deadline}
                onChange={e=>setSettings({...settings, attendance_deadline:e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                style={{background:'#f8fafc'}} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">자동 벌금 부과</label>
              <div className="flex items-center gap-3">
                <label className="relative inline-block" style={{width:'40px', height:'22px'}}>
                  <input type="checkbox" checked={settings.auto_penalty}
                    onChange={e=>setSettings({...settings, auto_penalty:e.target.checked})}
                    className="opacity-0 w-0 h-0 absolute" />
                  <span className="absolute cursor-pointer inset-0 rounded-full transition-all"
                    style={{background: settings.auto_penalty?'#0077ff':'#e2e8f0'}}
                    onClick={()=>setSettings({...settings, auto_penalty:!settings.auto_penalty})}>
                    <span className="absolute w-4 h-4 rounded-full bg-white transition-all"
                      style={{bottom:'3px', left: settings.auto_penalty?'19px':'3px'}}></span>
                  </span>
                </label>
                <span className="text-sm text-slate-600">{settings.auto_penalty ? '활성화' : '비활성화'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 설정 */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
          <h2 className="font-bold text-slate-800 mb-5">시스템 설정</h2>
          <div className="space-y-4">
            {[
              {key:'maintenance_mode' as const, label:'유지보수 모드', desc:'활성화 시 일반 사용자 접근 차단'},
              {key:'email_notifications' as const, label:'이메일 알림', desc:'중요 이벤트 시 이메일 발송'},
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl" style={{background:'#f8fafc'}}>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <span className="relative inline-block cursor-pointer" style={{width:'40px', height:'22px'}}
                  onClick={()=>setSettings({...settings, [item.key]:!settings[item.key]})}>
                  <span className="absolute inset-0 rounded-full transition-all"
                    style={{background: settings[item.key]?'#0077ff':'#e2e8f0'}}>
                    <span className="absolute w-4 h-4 rounded-full bg-white transition-all"
                      style={{bottom:'3px', left: settings[item.key]?'19px':'3px'}}></span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 저장 */}
        <div className="lg:col-span-2 flex justify-end gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            취소
          </button>
          <button onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-colors"
            style={{background: saved ? '#16a34a' : '#111111'}}>
            {saved ? '✓ 저장 완료' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
