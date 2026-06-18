'use client';

import { useState, useEffect, useCallback, useRef, type ReactElement } from 'react';
import Header from '@/components/Header';
import LeftMenu from '@/components/LeftMenu';

// ── Types ────────────────────────────────────────────────
type ViewType = 'month' | 'week' | 'day';

interface CalEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  start_time?: string;
  end_time?: string;
  group_id?: number;
  group_name?: string;
  group_color?: string;
  type: 'session' | 'personal';
  status?: string;
  topic?: string;
  location?: string;
  note?: string;
  color?: string;
}

interface GroupInfo {
  id: number;
  name: string;
  color: string;
}

interface CalSummary {
  week_sessions: number;
  attendance_rate: number;
  unchecked: number;
  personal_events: number;
}

// Modal state shapes
interface EventViewModal {
  open: boolean;
  event: CalEvent | null;
}
interface DateClickModal {
  open: boolean;
  ds: string;
}
interface SessionCreateModal {
  open: boolean;
  ds: string;
  groupId: string;
  topic: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  note: string;
  error: string;
}
interface MemoCreateModal {
  open: boolean;
  ds: string;
  time: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  note: string;
  error: string;
}
interface MemoEditModal {
  open: boolean;
  event: CalEvent | null;
  title: string;
  date: string;
  startTime: string;
  note: string;
  error: string;
}
interface ExportModal {
  open: boolean;
  range: string;
}
interface MoreEventsModal {
  open: boolean;
  ds: string;
  events: CalEvent[];
}

// ── Constants ────────────────────────────────────────────
const GROUP_COLORS = ['#0077ff', '#7c3aed', '#059669', '#d97706', '#e11d48', '#0891b2', '#9333ea', '#dc2626'];
const MEMO_COLORS  = ['#2E86AB', '#0077ff', '#7c3aed', '#059669', '#d97706', '#e11d48', '#0891b2', '#9333ea'];
const MONTHS       = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const DAYS_KR      = ['일','월','화','수','목','금','토'];

// ── Helpers ──────────────────────────────────────────────
function dStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fallbackEvents(): CalEvent[] {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth()+1).padStart(2,'0');
  const p = (n: number) => String(n).padStart(2,'0');
  const td = t.getDate();
  return [
    { id:1, title:'Python 알고리즘 세션', date:`${y}-${m}-${p(td)}`, start_time:'14:00', end_time:'16:00',
      group_id:1, group_name:'Python 알고리즘', group_color:'#7c3aed', type:'session', status:'unchecked', topic:'정렬 알고리즘', location:'강남 스터디카페' },
    { id:2, title:'Web Dev 세션', date:`${y}-${m}-${p(Math.min(td+2,28))}`, start_time:'10:00', end_time:'12:00',
      group_id:2, group_name:'Web Developer', group_color:'#0077ff', type:'session', status:'completed', topic:'React 컴포넌트' },
    { id:3, title:'토익 스터디', date:`${y}-${m}-${p(Math.min(td+4,28))}`, start_time:'09:00', end_time:'11:00',
      group_id:3, group_name:'토익 900점', group_color:'#059669', type:'session', status:'unchecked' },
    { id:4, title:'개인: 책 읽기', date:`${y}-${m}-${p(Math.min(td+1,28))}`,
      type:'personal', status:'personal', color:'#2E86AB', note:'클린코드 3장' },
    { id:5, title:'AI 월간 리포트', date:`${y}-${m}-${p(Math.max(td-2,1))}`, start_time:'15:00', end_time:'17:00',
      group_id:4, group_name:'AI 리포트', group_color:'#d97706', type:'session', status:'completed', topic:'5월 분석' },
  ];
}

function fallbackUpcoming(): CalEvent[] {
  const t = new Date();
  const evts: CalEvent[] = [];
  const titles  = ['Python 세션','Web Dev','토익 스터디','개인 리뷰','AI 리포트'];
  const gnames  = ['Python 알고리즘','Web Developer','토익 900점','개인','AI 리포트'];
  const colors  = ['#7c3aed','#0077ff','#059669','#2E86AB','#d97706'];
  const times   = ['14:00','10:00','09:00','','15:00'];
  for (let i = 1; i <= 5; i++) {
    const d = new Date(t); d.setDate(t.getDate()+i);
    evts.push({ id: 100+i, title: titles[i-1], date: dStr(d), start_time: times[i-1],
      group_name: gnames[i-1], color: colors[i-1], group_color: colors[i-1], type:'session' });
  }
  return evts;
}

