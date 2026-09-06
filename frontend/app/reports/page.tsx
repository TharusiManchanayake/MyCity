'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

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

const categories = ['all', 'streetlight', 'garbage', 'road', 'water'];

const statusColor: Record<string, string> = {
  reported: '#8a8a70',
  verified: '#b8862e',
  in_progress: '#2f6fa8',
  fixed: '#2f7d3a',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmMsg, setConfirmMsg] = useState<{ [key: number]: string }>({});

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

  if (loading) return <p style={{ padding: '2rem' }}>Loading reports...</p>;

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.category === filter);

  return (
    <div style={{ background: '#fdfcf8', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .filter-pill:hover { background: #eef3ea; }
      `}</style>

      {/* Header banner */}
      <div
        style={{
          position: 'relative',
          backgroundImage: 'url(/hero-city.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(120deg, rgba(253,252,248,0.92), rgba(253,252,248,0.55))',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ color: '#1f5c2c', fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>All reports</h1>
          <p style={{ color: '#3d4a3d', fontSize: 15, margin: 0 }}>
            Browse what's been reported across the city, and confirm issues you've seen too.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="filter-pill"
              style={{
                padding: '7px 16px',
                borderRadius: 999,
                border: filter === c ? 'none' : '1px solid #d7ddd2',
                background: filter === c ? '#2f7d3a' : '#fff',
                color: filter === c ? '#fff' : '#3d4a3d',
                textTransform: 'capitalize',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e6e2d6' }}>
          <ReportsMap reports={filtered} />
        </div>

        <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
          {filtered.length === 0 && <p style={{ color: '#5b6b5b' }}>No reports in this category yet.</p>}
          {filtered.map((r) => (
            <div key={r.id} style={{ background: '#fff', border: '1px solid #e6e2d6', borderRadius: 10, padding: 14 }}>
              {r.photoUrl && (
                <img src={r.photoUrl} alt={r.title} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }} />
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: statusColor[r.status] || '#5b6b5b',
                  letterSpacing: 0.4,
                }}
              >
                {r.status.replace('_', ' ')}
              </span>
              <p style={{ fontWeight: 700, color: '#16231e', margin: '6px 0 4px' }}>{r.title}</p>
              <p style={{ fontSize: 13, color: '#5b6b5b', margin: '0 0 8px', textTransform: 'capitalize' }}>
                {r.category} · {r.confirmCount} {r.confirmCount === 1 ? 'confirmation' : 'confirmations'}
              </p>
              <p style={{ fontSize: 13, color: '#3d4a3d', margin: '0 0 10px' }}>{r.description}</p>
              <button
                onClick={() => handleConfirm(r.id)}
                style={{ fontSize: 13, fontWeight: 600, background: 'transparent', color: '#2f7d3a', border: '1px solid #2f7d3a', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
              >
                Confirm this issue
              </button>
              {confirmMsg[r.id] && <p style={{ fontSize: 12, color: '#5b6b5b', marginTop: 6 }}>{confirmMsg[r.id]}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}