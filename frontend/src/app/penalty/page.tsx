'use client';

import { useState } from 'react';
import LeftMenu from '@/components/LeftMenu';
import Header from '@/components/Header';
import Swal from 'sweetalert2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const groupTabs = [
  { id: 1, name: 'Web Developer Study', memberCount: 6 },
  { id: 2, name: 'Python 스터디', memberCount: 4 },
];

const memberPenalties = [
  { id: 1, name: '김민수', avatar: 'K', color: '#1258fc', unpaid: 10000, paid: 30000, total: 40000, rate: 75 },
  { id: 2, name: '이지연', avatar: 'L', color: '#10b981', unpaid: 0, paid: 15000, total: 15000, rate: 100 },
  { id: 3, name: '박철수', avatar: 'P', color: '#f59e0b', unpaid: 20000, paid: 10000, total: 30000, rate: 33 },
  { id: 4, name: '최수아', avatar: 'C', color: '#8b5cf6', unpaid: 3000, paid: 9000, total: 12000, rate: 75 },
  { id: 5, name: '정도현', avatar: 'J', color: '#ec4899', unpaid: 13000, paid: 12000, total: 25000, rate: 48 },
  { id: 6, name: '한예진', avatar: 'H', color: '#f97316', unpaid: 30000, paid: 5000, total: 35000, rate: 14 },
];

type PenaltyRecord = { id: number; member: string; reason: string; date: string; amount: number; status: 'unpaid' | 'paid' };
const initialRecords: PenaltyRecord[] = [
  { id: 1, member: '한예진', reason: '결석', date: '2026-06-15', amount: 10000, status: 'unpaid' },
  { id: 2, member: '박철수', reason: '결석', date: '2026-06-08', amount: 10000, status: 'unpaid' },
  { id: 3, member: '정도현', reason: '지각', date: '2026-06-08', amount: 3000, status: 'paid' },
  { id: 4, member: '한예진', reason: '지각', date: '2026-06-01', amount: 3000, status: 'unpaid' },
  { id: 5, member: '이지연', reason: '결석', date: '2026-05-25', amount: 10000, status: 'paid' },
  { id: 6, member: '김민수', reason: '결석', date: '2026-05-18', amount: 10000, status: 'unpaid' },
  { id: 7, member: '정도현', reason: '결석', date: '2026-05-11', amount: 10000, status: 'unpaid' },
  { id: 8, member: '최수아', reason: '지각', date: '2026-05-04', amount: 3000, status: 'unpaid' },
];

const totalUnpaid = memberPenalties.reduce((s, m) => s + m.unpaid, 0);
const totalPaid = memberPenalties.reduce((s, m) => s + m.paid, 0);
const totalAmount = memberPenalties.reduce((s, m) => s + m.total, 0);

const lineData = {
  labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
  datasets: [{ label: '월별 벌금(원)', data: [45000, 30000, 55000, 38000, 42000, 76000], borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#dc2626', pointRadius: 4 }],
};
const lineOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } } } };

const doughnutData = {
  labels: ['미납', '납부완료'],
  datasets: [{ data: [totalUnpaid, totalPaid], backgroundColor: ['#fee2e2', '#dcfce7'], borderColor: ['#dc2626', '#16a34a'], borderWidth: 2 }],
};
const doughnutOptions = { responsive: true, plugins: { legend: { position: 'bottom' as const } }, cutout: '65%' };

const rateColor = (r: number) => r >= 80 ? '#16a34a' : r >= 50 ? '#d97706' : '#dc2626';
const rateBg = (r: number) => r >= 80 ? '#dcfce7' : r >= 50 ? '#fef3c7' : '#fee2e2';

