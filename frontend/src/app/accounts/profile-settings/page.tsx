'use client';

import { useState, useRef } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

type TabKey = 'info' | 'activity' | 'danger';

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userNickname: string = '';
  const userEmail: string = '';
  const userDateJoined: string = '';

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoUrl(URL.createObjectURL(file));
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
        .tab-btn { transition: all 0.2s; position: relative; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #0077ff; border-bottom-color: #0077ff; font-weight: 700; }
        .tab-btn:not(.active):hover { color: #0077ff; background: #f0f5fe; }
        .form-input { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; color:#1e293b; background:#f8fafc; outline:none; transition: border-color .15s, box-shadow .15s; }
        .form-input:focus { border-color:#0077ff; box-shadow:0 0 0 3px rgba(16,85,232,.1); background:#fff; }
        .section-card { background:#fff; border:1px solid #f1f5f9; border-radius:16px; padding:24px; }
        button:not(:disabled) { cursor: pointer; }
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
            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 lg:px-8 py-6">

              <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800">프로필 설정</h1>
                <p className="text-sm text-slate-400 mt-0.5">개인 정보 및 활동 설정을 관리합니다.</p>
              </div>

              {/* 탭 바 */}
              <div className="bg-white rounded-t-2xl border border-b-0 border-slate-100 px-6 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {([
                  {key:'info', label:'기본 정보'},
                  {key:'activity', label:'활동 통계'},
                  {key:'danger', label:'계정 관리'},
                ] as {key:TabKey, label:string}[]).map(tab => (
                  <button key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`tab-btn ${activeTab===tab.key?'active':''} px-5 py-3.5 text-sm whitespace-nowrap text-slate-500`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 탭 1: 기본 정보 */}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-0">
                  <div className="flex flex-col gap-5">
                    <div className="section-card rounded-t-none border-t-0 flex flex-col items-center text-center" style={{borderTopLeftRadius:0, borderTopRightRadius:0}}>
                      {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="프로필 사진"
                          className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white mb-4 mt-2" />
                      ) : (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white mb-4 mt-2"
                          style={{background:'linear-gradient(135deg,#3a74ef,#0d44c4)'}}>
                          {userNickname ? userNickname[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <p className="font-bold text-slate-800 text-lg">{userNickname || '사용자'}</p>
                      <p className="text-sm text-slate-400 mb-1">{userEmail}</p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mb-3" style={{background:'#dce6fd', color:'#0077ff'}}>스터디 멤버</span>
                      <p className="text-xs text-slate-400">{userDateJoined}부터 활동</p>
                      <div className="w-full mt-4 pt-4 border-t border-slate-100 space-y-2">
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        <button className="w-full text-xs font-semibold py-2 rounded-lg border transition-colors cursor-pointer"
                          style={{color:'#0077ff', borderColor:'#c7d7fb', background:'#f0f5fe'}}
                          onClick={() => fileInputRef.current?.click()}>
                          📷 프로필 사진 변경
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="section-card rounded-tl-none border-t-0" style={{borderTopLeftRadius:0}}>
                      <p className="text-sm font-bold text-slate-700 mb-5">기본 정보 수정</p>
                      <div className="space-y-4">
                        {[
                          {label:'닉네임', id:'nickname', type:'text', value: userNickname, placeholder:'닉네임을 입력하세요'},
                          {label:'이메일', id:'email', type:'email', value: userEmail, placeholder:'이메일', disabled:true},
                        ].map(f => (
                          <div key={f.id}>
                            <label htmlFor={f.id} className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                            <input id={f.id} type={f.type} defaultValue={f.value} placeholder={f.placeholder}
                              disabled={f.disabled} className="form-input" />
                          </div>
                        ))}
                        <div>
                          <label htmlFor="bio" className="block text-xs font-semibold text-slate-600 mb-1.5">자기소개</label>
                          <textarea id="bio" rows={4} placeholder="자기소개를 입력하세요..." className="form-input" style={{resize:'none'}}></textarea>
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-xs font-semibold text-slate-600 mb-1.5">관심 분야</label>
                          <select id="category" className="form-input">
                            <option value="">선택 안 함</option>
                            <option value="dev">개발 / 프로그래밍</option>
                            <option value="lang">어학 / 외국어</option>
                            <option value="job">취업 / 자격증</option>
                            <option value="selfdev">자기계발</option>
                            <option value="etc">기타</option>
                          </select>
                        </div>
                        <button className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors cursor-pointer"
                          style={{background:'#0077ff'}}>저장하기</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 탭 2: 활동 통계 */}
              {activeTab === 'activity' && (
                <div className="section-card rounded-t-none border-t-0" style={{borderTopLeftRadius:0, borderTopRightRadius:0}}>
                  <p className="text-sm font-bold text-slate-700 mb-5">활동 통계</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[{label:'총 출석', value:'—'},{label:'총 지각', value:'—'},{label:'총 결석', value:'—'},{label:'출석률', value:'—%'}].map(s => (
                      <div key={s.label} className="rounded-xl p-4 text-center" style={{background:'#f8fafc', border:'1px solid #f1f5f9'}}>
                        <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 탭 3: 계정 관리 */}
              {activeTab === 'danger' && (
                <div className="section-card rounded-t-none border-t-0" style={{borderTopLeftRadius:0, borderTopRightRadius:0}}>
                  <p className="text-sm font-bold text-slate-700 mb-5">계정 관리</p>
                  <div className="p-4 rounded-xl border" style={{background:'#fff1f2', borderColor:'#ffe4e6'}}>
                    <p className="text-sm font-bold text-rose-600 mb-2">계정 탈퇴</p>
                    <p className="text-xs text-rose-500 mb-4">탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
                    <button className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm cursor-pointer" style={{background:'#e11d48'}}>
                      계정 탈퇴
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
