'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';

interface GroupData {
  id: number; name: string; description?: string; color?: string;
  member_count: number; role?: string; attendance_rate?: number;
  leader_name?: string; created_at?: string; category?: string;
  max_members?: number; is_public?: boolean;
}
interface Member { id: number; nickname: string; role: string; attendance_rate?: number; }
interface Notice { id: number; title: string; content?: string; created_at: string; isPinned?: boolean; }
interface Session { id: number; topic: string; date: string; status: 'unchecked' | 'completed'; description?: string; }
interface Comment {
  id: number; authorId: number; authorName: string; content: string; createdAt: string;
}
interface StudyResource {
  id: number; title: string; type: 'link' | 'file';
  description?: string; uploaderName: string; uploadedAt: string; url?: string;
}

const CATEGORIES = ['개발', '외국어', '자격증', '취업/면접', '독서', '수학/과학', '예술/창작', '기타'];
const CURRENT_USER_ID = 1;

const todayStr = () => {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
};

export default function GroupHomePage() {
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupData|null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, authorId: 2, authorName: '이멤버', content: '이번 주 스터디 자료 공유드립니다! 열심히 준비했어요 😊', createdAt: '2026.06.17 14:23' },
    { id: 2, authorId: 3, authorName: '박멤버', content: '감사합니다! 저도 오늘 복습 완료했습니다.', createdAt: '2026.06.17 15:41' },
    { id: 3, authorId: 1, authorName: '김리더', content: '다들 고생 많으셨어요. 다음 세션 준비도 잘 부탁드립니다!', createdAt: '2026.06.17 16:05' },
  ]);
  const [commentInput, setCommentInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview'|'members'|'notices'|'resources'|'attendance'|'comments'>('overview');
  const [resources, setResources] = useState<StudyResource[]>([
    { id: 1, title: '정렬 알고리즘 시각화', type: 'link', description: '버블·퀵·병합 정렬 원리를 애니메이션으로 학습할 수 있는 사이트', uploaderName: '김리더', uploadedAt: '2026.06.17', url: 'https://visualgo.net/en/sorting' },
    { id: 2, title: 'React 컴포넌트 설계 PPT', type: 'file', description: '2주차 발표용 슬라이드. Atomic Design 방법론 포함', uploaderName: '이멤버', uploadedAt: '2026.06.11', url: 'react-component-design.pdf' },
  ]);
  const [resourceFilter, setResourceFilter] = useState<'all'|'link'|'file'>('all');

  useEffect(() => {
    fetch(`/groups/api/${id}/`)
      .then(r=>r.json())
      .then(data => setGroup(data))
      .catch(() => setGroup({ id: Number(id), name: 'Web Developer Study', member_count: 6, role: 'leader', attendance_rate: 92, color: '#0077ff', leader_name: '김리더', category: '개발', max_members: 10, is_public: true }));

    fetch(`/groups/api/${id}/members/`)
      .then(r=>r.json())
      .then(data => setMembers(data))
      .catch(() => setMembers([
        { id: 1, nickname: '김리더', role: 'leader', attendance_rate: 95 },
        { id: 2, nickname: '이멤버', role: 'member', attendance_rate: 88 },
        { id: 3, nickname: '박멤버', role: 'member', attendance_rate: 72 },
      ]));

    fetch(`/groups/api/${id}/notices/`)
      .then(r=>r.json())
      .then(data => setNotices(data))
      .catch(() => setNotices([
        { id: 1, title: '6월 스터디 일정 안내', content: '6월 스터디 일정을 안내드립니다.\n\n매주 화요일 오후 2시 ~ 4시에 진행됩니다.\n장소: 강남 스터디카페 3층\n\n참석 여부를 미리 알려주세요.', created_at: '2026.06.01', isPinned: true },
        { id: 2, title: '자료 공유 링크 업데이트', content: '이번 주 자료가 자료실에 업로드되었습니다.\n강의 자료와 예제 코드를 확인해 주세요.', created_at: '2026.05.28', isPinned: false },
      ]));

    fetch(`/groups/api/${id}/sessions/`)
      .then(r=>r.json())
      .then(data => setSessions(data))
      .catch(() => setSessions([
        { id: 1, topic: '정렬 알고리즘', date: todayStr(), status: 'unchecked', description: '버블 정렬, 퀵 정렬, 병합 정렬의 원리와 시간복잡도를 학습하고 코드로 직접 구현해 봅니다. 각자 구현한 코드를 공유하며 리뷰하는 시간도 갖습니다.' },
        { id: 2, topic: 'React 컴포넌트 설계', date: '2025.06.11', status: 'completed', description: '재사용 가능한 컴포넌트 구조화 원칙과 Props/State 관리 패턴을 학습합니다. Atomic Design 방법론을 실제 프로젝트에 적용하는 실습을 진행합니다.' },
        { id: 3, topic: 'JavaScript ES6', date: '2025.06.04', status: 'completed', description: 'Arrow Function, Destructuring, Spread Operator, Promise, async/await 등 ES6+ 핵심 문법을 예제 중심으로 학습하고 실습합니다.' },
      ]));
  }, [id]);

  /* ── 그룹 설정 ─────────────────────────────── */
  const handleGroupSettings = async () => {
    const Swal = (await import('sweetalert2')).default;
    if (!group) return;

    let deleteRequested = false;
    let delegateRequested = false;

    const catOptions = CATEGORIES.map(c =>
      `<option value="${c}" ${group.category === c ? 'selected' : ''}>${c}</option>`
    ).join('');

    const result = await Swal.fire({
      title: '<span style="font-size:18px;font-weight:700">그룹 설정</span>',
      width: 480,
      html: `
        <div style="text-align:left;font-family:-apple-system,sans-serif">

          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">그룹 이름</label>
            <input id="swal-gname" value="${group.name}" maxlength="30"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box"
              onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'" />
          </div>

          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">그룹 설명</label>
            <textarea id="swal-gdesc" rows="3" maxlength="200" placeholder="그룹을 소개해 주세요"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;resize:none;outline:none;box-sizing:border-box"
              onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'">${group.description || ''}</textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div>
              <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">카테고리</label>
              <select id="swal-gcat"
                style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box;background:#fff"
                onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'">
                ${catOptions}
              </select>
            </div>
            <div>
              <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">최대 인원수</label>
              <input id="swal-gmax" type="number" min="2" max="100" value="${group.max_members ?? 20}"
                style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box"
                onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'" />
            </div>
          </div>

          <div style="margin-bottom:6px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:8px">공개 설정</label>
            <div style="display:flex;gap:8px">
              <button id="swal-vis-public" type="button" onclick="
                document.getElementById('swal-vis').value='public';
                document.getElementById('swal-vis-public').style.boxShadow='0 0 0 2px #0077ff';
                document.getElementById('swal-vis-public').style.opacity='1';
                document.getElementById('swal-vis-private').style.boxShadow='none';
                document.getElementById('swal-vis-private').style.opacity='0.5';"
                style="flex:1;padding:9px;border-radius:10px;border:2px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:13px;cursor:pointer;${(group.is_public !== false) ? 'box-shadow:0 0 0 2px #0077ff;opacity:1' : 'opacity:0.5'}">
                🌐 공개
              </button>
              <button id="swal-vis-private" type="button" onclick="
                document.getElementById('swal-vis').value='private';
                document.getElementById('swal-vis-private').style.boxShadow='0 0 0 2px #0077ff';
                document.getElementById('swal-vis-private').style.opacity='1';
                document.getElementById('swal-vis-public').style.boxShadow='none';
                document.getElementById('swal-vis-public').style.opacity='0.5';"
                style="flex:1;padding:9px;border-radius:10px;border:2px solid #e2e8f0;background:#f8fafc;color:#475569;font-weight:700;font-size:13px;cursor:pointer;${(group.is_public === false) ? 'box-shadow:0 0 0 2px #0077ff;opacity:1' : 'opacity:0.5'}">
                🔒 비공개
              </button>
            </div>
            <p style="font-size:11px;color:#94a3b8;margin:6px 0 0 2px">비공개 설정 시 그룹명 검색에 표시되지 않습니다.</p>
            <input type="hidden" id="swal-vis" value="${(group.is_public !== false) ? 'public' : 'private'}" />
          </div>

          <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e2e8f0">
            <p style="font-size:11px;font-weight:600;color:#475569;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em">리더 관리</p>
            <button id="swal-delegate-btn" type="button"
              style="width:100%;padding:9px;border-radius:10px;border:1.5px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:13px;cursor:pointer">
              👑 리더 권한 위임
            </button>
          </div>

          <div style="margin-top:12px;padding-top:14px;border-top:1px solid #fee2e2">
            <button id="swal-delete-btn" type="button"
              style="width:100%;padding:9px;border-radius:10px;border:1.5px solid #fecaca;background:#fff1f2;color:#dc2626;font-weight:700;font-size:13px;cursor:pointer">
              🗑 그룹 삭제
            </button>
          </div>
        </div>`,
      confirmButtonText: '저장',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      didOpen: () => {
        document.getElementById('swal-delete-btn')?.addEventListener('click', () => {
          deleteRequested = true;
          Swal.close();
        });
        document.getElementById('swal-delegate-btn')?.addEventListener('click', () => {
          delegateRequested = true;
          Swal.close();
        });
      },
      preConfirm: () => {
        const name = ((document.getElementById('swal-gname') as HTMLInputElement)?.value || '').trim();
        const desc = ((document.getElementById('swal-gdesc') as HTMLTextAreaElement)?.value || '').trim();
        const cat  = (document.getElementById('swal-gcat') as HTMLSelectElement)?.value || '';
        const max  = parseInt((document.getElementById('swal-gmax') as HTMLInputElement)?.value || '20');
        const vis  = (document.getElementById('swal-vis') as HTMLInputElement)?.value || 'public';
        if (!name) { Swal.showValidationMessage('그룹 이름을 입력해 주세요.'); return false; }
        if (max < 2 || max > 100) { Swal.showValidationMessage('인원수는 2~100명 사이로 입력해 주세요.'); return false; }
        return { name, desc, cat, max, isPublic: vis === 'public' };
      },
    });

    if (deleteRequested) {
      const confirm = await Swal.fire({
        icon: 'warning',
        title: '그룹을 삭제하시겠습니까?',
        html: `<p style="color:#475569;font-size:14px"><strong style="color:#dc2626">${group.name}</strong> 그룹을 삭제하면<br/>모든 데이터가 영구적으로 삭제됩니다.</p>`,
        input: 'text',
        inputPlaceholder: `그룹 이름 "${group.name}"을 입력하세요`,
        inputAttributes: { style: 'font-size:14px;' },
        confirmButtonText: '삭제',
        confirmButtonColor: '#dc2626',
        showCancelButton: true,
        cancelButtonText: '취소',
        preConfirm: (val) => {
          if (val !== group.name) { Swal.showValidationMessage('그룹 이름이 일치하지 않습니다.'); return false; }
          return true;
        },
      });
      if (!confirm.isConfirmed) return;
      try {
        await fetch(`/groups/api/${id}/delete/`, { method: 'DELETE' });
      } catch { }
      await Swal.fire({ icon: 'success', title: '그룹이 삭제되었습니다.', timer: 1800, showConfirmButton: false });
      router.push('/groups');
      return;
    }

    if (delegateRequested) {
      const nonLeaders = members.filter(m => m.role !== 'leader');
      if (nonLeaders.length === 0) {
        await Swal.fire({ icon: 'info', title: '위임 가능한 멤버가 없습니다', text: '그룹에 리더 외 다른 멤버가 없습니다.', confirmButtonColor: '#0077ff' });
        return;
      }
      const avatarColors = ['#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];
      const memberBtns = nonLeaders.map((m, i) => `
        <button type="button" data-mid="${m.id}" data-mname="${m.nickname}"
          onclick="document.querySelectorAll('[data-mid]').forEach(b=>{b.style.boxShadow='none';b.style.background='#f8fafc';b.style.borderColor='#e2e8f0'});this.style.boxShadow='0 0 0 2px #0077ff';this.style.background='#eff6ff';this.style.borderColor='#bfdbfe';document.getElementById('swal-delegate-id').value=this.dataset.mid;document.getElementById('swal-delegate-name').textContent=this.dataset.mname;"
          style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #e2e8f0;background:#f8fafc;cursor:pointer;text-align:left;transition:all .15s">
          <div style="width:34px;height:34px;border-radius:50%;background:${avatarColors[i % 5]};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0">${m.nickname[0]}</div>
          <div>
            <p style="font-size:13px;font-weight:700;color:#1e293b;margin:0">${m.nickname}</p>
            <p style="font-size:11px;color:#94a3b8;margin:0">출석률 ${m.attendance_rate ?? 0}%</p>
          </div>
        </button>`).join('');

      const delegateResult = await Swal.fire({
        title: '<span style="font-size:17px;font-weight:700">리더 권한 위임</span>',
        width: 420,
        html: `
          <div style="text-align:left;font-family:-apple-system,sans-serif">
            <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;margin-bottom:16px;display:flex;gap:8px;align-items:flex-start">
              <span style="font-size:16px;flex-shrink:0">⚠️</span>
              <p style="font-size:12px;color:#92400e;line-height:1.5;margin:0">권한을 위임하면 현재 계정은 <strong>일반 멤버</strong>로 변경됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <p style="font-size:12px;font-weight:600;color:#475569;margin:0 0 10px 0">위임할 멤버를 선택해 주세요</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${memberBtns}
            </div>
            <input type="hidden" id="swal-delegate-id" value="" />
            <div id="swal-delegate-preview" style="margin-top:14px;padding:10px 14px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;display:none;align-items:center;gap:6px">
              <span style="font-size:13px;color:#1d4ed8;font-weight:600">👑 <span id="swal-delegate-name"></span> 님에게 위임합니다</span>
            </div>
          </div>`,
        confirmButtonText: '위임하기',
        confirmButtonColor: '#0077ff',
        showCancelButton: true,
        cancelButtonText: '취소',
        didOpen: () => {
          const nameEl = document.getElementById('swal-delegate-name');
          const previewEl = document.getElementById('swal-delegate-preview');
          if (nameEl && previewEl) {
            const observer = new MutationObserver(() => {
              previewEl.style.display = nameEl.textContent ? 'flex' : 'none';
            });
            observer.observe(nameEl, { childList: true, characterData: true, subtree: true });
          }
        },
        preConfirm: () => {
          const val = (document.getElementById('swal-delegate-id') as HTMLInputElement)?.value || '';
          if (!val) { Swal.showValidationMessage('위임할 멤버를 선택해 주세요.'); return false; }
          return { memberId: val };
        },
      });

      if (!delegateResult.isConfirmed || !delegateResult.value) return;
      const { memberId } = delegateResult.value as { memberId: string };
      try {
        await fetch(`/groups/api/${id}/delegate-leader/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ new_leader_id: memberId }),
        });
      } catch { }
      const newLeaderName = nonLeaders.find(m => String(m.id) === memberId)?.nickname || '';
      setMembers(prev => prev.map(m => ({ ...m, role: String(m.id) === memberId ? 'leader' : m.id === CURRENT_USER_ID ? 'member' : m.role })));
      setGroup(prev => prev ? { ...prev, role: 'member' } : prev);
      await Swal.fire({ icon: 'success', title: '리더 권한 위임 완료', text: `${newLeaderName} 님이 새 리더가 되었습니다.`, confirmButtonColor: '#0077ff', timer: 2000, timerProgressBar: true, showConfirmButton: false });
      return;
    }

    if (!result.isConfirmed || !result.value) return;
    const { name, desc, cat, max, isPublic } = result.value as { name:string; desc:string; cat:string; max:number; isPublic:boolean };
    try {
      await fetch(`/groups/api/${id}/update/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc, category: cat, max_members: max, is_public: isPublic }),
      });
    } catch { }
    setGroup(prev => prev ? { ...prev, name, description: desc, category: cat, max_members: max, is_public: isPublic } : prev);
    await Swal.fire({ icon: 'success', title: '설정이 저장되었습니다.', timer: 1500, showConfirmButton: false, timerProgressBar: true });
  };

  /* ── 출석 체크 ─────────────────────────────── */
  const handleCheckIn = async () => {
    const Swal = (await import('sweetalert2')).default;
    const unchecked = sessions.filter(s => s.status === 'unchecked');
    if (unchecked.length === 0) {
      await Swal.fire({ icon: 'info', title: '출석할 세션이 없습니다', text: '현재 미완료 세션이 없습니다.', confirmButtonColor: '#0077ff' });
      return;
    }
    const target = unchecked[0];
    const result = await Swal.fire({
      title: '출석 체크',
      html: `
        <div style="text-align:left">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin-bottom:14px">
            <p style="font-size:12px;color:#64748b;margin:0 0 4px 0">세션</p>
            <p style="font-size:15px;font-weight:700;color:#1e293b;margin:0">${target.topic}</p>
            <p style="font-size:12px;color:#94a3b8;margin:4px 0 0 0">${target.date}</p>
          </div>
          <p style="font-size:14px;font-weight:600;color:#1e293b;text-align:center;margin:0">출석 하시겠습니까?</p>
        </div>`,
      confirmButtonText: '출석 완료',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
    });
    if (!result.isConfirmed) return;
    try {
      await fetch(`/groups/api/${id}/sessions/${target.id}/self-check/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'present' }),
      });
    } catch { }
    const savedAttendance: Record<string, string> = JSON.parse(localStorage.getItem('sgm_attendance') || '{}');
    savedAttendance[`g${id}_s${target.id}_m1`] = 'present';
    localStorage.setItem('sgm_attendance', JSON.stringify(savedAttendance));
    setSessions(prev => prev.map(s => s.id === target.id ? { ...s, status: 'completed' } : s));
    await Swal.fire({ icon: 'success', title: '출석 완료!', text: `"${target.topic}" 출석이 완료되었습니다.`, confirmButtonColor: '#0077ff', timer: 2000, timerProgressBar: true, showConfirmButton: false });
  };

  /* ── 사유서 작성 ────────────────────────────── */
  const handleWriteReason = async () => {
    const Swal = (await import('sweetalert2')).default;
    const opts = sessions.map(s => `<option value="${s.id}">${s.topic} (${s.date})</option>`).join('');
    const result = await Swal.fire({
      title: '사유서 작성',
      html: `
        <div style="text-align:left">
          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">세션 선택</label>
            <select id="swal-sess" style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box">${opts}</select>
          </div>
          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">사유 유형</label>
            <div style="display:flex;gap:8px">
              <button onclick="document.querySelectorAll('[data-swal-type]').forEach(b=>{b.style.boxShadow='none';b.style.opacity='0.55'});this.style.boxShadow='0 0 0 2px #0077ff';this.style.opacity='1';document.getElementById('swal-type').value='late';document.getElementById('swal-fwrap').style.display='none'"
                data-swal-type style="flex:1;padding:9px;border-radius:10px;border:2px solid #fde68a;background:#fefce8;color:#b45309;font-weight:700;font-size:13px;cursor:pointer;opacity:0.55">⏰ 지각</button>
              <button onclick="document.querySelectorAll('[data-swal-type]').forEach(b=>{b.style.boxShadow='none';b.style.opacity='0.55'});this.style.boxShadow='0 0 0 2px #0077ff';this.style.opacity='1';document.getElementById('swal-type').value='absent';document.getElementById('swal-fwrap').style.display='block'"
                data-swal-type style="flex:1;padding:9px;border-radius:10px;border:2px solid #fecaca;background:#fff1f2;color:#dc2626;font-weight:700;font-size:13px;cursor:pointer;opacity:0.55">❌ 결석</button>
            </div>
            <input type="hidden" id="swal-type" value="" />
          </div>
          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">사유 내용</label>
            <textarea id="swal-reason" rows="3" placeholder="사유를 입력해 주세요" style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;resize:none;outline:none;box-sizing:border-box"></textarea>
          </div>
          <div id="swal-fwrap" style="display:none">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">증빙서류 첨부 <span style="color:#94a3b8;font-weight:400">(선택)</span></label>
            <div style="border:2px dashed #e2e8f0;border-radius:10px;padding:14px;text-align:center;cursor:pointer" onclick="document.getElementById('swal-file').click()">
              <input type="file" id="swal-file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" style="display:none" onchange="document.getElementById('swal-fname').textContent=this.files[0]?.name||''" />
              <div style="font-size:22px;margin-bottom:4px">📎</div>
              <p style="font-size:13px;color:#64748b;margin:0">클릭하여 파일 선택</p>
              <p id="swal-fname" style="font-size:12px;color:#0077ff;margin:6px 0 0 0"></p>
            </div>
          </div>
        </div>`,
      confirmButtonText: '제출',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const sess = (document.getElementById('swal-sess') as HTMLSelectElement)?.value || '';
        const type = (document.getElementById('swal-type') as HTMLInputElement)?.value || '';
        const reason = ((document.getElementById('swal-reason') as HTMLTextAreaElement)?.value || '').trim();
        const fileInput = document.getElementById('swal-file') as HTMLInputElement;
        const fileName = fileInput?.files?.[0]?.name || null;
        if (!type) { Swal.showValidationMessage('사유 유형을 선택해 주세요.'); return false; }
        if (!reason) { Swal.showValidationMessage('사유 내용을 입력해 주세요.'); return false; }
        return { sess, type, reason, fileName };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    const { sess, type, reason, fileName } = result.value as { sess:string; type:string; reason:string; fileName:string|null };
    const stored: Record<string, unknown> = JSON.parse(localStorage.getItem('sgm_reasons') || '{}');
    stored[`g${id}_s${sess}_m1`] = { type, reason, fileName };
    localStorage.setItem('sgm_reasons', JSON.stringify(stored));
    const savedAttendance: Record<string, string> = JSON.parse(localStorage.getItem('sgm_attendance') || '{}');
    savedAttendance[`g${id}_s${sess}_m1`] = type;
    localStorage.setItem('sgm_attendance', JSON.stringify(savedAttendance));
    await Swal.fire({ icon: 'success', title: '사유서 제출 완료', text: '사유서가 성공적으로 제출되었습니다.', confirmButtonColor: '#0077ff', timer: 2000, timerProgressBar: true, showConfirmButton: false });
  };

  /* ── 댓글 ──────────────────────────────────── */
  const handleAddComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    const now = new Date();
    const createdAt = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newComment: Comment = {
      id: Date.now(),
      authorId: CURRENT_USER_ID,
      authorName: '김리더',
      content: text,
      createdAt,
    };
    setComments(prev => [...prev, newComment]);
    setCommentInput('');
  };

  const handleDeleteComment = (commentId: number) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  /* ── 자료 ──────────────────────────────────── */
  const handleAddResource = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700">📁 자료 추가</span>',
      width: 460,
      html: `
        <div style="text-align:left;font-family:-apple-system,sans-serif">
          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">자료 유형</label>
            <div style="display:flex;gap:8px">
              <button type="button" id="rtype-link" onclick="
                ['rtype-link','rtype-file'].forEach(i=>{var b=document.getElementById(i);b.style.boxShadow='none';b.style.opacity='0.55'});
                this.style.boxShadow='0 0 0 2px #0077ff';this.style.opacity='1';
                document.getElementById('swal-rtype').value='link';"
                style="flex:1;padding:9px;border-radius:10px;border:2px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 0 0 2px #0077ff;opacity:1">🔗 링크</button>
              <button type="button" id="rtype-file" onclick="
                ['rtype-link','rtype-file'].forEach(i=>{var b=document.getElementById(i);b.style.boxShadow='none';b.style.opacity='0.55'});
                this.style.boxShadow='0 0 0 2px #0077ff';this.style.opacity='1';
                document.getElementById('swal-rtype').value='file';"
                style="flex:1;padding:9px;border-radius:10px;border:2px solid #e2e8f0;background:#f8fafc;color:#475569;font-weight:700;font-size:13px;cursor:pointer;opacity:0.55">📄 파일</button>
            </div>
            <input type="hidden" id="swal-rtype" value="link" />
          </div>

          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">제목 <span style="color:#dc2626">*</span></label>
            <input id="swal-rtitle" placeholder="자료 제목을 입력해 주세요"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box"
              onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'" />
          </div>

          <div id="rurl-wrap" style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">URL / 파일 경로</label>
            <input id="swal-rurl" placeholder="https:// 또는 파일명"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box"
              onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'" />
          </div>

          <div>
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">설명 <span style="color:#94a3b8;font-weight:400">(선택)</span></label>
            <textarea id="swal-rdesc" rows="2" placeholder="자료에 대한 간단한 설명"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;resize:none;outline:none;box-sizing:border-box"
              onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
          </div>
        </div>`,
      confirmButtonText: '추가',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const title = ((document.getElementById('swal-rtitle') as HTMLInputElement)?.value || '').trim();
        const type  = (document.getElementById('swal-rtype') as HTMLInputElement)?.value as 'link'|'file';
        const url   = ((document.getElementById('swal-rurl') as HTMLInputElement)?.value || '').trim();
        const desc  = ((document.getElementById('swal-rdesc') as HTMLTextAreaElement)?.value || '').trim();
        if (!title) { Swal.showValidationMessage('제목을 입력해 주세요.'); return false; }
        return { title, type, url, desc };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    const { title, type, url, desc } = result.value as { title:string; type:'link'|'file'; url:string; desc:string };
    const now = new Date();
    const uploadedAt = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
    setResources(prev => [...prev, { id: Date.now(), title, type, description: desc || undefined, uploaderName: '김리더', uploadedAt, url: url || undefined }]);
    await Swal.fire({ icon: 'success', title: '자료가 추가되었습니다.', timer: 1500, showConfirmButton: false, timerProgressBar: true });
  };

  const handleDeleteResource = async (resourceId: number) => {
    const Swal = (await import('sweetalert2')).default;
    const r = resources.find(x => x.id === resourceId);
    const result = await Swal.fire({
      icon: 'warning',
      title: '자료를 삭제하시겠습니까?',
      html: `<p style="color:#475569;font-size:14px"><strong>${r?.title ?? '자료'}</strong>가 삭제됩니다.</p>`,
      confirmButtonText: '삭제',
      confirmButtonColor: '#dc2626',
      showCancelButton: true,
      cancelButtonText: '취소',
    });
    if (!result.isConfirmed) return;
    setResources(prev => prev.filter(x => x.id !== resourceId));
  };

  /* ── 공지사항 보기 ─────────────────────────── */
  const handleViewNotice = async (n: Notice) => {
    const Swal = (await import('sweetalert2')).default;
    const safeTitle = n.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeContent = (n.content || '내용이 등록되지 않았습니다.').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    await Swal.fire({
      title: '',
      width: 520,
      html: `
        <div style="text-align:left;font-family:-apple-system,sans-serif">
          ${n.isPinned ? '<div style="margin-bottom:10px"><span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;background:#fef3c7;color:#d97706">📌 중요 공지</span></div>' : ''}
          <h2 style="font-size:17px;font-weight:800;color:#1e293b;margin:0 0 10px 0;line-height:1.4">${safeTitle}</h2>
          <div style="display:flex;align-items:center;gap:6px;padding-bottom:14px;border-bottom:1px solid #f1f5f9;margin-bottom:16px">
            <span style="font-size:12px;color:#94a3b8;font-family:monospace">${n.created_at}</span>
          </div>
          <div style="background:#f8fafc;border-radius:12px;padding:16px;font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap;max-height:280px;overflow-y:auto">${safeContent}</div>
        </div>`,
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  /* ── 공지사항 작성 ─────────────────────────── */
  const handleAddNotice = async () => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700">📢 공지 작성</span>',
      width: 500,
      html: `
        <div style="text-align:left;font-family:-apple-system,sans-serif">
          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">공지 제목 <span style="color:#dc2626">*</span></label>
            <input id="swal-ntitle" maxlength="100" placeholder="공지 제목을 입력해 주세요"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box"
              onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'" />
          </div>
          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">내용 <span style="color:#dc2626">*</span></label>
            <textarea id="swal-ncontent" rows="5" placeholder="공지 내용을 입력해 주세요"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;resize:none;outline:none;box-sizing:border-box"
              onfocus="this.style.borderColor='#0077ff'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;cursor:pointer" onclick="document.getElementById('swal-npin').click()">
            <input type="checkbox" id="swal-npin" style="width:16px;height:16px;accent-color:#f59e0b;cursor:pointer;flex-shrink:0" onclick="event.stopPropagation()" />
            <label for="swal-npin" style="font-size:13px;font-weight:600;color:#92400e;cursor:pointer;margin:0">📌 중요 공지로 설정 (상단 고정)</label>
          </div>
        </div>`,
      confirmButtonText: '작성 완료',
      confirmButtonColor: '#0077ff',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const title = ((document.getElementById('swal-ntitle') as HTMLInputElement)?.value || '').trim();
        const content = ((document.getElementById('swal-ncontent') as HTMLTextAreaElement)?.value || '').trim();
        const isPinned = (document.getElementById('swal-npin') as HTMLInputElement)?.checked ?? false;
        if (!title) { Swal.showValidationMessage('제목을 입력해 주세요.'); return false; }
        if (!content) { Swal.showValidationMessage('내용을 입력해 주세요.'); return false; }
        return { title, content, isPinned };
      },
    });
    if (!result.isConfirmed || !result.value) return;
    const { title, content, isPinned } = result.value as { title: string; content: string; isPinned: boolean };
    const now = new Date();
    const created_at = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
    setNotices(prev => {
      const newNotice = { id: Date.now(), title, content, created_at, isPinned };
      return [newNotice, ...prev].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    });
    await Swal.fire({ icon: 'success', title: '공지가 등록되었습니다.', timer: 1500, showConfirmButton: false, timerProgressBar: true });
  };

  /* ── 탈퇴하기 ──────────────────────────────── */
  const handleLeaveGroup = async () => {
    const Swal = (await import('sweetalert2')).default;
    if (!group) return;

    if (group.role === 'leader') {
      await Swal.fire({
        icon: 'warning',
        title: '리더는 탈퇴할 수 없습니다',
        html: `<p style="color:#475569;font-size:14px;line-height:1.6">
          그룹 리더는 바로 탈퇴할 수 없습니다.<br/>
          탈퇴하려면 먼저 <strong style="color:#0077ff">다른 멤버에게 리더 권한을 위임</strong>하거나,<br/>
          그룹을 <strong style="color:#dc2626">삭제</strong>해 주세요.
        </p>`,
        confirmButtonText: '확인',
        confirmButtonColor: '#0077ff',
      });
      return;
    }

    const result = await Swal.fire({
      title: '<span style="font-size:17px;font-weight:700;color:#dc2626">그룹 탈퇴</span>',
      width: 440,
      html: `
        <div style="text-align:left;font-family:-apple-system,sans-serif">
          <div style="background:#fff1f2;border:1px solid #fecaca;border-radius:12px;padding:14px 16px;margin-bottom:16px;display:flex;gap:10px;align-items:flex-start">
            <span style="font-size:20px;flex-shrink:0">⚠️</span>
            <div>
              <p style="font-size:13px;font-weight:700;color:#dc2626;margin:0 0 4px 0">탈퇴 전 확인하세요</p>
              <p style="font-size:12px;color:#9f1239;line-height:1.5;margin:0">
                탈퇴 후에는 해당 그룹의 출석 기록, 벌금 내역 등<br/>
                모든 데이터에 접근할 수 없게 됩니다.
              </p>
            </div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-bottom:16px">
            <p style="font-size:11px;color:#94a3b8;margin:0 0 3px 0">탈퇴할 그룹</p>
            <p style="font-size:15px;font-weight:700;color:#1e293b;margin:0">${group.name}</p>
          </div>

          <div>
            <label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:6px">
              확인을 위해 아래에 <strong style="color:#dc2626">탈퇴</strong> 를 입력해 주세요
            </label>
            <input id="swal-leave-confirm" type="text" placeholder="탈퇴"
              style="width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box;text-align:center;font-weight:700"
              onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#e2e8f0'" />
          </div>
        </div>`,
      confirmButtonText: '탈퇴하기',
      confirmButtonColor: '#dc2626',
      showCancelButton: true,
      cancelButtonText: '취소',
      preConfirm: () => {
        const val = ((document.getElementById('swal-leave-confirm') as HTMLInputElement)?.value || '').trim();
        if (val !== '탈퇴') {
          Swal.showValidationMessage('"탈퇴"를 정확히 입력해 주세요.');
          return false;
        }
        return true;
      },
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`/groups/api/${id}/leave/`, { method: 'POST' });
    } catch { }

    await Swal.fire({
      icon: 'success',
      title: '탈퇴 완료',
      text: `${group.name} 그룹에서 탈퇴했습니다.`,
      confirmButtonColor: '#0077ff',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    router.push('/groups');
  };

  /* ── 세션 상세 팝업 ────────────────────────── */
  const handleShowSessionDetail = async (s: Session) => {
    const Swal = (await import('sweetalert2')).default;

    const memberAvatarColors = ['#0077ff','#10b981','#f59e0b','#8b5cf6','#ef4444'];
    const memberRows = members.map((m, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;background:#f8fafc;border:1px solid #f1f5f9">
        <div style="width:32px;height:32px;border-radius:50%;background:${memberAvatarColors[i % 5]};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">
          ${m.nickname[0]}
        </div>
        <div style="flex:1;min-width:0">
          <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0">${m.nickname}</p>
          <p style="font-size:11px;color:#94a3b8;margin:0">${m.role === 'leader' ? '리더' : '멤버'}</p>
        </div>
        <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;background:${m.role === 'leader' ? '#dce6fd' : '#f1f5f9'};color:${m.role === 'leader' ? '#0077ff' : '#64748b'}">
          ${m.role === 'leader' ? '리더' : '멤버'}
        </span>
      </div>`).join('');

    const statusBadge = s.status === 'completed'
      ? `<span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px;background:#dcfce7;color:#16a34a">✅ 완료</span>`
      : `<span style="font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px;background:#fef3c7;color:#d97706">📖 진행 예정</span>`;

    await Swal.fire({
      title: '',
      width: 480,
      html: `
        <div style="text-align:left;font-family:-apple-system,sans-serif">

          <!-- 헤더 배지 -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <div style="width:40px;height:40px;border-radius:12px;background:#dce6fd;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">
              ${s.status === 'completed' ? '✅' : '📖'}
            </div>
            <div>
              <p style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 2px 0">Session</p>
              <h2 style="font-size:17px;font-weight:800;color:#1e293b;margin:0;line-height:1.3">${s.topic}</h2>
            </div>
          </div>

          <!-- 일자 & 상태 -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px">
              <p style="font-size:11px;color:#94a3b8;font-weight:600;margin:0 0 3px 0">📅 스터디 일자</p>
              <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0">${s.date}</p>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px">
              <p style="font-size:11px;color:#94a3b8;font-weight:600;margin:0 0 3px 0">상태</p>
              <div style="margin-top:2px">${statusBadge}</div>
            </div>
          </div>

          <!-- 내용 소개 -->
          <div style="margin-bottom:16px">
            <p style="font-size:12px;font-weight:700;color:#475569;margin:0 0 8px 0">📝 스터디 내용</p>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px">
              <p style="font-size:13px;color:#1e3a8a;line-height:1.6;margin:0">
                ${s.description || '세션 내용이 등록되지 않았습니다.'}
              </p>
            </div>
          </div>

          <!-- 참여 멤버 -->
          <div>
            <p style="font-size:12px;font-weight:700;color:#475569;margin:0 0 8px 0">👥 참여 멤버 (${members.length}명)</p>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${memberRows}
            </div>
          </div>
        </div>`,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: { popup: 'swal-session-popup' },
    });
  };

  /* ── 오늘의 스터디 ─────────────────────────── */
  const today = todayStr();
  const todaySessions = sessions.filter(s => s.date === today);

  /* ── render ────────────────────────────────── */
  return (
    <>
      <style>{`
        * { font-family: 'Pretendard', -apple-system, sans-serif; }
        .tab-btn { transition: all .2s; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #0077ff; border-bottom-color: #0077ff; font-weight: 700; }
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
        }} />

        <div className="max-w-[1440px] mx-auto my-0 lg:my-8 bg-white lg:rounded-[32px] shadow-2xl flex overflow-hidden" style={{minHeight:'100vh'}}>
          <LeftMenu />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-slate-50">

              {group ? (
                <>
                  {/* 그룹 헤더 배너 */}
                  <div className="bg-white border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                          style={{background:group.color||'#0077ff'}}>{group.name[0]}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-bold text-slate-800">{group.name}</h1>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:'#dce6fd', color:'#0077ff'}}>
                              {group.role === 'leader' ? '리더' : '멤버'}
                            </span>
                            {group.is_public === false && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">🔒 비공개</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{group.description || '그룹 설명 없음'}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>멤버 {group.member_count}명{group.max_members ? ` / 최대 ${group.max_members}명` : ''}</span>
                            {group.category && <span>· {group.category}</span>}
                            {group.created_at && <span>· {group.created_at} 개설</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {group.role === 'leader' && (
                          <button
                            onClick={handleGroupSettings}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                            ⚙ 그룹 설정
                          </button>
                        )}
                        <button
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
                          style={{background:'#0077ff'}}
                          onClick={handleWriteReason}>
                          사유서 작성
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
                          style={{background:'#0077ff'}}
                          onClick={handleCheckIn}>
                          출석 체크
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
                          style={{background:'#dc2626'}}
                          onMouseOver={e => { e.currentTarget.style.background = '#b91c1c'; }}
                          onMouseOut={e => { e.currentTarget.style.background = '#dc2626'; }}
                          onClick={handleLeaveGroup}>
                          탈퇴하기
                        </button>
                      </div>
                    </div>

                    {/* 통계 바 */}
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {[
                        {label:'출석률', value:`${group.attendance_rate||0}%`, color:'#0077ff'},
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
                  <div className="bg-white border-b border-slate-100 px-6 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {([
                      {key:'overview',    label:'개요'},
                      {key:'members',     label:'멤버'},
                      {key:'notices',     label:'공지사항'},
                      {key:'resources',   label:'자료'},
                      {key:'attendance',  label:'출석 현황'},
                      {key:'comments',    label:`💬 댓글 ${comments.length}`},
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

                    {/* ── 개요 ── */}
                    {activeTab === 'overview' && (
                      <div className="space-y-5">

                        {/* 오늘의 스터디 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{background:'#dce6fd'}}>📚</span>
                            오늘의 스터디
                            <span className="text-xs font-normal text-slate-400 ml-1">{today}</span>
                          </h3>

                          {todaySessions.length > 0 ? (
                            <div className="space-y-3">
                              {todaySessions.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border"
                                  style={{background:'linear-gradient(135deg,#eff6ff,#f0f9ff)', borderColor:'#bfdbfe'}}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                      style={{background:'#dce6fd'}}>
                                      {s.status === 'completed' ? '✅' : '📖'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">{s.topic}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {s.status === 'completed'
                                          ? <span className="text-green-600 font-semibold">출석 완료</span>
                                          : <span className="text-amber-600 font-semibold">출석 대기 중</span>}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {s.status === 'unchecked' && (
                                      <button
                                        onClick={handleCheckIn}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
                                        style={{background:'#0077ff'}}>
                                        출석 체크
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleShowSessionDetail(s)}
                                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-colors">
                                      세션 상세
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <span className="text-4xl mb-3">🎉</span>
                              <p className="text-sm font-semibold text-slate-600">오늘은 스터디 일정이 없습니다</p>
                              <p className="text-xs text-slate-400 mt-1">푹 쉬거나 자율 학습을 진행해 보세요!</p>
                            </div>
                          )}
                        </div>

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
                                    style={{background:group.color||'#0077ff'}}>{m.nickname[0]}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                      <p className="text-xs font-semibold text-slate-700 truncate">{m.nickname}</p>
                                      <span className="text-xs font-bold" style={{color:group.color||'#0077ff'}}>{m.attendance_rate||0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{width:`${m.attendance_rate||0}%`, background:group.color||'#0077ff'}}></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 멤버 ── */}
                    {activeTab === 'members' && (
                      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-slate-800">멤버 목록 ({members.length}명)</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {members.map(m => (
                            <div key={m.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{background:group.color||'#0077ff'}}>{m.nickname[0]}</div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-700">{m.nickname}</p>
                              </div>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{background: m.role==='leader'?'#dce6fd':'#f1f5f9', color: m.role==='leader'?'#0077ff':'#64748b'}}>
                                {m.role==='leader'?'리더':'멤버'}
                              </span>
                              <span className="text-xs font-bold" style={{color:group.color||'#0077ff'}}>{m.attendance_rate||0}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── 공지사항 ── */}
                    {activeTab === 'notices' && (
                      <div className="bg-white rounded-2xl border border-slate-100">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-slate-800">공지사항</h3>
                          {group.role === 'leader' && (
                            <button onClick={handleAddNotice} className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white" style={{background:'#0077ff'}}>
                              + 공지 작성
                            </button>
                          )}
                        </div>
                        <div className="divide-y divide-slate-50">
                          {[...notices].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(n => (
                            <div key={n.id} onClick={() => handleViewNotice(n)}
                              className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 cursor-pointer">
                              {n.isPinned
                                ? <span className="text-amber-500 text-sm flex-shrink-0">📌</span>
                                : <span className="w-4 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{n.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{n.created_at}</p>
                              </div>
                              <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                              </svg>
                            </div>
                          ))}
                          {notices.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">공지사항이 없습니다.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── 자료 ── */}
                    {activeTab === 'resources' && (
                      <div className="space-y-4">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800">스터디 자료</h3>
                            <p className="text-xs text-slate-400 mt-0.5">멤버들이 공유한 링크·파일을 한 곳에서 확인하세요</p>
                          </div>
                          <button
                            onClick={handleAddResource}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-colors"
                            style={{background:'#0077ff'}}
                            onMouseOver={e => { e.currentTarget.style.background='#0d44c4'; }}
                            onMouseOut={e => { e.currentTarget.style.background='#0077ff'; }}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                            </svg>
                            자료 추가
                          </button>
                        </div>

                        {/* 필터 */}
                        <div className="flex gap-2 flex-wrap">
                          {([['all','전체'],['link','🔗 링크'],['file','📄 파일']] as [typeof resourceFilter, string][]).map(([key, label]) => (
                            <button key={key} onClick={() => setResourceFilter(key)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all"
                              style={{
                                background: resourceFilter === key ? '#0077ff' : '#fff',
                                color: resourceFilter === key ? '#fff' : '#64748b',
                                borderColor: resourceFilter === key ? '#0077ff' : '#e2e8f0',
                              }}>
                              {label}
                            </button>
                          ))}
                          <span className="text-xs text-slate-400 self-center ml-1">
                            {resources.filter(r => resourceFilter === 'all' || r.type === resourceFilter).length}개
                          </span>
                        </div>

                        {/* 자료 목록 */}
                        {(() => {
                          const filtered = resources.filter(r => resourceFilter === 'all' || r.type === resourceFilter);
                          if (filtered.length === 0) return (
                            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
                              <span className="text-4xl block mb-3">📂</span>
                              <p className="text-sm font-semibold text-slate-500">공유된 자료가 없습니다</p>
                              <p className="text-xs text-slate-400 mt-1">위의 자료 추가 버튼을 눌러 첫 자료를 공유해 보세요!</p>
                            </div>
                          );
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {filtered.map(r => {
                                const typeIcon = r.type === 'link' ? '🔗' : '📄';
                                const typeBg   = r.type === 'link' ? '#eff6ff' : '#f0fdf4';
                                const typeBorder = r.type === 'link' ? '#bfdbfe' : '#bbf7d0';
                                const typeColor  = r.type === 'link' ? '#1d4ed8' : '#15803d';
                                const typeLabel  = r.type === 'link' ? '링크' : '파일';
                                return (
                                  <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                          style={{background: typeBg, border:`1px solid ${typeBorder}`}}>
                                          {typeIcon}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-bold text-slate-800 truncate">{r.title}</p>
                                          {r.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.description}</p>}
                                        </div>
                                      </div>
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                                        style={{background: typeBg, color: typeColor, border:`1px solid ${typeBorder}`}}>
                                        {typeLabel}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                                          style={{background: group.color||'#0077ff'}}>{r.uploaderName[0]}</div>
                                        <span>{r.uploaderName}</span>
                                        <span>·</span>
                                        <span>{r.uploadedAt}</span>
                                      </div>
                                      <div className="flex gap-1.5">
                                        {r.url && (
                                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                                            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                                            style={{color:'#0077ff', background:'#eff6ff'}}>
                                            {r.type === 'link' ? '열기' : '다운로드'}
                                          </a>
                                        )}
                                        <button onClick={() => handleDeleteResource(r.id)}
                                          className="text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                          삭제
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* ── 출석 현황 ── */}
                    {activeTab === 'attendance' && (
                      <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">세션 목록</h3>
                          </div>
                          {sessions.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">예정된 세션이 없습니다.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr style={{background:'#f8fafc'}}>
                                    {['날짜','주제','상태','액션','기록'].map(h => (
                                      <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-500 font-bold">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {sessions.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50">
                                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{s.date}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{s.topic}</td>
                                      <td className="px-4 py-3">
                                        {s.status === 'completed'
                                          ? <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{background:'#dcfce7', color:'#16a34a'}}>✅ 완료</span>
                                          : <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{background:'#fef3c7', color:'#d97706'}}>⚠ 미완료</span>}
                                      </td>
                                      <td className="px-4 py-3">
                                        {s.status === 'unchecked'
                                          ? <button onClick={() => router.push(`/attendance/check?group_id=${id}&session_id=${s.id}`)} className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white" style={{background:'#0077ff'}}>출석 체크</button>
                                          : <button onClick={() => router.push(`/attendance/check?group_id=${id}&session_id=${s.id}`)} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">결과 보기</button>}
                                      </td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => handleShowSessionDetail(s)}
                                          className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors"
                                          style={{borderColor:'#bfdbfe', color:'#0077ff', background:'#eff6ff'}}
                                          onMouseOver={e => { e.currentTarget.style.background='#dce6fd'; }}
                                          onMouseOut={e => { e.currentTarget.style.background='#eff6ff'; }}>
                                          세션 내용
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">멤버 출석 현황</h3>
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
                                    <td className="px-4 py-3 text-sm font-bold" style={{color:group.color||'#0077ff'}}>{m.attendance_rate||0}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 댓글 (Thread) ── */}
                    {activeTab === 'comments' && (
                      <div className="space-y-4">

                        {/* 입력창 */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-base">💬</span> 댓글 <span className="text-sm font-normal text-slate-400">({comments.length})</span>
                          </h3>
                          <div className="flex gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{background:group.color||'#0077ff'}}>
                              김
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={commentInput}
                                onChange={e => setCommentInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }}}
                                placeholder="댓글을 입력하세요..."
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                              />
                              <button
                                onClick={handleAddComment}
                                disabled={!commentInput.trim()}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{background:'#0077ff'}}>
                                작성
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Thread 목록 */}
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                          {comments.length === 0 ? (
                            <div className="py-16 text-center">
                              <span className="text-4xl block mb-3">💬</span>
                              <p className="text-sm text-slate-500 font-medium">첫 번째 댓글을 남겨보세요!</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-50">
                              {comments.map((c, idx) => (
                                <div key={c.id} className="flex gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                                  {/* 왼쪽: 프로필 */}
                                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                      style={{background: ['#0077ff','#10b981','#f59e0b','#8b5cf6','#ef4444'][idx % 5]}}>
                                      {c.authorName[0]}
                                    </div>
                                    {idx < comments.length - 1 && (
                                      <div className="w-0.5 flex-1 min-h-[16px] rounded-full bg-slate-100" />
                                    )}
                                  </div>
                                  {/* 오른쪽: 콘텐츠 */}
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-800">{c.authorName}</span>
                                        {c.authorId === 1 && (
                                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{background:'#dce6fd', color:'#0077ff'}}>리더</span>
                                        )}
                                        <span className="text-xs text-slate-400">{c.createdAt}</span>
                                      </div>
                                      {c.authorId === CURRENT_USER_ID && (
                                        <button
                                          onClick={() => handleDeleteComment(c.id)}
                                          className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-rose-500 transition-all px-2 py-0.5 rounded-lg hover:bg-rose-50">
                                          삭제
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed break-words">{c.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
