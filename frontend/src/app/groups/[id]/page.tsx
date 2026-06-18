'use client';

import { useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import Swal from 'sweetalert2';

const group = { id: 1, name: 'Web Developer Study', color: '#1258fc', memberCount: 6, attendanceRate: 92, totalSessions: 24, role: '리더' };

const members = [
  { id: 1, name: '김민수', role: '리더', attendanceRate: 92, present: 22, late: 1, absent: 1, avatar: 'K' },
  { id: 2, name: '이지연', role: '멤버', attendanceRate: 87, present: 20, late: 2, absent: 2, avatar: 'L' },
  { id: 3, name: '박철수', role: '멤버', attendanceRate: 79, present: 18, late: 3, absent: 3, avatar: 'P' },
  { id: 4, name: '최수아', role: '멤버', attendanceRate: 95, present: 23, late: 1, absent: 0, avatar: 'C' },
  { id: 5, name: '정도현', role: '멤버', attendanceRate: 83, present: 19, late: 2, absent: 3, avatar: 'J' },
  { id: 6, name: '한예진', role: '멤버', attendanceRate: 71, present: 16, late: 4, absent: 4, avatar: 'H' },
];

const notices = [
  { id: 1, title: '6월 스터디 일정 공지', content: '안녕하세요! 6월 스터디 일정을 안내드립니다.\n\n매주 일요일 오후 2시에 온라인으로 진행됩니다.\n\n참석 불가 시 24시간 전에 미리 알려주세요.', author: '김민수', date: '2026-06-15', isPinned: true, isRead: false },
  { id: 2, title: '발표 주제 선정 안내', content: '이번 주 발표 주제를 선택해주세요. 구글 시트에 본인 주제를 기입해 주시기 바랍니다.', author: '김민수', date: '2026-06-10', isPinned: false, isRead: true },
  { id: 3, title: '스터디 자료 업로드 완료', content: '지난 주 발표 자료가 업로드되었습니다. 리소스 탭에서 확인해주세요.', author: '이지연', date: '2026-06-05', isPinned: false, isRead: false },
];

const sessions = [
  { id: 1, date: '2026-06-15', topic: 'React Hooks 심화', presentCount: 5, lateCount: 1, absentCount: 0 },
  { id: 2, date: '2026-06-08', topic: 'TypeScript 기초', presentCount: 4, lateCount: 1, absentCount: 1 },
  { id: 3, date: '2026-06-01', topic: 'Next.js App Router', presentCount: 6, lateCount: 0, absentCount: 0 },
  { id: 4, date: '2026-05-25', topic: 'Redux Toolkit', presentCount: 5, lateCount: 1, absentCount: 0 },
];

type TabKey = 'overview' | 'members' | 'notices' | 'attendance';

const rateColor = (r: number) => r >= 90 ? '#16a34a' : r >= 75 ? '#d97706' : '#dc2626';

export default function GroupDetailPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const handleCheckIn = async () => {
    await Swal.fire({
      title: '출석 체크',
      html: `<div style="text-align:left;padding:8px 0">
        <p style="font-weight:600;margin-bottom:8px">📅 오늘의 세션</p>
        <p style="color:#64748b;font-size:14px">2026-06-18 · React Hooks 심화</p>
        <p style="color:#64748b;font-size:14px;margin-top:4px">📍 온라인 (Zoom)</p>
        <div style="margin-top:16px;padding:12px;background:#f0f5ff;border-radius:12px">
          <p style="font-size:13px;color:#1258fc;font-weight:600">✅ 출석 처리 하시겠습니까?</p>
        </div>
      </div>`,
      showCancelButton: true,
      confirmButtonText: '출석',
      cancelButtonText: '취소',
      confirmButtonColor: '#1258fc',
    }).then(r => {
      if (r.isConfirmed) Swal.fire({ title: '출석 완료!', icon: 'success', timer: 1500, showConfirmButton: false });
    });
  };

  const handleReason = async () => {
    await Swal.fire({
      title: '결석/지각 사유 제출',
      html: `<select class="swal2-select" id="reason-type">
               <option value="late">지각</option>
               <option value="absent">결석</option>
             </select>
             <textarea class="swal2-textarea" id="reason-text" placeholder="사유를 입력하세요 (최소 10자)" rows="4"></textarea>`,
      confirmButtonText: '제출',
      cancelButtonText: '취소',
      showCancelButton: true,
      confirmButtonColor: '#1258fc',
      preConfirm: () => {
        const text = (document.getElementById('reason-text') as HTMLTextAreaElement)?.value;
        if (!text || text.length < 10) { Swal.showValidationMessage('사유를 10자 이상 입력해주세요'); return false; }
        return text;
      },
    }).then(r => {
      if (r.isConfirmed) Swal.fire({ title: '사유가 제출되었습니다', icon: 'success', timer: 1500, showConfirmButton: false });
    });
  };

  const handleDeleteNotice = async (title: string) => {
    const r = await Swal.fire({ title: '공지를 삭제하시겠습니까?', text: `"${title}"`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: '삭제', cancelButtonText: '취소' });
    if (r.isConfirmed) Swal.fire({ title: '삭제 완료', icon: 'success', timer: 1500, showConfirmButton: false });
  };

  const handleViewNotice = (n: typeof notices[0]) => {
    Swal.fire({
      title: n.title,
      html: `<div style="text-align:left"><p style="white-space:pre-wrap;font-size:14px;color:#334155;line-height:1.7">${n.content}</p><hr style="margin:16px 0;border-color:#e2e8f0"><p style="font-size:12px;color:#94a3b8">${n.author} · ${n.date}</p></div>`,
      showCloseButton: true,
      showConfirmButton: false,
      showDenyButton: group.role === '리더',
      denyButtonText: '삭제',
      denyButtonColor: '#dc2626',
    }).then(r => { if (r.isDenied) handleDeleteNotice(n.title); });
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: '개요' },
    { key: 'members', label: '멤버' },
    { key: 'notices', label: '공지사항' },
    { key: 'attendance', label: '출석 현황' },
  ];

  const sortedMembers = [...members].sort((a, b) => b.attendanceRate - a.attendanceRate);

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">

          {/* 그룹 헤더 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ background: group.color }}>
                {group.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: '#dce6fd', color: '#1258fc' }}>{group.role}</span>
                </div>
                <p className="text-sm text-slate-500">멤버 {group.memberCount}명 · 총 {group.totalSessions}회 진행</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleCheckIn} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">출석 체크</button>
                <button onClick={handleReason} className="border border-slate-200 text-slate-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">사유 제출</button>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '출석률', value: `${group.attendanceRate}%`, color: rateColor(group.attendanceRate) },
              { label: '멤버', value: `${group.memberCount}명`, color: '#1258fc' },
              { label: '총 세션', value: `${group.totalSessions}회`, color: '#8b5cf6' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* 탭 + 컨텐츠 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-6 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${activeTab === t.key ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* 개요 */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">최근 공지사항</h4>
                    <div className="space-y-2">
                      {notices.slice(0, 2).map(n => (
                        <div key={n.id} onClick={() => handleViewNotice(n)} className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer transition-colors" style={{ borderLeftColor: n.isPinned ? '#f59e0b' : undefined, borderLeftWidth: n.isPinned ? 3 : undefined }}>
                          <div className="flex items-center gap-2 mb-0.5">
                            {n.isPinned && <span className="text-xs">📌</span>}
                            {!n.isRead && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-semibold">NEW</span>}
                            <p className="text-sm font-semibold text-slate-700 truncate">{n.title}</p>
                          </div>
                          <p className="text-xs text-slate-400">{n.author} · {n.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">출석 순위</h4>
                    <div className="space-y-2">
                      {sortedMembers.slice(0, 3).map((m, i) => (
                        <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                          <span className="text-xl w-7 text-center flex-shrink-0">{['🥇', '🥈', '🥉'][i]}</span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: group.color }}>{m.avatar}</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">{m.name}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-slate-200 rounded-full"><div className="h-1 rounded-full" style={{ width: `${m.attendanceRate}%`, background: rateColor(m.attendanceRate) }} /></div>
                              <span className="text-xs font-medium" style={{ color: rateColor(m.attendanceRate) }}>{m.attendanceRate}%</span>
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
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                        <th className="pb-3 pl-1">#</th>
                        <th className="pb-3">이름</th>
                        <th className="pb-3">역할</th>
                        <th className="pb-3 text-center">출석</th>
                        <th className="pb-3 text-center">지각</th>
                        <th className="pb-3 text-center">결석</th>
                        <th className="pb-3">출석률</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {members.map((m, i) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pl-1 text-slate-400">{i + 1}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: group.color }}>{m.avatar}</div>
                              <span className="font-medium text-slate-700">{m.name}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: m.role === '리더' ? '#dce6fd' : '#f1f5f9', color: m.role === '리더' ? '#1258fc' : '#64748b' }}>{m.role}</span>
                          </td>
                          <td className="py-3 text-center text-green-600 font-semibold">{m.present}</td>
                          <td className="py-3 text-center text-amber-600 font-semibold">{m.late}</td>
                          <td className="py-3 text-center text-red-500 font-semibold">{m.absent}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${m.attendanceRate}%`, background: rateColor(m.attendanceRate) }} /></div>
                              <span className="text-xs font-semibold" style={{ color: rateColor(m.attendanceRate) }}>{m.attendanceRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 공지사항 */}
              {activeTab === 'notices' && (
                <div className="space-y-3">
                  {group.role === '리더' && (
                    <div className="flex justify-end mb-2">
                      <button onClick={() => Swal.fire({ title: '공지 작성', html: `<input id="swal-title" class="swal2-input" placeholder="제목"><textarea id="swal-content" class="swal2-textarea" placeholder="내용을 입력하세요" rows="5"></textarea>`, confirmButtonText: '등록', cancelButtonText: '취소', showCancelButton: true, confirmButtonColor: '#1258fc' })}
                        className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                        + 공지 작성
                      </button>
                    </div>
                  )}
                  {notices.map(n => (
                    <div key={n.id} onClick={() => handleViewNotice(n)}
                      className="p-4 rounded-xl border cursor-pointer hover:border-blue-200 transition-all"
                      style={{ borderColor: n.isPinned ? '#fbbf24' : '#f1f5f9', borderLeftWidth: 3, borderLeftColor: n.isPinned ? '#f59e0b' : !n.isRead ? '#1258fc' : '#e2e8f0' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {n.isPinned && <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">📌 중요</span>}
                            {!n.isRead && <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">NEW</span>}
                            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{n.content.split('\n')[0]}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.author} · {n.date}</p>
                        </div>
                        {group.role === '리더' && (
                          <button onClick={e => { e.stopPropagation(); handleDeleteNotice(n.title); }}
                            className="text-slate-300 hover:text-red-400 transition-colors ml-3 p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 출석 현황 */}
              {activeTab === 'attendance' && (
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                        <th className="pb-3">날짜</th>
                        <th className="pb-3">주제</th>
                        <th className="pb-3 text-center">출석</th>
                        <th className="pb-3 text-center">지각</th>
                        <th className="pb-3 text-center">결석</th>
                        <th className="pb-3">출석률</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sessions.map(s => {
                        const total = s.presentCount + s.lateCount + s.absentCount;
                        const rate = Math.round(((s.presentCount + s.lateCount * 0.5) / total) * 100);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 text-slate-600">{s.date}</td>
                            <td className="py-3 font-medium text-slate-800">{s.topic}</td>
                            <td className="py-3 text-center"><span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700">{s.presentCount}</span></td>
                            <td className="py-3 text-center"><span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">{s.lateCount}</span></td>
                            <td className="py-3 text-center"><span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600">{s.absentCount}</span></td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${rate}%`, background: rateColor(rate) }} /></div>
                                <span className="text-xs font-semibold" style={{ color: rateColor(rate) }}>{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
