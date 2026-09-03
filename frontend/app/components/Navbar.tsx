'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type User = {
  name: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const syncUser = () => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  };

  useEffect(() => {
    syncUser();
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const citizenLinks = (
    <>
      <Link href="/report">Report an issue</Link>
      <Link href="/reports">View reports</Link>
      <Link href="/announcements">Announcements</Link>
    </>
  );

  return (
    <nav style={{ display: 'flex', gap: 16, padding: '12px 20px', borderBottom: '1px solid #ddd', alignItems: 'center' }}>
      <Link href="/" style={{ fontWeight: 700 }}>MyCity</Link>

      {(!user || user.role === 'citizen') && citizenLinks}

      {user?.role === 'admin' && (
        <>
          <Link href="/admin/queue">Admin queue</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/announcements">Announcements</Link>
          <Link href="/admin/assets">Assets</Link>
          <Link href="/admin/budgets">Budgets</Link>
        </>
      )}

      {user?.role === 'technician' && (
        <Link href="/technician">My assignments</Link>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, color: '#666' }}>Hi, {user.name}</span>
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