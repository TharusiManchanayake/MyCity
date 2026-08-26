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
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem' }}>
      <h1>All reports</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid #ccc',
              background: filter === c ? '#222' : '#fff',
              color: filter === c ? '#fff' : '#222',
              textTransform: 'capitalize',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <ReportsMap reports={filtered} />

      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {filtered.length === 0 && <p>No reports in this category yet.</p>}
        {filtered.map((r) => (
          <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            {r.photoUrl && (
              <img src={r.photoUrl} alt={r.title} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
            )}
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{r.title}</p>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>
              {r.category} · {r.status} · {r.confirmCount} {r.confirmCount === 1 ? 'confirmation' : 'confirmations'}
            </p>
            <p style={{ fontSize: 13, margin: '0 0 8px' }}>{r.description}</p>
            <button onClick={() => handleConfirm(r.id)} style={{ fontSize: 13 }}>Confirm this issue</button>
            {confirmMsg[r.id] && <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{confirmMsg[r.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}