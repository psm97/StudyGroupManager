'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProfilePage() {
  const router = useRouter();
  const [sysInfo] = useState({
    admin_id: 'admin',
    python_version: '3.11.x',
    django_version: '4.2.x',
    debug_mode: false,
    time_zone: 'Asia/Seoul',
    allowed_hosts: 'localhost, 127.0.0.1',
  });

  const handleShowPasswordInfo = () => {
    alert(
      '비밀번호 변경 방법:\n\n' +
      '변경 방법:\nadmin/views.py → _ADMIN_PW = \'새비밀번호\'\n\n' +
      '운영 환경 권장 방식:\nimport os\n_ADMIN_PW = os.environ.get(\'ADMIN_PW\', \'기본값\')'
    );
  };

  const handleLogout = async () => {
    try {
      await fetch('/admin/api/logout/', { method: 'POST' });
    } catch (_) {}
    router.push('/accounts/login');
  };

  return (
    <div className="max-w-3xl">

      {/* 배너 */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{background:'linear-gradient(135deg,#111111,#333333)', padding:'24px 28px'}}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{background:'rgba(255,255,255,.12)', backdropFilter:'blur(4px)'}}>
            {sysInfo.admin_id[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">관리자 정보</h1>
            <p className="text-sm mt-0.5" style={{color:'rgba(255,255,255,.55)'}}>관리자 계정 및 시스템 환경 정보</p>
          </div>
        </div>
      </div>

      {/* 계정 정보 카드 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'linear-gradient(135deg,#e0e7ff,#c7d2fe)'}}>
            <svg className="w-4 h-4" style={{color:'#4338ca'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-800">계정 정보</h2>
        </div>
        <div className="divide-y divide-slate-50">
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">관리자 ID</span>
            <span className="text-sm font-semibold text-slate-800">{sysInfo.admin_id}</span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:'#dcfce7', color:'#15803d'}}>활성</span>
          </div>
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">권한 등급</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{background:'#111111', color:'#ffffff'}}>최고 관리자</span>
          </div>
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">세션 방식</span>
            <span className="text-sm text-slate-600">서명된 쿠키 (Signed Cookie)</span>
          </div>
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">세션 유효 시간</span>
            <span className="text-sm text-slate-600">8시간</span>
          </div>
        </div>
      </div>

      {/* 시스템 환경 카드 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'linear-gradient(135deg,#fef9c3,#fde68a)'}}>
            <svg className="w-4 h-4" style={{color:'#b45309'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"/>
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-800">시스템 환경</h2>
        </div>
        <div className="divide-y divide-slate-50">
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">Python</span>
            <span className="font-mono text-sm text-slate-700">{sysInfo.python_version}</span>
          </div>
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">Django</span>
            <span className="font-mono text-sm text-slate-700">{sysInfo.django_version}</span>
          </div>
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">Debug 모드</span>
            {sysInfo.debug_mode
              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{background:'#fef3c7', color:'#b45309'}}>ON (개발)</span>
              : <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{background:'#dcfce7', color:'#15803d'}}>OFF (운영)</span>
            }
          </div>
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">타임존</span>
            <span className="font-mono text-sm text-slate-700">{sysInfo.time_zone}</span>
          </div>
          <div className="flex items-center px-6 py-4">
            <span className="w-36 text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">Allowed Hosts</span>
            <span className="font-mono text-sm text-slate-700 break-all">{sysInfo.allowed_hosts}</span>
          </div>
        </div>
      </div>

      {/* 보안 카드 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:'linear-gradient(135deg,#fee2e2,#fecaca)'}}>
            <svg className="w-4 h-4" style={{color:'#b91c1c'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-800">보안</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-500 mb-4">
            관리자 비밀번호는 <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs">admin/views.py</code>의{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs">_ADMIN_PW</code> 상수로 관리됩니다.
            운영 환경에서는 환경변수로 분리하는 것을 권장합니다.
          </p>
          <button onClick={handleShowPasswordInfo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-200 text-slate-600 hover:bg-slate-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
            </svg>
            비밀번호 변경 안내
          </button>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{background:'#111111'}}>
          ← 대시보드로 돌아가기
        </button>
        <button onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
          </svg>
          로그아웃
        </button>
      </div>
    </div>
  );
}
