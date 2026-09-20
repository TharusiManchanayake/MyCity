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

const statuses = ['all', 'reported', 'verified', 'in_progress', 'fixed'];
const categories = ['all', 'streetlight', 'garbage', 'road', 'water', 'other'];

const categoryIcon: Record<string, string> = {
  streetlight: '💡',
  garbage: '🗑️',
  road: '🛣️',
  water: '💧',
  other: '📍',
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

  const selectStyle = {
    border: '1px solid #dcdad5',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    color: '#2b2b2b',
    background: '#fff',
    outline: 'none',
  };

  const total = reports.length;
  const reportedCount = reports.filter((r) => r.status === 'reported').length;
  const verifiedCount = reports.filter((r) => r.status === 'verified').length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
  const fixedCount = reports.filter((r) => r.status === 'fixed').length;

  const categoryCounts = categories
    .filter((c) => c !== 'all')
    .map((c) => ({ key: c, count: reports.filter((r) => r.category === c).length }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .status-pill:hover { background: #f0fdf4; }
        .cat-pill-admin:hover { background: #f0fdf4; }
        .logout-btn:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #b91c1c !important; }
        .select-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .cat-stat-row-admin:hover { background: #f7fdf8; }
      `}</style>

      <div style={{ padding: '40px 24px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                margin: '0 0 4px',
                background: 'linear-gradient(90deg, #16a34a, #15803d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Reports queue
            </h1>
            <p style={{ color: '#6e6e6e', fontSize: 14, margin: 0 }}>
              {filtered.length} of {reports.length} reports · moderate, verify, and assign
            </p>
          </div>
          <button
            onClick={logout}
            className="logout-btn"
            style={{
              fontSize: 13,
              background: 'transparent',
              color: '#2b2b2b',
              border: '1px solid #dcdad5',
              borderRadius: 6,
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '24px 24px 56px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Main column */}
        <div style={{ flex: '1 1 620px', minWidth: 320 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 8px' }}>Status</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="status-pill"
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: filter === s ? 'none' : '1px solid #dcdad5',
                  background: filter === s ? '#22c55e' : '#fff',
                  color: filter === s ? '#ffffff' : '#3d3d3d',
                  textTransform: 'capitalize',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
                className="cat-pill-admin"
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: categoryFilter === c ? 'none' : '1px solid #dcdad5',
                  background: categoryFilter === c ? '#16a34a' : '#fff',
                  color: categoryFilter === c ? '#fff' : '#3d3d3d',
                  textTransform: 'capitalize',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
                      background: statusBg[r.status] || '#f5f4f1',
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
                    <select
                      className="select-input"
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      style={selectStyle}
                    >
                      <option value="reported">Reported</option>
                      <option value="verified">Verified</option>
                      <option value="in_progress">In progress</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 3 }}>Category</label>
                    <select
                      className="select-input"
                      value={r.category}
                      onChange={(e) => updateCategory(r.id, e.target.value)}
                      style={selectStyle}
                    >
                      <option value="streetlight">Streetlight</option>
                      <option value="garbage">Garbage</option>
                      <option value="road">Road</option>
                      <option value="water">Water leak</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {r.status === 'verified' && (
                    <div>
                      <label style={{ fontSize: 11, color: '#9a9a9a', display: 'block', marginBottom: 3 }}>Assign to</label>
                      <select
                        className="select-input"
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

                {assignMsg[r.id] && (
                  <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 10 }}>{assignMsg[r.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Queue overview
              </p>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>{total}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Total</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#9a9a9a', margin: 0 }}>{reportedCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Reported</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>{verifiedCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Verified</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2f6fa8', margin: 0 }}>{inProgressCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>In progress</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#15803d', margin: 0 }}>{fixedCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Fixed</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2b2b2b', margin: 0 }}>{technicians.length}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Technicians</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 12px' }}>
              By category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {categoryCounts.map(({ key, count }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div
                    key={key}
                    className="cat-stat-row-admin"
                    onClick={() => setCategoryFilter(key)}
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

          {reportedCount > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>
                ⏳ Needs attention
              </p>
              <p style={{ fontSize: 12, color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                {reportedCount} {reportedCount === 1 ? 'report is' : 'reports are'} still unverified.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}