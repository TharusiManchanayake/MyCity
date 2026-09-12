'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Report = {
  id: number;
  title: string;
  category: string;
  status: string;
  description: string;
  confirmCount?: number;
};

type Technician = {
  id: number;
  name: string;
  email: string;
};

const statusColor: Record<string, string> = {
  reported: '#9a9a9a',
  verified: '#d4a017',
  in_progress: '#2f6fa8',
  fixed: '#5c7a5c',
};

const statuses = ['all', 'reported', 'verified', 'in_progress', 'fixed'];
const categories = ['all', 'streetlight', 'garbage', 'road', 'water'];

const categoryIcon: Record<string, string> = {
  streetlight: '💡',
  garbage: '🗑️',
  road: '🛣️',
  water: '💧',
};

export default function AdminQueuePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignMsg, setAssignMsg] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('token');

    Promise.all([
      fetch('http://localhost:5000/api/reports').then((res) => res.json()),
      fetch('http://localhost:5000/api/auth/technicians', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ]).then(([reportsData, techData]) => {
      setReports(reportsData);
      setTechnicians(techData);
      setLoading(false);
    });
  }, [router]);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`http://localhost:5000/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } else {
      const data = await res.json();
      alert(`Update failed: ${data.error}`);
    }
  };

  const updateCategory = async (id: number, category: string) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`http://localhost:5000/api/reports/${id}/category`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category }),
    });

    if (res.ok) {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, category } : r)));
    } else {
      alert('Failed to update category');
    }
  };

  const assignTechnician = async (reportId: number, assignedToId: number) => {
    if (!assignedToId) return;
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/workorders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reportId, assignedToId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAssignMsg((prev) => ({ ...prev, [reportId]: data.error }));
      return;
    }

    setAssignMsg((prev) => ({ ...prev, [reportId]: 'Assigned! Moved to in progress.' }));
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'in_progress' } : r)));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading queue...</p>;

  const filtered = reports.filter((r) => {
    const statusMatch = filter === 'all' || r.status === filter;
    const categoryMatch = categoryFilter === 'all' || r.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const selectStyle = { border: '1px solid #dcdad5', borderRadius: 6, padding: '6px 10px', fontSize: 13, color: '#2b2b2b', background: '#fff' };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: '#2b2b2b', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Reports queue</h1>
            <p style={{ color: '#6e6e6e', fontSize: 14, margin: 0 }}>
              {filtered.length} of {reports.length} reports · moderate, verify, and assign
            </p>
          </div>
          <button
            onClick={logout}
            style={{ fontSize: 13, background: 'transparent', color: '#2b2b2b', border: '1px solid #dcdad5', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}
          >
            Log out
          </button>
        </div>

        <p style={{ fontSize: 12, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>Status</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: filter === s ? 'none' : '1px solid #dcdad5',
                background: filter === s ? '#d4a017' : '#fff',
                color: filter === s ? '#2b2b2b' : '#3d3d3d',
                textTransform: 'capitalize',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>Category</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: categoryFilter === c ? 'none' : '1px solid #dcdad5',
                background: categoryFilter === c ? '#2b2b2b' : '#fff',
                color: categoryFilter === c ? '#fff' : '#3d3d3d',
                textTransform: 'capitalize',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c !== 'all' && categoryIcon[c]} {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.length === 0 && <p style={{ color: '#9a9a9a', fontSize: 14 }}>No reports match these filters.</p>}
          {filtered.map((r) => (
            <div key={r.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{categoryIcon[r.category] || '📍'}</span>
                  <div>
                    <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 4px', fontSize: 16 }}>{r.title}</p>
                    {r.confirmCount !== undefined && (
                      <p style={{ fontSize: 12, color: '#9a9a9a', margin: 0 }}>
                        {r.confirmCount} {r.confirmCount === 1 ? 'confirmation' : 'confirmations'}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: statusColor[r.status] || '#6e6e6e',
                    letterSpacing: 0.4,
                    whiteSpace: 'nowrap',
                    background: '#f5f4f1',
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  {r.status.replace('_', ' ')}
                </span>
              </div>

              <p style={{ fontSize: 14, color: '#3d3d3d', margin: '0 0 14px' }}>{r.description}</p>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 3 }}>Status</label>
                  <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} style={selectStyle}>
                    <option value="reported">Reported</option>
                    <option value="verified">Verified</option>
                    <option value="in_progress">In progress</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 3 }}>Category</label>
                  <select value={r.category} onChange={(e) => updateCategory(r.id, e.target.value)} style={selectStyle}>
                    <option value="streetlight">Streetlight</option>
                    <option value="garbage">Garbage</option>
                    <option value="road">Road</option>
                    <option value="water">Water leak</option>
                  </select>
                </div>

                {r.status === 'verified' && (
                  <div>
                    <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 3 }}>Assign to</label>
                    <select
                      defaultValue=""
                      onChange={(e) => assignTechnician(r.id, Number(e.target.value))}
                      style={selectStyle}
                    >
                      <option value="" disabled>Choose technician...</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {assignMsg[r.id] && <p style={{ fontSize: 12, color: '#5c7a5c', marginTop: 10 }}>{assignMsg[r.id]}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}