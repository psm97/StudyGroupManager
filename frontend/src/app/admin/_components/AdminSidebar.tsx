'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '로그아웃',
      text: '관리자 계정에서 로그아웃 하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '로그아웃',
      confirmButtonColor: '#e11d48',
      cancelButtonText: '취소',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await fetch('/admin/api/logout/', { method: 'POST', credentials: 'include' });
    } finally {
      router.push('/accounts/login');
    }
  };

  const toggleSidebar = () => {
    const sb = document.getElementById('adminSidebar');
    const ov = document.getElementById('sidebarOverlay');
    sb?.classList.toggle('open');
    ov?.classList.toggle('show');
  };

  return (
    <>
      <style>{`
        .admin-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px; font-size: 13.5px;
          font-weight: 500; color: rgba(255,255,255,.6);
          transition: all .15s ease; text-decoration: none;
        }
        .admin-nav-link:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
        .admin-nav-link.active { background: linear-gradient(135deg,#2a2a2a,#4a4a4a); color: #ffffff; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,.35); }
        .admin-scrollbar::-webkit-scrollbar { width: 4px; }
        .admin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .admin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
        @media (max-width: 1024px) {
          #adminSidebar { transform: translateX(-100%); }
          #adminSidebar.open { transform: translateX(0); }
          #sidebarOverlay.show { display: block; }
        }
      `}</style>

      <aside id="adminSidebar"
        className="fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300"
        style={{width:'256px', background:'#111111'}}>

        {/* 로고 */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{borderColor:'rgba(255,255,255,.08)'}}>
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{background:'linear-gradient(135deg,#333333,#555555)'}}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.966 8.966 0 0 0-6 2.292m0-14.25v14.25"/>
            </svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight truncate">StudyGroup</p>
            <p className="text-xs font-semibold leading-tight" style={{color:'#aaaaaa'}}>Manager</p>
          </div>
          <span className="ml-auto flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{background:'rgba(255,255,255,.12)', color:'#bbbbbb'}}>Admin</span>
        </div>

        {/* 관리자 프로필 미니 */}
        <div className="px-5 py-3 flex items-center gap-3" style={{background:'rgba(0,0,0,.15)'}}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
               style={{background:'linear-gradient(135deg,#2a2a2a,#555555)'}}>
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">관리자</p>
            <p className="text-xs truncate" style={{color:'rgba(255,255,255,.45)'}}>관리자</p>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 admin-scrollbar">

          <a href="/admin" className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
            </svg>
            <span>대시보드</span>
          </a>

          <div className="pt-3 pb-1.5 px-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{color:'rgba(255,255,255,.28)'}}>관리</p>
          </div>

          <a href="/admin/members" className={`admin-nav-link ${isActive('/admin/members') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
            </svg>
            <span>회원관리</span>
          </a>

          <a href="/admin/groups" className={`admin-nav-link ${isActive('/admin/groups') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
            </svg>
            <span>그룹관리</span>
          </a>

          <a href="/admin/report" className={`admin-nav-link ${isActive('/admin/report') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"/>
            </svg>
            <span>신고관리</span>
          </a>

          <a href="/admin/files" className={`admin-nav-link ${isActive('/admin/files') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
            </svg>
            <span>파일관리</span>
          </a>

          <div className="pt-3 pb-1.5 px-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{color:'rgba(255,255,255,.28)'}}>시스템</p>
          </div>

          <a href="/admin/analytics" className={`admin-nav-link ${isActive('/admin/analytics') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
            <span>서비스통계</span>
          </a>

          <a href="/admin/logs" className={`admin-nav-link ${isActive('/admin/logs') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
            </svg>
            <span>시스템로그</span>
          </a>

          <a href="/admin/config" className={`admin-nav-link ${isActive('/admin/config') ? 'active' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>시스템설정</span>
          </a>
        </nav>

        {/* 하단 */}
        <div className="px-3 py-3 border-t" style={{borderColor:'rgba(255,255,255,.08)'}}>
          <a href="/dashboard"
             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all duration-150"
             style={{color:'rgba(255,255,255,.55)'}}
             onMouseOver={(e) => { e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.color='rgba(255,255,255,.85)'; }}
             onMouseOut={(e) => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(255,255,255,.55)'; }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
            </svg>
            <span>서비스로 이동</span>
          </a>
          <button
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
             style={{color:'rgba(255,255,255,.45)'}}
             onMouseOver={(e) => { e.currentTarget.style.background='rgba(239,68,68,.12)'; e.currentTarget.style.color='#fca5a5'; }}
             onMouseOut={(e) => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(255,255,255,.45)'; }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
            </svg>
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      <div id="sidebarOverlay"
        className="fixed inset-0 z-30 hidden"
        style={{background:'rgba(0,0,0,.5)'}}
        onClick={toggleSidebar}></div>
    </>
  );
}
