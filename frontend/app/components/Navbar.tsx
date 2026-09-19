
 'use client';

import Link from 'next/link';
import Image from 'next/image';
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

  const linkStyle = (href: string) => {
    const active = pathname === href;
    return {
      color: active ? '#16a34a' : '#3f3f3f',
      fontSize: 14,
      fontWeight: active ? 700 : 500,
      padding: '6px 2px',
      borderBottom: active ? '2px solid #22c55e' : '2px solid transparent',
      transition: 'color 0.15s ease, border-color 0.15s ease',
    };
  };

  const citizenLinks = (
    <>
      <Link href="/report" style={linkStyle('/report')} className="nav-link">Report an issue</Link>
      <Link href="/reports" style={linkStyle('/reports')} className="nav-link">View reports</Link>
      <Link href="/announcements" style={linkStyle('/announcements')} className="nav-link">Announcements</Link>
      <Link href="/council-info" style={linkStyle('/council-info')} className="nav-link">Council info</Link>
    </>
  );

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #e2f5e6',
        boxShadow: '0 1px 6px rgba(34,197,94,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <style>{`
        .nav-link:hover { color: #16a34a !important; }
      `}</style>

      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 20 }}>
        <Image src="/mycity-badge4.png" alt="MyCity" width={210} height={280} style={{ height: 44, width: 'auto' }} />
        <span style={{ fontWeight: 800, fontSize: 17, color: '#16a34a', letterSpacing: '-0.3px' }}>MyCity</span>
      </Link>

      <div style={{ width: 1, height: 32, background: '#e2f5e6', marginRight: 24 }} />

      <div style={{ display: 'flex', gap: 24 }}>
        {(!user || user.role === 'citizen') && citizenLinks}

        {user?.role === 'admin' && (
          <>
            <Link href="/admin/queue" style={linkStyle('/admin/queue')} className="nav-link">Admin queue</Link>
            <Link href="/admin/analytics" style={linkStyle('/admin/analytics')} className="nav-link">Analytics</Link>
            <Link href="/admin/announcements" style={linkStyle('/admin/announcements')} className="nav-link">Announcements</Link>
            <Link href="/admin/assets" style={linkStyle('/admin/assets')} className="nav-link">Assets</Link>
            <Link href="/admin/budgets" style={linkStyle('/admin/budgets')} className="nav-link">Budgets</Link>
            <Link href="/admin/council-info" style={linkStyle('/admin/council-info')} className="nav-link">Council info</Link>
          </>
        )}

        {user?.role === 'technician' && (
          <Link href="/technician" style={linkStyle('/technician')} className="nav-link">My assignments</Link>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: '#4b4b4b' }}>Hi, {user.name}</span>
            <button
              onClick={logout}
              style={{
                fontSize: 13,
                background: 'transparent',
                color: '#2b2b2b',
                border: '1px solid #dcdad5',
                borderRadius: 6,
                padding: '5px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.borderColor = '#fca5a5';
                e.currentTarget.style.color = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#dcdad5';
                e.currentTarget.style.color = '#2b2b2b';
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: '#2b2b2b', fontSize: 14, fontWeight: 500 }} className="nav-link">Sign in</Link>
            <Link
              href="/signup"
              style={{
                fontSize: 13,
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                color: '#ffffff',
                borderRadius: 6,
                padding: '6px 12px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
              }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}