// ── Component ────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();

  // Calendar state
  const [view, setViewState] = useState<ViewType>('month');
  const [calDate, setCalDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [groupFilters, setGroupFilters] = useState<Set<string>>(new Set());
  const [eventMap, setEventMap] = useState<Record<number, CalEvent>>({});
  const [miniYear, setMiniYear] = useState(today.getFullYear());
  const [miniMonth, setMiniMonth] = useState(today.getMonth());
  const [summary, setSummary] = useState<CalSummary>({ week_sessions:3, attendance_rate:87, unchecked:1, personal_events:2 });
  const [upcoming, setUpcoming] = useState<CalEvent[]>([]);

  // Modal states
  const [eventViewModal, setEventViewModal] = useState<EventViewModal>({ open: false, event: null });
  const [dateClickModal, setDateClickModal] = useState<DateClickModal>({ open: false, ds: '' });
  const [sessionModal, setSessionModal] = useState<SessionCreateModal>({
    open: false, ds: '', groupId: '', topic: '', date: '', startTime: '14:00', endTime: '16:00', location: '', note: '', error: ''
  });
  const [memoCreateModal, setMemoCreateModal] = useState<MemoCreateModal>({
    open: false, ds: '', time: '', title: '', date: '', startTime: '', endTime: '', color: MEMO_COLORS[0], note: '', error: ''
  });
  const [memoEditModal, setMemoEditModal] = useState<MemoEditModal>({
    open: false, event: null, title: '', date: '', startTime: '', note: '', error: ''
  });
  const [exportModal, setExportModal] = useState<ExportModal>({ open: false, range: 'month' });
  const [moreModal, setMoreModal] = useState<MoreEventsModal>({ open: false, ds: '', events: [] });

  const calDateRef = useRef(calDate);
  calDateRef.current = calDate;
  const viewRef = useRef(view);
  viewRef.current = view;

  // ── API ────────────────────────────────────────────────
  const loadGroups = useCallback(async () => {
    try {
      const res = await fetch('/groups/api/my-groups/');
      if (!res.ok) throw new Error();
      const data: GroupInfo[] = await res.json();
      const gs = data.map((g, i) => ({ ...g, color: g.color || GROUP_COLORS[i % GROUP_COLORS.length] }));
      setGroups(gs);
      setGroupFilters(new Set(gs.map(g => String(g.id))));
    } catch {
      setGroups([]);
      setGroupFilters(new Set());
    }
  }, []);

  const loadEvents = useCallback(async (d: Date, v: ViewType) => {
    try {
      let params = '';
      if (v === 'month') {
        params = `year=${d.getFullYear()}&month=${d.getMonth()+1}`;
      } else if (v === 'week') {
        const sow = new Date(d); sow.setDate(d.getDate()-d.getDay());
        const eow = new Date(sow); eow.setDate(sow.getDate()+6);
        params = `start=${dStr(sow)}&end=${dStr(eow)}`;
      } else {
        params = `date=${dStr(d)}`;
      }
      const res = await fetch(`/calendar/api/events/?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const evts: CalEvent[] = data.events || [];
      setEvents(evts);
      const map: Record<number, CalEvent> = {};
      evts.forEach(e => { map[e.id] = e; });
      setEventMap(map);
    } catch {
      const fb = fallbackEvents();
      setEvents(fb);
      const map: Record<number, CalEvent> = {};
      fb.forEach(e => { map[e.id] = e; });
      setEventMap(map);
    }
  }, []);

  const loadCalSummary = useCallback(async (d: Date) => {
    try {
      const res = await fetch(`/calendar/api/summary/?year=${d.getFullYear()}&month=${d.getMonth()+1}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data);
    } catch {
      setSummary({ week_sessions:3, attendance_rate:87, unchecked:1, personal_events:2 });
    }
  }, []);

  const loadUpcoming = useCallback(async () => {
    try {
      const res = await fetch('/calendar/api/upcoming/');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUpcoming(data.events || []);
    } catch {
      setUpcoming(fallbackUpcoming());
    }
  }, []);

  useEffect(() => {
    loadGroups().then(() => loadEvents(calDate, view));
    loadCalSummary(calDate);
    loadUpcoming();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ─────────────────────────────────────────
  const setView = (v: ViewType) => {
    setViewState(v);
    loadEvents(calDate, v);
  };

  const goToday = () => {
    const d = new Date();
    setCalDate(d);
    setMiniYear(d.getFullYear());
    setMiniMonth(d.getMonth());
    loadEvents(d, view);
  };

  const goPrev = () => {
    const d = new Date(calDate);
    if (view === 'month')     { d.setDate(1); d.setMonth(d.getMonth()-1); }
    else if (view === 'week') { d.setDate(d.getDate()-7); }
    else                       { d.setDate(d.getDate()-1); }
    setCalDate(d);
    setMiniYear(d.getFullYear());
    setMiniMonth(d.getMonth());
    loadEvents(d, view);
  };

  const goNext = () => {
    const d = new Date(calDate);
    if (view === 'month')     { d.setDate(1); d.setMonth(d.getMonth()+1); }
    else if (view === 'week') { d.setDate(d.getDate()+7); }
    else                       { d.setDate(d.getDate()+1); }
    setCalDate(d);
    setMiniYear(d.getFullYear());
    setMiniMonth(d.getMonth());
    loadEvents(d, view);
  };

  // ── Nav title ──────────────────────────────────────────
  const navTitle = () => {
    const d = calDate;
    if (view === 'month') return `${d.getFullYear()}년 ${MONTHS[d.getMonth()]}`;
    if (view === 'week') {
      const sow = new Date(d); sow.setDate(d.getDate()-d.getDay());
      const eow = new Date(sow); eow.setDate(sow.getDate()+6);
      return sow.getMonth() === eow.getMonth()
        ? `${sow.getFullYear()}년 ${MONTHS[sow.getMonth()]} ${sow.getDate()}~${eow.getDate()}일`
        : `${MONTHS[sow.getMonth()]} ${sow.getDate()}일 ~ ${MONTHS[eow.getMonth()]} ${eow.getDate()}일`;
    }
    return `${d.getFullYear()}년 ${MONTHS[d.getMonth()]} ${d.getDate()}일 (${DAYS_KR[d.getDay()]})`;
  };

  // ── Group filter ───────────────────────────────────────
  const toggleGroupFilter = (gid: string, checked: boolean) => {
    setGroupFilters(prev => {
      const s = new Set(prev);
      if (checked) s.add(gid); else s.delete(gid);
      return s;
    });
  };

  const toggleAllGroups = () => {
    if (groupFilters.size === groups.length) {
      setGroupFilters(new Set());
    } else {
      setGroupFilters(new Set(groups.map(g => String(g.id))));
    }
  };

  const filterToggleLabel = groupFilters.size === groups.length ? '전체 해제' : '전체 선택';

  // ── Visible events (filtered) ──────────────────────────
  const visibleEvents = (evts: CalEvent[]) =>
    evts.filter(e => !e.group_id || groupFilters.size === 0 || groupFilters.has(String(e.group_id)));

  // ── Week summary ───────────────────────────────────────
  const weekSummary = (() => {
    const sow = new Date(today); sow.setDate(today.getDate()-today.getDay()); sow.setHours(0,0,0,0);
    const eow = new Date(sow); eow.setDate(sow.getDate()+6); eow.setHours(23,59,59,999);
    const w = events.filter(e => { const ed = new Date(e.date+'T00:00:00'); return ed >= sow && ed <= eow; });
    return {
      sessions:   w.filter(e => e.type === 'session').length,
      attendance: w.filter(e => e.type === 'session').length,
      unchecked:  w.filter(e => e.status === 'unchecked').length,
      personal:   w.filter(e => e.type === 'personal').length,
    };
  })();

  // ── Mini calendar ──────────────────────────────────────
  const renderMiniCalendar = () => {
    const firstDay = new Date(miniYear, miniMonth, 1).getDay();
    const lastDate = new Date(miniYear, miniMonth+1, 0).getDate();
    const prevLast = new Date(miniYear, miniMonth, 0).getDate();
    const eventDays = new Set(
      events.filter(e => { const ed = new Date(e.date); return ed.getFullYear()===miniYear && ed.getMonth()===miniMonth; })
            .map(e => new Date(e.date).getDate())
    );
    const selDStr = dStr(calDate);
    const cells: ReactElement[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <span key={`prev-${i}`} className="mini-cal-day other">{prevLast - firstDay + i + 1}</span>
      );
    }
    for (let day = 1; day <= lastDate; day++) {
      const isToday = miniYear===today.getFullYear() && miniMonth===today.getMonth() && day===today.getDate();
      const ds = `${miniYear}-${String(miniMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const isSel = ds === selDStr && !isToday;
      const hasE = eventDays.has(day) && !isToday;
      const cls = ['mini-cal-day', isToday?'today':'', isSel?'selected':'', hasE?'has-event':''].filter(Boolean).join(' ');
      cells.push(
        <span key={ds} className={cls} onClick={() => miniCalClick(ds)}>{day}</span>
      );
    }
    const rem = (firstDay + lastDate) % 7;
    if (rem) for (let i = 1; i <= 7-rem; i++) {
      cells.push(<span key={`next-${i}`} className="mini-cal-day other">{i}</span>);
    }
    return cells;
  };

  const miniCalClick = (ds: string) => {
    const d = new Date(ds + 'T00:00:00');
    setCalDate(d);
    setMiniYear(d.getFullYear());
    setMiniMonth(d.getMonth());
    setViewState('day');
    loadEvents(d, 'day');
  };

  const prevMiniMonth = () => {
    if (miniMonth === 0) { setMiniMonth(11); setMiniYear(y => y-1); }
    else setMiniMonth(m => m-1);
  };
  const nextMiniMonth = () => {
    if (miniMonth === 11) { setMiniMonth(0); setMiniYear(y => y+1); }
    else setMiniMonth(m => m+1);
  };

  // ── Handlers ───────────────────────────────────────────
  const handleEventClick = (id: number) => {
    const e = eventMap[id];
    if (!e) return;
    setEventViewModal({ open: true, event: e });
  };

  const handleDateClick = (ds: string) => {
    setDateClickModal({ open: true, ds });
  };

  const handleDateTimeClick = (ds: string, time: string) => {
    openMemoCreate(ds, time);
  };

  const openSessionCreate = (ds: string) => {
    setDateClickModal({ open: false, ds: '' });
    setSessionModal({ open:true, ds, groupId:'', topic:'', date:ds, startTime:'14:00', endTime:'16:00', location:'', note:'', error:'' });
  };

  const openMemoCreate = (ds: string, time: string = '') => {
    setDateClickModal({ open: false, ds: '' });
    setMemoCreateModal({ open:true, ds, time, title:'', date:ds, startTime:time, endTime:'', color:MEMO_COLORS[0], note:'', error:'' });
  };

  const submitSessionCreate = async () => {
    if (!sessionModal.groupId) { setSessionModal(s => ({ ...s, error:'그룹을 선택해 주세요.' })); return; }
    if (!sessionModal.topic.trim()) { setSessionModal(s => ({ ...s, error:'주제를 입력해 주세요.' })); return; }
    try {
      const res = await fetch('/calendar/api/sessions/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: sessionModal.groupId, topic: sessionModal.topic,
          date: sessionModal.date, start_time: sessionModal.startTime, end_time: sessionModal.endTime,
          location: sessionModal.location, note: sessionModal.note }),
      });
      if (!res.ok) throw new Error();
      setSessionModal(s => ({ ...s, open: false }));
      alert(`"${sessionModal.topic}" 세션이 생성되었습니다.`);
      loadEvents(calDate, view);
      loadCalSummary(calDate);
    } catch {
      alert('세션 생성에 실패했습니다.');
    }
  };

  const submitMemoCreate = async () => {
    if (!memoCreateModal.title.trim()) { setMemoCreateModal(s => ({ ...s, error:'제목을 입력해 주세요.' })); return; }
    try {
      const res = await fetch('/calendar/api/personal-events/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: memoCreateModal.title, date: memoCreateModal.date,
          start_time: memoCreateModal.startTime, end_time: memoCreateModal.endTime,
          color: memoCreateModal.color, note: memoCreateModal.note }),
      });
      if (!res.ok) throw new Error();
      setMemoCreateModal(s => ({ ...s, open: false }));
      alert('메모 저장 완료!');
      loadEvents(calDate, view);
      loadCalSummary(calDate);
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  const submitMemoEdit = async () => {
    if (!memoEditModal.event) return;
    try {
      const res = await fetch(`/calendar/api/personal-events/${memoEditModal.event.id}/update/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: memoEditModal.title, date: memoEditModal.date,
          start_time: memoEditModal.startTime, note: memoEditModal.note }),
      });
      if (!res.ok) throw new Error();
      setMemoEditModal(s => ({ ...s, open: false }));
      alert('수정 완료!');
      loadEvents(calDate, view);
    } catch {
      alert('수정 실패.');
    }
  };

  const confirmDeleteMemo = async (id: number) => {
    if (!confirm('이 개인 메모를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/calendar/api/personal-events/${id}/delete/`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setEventViewModal({ open: false, event: null });
      alert('삭제 완료!');
      loadEvents(calDate, view);
      loadCalSummary(calDate);
    } catch {
      alert('삭제 실패.');
    }
  };

  const exportCalendar = async () => {
    if (!exportModal.open) { setExportModal({ open: true, range: 'month' }); return; }
  };

  const submitExport = async () => {
    try {
      const res = await fetch(`/calendar/api/export/?range=${exportModal.range}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'studygroup-calendar.ics'; a.click();
      URL.revokeObjectURL(url);
      setExportModal({ open: false, range: 'month' });
      alert('내보내기 완료!');
    } catch {
      alert('내보내기에 실패했습니다.');
    }
  };

  // ── Month view ─────────────────────────────────────────
  const renderMonthView = () => {
    const d = calDate;
    const year = d.getFullYear(), month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month+1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();

    const byDate: Record<number, CalEvent[]> = {};
    events.forEach(e => {
      const ed = new Date(e.date);
      if (ed.getFullYear() === year && ed.getMonth() === month) {
        const day = ed.getDate();
        if (!byDate[day]) byDate[day] = [];
        byDate[day].push(e);
      }
    });

    const cells: ReactElement[] = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div key={`prev-${i}`} className="month-cell p-1" style={{ background:'var(--bg-input)', opacity:0.5 }}>
          <div className="text-xs text-right p-0.5 text-slate-400">{prevLast - firstDay + i + 1}</div>
        </div>
      );
    }
    for (let day = 1; day <= lastDate; day++) {
      const isToday = year===today.getFullYear() && month===today.getMonth() && day===today.getDate();
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const rawEvents = byDate[day] || [];
      const visible = visibleEvents(rawEvents);
      const shown = visible.slice(0, 3);
      const more = visible.length - shown.length;

      cells.push(
        <div key={ds} className="month-cell p-1 cursor-pointer" onClick={() => handleDateClick(ds)}>
          <div className="flex justify-end p-0.5 mb-0.5">
            {isToday
              ? <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold text-white" style={{ background:'#0077ff' }}>{day}</span>
              : <span className="text-xs font-medium text-slate-600">{day}</span>}
          </div>
          <div className="space-y-0.5">
            {shown.map(e => {
              const color = e.color || e.group_color || '#0077ff';
              return (
                <div key={e.id} className="event-chip" style={{ background:`${color}1a`, color, borderLeftColor:color }}
                  onClick={ev => { ev.stopPropagation(); handleEventClick(e.id); }} title={e.title}>
                  {e.status==='unchecked' ? '⚠ ' : ''}{e.title}
                </div>
              );
            })}
            {more > 0 && (
              <div className="text-xs px-1 font-semibold cursor-pointer hover:underline" style={{ color:'#2E86AB' }}
                onClick={ev => { ev.stopPropagation(); setMoreModal({ open:true, ds, events:visible }); }}>
                +{more}개 더
              </div>
            )}
          </div>
        </div>
      );
    }
    const total = firstDay + lastDate;
    const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 1; i <= rem; i++) {
      cells.push(
        <div key={`next-${i}`} className="month-cell p-1" style={{ background:'var(--bg-input)', opacity:0.5 }}>
          <div className="text-xs text-right p-0.5 text-slate-400">{i}</div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7" style={{ borderBottom:'1px solid var(--border-card)' }}>
          {DAYS_KR.map((day, i) => (
            <div key={day} className={`py-2.5 text-center text-xs font-bold ${i===0?'text-rose-500':i===6?'text-blue-500':'text-slate-500'}`}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    );
  };

  // ── Week view ───────────────────────────────────────────
  const renderWeekView = () => {
    const d = calDate;
    const sow = new Date(d); sow.setDate(d.getDate()-d.getDay());
    const days = Array.from({ length:7 }, (_, i) => { const x = new Date(sow); x.setDate(sow.getDate()+i); return x; });

    const byDate: Record<string, CalEvent[]> = {};
    days.forEach(day => {
      const ds = dStr(day);
      byDate[ds] = visibleEvents(events.filter(e => e.date === ds));
    });

    const hours = Array.from({ length: 16 }, (_, i) => i + 7);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth:560 }}>
          <thead>
            <tr>
              <th style={{ width:48, background:'var(--bg-input)', borderBottom:'1px solid var(--border-card)', borderRight:'1px solid var(--border-card)' }}></th>
              {days.map((day, i) => {
                const isTodayDay = day.toDateString() === today.toDateString();
                return (
                  <th key={i} className="week-header-cell py-2 px-1 text-center" style={{ background:'var(--bg-input)', borderBottom:'1px solid var(--border-card)' }}>
                    <span className={`block text-xs font-bold ${i===0?'text-rose-500':i===6?'text-blue-500':'text-slate-500'}`}>{DAYS_KR[i]}</span>
                    <span className={`mx-auto mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isTodayDay?'text-white':'text-slate-700'}`}
                      style={isTodayDay?{background:'#0077ff'}:{}}>{day.getDate()}</span>
                    <span className="block text-xs text-slate-400">{day.getMonth()+1}/{day.getDate()}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* All-day row */}
            <tr>
              <td className="week-time-cell" style={{ height:'auto', padding:'4px 6px 4px 0' }}>종일</td>
              {days.map((day, i) => {
                const ds = dStr(day);
                const allDay = (byDate[ds]||[]).filter(e => !e.start_time);
                return (
                  <td key={i} className="week-day-cell" style={{ height:'auto', minHeight:30, verticalAlign:'top', padding:3 }}>
                    {allDay.map(e => {
                      const color = e.color || e.group_color || '#0077ff';
                      return (
                        <div key={e.id} className="event-chip mb-0.5" style={{ background:`${color}1a`, color, borderLeftColor:color }}
                          onClick={() => handleEventClick(e.id)}>
                          {e.status==='unchecked' ? '⚠ ' : ''}{e.title}
                        </div>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
            {/* Hour rows */}
            {hours.map(h => {
              const label = `${String(h).padStart(2,'0')}:00`;
              return (
                <tr key={h}>
                  <td className="week-time-cell">{label}</td>
                  {days.map((day, i) => {
                    const ds = dStr(day);
                    const slotEvts = (byDate[ds]||[]).filter(e => e.start_time && parseInt(e.start_time)===h);
                    return (
                      <td key={i} className="week-day-cell" onClick={() => handleDateTimeClick(ds, label)}>
                        {slotEvts.map(e => {
                          const color = e.color || e.group_color || '#0077ff';
                          return (
                            <div key={e.id} className="day-event-block" style={{ borderColor:color, background:`${color}15`, color }}
                              onClick={ev => { ev.stopPropagation(); handleEventClick(e.id); }}>
                              {e.status==='unchecked' ? '⚠ ' : ''}{e.title}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Day view ────────────────────────────────────────────
  const renderDayView = () => {
    const d = calDate;
    const isToday = d.toDateString() === today.toDateString();
    const ds = dStr(d);
    const dayEvts = visibleEvents(events.filter(e => e.date === ds));
    const allDay = dayEvts.filter(e => !e.start_time);

    return (
      <div className="p-4">
        {allDay.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border border-slate-100" style={{ background:'var(--bg-input)' }}>
            <p className="text-xs font-bold text-slate-500 mb-2">종일</p>
            {allDay.map(e => {
              const color = e.color || e.group_color || '#0077ff';
              return (
                <div key={e.id} className="event-chip mb-1" style={{ background:`${color}1a`, color, borderLeftColor:color }}
                  onClick={() => handleEventClick(e.id)}>
                  {e.status==='unchecked' ? '⚠ ' : ''}{e.title}
                </div>
              );
            })}
          </div>
        )}
        {Array.from({ length: 24 }, (_, h) => {
          const label = `${String(h).padStart(2,'0')}:00`;
          const slotEvts = dayEvts.filter(e => e.start_time && parseInt(e.start_time)===h);
          const isCur = isToday && today.getHours() === h;
          return (
            <div key={h} className={`flex gap-3 border-b border-slate-100 ${isCur?'rounded-lg':''}`}
              style={isCur?{background:'#eef7fb'}:{}}>
              <div className="w-12 text-right text-xs text-slate-400 py-3 flex-shrink-0">{label}</div>
              <div className="flex-1 min-h-[50px] py-1.5 cursor-pointer hover:bg-slate-50 rounded transition-colors"
                onClick={() => handleDateTimeClick(ds, label)}>
                {slotEvts.map(e => {
                  const color = e.color || e.group_color || '#0077ff';
                  return (
                    <div key={e.id} className="day-event-block" style={{ borderColor:color, background:`${color}15`, color }}
                      onClick={ev => { ev.stopPropagation(); handleEventClick(e.id); }}>
                      <div className="font-semibold">{e.status==='unchecked' ? '⚠ ' : ''}{e.title}</div>
                      <div style={{ opacity:0.7, fontSize:11 }}>{e.group_name||'개인'} {e.start_time||''}{e.end_time?' ~ '+e.end_time:''}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Upcoming events ─────────────────────────────────────
  const renderUpcomingList = (evts: CalEvent[]) => {
    if (!evts.length) return <p className="text-xs text-slate-400 text-center py-3">예정된 일정이 없습니다.</p>;
    const now = new Date(); now.setHours(0,0,0,0);
    return evts.map(e => {
      const ed = new Date(e.date+'T00:00:00');
      const diff = Math.ceil((ed.getTime() - now.getTime()) / 86400000);
      const dday = diff===0?'D-Day':diff>0?`D-${diff}`:`D+${Math.abs(diff)}`;
      const ddayColor = diff===0?'#e11d48':diff<=3?'#d97706':'#2E86AB';
      const color = e.color || e.group_color || '#0077ff';
      return (
        <div key={e.id} className="flex gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors"
          onClick={() => handleEventClick(e.id)}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${color}15` }}>
            <span className="dday-chip" style={{ background:`${ddayColor}20`, color:ddayColor }}>{dday}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{e.title}</p>
            <p className="text-xs text-slate-400 truncate">{e.group_name||'개인'}</p>
            <p className="text-xs text-slate-400">{e.date}{e.start_time?' '+e.start_time:''}</p>
          </div>
        </div>
      );
    });
  };

  // ── Event view modal helpers ────────────────────────────
  const getStatusBadge = (e: CalEvent) => {
    const statusMap: Record<string, { label:string; style:React.CSSProperties; icon:string }> = {
      completed: { label:'출석 완료',     style:{ background:'#dcfce7', color:'#16a34a' }, icon:'✅' },
      unchecked: { label:'체크 미완료',   style:{ background:'#fef3c7', color:'#d97706' }, icon:'⚠️' },
      absent:    { label:'결석',           style:{ background:'#ffe4e6', color:'#e11d48' }, icon:'❌' },
      late:      { label:'지각',           style:{ background:'#fef3c7', color:'#d97706' }, icon:'🕐' },
      personal:  { label:'개인 메모',      style:{ background:'#eff6ff', color:'#2563eb' }, icon:'📝' },
    };
    const key = e.status || (e.type==='personal'?'personal':'unchecked');
    return statusMap[key] || statusMap.unchecked;
  };

  // ── Summary cards ───────────────────────────────────────
  const summaryCards = [
    { label:'이번 주 세션',   value:`${summary.week_sessions}회`,        icon:'📅', bg:'#eef7fb', color:'#1a6d8e', sub:'스터디 세션' },
    { label:'이번달 출석률',  value:`${summary.attendance_rate}%`,       icon:'✅', bg:'#f0fdf4', color:'#16a34a', sub:'출석 현황' },
    { label:'미완료 체크',    value:`${summary.unchecked}건`,             icon:'⚠️', bg:'#fef3c7', color:'#d97706', sub:'확인 필요' },
    { label:'개인 일정',      value:`${summary.personal_events}개`,       icon:'🔵', bg:'#eff6ff', color:'#2563eb', sub:'이번 달 메모' },
  ];

  return (
    <>
      <style>{`
        * { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
        :root {
          --bg-body: #dbeafe; --bg-container: #ffffff; --bg-sidebar: #ffffff;
          --bg-header: #ffffff; --bg-content: #f8fafc; --bg-card: #ffffff;
          --bg-input: #f8fafc; --bg-skeleton: #e2e8f0; --bg-nav-hover: #dce6fd;
          --text-primary: #1e293b; --text-secondary: #475569; --text-muted: #94a3b8;
          --text-heading: #0f172a; --text-nav: #475569; --text-nav-hover: #0077ff;
          --border-default: #f1f5f9; --border-card: #f1f5f9; --border-input: #e2e8f0;
          --border-sidebar: #f1f5f9; --cal-other: #cbd5e1; --scrollbar-track: #f1f5f9;
        }
        html[data-theme="dark"] {
          --bg-body: #0c1120; --bg-container: #111827; --bg-sidebar: #111827;
          --bg-header: #111827; --bg-content: #0f172a; --bg-card: #1e293b;
          --bg-input: #1e293b; --bg-skeleton: #334155; --bg-nav-hover: #1a2d52;
          --text-primary: #e2e8f0; --text-secondary: #cbd5e1; --text-muted: #64748b;
          --text-heading: #f1f5f9; --text-nav: #94a3b8; --text-nav-hover: #93c5fd;
          --border-default: #1e293b; --border-card: #334155; --border-input: #334155;
          --border-sidebar: #1e293b; --cal-other: #475569; --scrollbar-track: #1e293b;
        }
        body { background: var(--bg-body) !important; }
        .mini-cal-day { width:26px; height:26px; display:flex; align-items:center; justify-content:center;
          border-radius:50%; font-size:11px; cursor:pointer; transition:all 0.15s; }
        .mini-cal-day:hover:not(.today):not(.other) { background:#dce6fd; color:#0077ff; }
        .mini-cal-day.today { background:#0077ff; color:white; font-weight:700; }
        .mini-cal-day.other { color:var(--cal-other); cursor:default; pointer-events:none; }
        .mini-cal-day.selected:not(.today) { background:#dce6fd; color:#0077ff; font-weight:600; }
        .mini-cal-day.has-event { position:relative; }
        .mini-cal-day.has-event::after { content:''; position:absolute; bottom:2px; left:50%;
          transform:translateX(-50%); width:3px; height:3px; background:#2E86AB; border-radius:50%; }
        .month-cell { min-height:90px; border-right:1px solid var(--border-card);
          border-bottom:1px solid var(--border-card); transition:background 0.1s; }
        .month-cell:hover { background:#f0f7ff; }
        html[data-theme="dark"] .month-cell:hover { background:#1a2d52 !important; }
        html[data-theme="dark"] .month-cell { border-color:#334155 !important; }
        .event-chip { font-size:11px; padding:2px 6px; border-radius:4px; white-space:nowrap;
          overflow:hidden; text-overflow:ellipsis; cursor:pointer; transition:opacity 0.15s;
          border-left-width:2px; border-left-style:solid; }
        .event-chip:hover { opacity:0.75; }
        .day-event-block { border-left:3px solid; padding:4px 8px; border-radius:6px; cursor:pointer;
          transition:opacity 0.15s; font-size:12px; margin-bottom:3px; }
        .day-event-block:hover { opacity:0.8; }
        .dday-chip { font-size:10px; font-weight:700; padding:2px 7px; border-radius:10px; }
        .cal-stat-card { transition:transform 0.2s, box-shadow 0.2s; }
        .cal-stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(46,134,171,0.15); }
        .week-header-cell { border-right:1px solid var(--border-card); }
        .week-time-cell { border-right:1px solid var(--border-card); border-bottom:1px solid var(--border-card);
          height:50px; font-size:10px; color:var(--text-muted); text-align:right;
          padding-right:6px; padding-top:4px; vertical-align:top; width:48px; }
        .week-day-cell { border-right:1px solid var(--border-card); border-bottom:1px solid var(--border-card);
          height:50px; vertical-align:top; padding:2px; cursor:pointer; }
        .week-day-cell:hover { background:#f8fafc; }
        html[data-theme="dark"] .week-day-cell:hover { background:#1a2d52 !important; }
        html[data-theme="dark"] .week-time-cell, html[data-theme="dark"] .week-header-cell,
        html[data-theme="dark"] .week-day-cell { border-color:#334155 !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:var(--scrollbar-track,#f1f5f9); }
        ::-webkit-scrollbar-thumb { background:#c7d7fb; border-radius:4px; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:50; display:flex;
          align-items:center; justify-content:center; padding:16px; }
        .modal-box { background:var(--bg-card); border-radius:20px; padding:24px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
        .modal-label { display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:6px; }
        html[data-theme="dark"] .modal-label { color:#94a3b8; }
        .modal-input { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px;
          font-size:14px; outline:none; transition:border-color .2s; background:var(--bg-input);
          color:var(--text-primary); box-sizing:border-box; }
        html[data-theme="dark"] .modal-input { border-color:#334155; }
        .modal-input:focus { border-color:#0077ff; box-shadow:0 0 0 3px rgba(18,88,252,.12); }
        .modal-btn-primary { background:#0077ff; color:#fff; border:none; border-radius:10px;
          padding:10px 20px; font-size:14px; font-weight:600; cursor:pointer; transition:background 0.2s; }
        .modal-btn-primary:hover { background:#0e47d4; }
        .modal-btn-cancel { background:#f1f5f9; color:#64748b; border:none; border-radius:10px;
          padding:10px 20px; font-size:14px; font-weight:600; cursor:pointer; }
        html[data-theme="dark"] .modal-btn-cancel { background:#334155; color:#94a3b8; }
        @media (max-width:1024px) { #calLeftPanel { display:none !important; } #calRightPanel { display:none !important; } }
        @media (min-width:1025px) and (max-width:1280px) { #calRightPanel { display:none !important; } }
        @media (max-width:640px) { .cal-stat-grid { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>

      <div className="bg-blue-100 min-h-screen">
      <div id="sidebarOverlay" onClick={() => {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('open');
      }}></div>
      <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{ minHeight:'100vh' }}>
        <LeftMenu />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />

          <div className="flex-1 overflow-y-auto bg-slate-50">

            {/* ① Banner */}
            <div className="px-4 lg:px-6 pt-4">
              <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ background:'linear-gradient(135deg,#0077ff 0%,#0077ff 55%,#3eb0ed 100%)' }}>
                <div className="absolute top-0 right-0 w-56 h-56 bg-white opacity-5 rounded-full translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 w-36 h-36 bg-white opacity-5 rounded-full translate-y-14" style={{ left:'33%' }}></div>
                <div className="relative z-10 px-5 lg:px-7 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-cyan-200 text-xs font-medium mb-0.5">📅 스터디 일정 관리</p>
                      <h1 className="text-white text-xl font-bold">스터디 캘린더</h1>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Today */}
                      <button onClick={goToday}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-white border-opacity-40 text-white transition-colors"
                        style={{ borderColor:'rgba(255,255,255,0.4)' }}>
                        오늘
                      </button>
                      {/* View tabs */}
                      <div className="flex p-0.5 rounded-lg" style={{ background:'rgba(0,0,0,0.2)' }}>
                        {(['day','week','month'] as ViewType[]).map(v => (
                          <button key={v} onClick={() => setView(v)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
                            style={view===v ? { background:'#fff', color:'#0077ff', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' } : { color:'rgba(255,255,255,0.7)' }}>
                            {v==='day'?'일':v==='week'?'주':'월'}
                          </button>
                        ))}
                      </div>
                      {/* Nav */}
                      <div className="flex items-center gap-1">
                        <button onClick={goPrev} className="w-7 h-7 flex items-center justify-center rounded-lg text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <span className="text-white font-bold text-sm min-w-[150px] text-center select-none">{navTitle()}</span>
                        <button onClick={goNext} className="w-7 h-7 flex items-center justify-center rounded-lg text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                      {/* Add + Export */}
                      <button onClick={() => handleDateClick(dStr(calDate))}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white flex items-center gap-1"
                        style={{ background:'rgba(255,255,255,0.18)' }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                        일정 추가
                      </button>
                      <button onClick={() => setExportModal({ open:true, range:'month' })}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border text-white"
                        style={{ borderColor:'rgba(255,255,255,0.4)' }}>
                        내보내기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ② Summary Cards */}
            <div className="px-4 lg:px-6 pt-4 pb-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 cal-stat-grid">
                {summaryCards.map(c => (
                  <div key={c.label} className="cal-stat-card bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background:c.bg }}>{c.icon}</div>
                    </div>
                    <p className="text-2xl font-bold" style={{ color:c.color }}>{c.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ③ Three-column layout */}
            <div className="flex gap-4 px-4 lg:px-6 pb-6 pt-2">

              {/* Left Panel */}
              <div id="calLeftPanel" className="flex-col gap-4 flex-shrink-0 hidden lg:flex" style={{ width:216 }}>

                {/* Mini Calendar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={prevMiniMonth} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <span className="text-xs font-bold text-slate-700">{miniYear}년 {MONTHS[miniMonth]}</span>
                    <button onClick={nextMiniMonth} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-0.5">
                    {['일','월','화','수','목','금','토'].map((d, i) => (
                      <span key={d} className={`mini-cal-day text-xs font-bold pointer-events-none ${i===0?'text-rose-400':i===6?'text-blue-400':'text-slate-400'}`}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-0.5">{renderMiniCalendar()}</div>
                </div>

                {/* Group Filter */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700">그룹 필터</h3>
                    <button onClick={toggleAllGroups} className="text-xs font-semibold hover:underline" style={{ color:'#2E86AB' }}>{filterToggleLabel}</button>
                  </div>
                  <div className="space-y-2">
                    {groups.length === 0
                      ? <p className="text-xs text-slate-400">그룹 없음</p>
                      : groups.map(g => (
                          <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={groupFilters.has(String(g.id))}
                              onChange={e => toggleGroupFilter(String(g.id), e.target.checked)}
                              style={{ accentColor:g.color, cursor:'pointer' }} />
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:g.color }}></div>
                            <span className="text-xs text-slate-600 truncate">{g.name}</span>
                          </label>
                        ))
                    }
                  </div>
                </div>

                {/* Color Legend */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-700 mb-3">색상 범례</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><span className="text-sm">✅</span><span className="text-xs text-slate-600">출석 완료</span></div>
                    <div className="flex items-center gap-2"><span className="text-sm">⚠️</span><span className="text-xs text-slate-600">체크 미완료</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background:'#2E86AB' }}></div><span className="text-xs text-slate-600">개인 일정</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0"></div><span className="text-xs text-slate-600">결석</span></div>
                  </div>
                </div>
              </div>

              {/* Main Calendar */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" style={{ minHeight:500 }}>
                  {view === 'month' && renderMonthView()}
                  {view === 'week' && renderWeekView()}
                  {view === 'day' && renderDayView()}
                </div>
              </div>

              {/* Right Panel */}
              <div id="calRightPanel" className="flex-col gap-4 flex-shrink-0 hidden xl:flex" style={{ width:256 }}>

                {/* Week Summary */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-700 mb-3">📊 이번 주 요약</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl text-center" style={{ background:'#eef7fb' }}>
                      <p className="text-xs font-medium mb-1" style={{ color:'#2E86AB' }}>세션 수</p>
                      <p className="text-xl font-bold" style={{ color:'#1a6d8e' }}>{weekSummary.sessions}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background:'#f0fdf4' }}>
                      <p className="text-xs text-emerald-600 font-medium mb-1">출석 예정</p>
                      <p className="text-xl font-bold text-emerald-700">{weekSummary.attendance}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background:'#fef3c7' }}>
                      <p className="text-xs text-amber-600 font-medium mb-1">미완료</p>
                      <p className="text-xl font-bold text-amber-700">{weekSummary.unchecked}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background:'#eff6ff' }}>
                      <p className="text-xs text-blue-600 font-medium mb-1">개인 일정</p>
                      <p className="text-xl font-bold text-blue-700">{weekSummary.personal}</p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700">📅 다가오는 일정</h3>
                    <span className="text-xs text-slate-400">향후 7일</span>
                  </div>
                  <div className="space-y-2">{renderUpcomingList(upcoming)}</div>
                </div>
              </div>
            </div>

            {/* ④ Mobile panels */}
            <div className="px-4 pb-6 space-y-4 lg:hidden">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700">그룹 필터</h3>
                  <button onClick={toggleAllGroups} className="text-xs font-semibold hover:underline" style={{ color:'#2E86AB' }}>{filterToggleLabel}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groups.map(g => {
                    const active = groupFilters.has(String(g.id));
                    return (
                      <button key={g.id} onClick={() => toggleGroupFilter(String(g.id), !active)}
                        className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                        style={{ background:active?g.color:'transparent', color:active?'#fff':g.color, borderColor:g.color }}>
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-bold text-slate-700 mb-3">📅 다가오는 일정 (향후 7일)</h3>
                <div className="space-y-2">{renderUpcomingList(upcoming)}</div>
              </div>
            </div>

          </div>
        </main>
      </div>
      </div>

      {/* ══ Modals ══════════════════════════════════════════ */}

      {/* Event View Modal */}
      {eventViewModal.open && eventViewModal.event && (() => {
        const e = eventViewModal.event!;
        const color = e.color || e.group_color || '#0077ff';
        const st = getStatusBadge(e);
        return (
          <div className="modal-overlay" onClick={() => setEventViewModal({ open:false, event:null })}>
            <div className="modal-box" style={{ maxWidth:460 }} onClick={ev => ev.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-800 mb-4">{e.title}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={st.style}>{st.icon} {st.label}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background:`${color}1a`, color }}>
                    {e.type==='session'?'스터디 세션':'개인 일정'}
                  </span>
                </div>
                <div className="space-y-2.5 p-3 rounded-xl" style={{ background:'#f8fafc' }}>
                  {e.group_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:color }}></div>
                      <div><p className="text-xs text-slate-400">그룹</p><p className="text-sm font-semibold text-slate-700">{e.group_name}</p></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <div>
                      <p className="text-xs text-slate-400">날짜 / 시간</p>
                      <p className="text-sm font-semibold text-slate-700">{e.date}{e.start_time?' '+e.start_time:''}{e.end_time?' ~ '+e.end_time:''}</p>
                    </div>
                  </div>
                  {e.topic && (
                    <div className="flex items-center gap-3">
                      <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <div><p className="text-xs text-slate-400">주제</p><p className="text-sm font-semibold text-slate-700">{e.topic}</p></div>
                    </div>
                  )}
                  {e.location && (
                    <div className="flex items-center gap-3">
                      <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <div><p className="text-xs text-slate-400">장소</p><p className="text-sm font-semibold text-slate-700">{e.location}</p></div>
                    </div>
                  )}
                  {e.note && (
                    <div className="pt-1 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">메모</p>
                      <p className="text-sm text-slate-600">{e.note}</p>
                    </div>
                  )}
                </div>
                {e.type === 'personal' && (
                  <button className="w-full text-xs text-rose-500 hover:text-rose-600 text-right font-semibold hover:underline mt-1"
                    onClick={() => confirmDeleteMemo(e.id)}>
                    🗑 삭제하기
                  </button>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button className="modal-btn-cancel" onClick={() => setEventViewModal({ open:false, event:null })}>닫기</button>
                {e.type === 'session' && e.group_id && (
                  <button className="modal-btn-primary" onClick={() => { window.location.href=`/attendance/check?group_id=${e.group_id}&session_id=${e.id}`; }}>출석 체크로 이동 →</button>
                )}
                {e.type === 'personal' && (
                  <button className="modal-btn-primary" onClick={() => {
                    setEventViewModal({ open:false, event:null });
                    setMemoEditModal({ open:true, event:e, title:e.title, date:e.date, startTime:e.start_time||'', note:e.note||'', error:'' });
                  }}>수정</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Date Click (choice) Modal */}
      {dateClickModal.open && (
        <div className="modal-overlay" onClick={() => setDateClickModal({ open:false, ds:'' })}>
          <div className="modal-box" style={{ maxWidth:360 }} onClick={ev => ev.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-800 mb-3">{dateClickModal.ds}</h2>
            <div className="space-y-2.5 mt-1">
              <button onClick={() => openSessionCreate(dateClickModal.ds)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#dce6fd' }}>
                  <svg style={{ width:18, height:18, color:'#0077ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">스터디 세션 생성</p>
                  <p className="text-xs text-slate-400">리더 전용 · 출석 체크 연동</p>
                </div>
              </button>
              <button onClick={() => openMemoCreate(dateClickModal.ds)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#e0f2fe' }}>
                  <svg style={{ width:18, height:18 }} className="text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">개인 메모 추가</p>
                  <p className="text-xs text-slate-400">나만의 개인 일정</p>
                </div>
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button className="modal-btn-cancel" onClick={() => setDateClickModal({ open:false, ds:'' })}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* Session Create Modal */}
      {sessionModal.open && (
        <div className="modal-overlay" onClick={() => setSessionModal(s => ({ ...s, open:false }))}>
          <div className="modal-box" style={{ maxWidth:520 }} onClick={ev => ev.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">스터디 세션 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="modal-label">그룹 선택 <span className="text-rose-500">*</span></label>
                <select className="modal-input" value={sessionModal.groupId} onChange={e => setSessionModal(s => ({ ...s, groupId:e.target.value }))}>
                  <option value="">그룹을 선택하세요</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="modal-label">세션 주제 <span className="text-rose-500">*</span></label>
                <input className="modal-input" placeholder="예: 5장 정렬 알고리즘" maxLength={100}
                  value={sessionModal.topic} onChange={e => setSessionModal(s => ({ ...s, topic:e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="modal-label">날짜</label>
                  <input type="date" className="modal-input" value={sessionModal.date}
                    onChange={e => setSessionModal(s => ({ ...s, date:e.target.value }))} />
                </div>
                <div>
                  <label className="modal-label">시작 시간</label>
                  <input type="time" className="modal-input" value={sessionModal.startTime}
                    onChange={e => setSessionModal(s => ({ ...s, startTime:e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="modal-label">종료 시간</label>
                  <input type="time" className="modal-input" value={sessionModal.endTime}
                    onChange={e => setSessionModal(s => ({ ...s, endTime:e.target.value }))} />
                </div>
                <div>
                  <label className="modal-label">장소</label>
                  <input className="modal-input" placeholder="예: 강남 스터디카페"
                    value={sessionModal.location} onChange={e => setSessionModal(s => ({ ...s, location:e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="modal-label">메모</label>
                <textarea className="modal-input" rows={2} style={{ resize:'none' }} placeholder="세션 관련 메모"
                  value={sessionModal.note} onChange={e => setSessionModal(s => ({ ...s, note:e.target.value }))} />
              </div>
              {sessionModal.error && <p className="text-xs text-rose-500">{sessionModal.error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="modal-btn-cancel" onClick={() => setSessionModal(s => ({ ...s, open:false }))}>취소</button>
              <button className="modal-btn-primary" onClick={submitSessionCreate}>세션 생성</button>
            </div>
          </div>
        </div>
      )}

      {/* Memo Create Modal */}
      {memoCreateModal.open && (
        <div className="modal-overlay" onClick={() => setMemoCreateModal(s => ({ ...s, open:false }))}>
          <div className="modal-box" style={{ maxWidth:480 }} onClick={ev => ev.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">개인 메모 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="modal-label">제목 <span className="text-rose-500">*</span></label>
                <input className="modal-input" placeholder="일정 제목" maxLength={100}
                  value={memoCreateModal.title} onChange={e => setMemoCreateModal(s => ({ ...s, title:e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="modal-label">날짜</label>
                  <input type="date" className="modal-input" value={memoCreateModal.date}
                    onChange={e => setMemoCreateModal(s => ({ ...s, date:e.target.value }))} />
                </div>
                <div>
                  <label className="modal-label">시작 시간</label>
                  <input type="time" className="modal-input" value={memoCreateModal.startTime}
                    onChange={e => setMemoCreateModal(s => ({ ...s, startTime:e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="modal-label">종료 시간</label>
                <input type="time" className="modal-input" value={memoCreateModal.endTime}
                  onChange={e => setMemoCreateModal(s => ({ ...s, endTime:e.target.value }))} />
              </div>
              <div>
                <label className="modal-label">색상</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {MEMO_COLORS.map((c, i) => (
                    <button key={c} type="button" onClick={() => setMemoCreateModal(s => ({ ...s, color:c }))}
                      className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${memoCreateModal.color===c?'ring-2 ring-offset-2':'ring-1'}`}
                      style={{ background:c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="modal-label">메모</label>
                <textarea className="modal-input" rows={2} style={{ resize:'none' }}
                  value={memoCreateModal.note} onChange={e => setMemoCreateModal(s => ({ ...s, note:e.target.value }))} />
              </div>
              {memoCreateModal.error && <p className="text-xs text-rose-500">{memoCreateModal.error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="modal-btn-cancel" onClick={() => setMemoCreateModal(s => ({ ...s, open:false }))}>취소</button>
              <button className="modal-btn-primary" onClick={submitMemoCreate}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* Memo Edit Modal */}
      {memoEditModal.open && (
        <div className="modal-overlay" onClick={() => setMemoEditModal(s => ({ ...s, open:false }))}>
          <div className="modal-box" style={{ maxWidth:480 }} onClick={ev => ev.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">개인 메모 수정</h2>
            <div className="space-y-4">
              <div>
                <label className="modal-label">제목</label>
                <input className="modal-input" value={memoEditModal.title}
                  onChange={e => setMemoEditModal(s => ({ ...s, title:e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="modal-label">날짜</label>
                  <input type="date" className="modal-input" value={memoEditModal.date}
                    onChange={e => setMemoEditModal(s => ({ ...s, date:e.target.value }))} />
                </div>
                <div>
                  <label className="modal-label">시작 시간</label>
                  <input type="time" className="modal-input" value={memoEditModal.startTime}
                    onChange={e => setMemoEditModal(s => ({ ...s, startTime:e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="modal-label">메모</label>
                <textarea className="modal-input" rows={2} style={{ resize:'none' }}
                  value={memoEditModal.note} onChange={e => setMemoEditModal(s => ({ ...s, note:e.target.value }))} />
              </div>
              {memoEditModal.error && <p className="text-xs text-rose-500">{memoEditModal.error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="modal-btn-cancel" onClick={() => setMemoEditModal(s => ({ ...s, open:false }))}>취소</button>
              <button className="modal-btn-primary" onClick={submitMemoEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModal.open && (
        <div className="modal-overlay" onClick={() => setExportModal({ open:false, range:'month' })}>
          <div className="modal-box" style={{ maxWidth:400 }} onClick={ev => ev.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">캘린더 내보내기</h2>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">iCal(.ics) 형식으로 내보냅니다.<br/>구글 캘린더·아이폰 캘린더와 연동됩니다.</p>
              <div>
                <label className="modal-label">내보낼 범위</label>
                <select className="modal-input" value={exportModal.range} onChange={e => setExportModal(s => ({ ...s, range:e.target.value }))}>
                  <option value="month">이번 달</option>
                  <option value="3month">최근 3개월</option>
                  <option value="year">올해 전체</option>
                  <option value="all">전체 기간</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="modal-btn-cancel" onClick={() => setExportModal({ open:false, range:'month' })}>취소</button>
              <button className="modal-btn-primary" onClick={submitExport}>내보내기</button>
            </div>
          </div>
        </div>
      )}

      {/* More Events Modal */}
      {moreModal.open && (
        <div className="modal-overlay" onClick={() => setMoreModal(s => ({ ...s, open:false }))}>
          <div className="modal-box" style={{ maxWidth:420 }} onClick={ev => ev.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-800 mb-3">📅 {moreModal.ds}</h2>
            <div className="space-y-2">
              {moreModal.events.map(e => {
                const color = e.color || e.group_color || '#0077ff';
                return (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => { setMoreModal(s => ({ ...s, open:false })); handleEventClick(e.id); }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:color }}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{e.status==='unchecked'?'⚠ ':''}{e.title}</p>
                      <p className="text-xs text-slate-400">{e.group_name||'개인'} {e.start_time||''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-4">
              <button className="modal-btn-primary" onClick={() => setMoreModal(s => ({ ...s, open:false }))}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
