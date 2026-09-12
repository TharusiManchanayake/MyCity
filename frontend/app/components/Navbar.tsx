'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type User = {
  name: string;
  role: string;
};

const linkStyle = { color: '#2b2b2b', fontSize: 14, fontWeight: 500 };

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
      <Link href="/council-info" style={linkStyle}>Council info</Link>
    </>
  );

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #dcdad5',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', paddingRight: 20 }}>
        <Image src="/mycity-badge4.png" alt="MyCity" width={210} height={280} style={{ height: 56, width: 'auto' }} />
      </Link>

      <div style={{ width: 1, height: 32, background: '#dcdad5', marginRight: 24 }} />

      <div style={{ display: 'flex', gap: 20 }}>
        {(!user || user.role === 'citizen') && citizenLinks}

        {user?.role === 'admin' && (
          <>
            <Link href="/admin/queue" style={linkStyle}>Admin queue</Link>
            <Link href="/admin/analytics" style={linkStyle}>Analytics</Link>
            <Link href="/admin/announcements" style={linkStyle}>Announcements</Link>
            <Link href="/admin/assets" style={linkStyle}>Assets</Link>
            <Link href="/admin/budgets" style={linkStyle}>Budgets</Link>
            <Link href="/admin/council-info" style={linkStyle}>Council info</Link>
          </>
        )}

        {user?.role === 'technician' && (
          <Link href="/technician" style={linkStyle}>My assignments</Link>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, color: '#6e6e6e' }}>Hi, {user.name}</span>
            <button
              onClick={logout}
              style={{ fontSize: 13, background: 'transparent', color: '#2b2b2b', border: '1px solid #dcdad5', borderRadius: 6, padding: '5px 10px' }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>Sign in</Link>
            <Link
              href="/signup"
              style={{ fontSize: 13, background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', borderRadius: 6, padding: '6px 12px', fontWeight: 700 }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}