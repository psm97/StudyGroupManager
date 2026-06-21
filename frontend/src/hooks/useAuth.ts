'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  profile_image: string;
  role: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/accounts/api/me/', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) {
          router.replace('/accounts/login');
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((data: User | null) => {
        if (data) setUser(data);
      })
      .catch(() => {
        router.replace('/accounts/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  return { user, loading };
}
