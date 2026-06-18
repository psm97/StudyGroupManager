'use client';

import { useState, useEffect } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface Group {
  id: number; name: string; description?: string; color?: string;
  member_count: number; role: string; attendance_rate?: number;
  is_public?: boolean; category?: string;
}

export default function GroupListPage() {
  const [activeTab, setActiveTab] = useState<'my'|'public'>('my');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/groups/api/my-groups/').then(r=>r.json()).catch(()=>[]),
      fetch('/groups/api/public/').then(r=>r.json()).catch(()=>[]),
    ]).then(([my, pub]) => {
      setMyGroups(my.length ? my : [
        {id:1, name:'Web Developer Study', member_count:6, role:'leader', attendance_rate:92, color:'#0077ff'},
        {id:2, name:'Python 알고리즘', member_count:8, role:'member', attendance_rate:75, color:'#10b981'},
      ]);
      setPublicGroups(pub.length ? pub : [
        {id:3, name:'영어 회화 스터디', member_count:5, role:'', attendance_rate:88, color:'#f59e0b', is_public:true},
        {id:4, name:'토익 900+ 스터디', member_count:10, role:'', attendance_rate:80, color:'#8b5cf6', is_public:true},
      ]);
      setLoading(false);
    });
  }, []);

  const filteredMy = myGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPublic = publicGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{`
        * { font-family: 'Pretendard', -apple-system, sans-serif; }
        .nav-link { transition: all 0.2s ease; }
        .nav-link.active { background: #0077ff; color: #fff; }
        .nav-link:not(.active):hover { background: #dce6fd; color: #0077ff; }
        .toggle-wrap { position: relative; display: inline-block; width: 40px; height: 22px; }
        .toggle-wrap input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #e2e8f0; border-radius: 22px; transition: .3s; }
        .toggle-slider::before { content:""; position:absolute; width:16px; height:16px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.3s; }
        input:checked + .toggle-slider { background: #0077ff; }
        input:checked + .toggle-slider::before { transform: translateX(18px); }
        .group-card { transition: transform .2s ease, box-shadow .2s ease; cursor: pointer; }
        .group-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(16,85,232,.13); }
        .tab-btn { transition: all .2s ease; }
        .tab-btn.active { color: #0077ff; border-bottom: 2px solid #0077ff; font-weight: 700; }
        .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
        .progress-bar { transition: width 1s cubic-bezier(.22,1,.36,1); }
        @media (max-width:1024px) {
          #sidebar { position:fixed; top:0; left:0; height:100vh; z-index:50; transform:translateX(-100%); }
          #sidebar.open { transform:translateX(0); }
          #sidebarOverlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:40; }
          #sidebarOverlay.open { display:block; }
        }
      `}</style>

      <div className="bg-blue-100 min-h-screen">
        <div id="sidebarOverlay" onClick={() => {
          document.getElementById('sidebar')?.classList.remove('open');
          document.getElementById('sidebarOverlay')?.classList.remove('open');
        }}></div>

        <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" id="mainContainer" style={{minHeight:'100vh'}}>
          <LeftMenu />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-5 lg:py-6 space-y-5">

              {/* 헤더 배너 */}
              <div className="rounded-2xl p-5 sm:p-6 text-white" style={{background:'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)'}}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">내 그룹</h1>
                    <p className="text-blue-100 text-sm">스터디 그룹을 관리하고 탐색하세요</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/25 transition-colors"
                      style={{background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)'}}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/></svg>
                      그룹 참여
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-sm font-bold shadow hover:bg-blue-50 transition-all" style={{color:'#0077ff'}}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                      그룹 만들기
                    </button>
                  </div>
                </div>
              </div>

              {/* 탭 + 컨텐츠 */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100">
                  <button id="tab-my"
                    onClick={() => setActiveTab('my')}
                    className={`tab-btn ${activeTab==='my'?'active':''} px-5 py-3.5 text-sm text-slate-500 border-b-2 border-transparent -mb-px`}>
                    내 그룹 <span className="ml-1.5 badge" style={{background:'#dce6fd',color:'#0077ff'}}>{myGroups.length}</span>
                  </button>
                  <button id="tab-public"
                    onClick={() => setActiveTab('public')}
                    className={`tab-btn ${activeTab==='public'?'active':''} px-5 py-3.5 text-sm text-slate-500 border-b-2 border-transparent -mb-px`}>
                    공개 그룹 탐색 <span className="ml-1.5 badge bg-slate-100 text-slate-500">{publicGroups.length}</span>
                  </button>
                </div>

                {/* 검색 */}
                <div className="p-4 border-b border-slate-100">
                  <div className="relative max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="그룹 검색..." value={search} onChange={e=>setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full focus:outline-none focus:border-blue-500"
                      style={{background:'#f8fafc'}} />
                  </div>
                </div>

                {/* 그룹 목록 */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    Array.from({length:3}).map((_,i) => (
                      <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
                    ))
                  ) : (activeTab === 'my' ? filteredMy : filteredPublic).map(g => (
                    <a key={g.id} href={`/groups/${g.id}`} className="group-card block bg-white rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                            style={{background:g.color||'#0077ff'}}>{g.name[0]}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 truncate max-w-[140px]">{g.name}</p>
                            <p className="text-xs text-slate-400">{g.member_count}명</p>
                          </div>
                        </div>
                        {g.role && (
                          <span className="badge flex-shrink-0" style={{background: g.role==='leader'?'#dce6fd':'#f1f5f9', color: g.role==='leader'?'#0077ff':'#64748b'}}>
                            {g.role==='leader'?'리더':'멤버'}
                          </span>
                        )}
                      </div>
                      {g.attendance_rate !== undefined && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">출석률</span>
                            <span className="font-semibold" style={{color:g.color||'#0077ff'}}>{g.attendance_rate}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="progress-bar h-full rounded-full" style={{width:`${g.attendance_rate}%`, background:g.color||'#0077ff'}}></div>
                          </div>
                        </div>
                      )}
                    </a>
                  ))}
                  {!loading && (activeTab === 'my' ? filteredMy : filteredPublic).length === 0 && (
                    <div className="col-span-3 py-12 text-center text-slate-400">
                      <p className="text-sm">그룹이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
