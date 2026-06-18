'use client';

import { useState, useEffect } from 'react';

export default function DarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sgm-dark-mode');
    const isDark = saved === 'true';
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('sgm-dark-mode', String(next));
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
  };

  return (
    <button
      onClick={toggle}
      title={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="relative flex-shrink-0 w-14 h-7 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{
        background: dark ? '#1e40af' : '#e2e8f0',
        transition: 'background 0.3s',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
        style={{
          transform: dark ? 'translateX(28px)' : 'translateX(0)',
          background: dark ? '#60a5fa' : '#ffffff',
          transition: 'transform 0.3s, background 0.3s',
        }}
      >
        {dark ? (
          <svg
            className="w-3.5 h-3.5"
            style={{ color: '#1e3a8a' }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            style={{ color: '#f59e0b' }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <path
              strokeLinecap="round"
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
