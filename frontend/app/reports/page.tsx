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
  reported: '#9a9a9a',
  verified: '#d4a017',
  in_progress: '#2f6fa8',
  fixed: '#5c7a5c',
};

const statusBg: Record<string, string> = {
  reported: '#f0efec',
  verified: '#fbf1d9',
  in_progress: '#e2ecf5',
  fixed: '#e6efe6',
};

const categoryIcon: Record<string, string> = {
  streetlight: '💡',
  garbage: '🗑️',
  road: '🛣️',
  water: '💧',
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

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading reports...</p>;

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.category === filter);

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .filter-pill:hover { background: #f0efec; }
      `}</style>

      <div style={{ padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ color: '#2b2b2b', fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>All reports</h1>
          <p style={{ color: '#6e6e6e', fontSize: 15, margin: 0 }}>
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
                border: filter === c ? 'none' : '1px solid #dcdad5',
                background: filter === c ? '#d4a017' : '#fff',
                color: filter === c ? '#2b2b2b' : '#3d3d3d',
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

        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #dcdad5' }}>
          <ReportsMap reports={filtered} />
        </div>

        <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
          {filtered.length === 0 && <p style={{ color: '#9a9a9a' }}>No reports in this category yet.</p>}
          {filtered.map((r) => (
            <div key={r.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
              {r.photoUrl && (
                <img src={r.photoUrl} alt={r.title} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 12 }} />
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
                <span style={{ fontSize: 12, color: '#3d3d3d', background: '#f0efec', padding: '4px 10px', borderRadius: 999, textTransform: 'capitalize' }}>
                  {categoryIcon[r.category] || '📍'} {r.category}
                </span>
                <span style={{ fontSize: 12, color: '#3d3d3d', background: '#f0efec', padding: '4px 10px', borderRadius: 999 }}>
                  👍 {r.confirmCount} {r.confirmCount === 1 ? 'confirmation' : 'confirmations'}
                </span>
              </div>

              <p style={{ fontSize: 13, color: '#3d3d3d', margin: '0 0 12px', lineHeight: 1.5 }}>{r.description}</p>

              <button
                onClick={() => handleConfirm(r.id)}
                style={{ fontSize: 13, fontWeight: 600, background: 'transparent', color: '#d4a017', border: '1px solid #d4a017', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
              >
                Confirm this issue
              </button>
              {confirmMsg[r.id] && <p style={{ fontSize: 12, color: '#6e6e6e', marginTop: 6 }}>{confirmMsg[r.id]}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}