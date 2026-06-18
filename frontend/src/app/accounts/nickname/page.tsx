'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const NICKNAME_RE = /^[가-힣a-zA-Z0-9_]+$/;
const START_NUM_RE = /^[0-9]/;

type RuleState = 'neutral' | 'valid' | 'invalid';

interface RuleStatus {
  length: RuleState;
  chars: RuleState;
  noSpecial: RuleState;
  start: RuleState;
}

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [valMsg, setValMsg] = useState('');
  const [valType, setValType] = useState<'success'|'error'|''>('');
  const [rules, setRules] = useState<RuleStatus>({length:'neutral', chars:'neutral', noSpecial:'neutral', start:'neutral'});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateLocal = (val: string) => {
    const len = val.length;
    if (!val) return { ok: false, msg: '' };
    if (len < 2) return { ok: false, msg: '닉네임은 2자 이상 입력해주세요.' };
    if (len > 20) return { ok: false, msg: '닉네임은 최대 20자까지 입력 가능합니다.' };
    if (!NICKNAME_RE.test(val)) return { ok: false, msg: '한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.' };
    if (START_NUM_RE.test(val)) return { ok: false, msg: '닉네임은 숫자로 시작할 수 없습니다.' };
    return { ok: true, msg: '사용 가능한 닉네임입니다 👍' };
  };

  const handleInput = (val: string) => {
    setNickname(val);
    setCharCount(val.length);
    if (!val) {
      setValMsg(''); setValType('');
      setRules({length:'neutral', chars:'neutral', noSpecial:'neutral', start:'neutral'});
      return;
    }
    const len = val.length;
    const lengthOk = len >= 2 && len <= 20;
    const charsOk = NICKNAME_RE.test(val);
    const startOk = !START_NUM_RE.test(val);
    setRules({length: lengthOk?'valid':'invalid', chars: charsOk?'valid':'invalid', noSpecial: charsOk?'valid':'invalid', start: startOk?'valid':'invalid'});
    const {ok, msg} = validateLocal(val);
    setValMsg(msg); setValType(ok ? 'success' : 'error');
  };

  const submitNickname = async () => {
    const val = nickname.trim();
    const {ok, msg} = validateLocal(val);
    if (!val) { alert('닉네임을 입력해주세요.'); inputRef.current?.focus(); return; }
    if (!ok) { alert(msg || '닉네임 조건을 확인해주세요.'); inputRef.current?.focus(); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/accounts/nickname/', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({nickname: val}),
      });
      const data = await res.json();
      if (data.success) {
        alert(`환영합니다! ${val}님, StudyGroupManager에 오신 걸 환영해요!`);
        router.push(data.redirect_url || '/dashboard');
      } else {
        alert(data.message || '닉네임 설정에 실패했습니다.');
      }
    } catch {
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const RuleIcon = ({state}: {state:RuleState}) => {
    if (state === 'valid') return (
      <svg className="w-3.5 h-3.5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    );
    if (state === 'invalid') return (
      <svg className="w-3.5 h-3.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    );
    return (
      <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9"/>
      </svg>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 antialiased"
      style={{
        backgroundColor: '#EFF6FF',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 15% 10%, rgba(37,99,235,.13) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 85%, rgba(30,64,175,.10) 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 50% 50%, rgba(96,165,250,.07) 0%, transparent 70%)`
      }}>
      <style>{`
        .glass-card { background: rgba(255,255,255,.92); backdrop-filter: blur(16px); }
        .step-line { flex:1; height:2px; background:#E2E8F0; margin-top:18px; }
        .step-line.done { background: linear-gradient(to right, #2563EB, #93C5FD); }
        .nickname-input { transition: border-color .2s, box-shadow .2s; }
        .nickname-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,.15); background: #fff; outline: none; }
        .submit-btn { background: linear-gradient(135deg, #2563EB, #1E40AF); transition: box-shadow .2s, transform .15s; }
        .submit-btn:hover:not(:disabled) { box-shadow: 0 6px 22px rgba(37,99,235,.45); transform: translateY(-1px); }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }
        .spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* 장식 배경 원 */}
      <div className="pointer-events-none" style={{position:'fixed', top:'-80px', left:'-96px', width:'384px', height:'384px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.15), transparent 70%)'}}></div>
      <div className="pointer-events-none" style={{position:'fixed', bottom:0, right:0, width:'288px', height:'288px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.15), transparent 70%)'}}></div>

      <div className="glass-card rounded-2xl w-full max-w-md p-8 sm:p-10 relative z-10" style={{boxShadow:'0 4px 24px rgba(37,99,235,0.10)'}}>

        {/* 로고 */}
        <div className="text-center mb-7">
          <a href="/accounts/login"
             className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
             style={{background:'linear-gradient(135deg,#2563EB,#1E40AF)', boxShadow:'0 2px 12px rgba(37,99,235,.30)'}}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25"/>
            </svg>
          </a>
          <h1 className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none" style={{color:'#0F172A'}}>
            StudyGroup<span style={{color:'#2563EB'}}>Manager</span>
          </h1>
          <p className="mt-2 text-sm" style={{color:'#94A3B8'}}>거의 다 왔어요! 닉네임만 설정하면 시작됩니다</p>
        </div>

        {/* 진행 단계 */}
        <div className="flex items-start mb-8">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:'#2563EB', boxShadow:'0 2px 12px rgba(37,99,235,.30)'}}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <span className="text-xs font-semibold whitespace-nowrap" style={{color:'#2563EB'}}>계정 선택</span>
          </div>
          <div className="step-line done mx-2"></div>
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center ring-4" style={{background:'#2563EB', boxShadow:'0 0 0 4px #DBEAFE, 0 2px 12px rgba(37,99,235,.30)'}}>
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <span className="text-xs font-bold whitespace-nowrap" style={{color:'#2563EB'}}>닉네임 설정</span>
          </div>
          <div className="step-line mx-2"></div>
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:'#E2E8F0'}}>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              </svg>
            </div>
            <span className="text-xs font-medium whitespace-nowrap" style={{color:'#94A3B8'}}>시작!</span>
          </div>
        </div>

        {/* 닉네임 입력 */}
        <div>
          <label htmlFor="nicknameInput" className="block text-sm font-bold mb-2" style={{color:'#0F172A'}}>
            닉네임 <span className="text-red-400 ml-0.5">*</span>
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="nicknameInput"
              type="text"
              maxLength={20}
              placeholder="스터디에서 사용할 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitNickname(); }}
              className="nickname-input w-full rounded-2xl border text-sm font-medium py-4 px-5"
              style={{paddingRight:'64px', borderColor:'#E2E8F0', background:'#fff', color:'#0F172A'}}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold tabular-nums pointer-events-none select-none"
              style={{color: charCount === 0 ? '#94A3B8' : charCount >= 18 ? '#F97316' : '#2563EB'}}>
              {charCount}/20
            </span>
          </div>
          <p className="mt-2 text-xs font-medium min-h-[1.25rem] transition-colors"
            style={{color: valType === 'success' ? '#16A34A' : valType === 'error' ? '#EF4444' : '#94A3B8'}}>
            {valMsg}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-3">
            {[
              {key:'length', label:'2~20자 이내', state: rules.length},
              {key:'chars', label:'한글·영문·숫자·_', state: rules.chars},
              {key:'noSpecial', label:'특수문자 불가', state: rules.noSpecial},
              {key:'start', label:'숫자로 시작 불가', state: rules.start},
            ].map(r => (
              <div key={r.key} className="flex items-center gap-1.5 text-xs" style={{color: r.state === 'valid' ? '#16A34A' : r.state === 'invalid' ? '#DC2626' : '#64748B'}}>
                <RuleIcon state={r.state} />
                <span>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 미리보기 */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-center" style={{color:'#94A3B8'}}>미리보기</p>
          <div className="rounded-2xl p-4" style={{background:'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border:'1.5px solid rgba(37,99,235,.18)'}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'linear-gradient(135deg,#2563EB,#1E40AF)', boxShadow:'0 2px 12px rgba(37,99,235,.30)'}}>
                <span className="text-white font-bold text-sm select-none">
                  {nickname ? (nickname.match(/[가-힣]/) ? nickname[0] : nickname[0].toUpperCase()) : '?'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{color:'#0F172A'}}>
                  <span style={{color:'#2563EB'}}>{nickname || '닉네임'}</span>님
                </p>
                <p className="text-xs mt-0.5" style={{color:'#94A3B8'}}>StudyGroupManager 멤버</p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{background:'#f0fdf4', color:'#15803d', border:'1px solid #dcfce7'}}>
                  신규 멤버
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="mt-6">
          <button onClick={submitNickname} disabled={loading}
                  className="submit-btn w-full text-white font-bold text-sm rounded-2xl py-4 flex items-center justify-center gap-2 focus:outline-none">
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
                <span>닉네임 설정 완료</span>
              </>
            )}
          </button>
        </div>

        {/* 하단 안내 */}
        <div className="mt-4 p-3.5 rounded-xl border" style={{background:'#FFFBEB', borderColor:'#FEF3C7'}}>
          <p className="text-xs leading-relaxed text-center" style={{color:'#92400E'}}>
            닉네임은 <strong>프로필 설정</strong>에서 언제든지 변경할 수 있습니다.
          </p>
        </div>
      </div>

      <p className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap z-10" style={{color:'rgba(148,163,184,.7)'}}>
        © 2025 StudyGroupManager. All rights reserved.
      </p>
    </div>
  );
}
