'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type User = {
  name: string;
  role: string;
};

const linkStyle = { color: '#eaf5ea' };

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
      <Link href="/report" style={linkStyle}>Report an issue</Link>
      <Link href="/reports" style={linkStyle}>View reports</Link>
      <Link href="/announcements" style={linkStyle}>Announcements</Link>
    </>
  );

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 20px',
        background: '#2f7d3a',
      }}
    >
     <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
  <Image src="/mycity-badge.png" alt="MyCity" width={190} height={125} style={{ height: 48, width: 'auto' }} />
</Link>

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)', margin: '0 20px' }} />

      <div style={{ display: 'flex', gap: 20 }}>
        {(!user || user.role === 'citizen') && citizenLinks}

        {user?.role === 'admin' && (
          <>
            <Link href="/admin/queue" style={linkStyle}>Admin queue</Link>
            <Link href="/admin/analytics" style={linkStyle}>Analytics</Link>
            <Link href="/admin/announcements" style={linkStyle}>Announcements</Link>
            <Link href="/admin/assets" style={linkStyle}>Assets</Link>
            <Link href="/admin/budgets" style={linkStyle}>Budgets</Link>
          </>
        )}

        {user?.role === 'technician' && (
          <Link href="/technician" style={linkStyle}>My assignments</Link>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, color: '#d7ecd6' }}>Hi, {user.name}</span>
            <button
              onClick={logout}
              style={{ fontSize: 13, background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 4, padding: '4px 10px' }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>Sign in</Link>
            <Link
              href="/signup"
              style={{ fontSize: 13, background: '#fff', color: '#2f7d3a', borderRadius: 4, padding: '4px 10px', fontWeight: 600 }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}