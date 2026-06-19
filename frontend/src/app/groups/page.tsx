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

  const openJoinGroupModal = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700">👥 그룹 참여</span>',
      width: 460,
      html: `<div style="text-align:left;padding:4px 0">
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">초대 코드</label>
          <input id="swal-jcode" type="text" placeholder="초대 코드를 입력하세요" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box" />
        </div>
        <div style="background:#f8fafc;border-radius:10px;padding:12px 14px;border:1px solid #f1f5f9">
          <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:600">💡 초대 코드가 없으신가요?</p>
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6">공개 그룹은 <b style="color:#0077ff">공개 그룹 탐색</b> 탭에서 직접 참여할 수 있습니다.</p>
        </div>
      </div>`,
      confirmButtonText: '참여하기',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const code = ((document.getElementById('swal-jcode') as HTMLInputElement)?.value || '').trim();
        if (!code) { Swal.showValidationMessage('초대 코드를 입력해 주세요.'); return false; }
        return { code };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    await Swal.fire({ icon: 'success', title: '참여 요청이 전송되었습니다!', text: '그룹 리더의 승인 후 참여가 완료됩니다.', timer: 2200, showConfirmButton: false, timerProgressBar: true });
  };

  const openCreateGroupModal = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700">🏫 그룹 만들기</span>',
      width: 500,
      html: `<div style="text-align:left;padding:4px 0">
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">그룹 이름 *</label>
          <input id="swal-gname" type="text" placeholder="그룹 이름을 입력하세요" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box" />
        </div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">설명</label>
          <textarea id="swal-gdesc" rows="3" placeholder="그룹 소개를 입력하세요" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;resize:none;box-sizing:border-box;font-family:inherit"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">카테고리</label>
            <select id="swal-gcat" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;background:#fff;box-sizing:border-box">
              <option value="study">📚 스터디</option>
              <option value="language">🌏 어학</option>
              <option value="algorithm">💻 알고리즘</option>
              <option value="dev">🛠 개발</option>
              <option value="etc">📌 기타</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:4px">최대 인원</label>
            <input id="swal-gmax" type="number" min="2" max="50" value="10" style="width:100%;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box" />
          </div>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px">공개 설정</label>
          <div style="display:flex;gap:16px">
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;color:#334155">
              <input type="radio" name="swal-gvis" value="public" checked style="accent-color:#0077ff;width:15px;height:15px" /> 🌐 공개
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;color:#334155">
              <input type="radio" name="swal-gvis" value="private" style="accent-color:#0077ff;width:15px;height:15px" /> 🔒 비공개
            </label>
          </div>
        </div>
      </div>`,
      confirmButtonText: '그룹 만들기',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const name = ((document.getElementById('swal-gname') as HTMLInputElement)?.value || '').trim();
        const desc = ((document.getElementById('swal-gdesc') as HTMLTextAreaElement)?.value || '').trim();
        const category = (document.getElementById('swal-gcat') as HTMLSelectElement)?.value || 'study';
        const maxMembers = parseInt((document.getElementById('swal-gmax') as HTMLInputElement)?.value || '10', 10);
        const visEls = document.querySelectorAll<HTMLInputElement>('input[name="swal-gvis"]');
        const visibility = Array.from(visEls).find(el => el.checked)?.value || 'public';
        if (!name) { Swal.showValidationMessage('그룹 이름을 입력해 주세요.'); return false; }
        if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 50) { Swal.showValidationMessage('최대 인원은 2~50명 사이여야 합니다.'); return false; }
        return { name, desc, category, maxMembers, visibility };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    const { name } = result.value as { name: string; desc: string; category: string; maxMembers: number; visibility: string };
    await Swal.fire({ icon: 'success', title: '그룹이 생성되었습니다!', text: `"${name}" 그룹이 만들어졌습니다.`, timer: 2000, showConfirmButton: false, timerProgressBar: true });
  };

  return (
    <>
      <style>{`
        .group-card { transition: transform .2s ease, box-shadow .2s ease; cursor: pointer; }
        .group-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(16,85,232,.13); }
        .tab-btn { transition: all .2s ease; }
        .tab-btn.active { color: #0077ff; border-bottom: 2px solid #0077ff; font-weight: 700; }
        .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
        .progress-bar { transition: width 1s cubic-bezier(.22,1,.36,1); }
      `}</style>

      <div className="bg-blue-100 min-h-screen">
        <div id="sidebarOverlay" onClick={() => {
          document.getElementById('sidebar')?.classList.remove('open');
          document.getElementById('sidebarOverlay')?.classList.remove('open');
        }}></div>

        <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{minHeight:'100vh'}}>
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
                    <button onClick={openJoinGroupModal}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors cursor-pointer"
                      style={{background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)'}}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.15)')}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/></svg>
                      그룹 참여
                    </button>
                    <button onClick={openCreateGroupModal}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-sm font-bold shadow hover:bg-blue-50 transition-all cursor-pointer" style={{color:'#0077ff'}}>
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
                    className={`tab-btn ${activeTab==='my'?'active':''} px-5 py-3.5 text-sm text-slate-500 border-b-2 border-transparent -mb-px cursor-pointer`}>
                    내 그룹 <span className="ml-1.5 badge" style={{background:'#dce6fd',color:'#0077ff'}}>{myGroups.length}</span>
                  </button>
                  <button id="tab-public"
                    onClick={() => setActiveTab('public')}
                    className={`tab-btn ${activeTab==='public'?'active':''} px-5 py-3.5 text-sm text-slate-500 border-b-2 border-transparent -mb-px cursor-pointer`}>
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
