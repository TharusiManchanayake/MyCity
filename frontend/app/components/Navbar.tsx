'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  name: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav style={{ display: 'flex', gap: 16, padding: '12px 20px', borderBottom: '1px solid #ddd', alignItems: 'center' }}>
      <Link href="/" style={{ fontWeight: 700 }}>MyCity</Link>
      <Link href="/report">Report an issue</Link>
      <Link href="/reports">View reports</Link>
      <Link href="/announcements">Announcements</Link>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, color: '#666' }}>Hi, {user.name}</span>
            {user.role === 'admin' && (
  <>
    <Link href="/admin/queue" style={{ fontSize: 13 }}>Admin queue</Link>
    <Link href="/admin/announcements" style={{ fontSize: 13 }}>Post announcement</Link>
  </>
)}
            <button onClick={logout} style={{ fontSize: 13 }}>Log out</button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ fontSize: 13 }}>Sign in</Link>
            <Link href="/signup" style={{ fontSize: 13 }}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}