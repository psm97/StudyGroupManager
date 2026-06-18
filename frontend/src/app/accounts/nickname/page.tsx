'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

const RULES = [
  { id: 'length', label: '2~20자', test: (v: string) => v.length >= 2 && v.length <= 20 },
  { id: 'chars', label: '한글, 영문, 숫자 사용 가능', test: (v: string) => /^[가-힣a-zA-Z0-9]+$/.test(v) },
  { id: 'noSpecial', label: '특수문자 사용 불가', test: (v: string) => !/[^가-힣a-zA-Z0-9]/.test(v) },
  { id: 'noDup', label: '중복되지 않은 닉네임', test: (v: string) => !['관리자', 'admin', 'test'].includes(v.toLowerCase()) },
];

export default function NicknamePage() {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const allValid = nickname.length > 0 && RULES.every(r => r.test(nickname));
  const charColor = nickname.length === 0 ? 'text-slate-400' : nickname.length <= 15 ? 'text-blue-500' : 'text-orange-500';

  const handleSubmit = async () => {
    if (!allValid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    await Swal.fire({
      title: '닉네임 설정 완료! 🎉',
      text: `"${nickname}"(으)로 설정되었습니다. 스터디 그룹 매니저에 오신 걸 환영합니다!`,
      icon: 'success',
      confirmButtonText: '시작하기',
      confirmButtonColor: '#1258fc',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#f0f5ff' }}>
      <div className="fixed w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,.13) 0%, transparent 70%)', top: '-60px', right: '-60px' }} />
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white/80 rounded-3xl shadow-2xl p-8" style={{ backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)' }}>
          {/* 단계 표시 */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { label: '1', status: 'done', text: 'Google 로그인' },
              { label: '2', status: 'current', text: '닉네임 설정' },
              { label: '3', status: 'wait', text: '완료' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-0.5 ${s.status !== 'wait' ? 'bg-blue-400' : 'bg-slate-200'}`} />}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: s.status === 'done' ? '#1258fc' : s.status === 'current' ? '#dce6fd' : '#f1f5f9',
                      color: s.status === 'done' ? '#fff' : s.status === 'current' ? '#1258fc' : '#94a3b8',
                    }}>
                    {s.status === 'done' ? '✓' : s.label}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{s.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 타이틀 */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#2563EB,#1E40AF)' }}>
              SG
            </div>
            <h1 className="text-xl font-bold text-slate-800">닉네임을 설정해주세요</h1>
            <p className="text-sm text-slate-500 mt-1">스터디 그룹에서 사용할 이름이에요</p>
          </div>

          {/* 입력 필드 */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value.slice(0, 20))}
                placeholder="닉네임을 입력하세요"
                className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                style={{ borderColor: nickname.length === 0 ? '#e2e8f0' : allValid ? '#1258fc' : '#e2e8f0' }}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${charColor}`}>
                {nickname.length}/20
              </span>
            </div>
          </div>

          {/* 유효성 검사 */}
          <div className="bg-slate-50 rounded-xl p-3 mb-5 space-y-2">
            {RULES.map(rule => {
              const passed = nickname.length > 0 && rule.test(nickname);
              return (
                <div key={rule.id} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: passed ? '#dcfce7' : '#f1f5f9', color: passed ? '#16a34a' : '#94a3b8' }}>
                    {passed ? '✓' : '·'}
                  </span>
                  <span className={`text-xs ${passed ? 'text-slate-700' : 'text-slate-400'}`}>{rule.label}</span>
                </div>
              );
            })}
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!allValid || loading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: allValid ? 'linear-gradient(135deg,#1258fc,#3a74ef)' : '#e2e8f0',
              color: allValid ? '#fff' : '#94a3b8',
              cursor: allValid ? 'pointer' : 'not-allowed',
            }}>
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {loading ? '설정 중...' : '닉네임 설정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
