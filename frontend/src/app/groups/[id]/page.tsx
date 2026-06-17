'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface GroupData {
  id: number; name: string; description?: string; color?: string;
  member_count: number; role?: string; attendance_rate?: number;
  leader_name?: string; created_at?: string; category?: string;
}
interface Member { id: number; nickname: string; role: string; attendance_rate?: number; }
interface Notice { id: number; title: string; content?: string; created_at: string; }

export default function GroupHomePage() {
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupData|null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeTab, setActiveTab] = useState<'overview'|'members'|'notices'|'attendance'>('overview');

  /* TODO: CDN 스크립트 → npm 패키지로 교체 필요 (Chart.js, Font Awesome) */

  useEffect(() => {
    fetch(`/groups/api/${id}/`)
      .then(r=>r.json())
      .then(data => setGroup(data))
      .catch(() => setGroup({id:Number(id), name:'Web Developer Study', member_count:6, role:'leader', attendance_rate:92, color:'#1258fc', leader_name:'김리더', category:'개발'}));

    fetch(`/groups/api/${id}/members/`)
      .then(r=>r.json())
      .then(data => setMembers(data))
      .catch(() => setMembers([
        {id:1, nickname:'김리더', role:'leader', attendance_rate:95},
        {id:2, nickname:'이멤버', role:'member', attendance_rate:88},
        {id:3, nickname:'박멤버', role:'member', attendance_rate:72},
      ]));

    fetch(`/groups/api/${id}/notices/`)
      .then(r=>r.json())
      .then(data => setNotices(data))
      .catch(() => setNotices([
        {id:1, title:'6월 스터디 일정 안내', created_at:'2025.06.01'},
        {id:2, title:'자료 공유 링크 업데이트', created_at:'2025.05.28'},
      ]));
  }, [id]);

  return (
    <>
      <style>{`
        * { font-family: 'Pretendard', -apple-system, sans-serif; }
        .nav-link { transition: all 0.2s ease; }
        .nav-link.active { background: #1258fc; color: #fff; }
        .nav-link:not(.active):hover { background: #dce6fd; color: #1258fc; }
        .toggle-wrap { position: relative; display: inline-block; width: 40px; height: 22px; }
        .toggle-wrap input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #e2e8f0; border-radius: 22px; transition: .3s; }
        .toggle-slider::before { content:""; position:absolute; width:16px; height:16px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.3s; }
        input:checked + .toggle-slider { background: #1258fc; }
        input:checked + .toggle-slider::before { transform: translateX(18px); }
        .tab-btn { transition: all .2s; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #1258fc; border-bottom-color: #1258fc; font-weight: 700; }
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

        <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{minHeight:'100vh'}}>
          <LeftMenu />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {group ? (
                <>
                  {/* 그룹 헤더 배너 */}
                  <div className="bg-white border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                          style={{background:group.color||'#1258fc'}}>{group.name[0]}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-bold text-slate-800">{group.name}</h1>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:'#dce6fd', color:'#1258fc'}}>
                              {group.role === 'leader' ? '리더' : '멤버'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{group.description || '그룹 설명 없음'}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>멤버 {group.member_count}명</span>
                            {group.category && <span>· {group.category}</span>}
                            {group.created_at && <span>· {group.created_at} 개설</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {group.role === 'leader' && (
                          <button className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">
                            그룹 설정
                          </button>
                        )}
                        <button className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{background:'#1258fc'}}>
                          출석 체크
                        </button>
                      </div>
                    </div>

                    {/* 통계 바 */}
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {[
                        {label:'출석률', value:`${group.attendance_rate||0}%`, color:'#1258fc'},
                        {label:'총 멤버', value:`${group.member_count}명`, color:'#10b981'},
                        {label:'이번 달 세션', value:'4회', color:'#f59e0b'},
                      ].map(s => (
                        <div key={s.label} className="rounded-xl p-3 text-center" style={{background:'#f8fafc', border:'1px solid #f1f5f9'}}>
                          <p className="text-lg font-bold" style={{color:s.color}}>{s.value}</p>
                          <p className="text-xs text-slate-400">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 탭 */}
                  <div className="bg-white border-b border-slate-100 px-6 flex gap-1 overflow-x-auto">
                    {([
                      {key:'overview', label:'개요'},
                      {key:'members', label:'멤버'},
                      {key:'notices', label:'공지사항'},
                      {key:'attendance', label:'출석 현황'},
                    ] as {key:typeof activeTab, label:string}[]).map(tab => (
                      <button key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`tab-btn ${activeTab===tab.key?'active':''} px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 탭 콘텐츠 */}
                  <div className="p-6">

                    {/* 개요 */}
                    {activeTab === 'overview' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* 최근 공지 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                          <h3 className="font-bold text-slate-800 mb-4">최근 공지사항</h3>
                          <div className="space-y-3">
                            {notices.slice(0,3).map(n => (
                              <div key={n.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                                <div>
                                  <p className="text-sm font-medium text-slate-700">{n.title}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">{n.created_at}</p>
                                </div>
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                                </svg>
                              </div>
                            ))}
                            {notices.length === 0 && <p className="text-xs text-slate-400 text-center py-4">공지사항이 없습니다.</p>}
                          </div>
                        </div>

                        {/* 출석 현황 요약 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                          <h3 className="font-bold text-slate-800 mb-4">멤버 출석 현황</h3>
                          <div className="space-y-3">
                            {members.slice(0,5).map(m => (
                              <div key={m.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                  style={{background:group.color||'#1258fc'}}>{m.nickname[0]}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-semibold text-slate-700 truncate">{m.nickname}</p>
                                    <span className="text-xs font-bold" style={{color:group.color||'#1258fc'}}>{m.attendance_rate||0}%</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{width:`${m.attendance_rate||0}%`, background:group.color||'#1258fc'}}></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 멤버 */}
                    {activeTab === 'members' && (
                      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-slate-800">멤버 목록 ({members.length}명)</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {members.map(m => (
                            <div key={m.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{background:group.color||'#1258fc'}}>{m.nickname[0]}</div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-700">{m.nickname}</p>
                              </div>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{background: m.role==='leader'?'#dce6fd':'#f1f5f9', color: m.role==='leader'?'#1258fc':'#64748b'}}>
                                {m.role==='leader'?'리더':'멤버'}
                              </span>
                              <span className="text-xs font-bold" style={{color:group.color||'#1258fc'}}>{m.attendance_rate||0}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 공지사항 */}
                    {activeTab === 'notices' && (
                      <div className="bg-white rounded-2xl border border-slate-100">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-slate-800">공지사항</h3>
                          {group.role === 'leader' && (
                            <button className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white" style={{background:'#1258fc'}}>
                              + 공지 작성
                            </button>
                          )}
                        </div>
                        <div className="divide-y divide-slate-50">
                          {notices.map(n => (
                            <div key={n.id} className="px-5 py-4 hover:bg-slate-50 cursor-pointer">
                              <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{n.created_at}</p>
                            </div>
                          ))}
                          {notices.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">공지사항이 없습니다.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 출석 현황 */}
                    {activeTab === 'attendance' && (
                      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                          <h3 className="font-bold text-slate-800">출석 현황</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr style={{background:'#f8fafc'}}>
                                {['멤버','출석','지각','결석','출석률'].map(h => (
                                  <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-500 font-bold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {members.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{m.nickname}</td>
                                  <td className="px-4 py-3 text-sm text-emerald-600 font-semibold">—</td>
                                  <td className="px-4 py-3 text-sm text-amber-500 font-semibold">—</td>
                                  <td className="px-4 py-3 text-sm text-rose-500 font-semibold">—</td>
                                  <td className="px-4 py-3 text-sm font-bold" style={{color:group.color||'#1258fc'}}>{m.attendance_rate||0}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400">그룹 정보를 불러오는 중...</div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
