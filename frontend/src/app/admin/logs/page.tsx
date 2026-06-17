'use client';

import { useEffect, useState } from 'react';

interface Log {
  id: number; timestamp: string; level: 'INFO'|'WARN'|'ERROR'; message: string; user?: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [levelFilter, setLevelFilter] = useState<'ALL'|'INFO'|'WARN'|'ERROR'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/admin/api/logs/')
      .then(r=>r.json())
      .then(data => { setLogs(data.data || data); setLoading(false); })
      .catch(() => {
        setLogs([
          {id:1, timestamp:'2025-06-17 14:23:11', level:'INFO', message:'사용자 로그인 성공', user:'홍길동'},
          {id:2, timestamp:'2025-06-17 14:20:05', level:'WARN', message:'비밀번호 5회 오류 감지', user:'unknown'},
          {id:3, timestamp:'2025-06-17 14:15:32', level:'ERROR', message:'DB 연결 타임아웃 발생', user:'system'},
          {id:4, timestamp:'2025-06-17 14:10:00', level:'INFO', message:'그룹 생성: Web Developer Study', user:'김철수'},
          {id:5, timestamp:'2025-06-17 14:05:22', level:'INFO', message:'출석 체크 완료 (8명)', user:'system'},
        ]);
        setLoading(false);
      });
  }, []);

  const levelStyle = (level: string) => {
    const map: Record<string, {bg:string, color:string}> = {
      INFO: {bg:'#dbeafe', color:'#1d4ed8'},
      WARN: {bg:'#fef3c7', color:'#d97706'},
      ERROR: {bg:'#fee2e2', color:'#dc2626'},
    };
    return map[level] || {bg:'#f1f5f9', color:'#64748b'};
  };

  const filtered = levelFilter === 'ALL' ? logs : logs.filter(l => l.level === levelFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">시스템로그</h1>
          <p className="text-sm text-slate-400 mt-0.5">서비스 이벤트 및 오류 로그</p>
        </div>
        <div className="flex items-center gap-2">
          {(['ALL','INFO','WARN','ERROR'] as const).map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all"
              style={{
                background: levelFilter===l ? '#111111' : '#fff',
                color: levelFilter===l ? '#fff' : '#64748b',
                borderColor: levelFilter===l ? '#111111' : '#e2e8f0'
              }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{boxShadow:'0 1px 8px rgba(15,23,42,.05)'}}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">총 <strong>{filtered.length}</strong>건</span>
          <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">로그 다운로드</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background:'#f8fafc'}}>
                {['시간','레벨','메시지','사용자'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">로딩 중...</td></tr>
              ) : filtered.map(log => {
                const badge = levelStyle(log.level);
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:badge.bg, color:badge.color}}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{log.message}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{log.user || '-'}</td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">로그가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
