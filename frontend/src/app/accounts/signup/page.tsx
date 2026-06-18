'use client';

export default function SignupPage() {
  const showTerms = () => {
    alert('이용약관:\n제1조 (목적)\n이 약관은 StudyGroupManager 서비스 이용 조건 및 절차, 회원과 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (서비스 이용)\n회원은 서비스를 통해 스터디 그룹을 생성하고 참여할 수 있으며, 출석 관리 및 벌금 정산 기능을 이용할 수 있습니다.\n\n제3조 (회원의 의무)\n회원은 서비스 이용 시 타인의 권리를 침해하거나 법령을 위반하는 행위를 해서는 안 됩니다.');
  };

  const showPrivacy = () => {
    alert('개인정보 처리방침:\n수집 항목: Google 계정 이메일, 이름, 프로필 사진 (Google OAuth 제공)\n\n수집 목적: 회원 식별 및 서비스 제공, 출석/벌금 데이터 관리\n\n보유 기간: 회원 탈퇴 시 즉시 삭제 (단, 법령에 따라 일정 기간 보관될 수 있음)\n\n제3자 제공: 원칙적으로 개인정보를 제3자에게 제공하지 않습니다.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 antialiased"
      style={{
        backgroundColor: '#E1F6FF',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 15% 10%, rgba(37,99,235,.13) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 85% 85%, rgba(30,64,175,.10) 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 50% 50%, rgba(96,165,250,.07) 0%, transparent 70%)`
      }}>
      <style>{`
        .glass-card { background: rgba(255,255,255,.92); backdrop-filter: blur(16px); }
        .google-btn { transition: background .2s, box-shadow .2s, transform .15s; background: #fff; }
        .google-btn:hover { background: #f1f5f9; box-shadow: 0 4px 18px rgba(15,23,42,.12); transform: translateY(-2px); }
        .feature-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 12px; background: rgba(37,99,235,.04); border: 1px solid rgba(37,99,235,.08); transition: background .2s; }
        .feature-item:hover { background: rgba(37,99,235,.08); }
      `}</style>

      {/* 장식 배경 원 */}
      <div className="pointer-events-none" style={{position:'fixed', top:'-80px', left:'-96px', width:'384px', height:'384px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.15), transparent 70%)'}}></div>
      <div className="pointer-events-none" style={{position:'fixed', bottom:0, right:0, width:'288px', height:'288px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.15), transparent 70%)', animationDelay:'.8s'}}></div>

      {/* 회원가입 카드 */}
      <div className="glass-card rounded-2xl w-full max-w-md p-8 sm:p-10 relative z-10" style={{boxShadow:'0 4px 24px rgba(37,99,235,0.10), 0 1px 4px rgba(15,23,42,0.06)'}}>

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
          <p className="mt-2 text-sm" style={{color:'#94A3B8'}}>Google 계정으로 3초만에 시작하세요</p>
        </div>

        {/* Google 회원가입 버튼 */}
        <div>
          <a href="/accounts/google/login/"
            className="google-btn w-full flex items-center justify-center gap-3 border rounded-2xl py-4 text-sm font-bold focus:outline-none"
            style={{borderColor:'#E2E8F0', color:'#0F172A', boxShadow:'0 4px 24px rgba(37,99,235,0.10)'}}>
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Google 계정으로 회원가입
          </a>
          <p className="text-center text-xs mt-3 flex items-center justify-center gap-1.5" style={{color:'#94A3B8'}}>
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
            별도 비밀번호 설정 없이 Google 계정으로 안전하게 가입됩니다
          </p>
        </div>

        {/* 가입 절차 안내 */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{color:'#94A3B8'}}>가입 절차</p>
          <div className="space-y-2">
            {[
              {step:'1', title:'Google 계정 선택', desc:'사용할 Google 계정을 선택하세요'},
              {step:'2', title:'닉네임 설정', desc:'스터디에서 사용할 닉네임을 입력합니다'},
              {step:'✓', title:'가입 완료 & 시작', desc:'바로 스터디 그룹을 만들거나 참여하세요', green:true},
            ].map((item, idx) => (
              <div key={idx} className="feature-item">
                <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 text-xs font-bold"
                  style={{
                    background: item.green ? '#dcfce7' : '#DBEAFE',
                    color: item.green ? '#15803d' : '#2563EB'
                  }}>{item.step}</div>
                <div>
                  <p className="text-sm font-semibold" style={{color:'#0F172A'}}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{color:'#94A3B8'}}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 이용약관 동의 안내 */}
        <div className="mt-5 p-4 rounded-xl border" style={{background:'#F8FAFC', borderColor:'#E2E8F0'}}>
          <p className="text-xs leading-relaxed" style={{color:'#64748B'}}>
            Google 계정으로 가입 시{' '}
            <button type="button" onClick={showTerms} className="font-semibold hover:underline" style={{color:'#2563EB'}}>이용약관</button>
            {' '}및{' '}
            <button type="button" onClick={showPrivacy} className="font-semibold hover:underline" style={{color:'#2563EB'}}>개인정보 처리방침</button>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>

        {/* 하단: 로그인 링크 */}
        <div className="mt-7 pt-5 border-t text-center" style={{borderColor:'#E2E8F0'}}>
          <p className="text-sm" style={{color:'#94A3B8'}}>
            이미 계정이 있으신가요?{' '}
            <a href="/accounts/login" className="font-semibold ml-1" style={{color:'#2563EB'}}>로그인</a>
          </p>
        </div>
      </div>

      <p className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap z-10" style={{color:'rgba(148,163,184,.7)'}}>
        © 2025 StudyGroupManager. All rights reserved.
      </p>
    </div>
  );
}
