'use client';

import { useEffect, useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

export default function DashboardPage() {
  const [stats, setStats] = useState({groups:0, attendance:'—', penalty:'—', rate:'—%'});
  const userNickname = '';

  /* TODO: CDN 스크립트 → npm 패키지로 교체 필요 (Chart.js) */

  useEffect(() => {
    fetch('/api/dashboard/stats/')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => setStats({groups:3, attendance:'87%', penalty:'₩5,000', rate:'92%'}));
  }, []);

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

  const openJoinGroupModal = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700">🔑 초대코드로 참여</span>',
      width: 440,
      html: `<div style="text-align:left;padding:4px 0">
        <p style="font-size:13px;color:#64748b;margin-bottom:14px;line-height:1.6">초대 코드를 입력하면 해당 스터디 그룹에 참여할 수 있습니다.</p>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px">초대 코드 *</label>
          <input id="swal-invite" type="text" placeholder="예: ABC123" maxlength="20" style="width:100%;padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:16px;outline:none;text-align:center;letter-spacing:3px;text-transform:uppercase;box-sizing:border-box;font-weight:700;color:#1e293b" />
        </div>
      </div>`,
      confirmButtonText: '참여하기',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      didOpen: () => {
        const input = document.getElementById('swal-invite') as HTMLInputElement;
        input?.addEventListener('input', () => { input.value = input.value.toUpperCase(); });
      },
      preConfirm: () => {
        const code = ((document.getElementById('swal-invite') as HTMLInputElement)?.value || '').trim();
        if (!code) { Swal.showValidationMessage('초대 코드를 입력해 주세요.'); return false; }
        return { code };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    const { code } = result.value as { code: string };
    await Swal.fire({ icon: 'success', title: '그룹에 참여했습니다!', text: `초대 코드 "${code}"로 그룹에 참여했습니다.`, timer: 2000, showConfirmButton: false, timerProgressBar: true });
  };

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
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,85,232,0.12); }
        .group-card { transition: all 0.2s; }
        .group-card:hover { border-color: #93aeee; box-shadow: 0 4px 16px rgba(16,85,232,0.1); }
        .progress-fill { transition: width 0.7s ease; }
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

              {/* 웰컴 배너 */}
              <div className="relative rounded-2xl overflow-hidden shadow-md" style={{background:'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)'}}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white opacity-5 rounded-full translate-y-16"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 lg:p-8 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm font-medium mb-1">📚 오늘도 열심히!</p>
                    <h1 className="text-white text-xl lg:text-2xl font-bold mb-1">
                      Welcome Back, {userNickname || '사용자'}!
                    </h1>
                    <p className="text-blue-100 text-sm mb-5">스터디 그룹 매니저에 오신 것을 환영합니다.</p>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={openCreateGroupModal}
                        className="bg-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 transition-colors cursor-pointer"
                        style={{color:'#0077ff'}}>
                        + 그룹 만들기
                      </button>
                      <button onClick={openJoinGroupModal}
                        className="border border-white/50 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                        초대코드로 참여
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 통계 카드 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stat-grid">
                {[
                  {label:'내 그룹', value: String(stats.groups), unit:'개', color:'#0077ff', bg:'#dce6fd'},
                  {label:'이번 달 출석률', value: stats.rate, unit:'', color:'#10b981', bg:'#dcfce7'},
                  {label:'총 출석', value: stats.attendance, unit:'', color:'#3b82f6', bg:'#dbeafe'},
                  {label:'미납 벌금', value: stats.penalty, unit:'', color:'#ef4444', bg:'#fee2e2'},
                ].map(card => (
                  <div key={card.label} className="stat-card bg-white rounded-2xl p-5 border border-slate-100">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:card.bg}}>
                      <div className="w-4 h-4 rounded-full" style={{background:card.color}}></div>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{color:card.color}}>{card.value}{card.unit}</p>
                    <p className="text-xs text-slate-500">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* 중간 그리드 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mid-grid">
                {/* 내 그룹 목록 */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-800">내 그룹</h2>
                    <a href="/groups" className="text-xs font-semibold hover:underline" style={{color:'#0077ff'}}>전체 보기</a>
                  </div>
                  <div className="space-y-3">
                    {[
                      {name:'Web Developer Study', members:6, rate:92, role:'리더', color:'#0077ff'},
                      {name:'Python 알고리즘', members:8, rate:75, role:'멤버', color:'#10b981'},
                      {name:'영어 회화 스터디', members:5, rate:88, role:'멤버', color:'#f59e0b'},
                    ].map(g => (
                      <div key={g.name} className="group-card flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{background:g.color}}>{g.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">{g.name}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{background: g.role==='리더'?'#dce6fd':'#f1f5f9', color: g.role==='리더'?'#0077ff':'#64748b'}}>
                              {g.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="progress-fill h-full rounded-full" style={{width:`${g.rate}%`, background:g.color}}></div>
                            </div>
                            <span className="text-xs font-semibold" style={{color:g.color}}>{g.rate}%</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{g.members}명</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 캘린더 미니 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-800">이번 달 캘린더</h2>
                    <a href="/support/calendar" className="text-xs font-semibold hover:underline" style={{color:'#0077ff'}}>전체 보기</a>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['일','월','화','수','목','금','토'].map(d => (
                      <span key={d} className="text-center text-xs font-semibold text-slate-400">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({length:35}).map((_,i) => {
                      const day = i - 5; // offset
                      const today = new Date().getDate();
                      const isToday = day === today;
                      return (
                        <div key={i} className="aspect-square flex items-center justify-center rounded-full text-xs cursor-pointer transition-all"
                          style={{
                            background: isToday ? '#0077ff' : 'transparent',
                            color: isToday ? '#fff' : day < 1 || day > 30 ? '#cbd5e1' : '#1e293b',
                            fontWeight: isToday ? 700 : 400,
                          }}>
                          {day >= 1 && day <= 31 ? day : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl" style={{background:'#f0f5fe'}}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'#0077ff'}}></div>
                      <span className="text-xs text-slate-600 truncate">오늘 세션 없음</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단: 최근 활동 + AI 리포트 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bot-grid">
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h2 className="font-bold text-slate-800 mb-4">최근 활동</h2>
                  <div className="space-y-3">
                    {[
                      {time:'오늘 10:00', desc:'Web Developer Study 출석 완료', color:'#10b981'},
                      {time:'어제 14:00', desc:'Python 알고리즘 지각', color:'#f59e0b'},
                      {time:'3일 전', desc:'영어 회화 스터디 결석 (벌금 부과)', color:'#ef4444'},
                    ].map((a, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:a.color}}></div>
                        <div>
                          <p className="text-sm text-slate-700">{a.desc}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h2 className="font-bold text-slate-800 mb-4">AI 리포트 요약</h2>
                  <div className="rounded-xl p-4 mb-3" style={{background:'#eef2fd', border:'1px solid #c7d7fb'}}>
                    <p className="text-sm font-semibold mb-2" style={{color:'#0077ff'}}>📊 이번 달 요약</p>
                    <p className="text-xs text-slate-600 leading-relaxed">총 출석률 87%. 지각 1회, 결석 1회 기록됨. 전월 대비 5% 향상되었습니다.</p>
                  </div>
                  <a href="/ai/monthly-report"
                    className="block w-full text-center text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                    style={{background:'#0077ff'}}>
                    AI 월간 리포트 보기 →
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
