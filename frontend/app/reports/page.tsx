'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ReportsMap = dynamic(() => import('../components/ReportsMap'), { ssr: false });

type Report = {
  id: number;
  title: string;
  description: string;
  category: string;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
  status: string;
  confirmCount: number;
};

type User = {
  name: string;
  role: string;
};

const categories = ['all', 'streetlight', 'garbage', 'road', 'water', 'other'];

const statusColor: Record<string, string> = {
  reported: '#9a9a9a',
  verified: '#16a34a',
  in_progress: '#2f6fa8',
  fixed: '#15803d',
};

const statusBg: Record<string, string> = {
  reported: '#f0efec',
  verified: '#e7fbec',
  in_progress: '#e2ecf5',
  fixed: '#dcf5e2',
};

const categoryIcon: Record<string, string> = {
  streetlight: '💡',
  garbage: '🗑️',
  road: '🛣️',
  water: '💧',
  other: '📍',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmMsg, setConfirmMsg] = useState<{ [key: number]: string }>({});
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const loadReports = () => {
    fetch('http://localhost:5000/api/reports')
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleConfirm = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setConfirmMsg((prev) => ({ ...prev, [id]: 'Please sign up or log in to confirm.' }));
      return;
    }

    const res = await fetch(`http://localhost:5000/api/reports/${id}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      setConfirmMsg((prev) => ({ ...prev, [id]: data.error }));
      return;
    }

    setConfirmMsg((prev) => ({ ...prev, [id]: `Confirmed!` }));
    loadReports();
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading reports...</p>;

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.category === filter);

  const total = reports.length;
  const fixedCount = reports.filter((r) => r.status === 'fixed').length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
  const openCount = reports.filter((r) => r.status === 'reported' || r.status === 'verified').length;

  const categoryCounts = categories
    .filter((c) => c !== 'all')
    .map((c) => ({ key: c, count: reports.filter((r) => r.category === c).length }))
    .sort((a, b) => b.count - a.count);

  const mostConfirmed = [...reports].sort((a, b) => b.confirmCount - a.confirmCount)[0];

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .filter-pill:hover { background: #f0fdf4; }
        .confirm-btn:hover { background: #e7fbec !important; }
        .signup-cta:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        .cat-stat-row:hover { background: #f7fdf8; }
      `}</style>

      <div style={{ padding: '48px 24px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              margin: '0 0 6px',
              background: 'linear-gradient(90deg, #16a34a, #15803d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            All reports
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 15, margin: 0 }}>
            Browse what's been reported across the city, and confirm issues you've seen too.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 8px' }}>
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#e7fbec',
              border: '1px solid #bdf0ca',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                Hello, {user.name}! 👋
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#3f6b4a' }}>
                Here's what's happening around the city. Confirming a report helps it get fixed faster.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              background: 'linear-gradient(90deg, #f0fdf4, #e7fbec)',
              border: '1px solid #bdf0ca',
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 24,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                👋 Browsing as a guest
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4b4b4b', maxWidth: 420 }}>
                Sign up to confirm reports you've seen too, and help push them toward getting fixed.
              </p>
            </div>
            <Link
              href="/signup"
              className="signup-cta"
              style={{
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: 'box-shadow 0.15s ease',
              }}
            >
              Sign up — it's free
            </Link>
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px 56px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 620px', minWidth: 320 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className="filter-pill"
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: filter === c ? 'none' : '1px solid #dcdad5',
                  background: filter === c ? '#22c55e' : '#fff',
                  color: filter === c ? '#ffffff' : '#3d3d3d',
                  textTransform: 'capitalize',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {categoryIcon[c] ? `${categoryIcon[c]} ` : ''}{c}
              </button>
            ))}
          </div>

          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #dcdad5' }}>
            <ReportsMap reports={filtered} />
          </div>

          <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
            {filtered.length === 0 && (
              <p style={{ color: '#9a9a9a' }}>No reports in this category yet.</p>
            )}
            {filtered.map((r) => (
              <div key={r.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
                {r.photoUrl && (
                  <img
                    src={r.photoUrl}
                    alt={r.title}
                    style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 12 }}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, color: '#2b2b2b', margin: 0, fontSize: 16 }}>{r.title}</p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: statusColor[r.status] || '#6e6e6e',
                      background: statusBg[r.status] || '#f0efec',
                      letterSpacing: 0.4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#3d3d3d', background: '#f0fdf4', padding: '4px 10px', borderRadius: 999, textTransform: 'capitalize' }}>
                    {categoryIcon[r.category] || '📍'} {r.category}
                  </span>
                  <span style={{ fontSize: 12, color: '#3d3d3d', background: '#f0fdf4', padding: '4px 10px', borderRadius: 999 }}>
                    👍 {r.confirmCount} {r.confirmCount === 1 ? 'confirmation' : 'confirmations'}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#3d3d3d', margin: '0 0 12px', lineHeight: 1.5 }}>{r.description}</p>

                <button
                  onClick={() => handleConfirm(r.id)}
                  className="confirm-btn"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    background: 'transparent',
                    color: '#16a34a',
                    border: '1px solid #16a34a',
                    borderRadius: 6,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  Confirm this issue
                </button>
                {confirmMsg[r.id] && (
                  <p style={{ fontSize: 12, color: '#6e6e6e', marginTop: 6 }}>{confirmMsg[r.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                City overview
              </p>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>{total}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Total reports</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#9a9a9a', margin: 0 }}>{openCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Open</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2f6fa8', margin: 0 }}>{inProgressCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>In progress</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#15803d', margin: 0 }}>{fixedCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Fixed</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 12px' }}>
              Reports by category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {categoryCounts.map(({ key, count }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div
                    key={key}
                    className="cat-stat-row"
                    onClick={() => setFilter(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 6px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: 14, width: 20 }}>{categoryIcon[key]}</span>
                    <span style={{ fontSize: 13, color: '#3d3d3d', textTransform: 'capitalize', flex: 1 }}>{key}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{count}</span>
                    <div style={{ width: 50, height: 6, background: '#f0fdf4', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#22c55e' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {mostConfirmed && mostConfirmed.confirmCount > 0 && (
            <div style={{ background: '#e7fbec', border: '1px solid #bdf0ca', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 0 8px' }}>
                Most confirmed issue
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 4px' }}>{mostConfirmed.title}</p>
              <p style={{ fontSize: 12, color: '#4b4b4b', margin: 0 }}>
                👍 {mostConfirmed.confirmCount} {mostConfirmed.confirmCount === 1 ? 'person has' : 'people have'} confirmed this
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}