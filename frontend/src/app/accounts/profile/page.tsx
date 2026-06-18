'use client';

import { useEffect, useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface PenaltyItem {
  date: string; group_name: string; reason: string; amount: number; is_paid: boolean;
}
interface Group {
  id: number; name: string; color?: string; role: string; member_count: number;
}

export default function ProfilePage() {
  const [atRate, setAtRate] = useState('—');
  const [atPresent, setAtPresent] = useState('—');
  const [atLate, setAtLate] = useState('—');
  const [atAbsent, setAtAbsent] = useState('—');
  const [attendanceMonth, setAttendanceMonth] = useState('');
  const [penaltyTotal, setPenaltyTotal] = useState('—');
  const [penaltyPaid, setPenaltyPaid] = useState('—');
  const [penaltyUnpaid, setPenaltyUnpaid] = useState('—');
  const [penalties, setPenalties] = useState<PenaltyItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [heatmap, setHeatmap] = useState<number[]>([]);

  const userNickname: string = '';
  const userEmail: string = '';
  const userBio = '자기소개가 작성되지 않았습니다.';
  const userCategory = '';
  const userDateJoined = '';

  const categoryLabel: Record<string, string> = {
    dev:'개발 / 프로그래밍', lang:'어학 / 외국어', job:'취업 / 자격증', selfdev:'자기계발', etc:'기타'
  };

  useEffect(() => {
    const now = new Date();
    setAttendanceMonth(`${now.getFullYear()}년 ${now.getMonth()+1}월 기준`);

    // Load profile data
    fetch('/accounts/api/profile/')
      .then(r => r.json())
      .then(data => {
        setAtRate((data.monthly_rate || 0) + '%');
        setAtPresent((data.monthly_present || 0) + '회');
        setAtLate((data.monthly_late || 0) + '회');
        setAtAbsent((data.monthly_absent || 0) + '회');
        setHeatmap(data.heatmap_data || []);
      })
      .catch(() => {
        setAtRate('87%'); setAtPresent('13회'); setAtLate('1회'); setAtAbsent('1회');
        setHeatmap(Array.from({length:35}, () => Math.floor(Math.random()*4)));
      });

    // Load groups
    fetch('/groups/api/my-groups/')
      .then(r => r.json())
      .then(data => setGroups(data))
      .catch(() => setGroups([{id:1, name:'Web Developer', color:'#0077ff', role:'leader', member_count:6}]));

    // Load penalty
    fetch('/penalty/api/my-history/')
      .then(r => r.json())
      .then((data: PenaltyItem[]) => {
        const total = data.reduce((s,i) => s+i.amount, 0);
        const paid = data.filter(i=>i.is_paid).reduce((s,i)=>s+i.amount, 0);
        setPenaltyTotal(`₩${total.toLocaleString()}`);
        setPenaltyPaid(`₩${paid.toLocaleString()}`);
        setPenaltyUnpaid(`₩${(total-paid).toLocaleString()}`);
        setPenalties(data);
      })
      .catch(() => {
        setPenaltyTotal('₩7,000'); setPenaltyPaid('₩2,000'); setPenaltyUnpaid('₩5,000');
        setPenalties([
          {date:'2025.06.10', group_name:'Web Developer', reason:'결석', amount:5000, is_paid:false},
          {date:'2025.05.28', group_name:'Python 스터디', reason:'지각', amount:2000, is_paid:true},
        ]);
      });
  }, []);

  const colors = ['#f1f5f9','#c7d7fb','#6d98e8','#0077ff'];

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
        .section-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 22px; }
        .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
        .badge-blue { background:#dce6fd; color:#0077ff; }
        .badge-green { background:#dcfce7; color:#16a34a; }
        .badge-rose { background:#ffe4e6; color:#e11d48; }
        .badge-leader { background:#dce6fd; color:#0077ff; }
        .badge-member { background:#f1f5f9; color:#64748b; }
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

              {/* 프로필 배너 */}
              <div className="mx-4 mt-4 rounded-t-2xl relative overflow-hidden min-h-[160px] flex flex-col items-center text-center p-8"
                style={{background:'linear-gradient(135deg, #0077ff 0%, #0077ff 60%, #3eb0ed 100%)'}}>
                <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{color:'rgba(255,255,255,.7)'}}>✦ 프로필 ✦</p>
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 border-4 border-white"
                  style={{background:'linear-gradient(135deg,#0077ff,#0d44c4)'}}>
                  {userNickname ? userNickname[0].toUpperCase() : 'U'}
                </div>
                <p className="text-white font-bold text-xl leading-tight mb-5">{userNickname || '사용자'}</p>
              </div>

              {/* 메인 콘텐츠 */}
              <div className="px-4 lg:px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-5" style={{margin:'0 10px'}}>

                {/* 좌측 */}
                <div className="flex flex-col gap-5">
                  <div className="section-card" style={{borderTopLeftRadius:0, borderTopRightRadius:0, borderTop:'none'}}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">기본 정보</p>
                    <div className="space-y-3">
                      {[
                        {label:'닉네임', value: userNickname || '-', bg:'#dce6fd', color:'#0077ff'},
                        {label:'이메일', value: userEmail || '-', bg:'#dcfce7', color:'#10b981'},
                        {label:'가입일', value: userDateJoined || '-', bg:'#fef3c7', color:'#d97706'},
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:item.bg}}>
                              <div className="w-3.5 h-3.5 rounded-full" style={{background:item.color}}></div>
                            </div>
                            <span className="text-xs text-slate-500">{item.label}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-600 truncate max-w-[140px]">{item.value}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-slate-500">멤버 레벨</span>
                        <span className="badge badge-blue" style={{fontSize:'11px'}}>스터디 멤버</span>
                      </div>
                    </div>
                  </div>

                  {/* 참여 중인 그룹 */}
                  <div className="section-card">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-slate-700">참여 중인 그룹</p>
                      <a href="/groups" className="text-xs font-semibold hover:underline" style={{color:'#0077ff'}}>전체 →</a>
                    </div>
                    <div className="space-y-2">
                      {groups.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">참여 중인 그룹이 없습니다.</p>
                      ) : groups.slice(0,5).map(g => (
                        <a key={g.id} href={`/groups/${g.id}`} className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{background:g.color||'#0077ff'}}>{g.name.charAt(0)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-700 truncate">{g.name}</p>
                            <p className="text-xs text-slate-400">{g.role==='leader'?'리더':'멤버'} · {g.member_count}명</p>
                          </div>
                          <span className={`badge ${g.role==='leader'?'badge-leader':'badge-member'}`} style={{fontSize:'10px', flexShrink:0}}>
                            {g.role==='leader'?'리더':'멤버'}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 우측 */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                  {/* 소개 & 관심 분야 */}
                  <div className="section-card">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">소개 &amp; 관심 분야</p>
                    <div className="mb-5">
                      <p className="text-xs font-bold text-slate-500 mb-2">자기소개</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line min-h-[52px]">{userBio}</p>
                    </div>
                    <div className="flex items-center gap-2.5 my-4">
                      <div className="flex-1 h-px bg-slate-100"></div>
                      <span className="text-xs font-bold text-slate-400">관심 분야</span>
                      <div className="flex-1 h-px bg-slate-100"></div>
                    </div>
                    <div className="mt-4">
                      {userCategory && categoryLabel[userCategory] ? (
                        <span className="badge badge-blue">{categoryLabel[userCategory]}</span>
                      ) : (
                        <span className="text-sm text-slate-400">설정되지 않음</span>
                      )}
                    </div>
                  </div>

                  {/* 출석 현황 */}
                  <div className="section-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="font-bold text-slate-800">출석 현황</p>
                        <p className="text-xs text-slate-400 mt-0.5">{attendanceMonth}</p>
                      </div>
                      <div className="flex gap-4 text-center">
                        {[{val:atRate,label:'출석률',color:'#0077ff'},{val:atPresent,label:'출석',color:'#1e293b'},{val:atLate,label:'지각',color:'#f59e0b'},{val:atAbsent,label:'결석',color:'#e11d48'}].map((s,i,arr) => (
                          <div key={s.label} className="flex gap-4">
                            <div>
                              <p className="text-xl font-bold" style={{color:s.color}}>{s.val}</p>
                              <p className="text-xs text-slate-400">{s.label}</p>
                            </div>
                            {i < arr.length-1 && <div className="w-px bg-slate-100 mx-0"></div>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['일','월','화','수','목','금','토'].map(d => (
                        <span key={d} className="text-center text-xs text-slate-400">{d}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({length:35}).map((_,i) => {
                        const lv = heatmap[i] !== undefined ? Math.min(heatmap[i],3) : 0;
                        return <div key={i} style={{width:'20px',height:'20px',borderRadius:'4px',background:colors[lv],cursor:'pointer',flexShrink:0}} title={['출석 없음','1회 세션','2회 세션','3회 이상'][lv]}></div>;
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">적음</span>
                      <div className="flex gap-1">
                        {colors.map(c => <div key={c} className="w-3 h-3 rounded-sm" style={{background:c}}></div>)}
                      </div>
                      <span className="text-xs text-slate-400">많음</span>
                    </div>
                  </div>

                  {/* 벌금 현황 */}
                  <div className="section-card">
                    <p className="font-bold text-slate-800 mb-4">벌금 현황</p>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[{val:penaltyTotal,label:'총 벌금',bg:'#f8fafc',border:'#f1f5f9',color:'#1e293b'},{val:penaltyPaid,label:'납부 완료',bg:'#f0fdf4',border:'#dcfce7',color:'#16a34a'},{val:penaltyUnpaid,label:'미납',bg:'#fff1f2',border:'#ffe4e6',color:'#e11d48'}].map(s => (
                        <div key={s.label} className="rounded-xl p-3 text-center" style={{background:s.bg, border:`1px solid ${s.border}`}}>
                          <p className="text-lg font-bold" style={{color:s.color}}>{s.val}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-sm" style={{minWidth:'460px'}}>
                        <thead>
                          <tr style={{background:'#f8fafc'}}>
                            {['날짜','그룹','사유','금액','납부'].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-500 font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {penalties.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-400">벌금 이력이 없습니다.</td></tr>
                          ) : penalties.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-xs text-slate-500">{item.date}</td>
                              <td className="px-4 py-3 text-xs font-medium text-slate-700">{item.group_name}</td>
                              <td className="px-4 py-3 text-xs text-slate-500">{item.reason}</td>
                              <td className={`px-4 py-3 text-xs font-bold text-right ${item.is_paid?'text-slate-700':'text-rose-500'}`}>₩{item.amount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`badge ${item.is_paid?'badge-green':'badge-rose'}`} style={{fontSize:'11px'}}>
                                  {item.is_paid?'납부':'미납'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
