'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface MemberRecord {
  status: string;
  note: string;
  original: string;
}

interface Member {
  id: string;
  nickname: string;
  role: string;
  attendanceRate: number;
  hasRecord: boolean;
  initialStatus: string;
  initialNote: string;
}

interface PenaltyRule {
  absentFee: number;
  lateFee: number;
}

interface SessionInfo {
  id: number;
  topic: string;
  date: string;
  createdBy: string;
  isEdit: boolean;
}

interface GroupInfo {
  id: number;
  name: string;
}

interface Group {
  id: number;
  name: string;
  color?: string;
}

const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Web Developer Study', color: '#0077ff' },
  { id: 2, name: 'Python 스터디', color: '#10b981' },
];

export default function AttendanceCheckPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get('group_id') || '0';
  const sessionId = searchParams.get('session_id') || '0';

  const [session] = useState<SessionInfo>({ id: parseInt(sessionId), topic: '출석 체크', date: new Date().toLocaleDateString('ko-KR'), createdBy: '', isEdit: false });
  const [group] = useState<GroupInfo>({ id: parseInt(groupId), name: '스터디 그룹' });
  const [members, setMembers] = useState<Member[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [penaltyRule, setPenaltyRule] = useState<PenaltyRule>({ absentFee: 5000, lateFee: 2000 });
  const [state, setState] = useState<Record<string, MemberRecord>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [ruleModal, setRuleModal] = useState(false);
  const [newAbsentFee, setNewAbsentFee] = useState(penaltyRule.absentFee.toString());
  const [newLateFee, setNewLateFee] = useState(penaltyRule.lateFee.toString());
  const hasChangesRef = useRef(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(parseInt(groupId) || 0);
  const [reasons, setReasons] = useState<Record<string, {type:string;reason:string;fileName:string|null}>>({});
  const [statusFilter, setStatusFilter] = useState<'all'|'present'|'late'|'absent'|'unset'>('all');

  useEffect(() => {
    fetch('/groups/api/my-groups/', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((data) => {
        const gs = data?.groups ?? [];
        const nextGroups: Group[] = gs.length ? gs.map((g: { id: number; name: string; color: string }) => ({ id: g.id, name: g.name, color: g.color })) : MOCK_GROUPS;
        setGroups(nextGroups);
        setSelectedGroupId(prev => prev || nextGroups[0]?.id || 0);
      })
      .catch(() => {
        setGroups(MOCK_GROUPS);
        setSelectedGroupId(prev => prev || MOCK_GROUPS[0]?.id || 0);
      });
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;
    fetch(`/groups/api/${selectedGroupId}/members/`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setIsLeader(data.is_leader ?? false);
        setMembers((data.members ?? []).map((m: { id: number; nickname: string; role: string; attendance_rate: number }) => ({
          id: String(m.id),
          nickname: m.nickname,
          role: m.role,
          attendanceRate: m.attendance_rate ?? 0,
          hasRecord: false,
          initialStatus: '',
          initialNote: '',
        })));
      })
      .catch(() => {});
  }, [selectedGroupId]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sgm_reasons');
      if (stored) {
        const parsedReasons = JSON.parse(stored);
        queueMicrotask(() => setReasons(parsedReasons));
      }
    } catch { }
  }, []);

  useEffect(() => {
    const savedAttendance: Record<string, string> = JSON.parse(localStorage.getItem('sgm_attendance') || '{}');
    const initial: Record<string, MemberRecord> = {};
    members.forEach(m => {
      const lsStatus = savedAttendance[`g${selectedGroupId}_s${sessionId}_m${m.id}`] || '';
      const status = lsStatus || m.initialStatus;
      initial[m.id] = { status, note: m.initialNote, original: m.initialStatus };
    });
    queueMicrotask(() => setState(initial));
  }, [members, selectedGroupId, sessionId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasChanges = Object.values(state).some(s => s.status && s.status !== s.original);
      if (hasChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state]);

  const counts = useCallback(() => {
    let present = 0, late = 0, absent = 0, filled = 0;
    Object.values(state).forEach(s => {
      if (s.status === 'present') { present++; filled++; }
      else if (s.status === 'late') { late++; filled++; }
      else if (s.status === 'absent') { absent++; filled++; }
    });
    const total = members.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const penalty = (late * penaltyRule.lateFee) + (absent * penaltyRule.absentFee);
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    return { present, late, absent, filled, total, rate, penalty, pct };
  }, [state, members, penaltyRule]);

  const selectStatus = (uid: string, status: string) => {
    setState(prev => {
      const cur = prev[uid] || { status: '', note: '', original: '' };
      return { ...prev, [uid]: { ...cur, status: cur.status === status ? '' : status } };
    });
    hasChangesRef.current = true;
  };

  const setAll = (status: string) => {
    if (!confirm(`모든 멤버를 "${status === 'present' ? '전원 출석' : status === 'late' ? '전원 지각' : '전원 결석'}"으로 변경하시겠습니까?`)) return;
    setState(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(uid => { next[uid] = { ...next[uid], status }; });
      return next;
    });
  };

  const resetAll = () => {
    if (!confirm('모든 출석 상태를 초기화하시겠습니까?')) return;
    setState(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(uid => { next[uid] = { ...next[uid], status: '', note: '' }; });
      return next;
    });
  };

  const saveRule = () => {
    const af = parseInt(newAbsentFee);
    const lf = parseInt(newLateFee);
    if (isNaN(af) || isNaN(lf) || af < 0 || lf < 0) { alert('올바른 금액을 입력해 주세요.'); return; }
    setPenaltyRule({ absentFee: af, lateFee: lf });
    fetch(`/groups/${group.id}/penalty/rule/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ absent_fee: af, late_fee: lf }) }).catch(() => {});
    setRuleModal(false);
    alert('저장 완료');
  };

  const confirmSave = () => {
    const c = counts();
    if (c.filled === 0) { alert('최소 1명 이상의 출석 상태를 선택해 주세요.'); return; }
    setConfirmModal(true);
  };

  const submitAttendance = async () => {
    setConfirmModal(false);
    setSaving(true);
    const records = Object.entries(state)
      .filter(([, s]) => s.status)
      .map(([uid, s]) => ({ member_id: parseInt(uid), status: s.status, note: s.note }));
    try {
      await fetch(`/groups/${group.id}/sessions/${session.id}/check/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      alert('출석 저장 완료!');
      router.push(`/groups/${group.id}`);
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const c = counts();
  const groupTabs = groups.length ? groups : MOCK_GROUPS;
  const activeGroupId = selectedGroupId || groupTabs[0]?.id || 0;
  const selectedGroup = groupTabs.find(g => g.id === activeGroupId) || groupTabs[0] || null;
  const filteredMembers = members.filter(m => {
    if (searchQuery && !m.nickname.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all') {
      const ms = state[m.id]?.status || '';
      if (statusFilter === 'unset') return !ms;
      return ms === statusFilter;
    }
    return true;
  });

  const dotColor = (status: string) => {
    if (status === 'present') return '#4ade80';
    if (status === 'late') return '#facc15';
    if (status === 'absent') return '#f87171';
    return '#cbd5e1';
  };

  const rateColor = (rate: number) => rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-500';
  const rateBarColor = (rate: number) => rate >= 80 ? '#34d399' : rate >= 50 ? '#fbbf24' : '#f87171';

  return (
    <>
      <style>{`
        @keyframes pulseSave {
          0%   { box-shadow: 0 0 0 0 rgba(16,85,232,.4); }
          70%  { box-shadow: 0 0 0 8px rgba(16,85,232,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,85,232,0); }
        }
        .btn-pulse { animation: pulseSave 1.8s infinite; }
        .status-btn { display:inline-flex;align-items:center;justify-content:center;gap:5px;
          padding:7px 14px;border-radius:10px;font-size:13px;font-weight:600;
          cursor:pointer;border:2px solid transparent;transition:all 0.18s ease; }
        .btn-present { background:#f0fdf4;border-color:#d1fae5;color:#86efac; }
        .btn-present.active { background:#dcfce7;border-color:#22c55e;color:#15803d; }
        .btn-late { background:#fffbeb;border-color:#fef3c7;color:#fcd34d; }
        .btn-late.active { background:#fef9c3;border-color:#facc15;color:#b45309; }
        .btn-absent { background:#fff1f2;border-color:#fee2e2;color:#fca5a5; }
        .btn-absent.active { background:#fee2e2;border-color:#f87171;color:#dc2626; }
        .prog-track { height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden; }
        .prog-fill { height:100%;border-radius:99px;transition:width 0.5s ease;background:linear-gradient(90deg,#0077ff,#3a74ef); }
        .member-row { transition:background 0.15s; }
        .member-row:hover { background:#f8fafc; }
        .member-row.changed { box-shadow:inset 3px 0 0 #0077ff;background:#f0f5ff; }
        .status-btn:disabled { cursor:not-allowed;opacity:0.45; }
        button:not(:disabled) { cursor: pointer; }
        .tab-btn { transition: all .2s ease; }
        .tab-btn.active { color: #0077ff; border-bottom: 2px solid #0077ff; font-weight: 700; }
        .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        .fade-up { animation:fadeUp 0.3s ease forwards; }
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
          <div className="flex-1 overflow-y-auto bg-slate-50 pb-28">

        {/* 세션 정보 배너 */}
        <div className="px-4 lg:px-8 pt-5">
          <div className="rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)' }}>
            <div className="absolute top-0 right-0 w-56 h-56 bg-white opacity-5 rounded-full translate-x-16 -translate-y-16" />
            <div className="relative z-10 px-6 lg:px-10 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold bg-white/20 rounded-full px-3 py-1 text-white">{session.date}</span>
                  {session.isEdit && <span className="text-xs font-bold bg-amber-400/80 rounded-full px-2.5 py-1 text-white">수정 모드</span>}
                  <span className="text-xs font-bold bg-white/20 rounded-full px-2.5 py-1 text-white">
                    {selectedGroup ? `${selectedGroup.name}` : ''}
                  </span>
                </div>
                <h1 className="text-white text-xl lg:text-2xl font-bold mb-1">{session.topic}</h1>
                <p className="text-blue-100 text-sm">{selectedGroup?.name || group.name} · 리더: {session.createdBy}</p>
              </div>
              <div className="flex items-center gap-4 bg-white/15 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur flex-shrink-0">
                <div className="text-center"><p className="text-xl font-bold text-white">{c.present}</p><p className="text-xs text-blue-200">출석</p></div>
                <div className="w-px h-8 bg-white/30" />
                <div className="text-center"><p className="text-xl font-bold text-amber-300">{c.late}</p><p className="text-xs text-blue-200">지각</p></div>
                <div className="w-px h-8 bg-white/30" />
                <div className="text-center"><p className="text-xl font-bold text-red-300">{c.absent}</p><p className="text-xs text-blue-200">결석</p></div>
                <div className="w-px h-8 bg-white/30" />
                <div className="text-center"><p className="text-xl font-bold text-green-300">{c.rate}%</p><p className="text-xs text-blue-200">출석률</p></div>
                <div className="w-px h-8 bg-white/30" />
                <div className="text-center"><p className="text-base font-bold text-orange-300">₩{c.penalty.toLocaleString()}</p><p className="text-xs text-blue-200">예상 벌금</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 py-5 space-y-4">

          {/* 읽기 전용 배너 */}
          {!isLeader && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-amber-500 text-base flex-shrink-0">🔒</span>
              <div>
                <p className="text-sm font-bold text-amber-700">읽기 전용 모드</p>
                <p className="text-xs text-amber-600 mt-0.5">리더만 출석 내용을 수정할 수 있습니다.</p>
              </div>
            </div>
          )}

          {/* 탭 + 컨텐츠 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {groupTabs.map(g => {
                const isActive = activeGroupId === g.id;
                const isGroupLeader = isLeader && g.id === activeGroupId;
                return (
                  <button key={g.id}
                    onClick={() => { setSelectedGroupId(g.id); setStatusFilter('all'); }}
                    className={`tab-btn ${isActive ? 'active' : ''} px-5 py-3.5 text-sm text-slate-500 border-b-2 border-transparent -mb-px whitespace-nowrap`}>
                    {g.name}
                    <span className="ml-1.5 badge" style={isActive ? { background: '#dce6fd', color: '#0077ff' } : { background: '#f1f5f9', color: '#64748b' }}>
                      {members.length}명
                    </span>
                    <span className="ml-1 badge" style={{ background: isGroupLeader ? '#fef3c7' : '#f1f5f9', color: isGroupLeader ? '#d97706' : '#94a3b8', fontSize: '10px' }}>
                      {isGroupLeader ? '👑 리더' : '멤버'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="px-4 sm:px-5 py-3 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex-shrink-0">상태 필터</span>
              {([
                { key: 'all' as const, label: '전체', color: '#0077ff', bg: '#dce6fd' },
                { key: 'present' as const, label: '출석', color: '#16a34a', bg: '#dcfce7' },
                { key: 'late' as const, label: '지각', color: '#d97706', bg: '#fef9c3' },
                { key: 'absent' as const, label: '결석', color: '#dc2626', bg: '#fee2e2' },
                { key: 'unset' as const, label: '미입력', color: '#64748b', bg: '#f1f5f9' },
              ]).map(f => {
                const cnt = f.key === 'all' ? members.length
                  : f.key === 'unset' ? Object.values(state).filter(s => !s.status).length
                  : Object.values(state).filter(s => s.status === f.key).length;
                return (
                  <button key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                    style={statusFilter === f.key
                      ? { background: f.bg, color: f.color, borderColor: f.color + '50' }
                      : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}>
                    {f.label} <span className="font-bold">{cnt}</span>
                  </button>
                );
              })}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-50 pt-3">
              {isLeader && <>
              <span className="text-xs text-slate-500 font-semibold flex-shrink-0">일괄 적용</span>
              <button onClick={() => setAll('present')} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-semibold transition-colors">✅ 전원 출석</button>
              <button onClick={() => setAll('late')} className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold transition-colors">⏰ 전원 지각</button>
              <button onClick={() => setAll('absent')} className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-semibold transition-colors">❌ 전원 결석</button>
              <button onClick={resetAll} className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition-colors">🔄 초기화</button>
              </>}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 ml-auto flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>결석 <span className="font-bold text-red-600">{penaltyRule.absentFee.toLocaleString()}원</span></span>
                <span className="text-slate-200">·</span>
                <span>지각 <span className="font-bold text-amber-600">{penaltyRule.lateFee.toLocaleString()}원</span></span>
                {isLeader && <button onClick={() => { setNewAbsentFee(penaltyRule.absentFee.toString()); setNewLateFee(penaltyRule.lateFee.toString()); setRuleModal(true); }} className="ml-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors">수정</button>}
              </div>
              </div>
            </div>
          </div>

          {/* 진행 현황 바 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">입력 진행 현황</span>
              <span className="text-xs text-slate-400">{c.filled} / {c.total}명 입력 완료</span>
            </div>
            <div className="prog-track"><div className="prog-fill" style={{ width: `${c.pct}%` }} /></div>
          </div>

          {/* 멤버 출석 목록 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <h2 className="font-bold text-slate-800">멤버 출석</h2>
                <span className="text-xs text-slate-400 font-normal">({filteredMembers.length}/{members.length}명)</span>
              </div>
              <div className="relative">
                <svg className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" placeholder="멤버 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-xl w-36 focus:outline-none focus:border-blue-500 transition-all" />
              </div>
            </div>

            <div>
              {filteredMembers.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-sm font-semibold">{statusFilter !== 'all' ? '해당 상태의 멤버가 없습니다.' : '그룹 멤버가 없습니다.'}</p>
                  <p className="text-xs mt-1">{statusFilter !== 'all' ? '다른 필터를 선택해 보세요.' : '멤버를 먼저 초대해 주세요.'}</p>
                </div>
              ) : filteredMembers.map((m, idx) => {
                const s = state[m.id] || { status: '', note: '', original: '' };
                const showPenalty = s.status === 'absent' && penaltyRule.absentFee > 0 || s.status === 'late' && penaltyRule.lateFee > 0;
                const penaltyLabel = s.status === 'absent' ? `결석 벌금 ${penaltyRule.absentFee.toLocaleString()}원이 자동 부과됩니다.` : `지각 벌금 ${penaltyRule.lateFee.toLocaleString()}원이 자동 부과됩니다.`;
                const showReason = s.status === 'late' || s.status === 'absent';
                const memberReason = showReason ? reasons[`g${selectedGroupId}_s${sessionId}_m${m.id}`] : null;

                return (
                  <div key={m.id} className={`member-row border-b border-slate-50 last:border-0 fade-up ${s.status !== s.original && s.status ? 'changed' : ''}`}
                    style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="px-4 sm:px-5 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                              style={{ background: 'linear-gradient(135deg,#3a74ef,#0d44c4)' }}>
                              {m.nickname[0]?.toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                              style={{ background: dotColor(s.status) }} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-800 text-sm">{m.nickname}</p>
                              {m.role === 'leader' && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#dce6fd', color: '#0077ff' }}>리더</span>}
                              {m.hasRecord && <span className="text-xs text-amber-600 font-medium">기존 기록 있음</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-400">누적 출석률</span>
                              <span className={`text-xs font-bold ${rateColor(m.attendanceRate)}`}>{m.attendanceRate}%</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                <div className="h-full rounded-full" style={{ width: `${m.attendanceRate}%`, background: rateBarColor(m.attendanceRate) }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button type="button" className={`status-btn btn-present ${s.status === 'present' ? 'active' : ''}`} onClick={() => selectStatus(m.id, 'present')} disabled={!isLeader}>
                            <span>✅</span><span>출석</span>
                          </button>
                          <button type="button" className={`status-btn btn-late ${s.status === 'late' ? 'active' : ''}`} onClick={() => selectStatus(m.id, 'late')} disabled={!isLeader}>
                            <span>⏰</span><span>지각</span>
                          </button>
                          <button type="button" className={`status-btn btn-absent ${s.status === 'absent' ? 'active' : ''}`} onClick={() => selectStatus(m.id, 'absent')} disabled={!isLeader}>
                            <span>❌</span><span>결석</span>
                          </button>
                        </div>
                      </div>

                      {showReason && (
                        <div className="mt-3">
                          {memberReason ? (
                            <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
                              <span className="text-base flex-shrink-0">📋</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-xs font-semibold text-blue-700">제출된 사유서</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${memberReason.type === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {memberReason.type === 'late' ? '지각' : '결석'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{memberReason.reason}</p>
                                {memberReason.fileName && <p className="text-xs text-slate-400 mt-1.5">📎 {memberReason.fileName}</p>}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center">
                              제출된 사유서 없음
                            </div>
                          )}
                        </div>
                      )}

                      {showPenalty && (
                        <div className="flex mt-2 items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                          <span>{penaltyLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
          </main>
        </div>
      </div>

      {/* 하단 고정 저장 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-4 text-sm flex-1 w-full sm:w-auto flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-600">출석 <strong className="text-emerald-600">{c.present}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-600">지각 <strong className="text-amber-600">{c.late}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="text-slate-600">결석 <strong className="text-red-600">{c.absent}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-slate-500 text-xs">예상 벌금</span>
                <strong className="text-orange-600 text-sm">₩{c.penalty.toLocaleString()}</strong>
              </div>
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-slate-500 text-xs">입력</span>
                <strong className="text-slate-700 text-sm">{c.filled}/{c.total}</strong>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => router.back()} className="flex-1 sm:flex-none text-center text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors">취소</button>
              {isLeader ? (
                <button onClick={confirmSave} disabled={saving}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-bold text-white px-6 py-2.5 rounded-xl transition-colors shadow-sm ${c.filled > 0 ? 'btn-pulse' : ''}`}
                  style={{ background: '#0077ff' }}>
                  {saving ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  )}
                  {saving ? '저장 중...' : '출석 저장'}
                </button>
              ) : (
                <span className="flex-1 sm:flex-none text-center text-sm font-semibold px-6 py-2.5 rounded-xl" style={{background:'#f1f5f9', color:'#94a3b8'}}>🔒 읽기 전용</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 저장 확인 모달 */}
      {isLeader && confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">출석 저장 확인</h2>
            <div className="grid grid-cols-4 gap-2 text-center mb-4">
              <div className="rounded-xl p-3" style={{ background: '#dcfce7' }}><p className="text-xl font-bold text-emerald-600">{c.present}</p><p className="text-xs text-emerald-500 mt-0.5">출석</p></div>
              <div className="rounded-xl p-3" style={{ background: '#fef9c3' }}><p className="text-xl font-bold text-amber-600">{c.late}</p><p className="text-xs text-amber-500 mt-0.5">지각</p></div>
              <div className="rounded-xl p-3" style={{ background: '#fee2e2' }}><p className="text-xl font-bold text-red-600">{c.absent}</p><p className="text-xs text-red-500 mt-0.5">결석</p></div>
              <div className="rounded-xl p-3" style={{ background: '#dce6fd' }}><p className="text-xl font-bold" style={{ color: '#0077ff' }}>{c.rate}%</p><p className="text-xs mt-0.5" style={{ color: '#3a74ef' }}>출석률</p></div>
            </div>
            {c.filled < c.total && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">⚠️ {c.total - c.filled}명의 출석 상태가 입력되지 않았습니다. 미입력 멤버는 건너뜁니다.</p>}
            {c.penalty > 0 && (
              <div className="rounded-xl p-3 border mb-3" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                <p className="text-xs text-orange-600 font-bold">💰 자동 부과될 벌금</p>
                <p className="text-lg font-bold text-orange-700 mt-0.5">{c.penalty.toLocaleString()}원</p>
                <p className="text-xs text-orange-400 mt-0.5">지각 {c.late}명 × {penaltyRule.lateFee.toLocaleString()}원 + 결석 {c.absent}명 × {penaltyRule.absentFee.toLocaleString()}원</p>
              </div>
            )}
            <p className="text-xs text-slate-400 mb-5">저장 후 출석률이 자동으로 갱신됩니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={submitAttendance} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#0077ff' }}>저장 완료</button>
            </div>
          </div>
        </div>
      )}

      {/* 벌금 규칙 수정 모달 */}
      {isLeader && ruleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">벌금 규칙 수정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">결석 벌금 (원)</label>
                <input type="number" min="0" value={newAbsentFee} onChange={e => setNewAbsentFee(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">지각 벌금 (원)</label>
                <input type="number" min="0" value={newLateFee} onChange={e => setNewLateFee(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRuleModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={saveRule} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#0077ff' }}>저장</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