export default function PenaltyPage() {
  const [selectedGroupId, setSelectedGroupId] = useState(1);
  const [records, setRecords] = useState<PenaltyRecord[]>(initialRecords);
  const [filterMember, setFilterMember] = useState('all');
  const [unpaidOnly, setUnpaidOnly] = useState(false);

  const handleMarkPaid = async (record: PenaltyRecord) => {
    const result = await Swal.fire({
      title: '납부 처리',
      text: `${record.member}의 ${record.amount.toLocaleString()}원을 납부 처리하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '처리',
      cancelButtonText: '취소',
      confirmButtonColor: '#1258fc',
    });
    if (result.isConfirmed) {
      setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'paid' } : r));
      Swal.fire({ title: '납부 처리 완료!', icon: 'success', timer: 1500, showConfirmButton: false });
    }
  };

  const handleMarkAllPaid = async () => {
    const unpaidCount = records.filter(r => r.status === 'unpaid').length;
    if (unpaidCount === 0) { Swal.fire({ title: '미납금이 없습니다', icon: 'info', timer: 1500, showConfirmButton: false }); return; }
    const result = await Swal.fire({
      title: '전체 납부 처리',
      text: `미납 ${unpaidCount}건(₩${records.filter(r => r.status === 'unpaid').reduce((s, r) => s + r.amount, 0).toLocaleString()})을 모두 납부 처리하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '전체 처리',
      cancelButtonText: '취소',
      confirmButtonColor: '#1258fc',
    });
    if (result.isConfirmed) {
      setRecords(prev => prev.map(r => ({ ...r, status: 'paid' as const })));
      Swal.fire({ title: '전체 납부 처리 완료!', icon: 'success', timer: 1500, showConfirmButton: false });
    }
  };

  const filteredRecords = records
    .filter(r => filterMember === 'all' || r.member === filterMember)
    .filter(r => !unpaidOnly || r.status === 'unpaid');

  const members = Array.from(new Set(records.map(r => r.member)));

  return (
    <div className="flex h-screen bg-slate-50">
      <LeftMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">

          {/* 배너 */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
            <h2 className="text-xl font-bold mb-2">벌금 관리 💰</h2>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold">미납 ₩{totalUnpaid.toLocaleString()}</span>
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold">납부완료 ₩{totalPaid.toLocaleString()}</span>
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold">총 ₩{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* 그룹 탭 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {groupTabs.map(g => (
                <button key={g.id} onClick={() => setSelectedGroupId(g.id)}
                  className={`px-5 py-3.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${selectedGroupId === g.id ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'}`}>
                  {g.name}
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-xs" style={selectedGroupId === g.id ? { background: '#dce6fd', color: '#1258fc' } : { background: '#f1f5f9', color: '#64748b' }}>{g.memberCount}명</span>
                </button>
              ))}
            </div>
          </div>

          {/* 요약 카드 3개 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: '총 미납금', value: `₩${totalUnpaid.toLocaleString()}`, color: '#dc2626', bg: '#fee2e2', icon: '⚠️' },
              { label: '납부 완료', value: `₩${totalPaid.toLocaleString()}`, color: '#16a34a', bg: '#dcfce7', icon: '✅' },
              { label: '총 발생 벌금', value: `₩${totalAmount.toLocaleString()}`, color: '#1258fc', bg: '#dce6fd', icon: '💰' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-9 h-9 flex items-center justify-center rounded-xl text-lg" style={{ background: c.bg }}>{c.icon}</span>
                  <span className="text-sm text-slate-500">{c.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* 멤버 카드 + 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 멤버 벌금 카드 */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {memberPenalties.map(m => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: m.color }}>{m.avatar}</div>
                    <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                  </div>
                  <div className="space-y-1 mb-3 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">미납</span><span className="font-semibold text-red-500">₩{m.unpaid.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">납부</span><span className="font-semibold text-green-600">₩{m.paid.toLocaleString()}</span></div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${m.rate}%`, background: rateColor(m.rate) }} /></div>
                    <span className="text-xs font-bold" style={{ color: rateColor(m.rate) }}>{m.rate}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 차트 */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h4 className="font-semibold text-slate-700 text-sm mb-3">월별 벌금 추이</h4>
                <Line data={lineData} options={lineOptions} />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h4 className="font-semibold text-slate-700 text-sm mb-3">납부 현황</h4>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* 벌금 내역 테이블 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
              <h3 className="font-bold text-slate-800">벌금 내역</h3>
              <select value={filterMember} onChange={e => setFilterMember(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-400">
                <option value="all">전체 멤버</option>
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" checked={unpaidOnly} onChange={e => setUnpaidOnly(e.target.checked)} className="rounded" />
                <span className="text-slate-600">미납만 보기</span>
              </label>
              <button onClick={handleMarkAllPaid} className="ml-auto text-sm font-semibold bg-green-50 text-green-700 px-4 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
                전체 납부 처리
              </button>
            </div>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-xs text-slate-400">
                    <th className="py-3 px-5 text-left">멤버</th>
                    <th className="py-3 px-3 text-left">사유</th>
                    <th className="py-3 px-3 text-left">날짜</th>
                    <th className="py-3 px-3 text-right">금액</th>
                    <th className="py-3 px-3 text-center">상태</th>
                    <th className="py-3 px-5 text-center">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 font-medium text-slate-700">{r.member}</td>
                      <td className="py-3 px-3 text-slate-500">{r.reason}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{r.date}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">₩{r.amount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={{ background: r.status === 'paid' ? '#dcfce7' : '#fee2e2', color: r.status === 'paid' ? '#16a34a' : '#dc2626' }}>
                          {r.status === 'paid' ? '납부완료' : '미납'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        {r.status === 'unpaid' && (
                          <button onClick={() => handleMarkPaid(r)}
                            className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                            납부 처리
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">내역이 없습니다</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
