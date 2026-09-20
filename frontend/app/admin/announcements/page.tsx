'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Announcement = {
  id: number;
  title: string;
  message: string;
  category: string;
  startDate: string | null;
  endDate: string | null;
};

const categories = ['general', 'power_cut', 'road_repair', 'water_cut', 'cleaning_campaign', 'health_camp'];

const categoryColor: Record<string, string> = {
  general: '#6e6e6e',
  power_cut: '#b45309',
  road_repair: '#2f6fa8',
  water_cut: '#0891b2',
  cleaning_campaign: '#16a34a',
  health_camp: '#a13d4c',
};

const categoryIcon: Record<string, string> = {
  general: '📋',
  power_cut: '⚡',
  road_repair: '🛣️',
  water_cut: '💧',
  cleaning_campaign: '🧹',
  health_camp: '🩺',
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAnnouncements = () => {
    fetch('http://localhost:5000/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/login');
      return;
    }
    loadAnnouncements();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, message, category, startDate: startDate || null, endDate: endDate || null }),
    });

    if (res.ok) {
      setTitle('');
      setMessage('');
      setCategory('general');
      setStartDate('');
      setEndDate('');
      loadAnnouncements();
    } else {
      alert('Failed to create announcement');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadAnnouncements();
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading...</p>;

  const inputStyle = {
    display: 'block',
    width: '100%',
    marginBottom: 12,
    padding: '10px 12px',
    border: '1px solid #dcdad5',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const activeNow = announcements.filter((a) => {
    if (!a.endDate) return true;
    return new Date(a.endDate) >= new Date();
  }).length;

  const categoryCounts = categories
    .map((key) => ({ key, count: announcements.filter((a) => a.category === key).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .admin-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .post-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        .delete-btn-ann:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #b91c1c !important; }
      `}</style>

      <div style={{ padding: '40px 24px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
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
            Announcements
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>
            Post updates for citizens — power cuts, road repairs, and more.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 24px 48px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Main column: form + list */}
        <div style={{ flex: '1 1 480px', minWidth: 320 }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: 28, background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Title</label>
            <input
              className="admin-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Message</label>
            <textarea
              className="admin-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{ ...inputStyle, minHeight: 70 }}
            />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Category</label>
            <select
              className="admin-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{categoryIcon[c]} {c.replace('_', ' ')}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#6e6e6e' }}>Start date (optional)</label>
                <input
                  className="admin-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#6e6e6e' }}>End date (optional)</label>
                <input
                  className="admin-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              className="post-btn"
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                marginTop: 4,
                transition: 'box-shadow 0.15s ease',
              }}
            >
              Post announcement
            </button>
          </form>

          <div style={{ display: 'grid', gap: 12 }}>
            {announcements.length === 0 && <p style={{ color: '#9a9a9a', fontSize: 14 }}>No announcements posted yet.</p>}
            {announcements.map((a) => (
              <div key={a.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: categoryColor[a.category] || '#6e6e6e',
                    letterSpacing: 0.4,
                  }}
                >
                  {categoryIcon[a.category] || '📋'} {a.category.replace('_', ' ')}
                </span>
                <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '8px 0 6px', fontSize: 16 }}>{a.title}</p>
                {a.startDate && (
                  <p style={{ fontSize: 12, color: '#9a9a9a', margin: '0 0 8px' }}>
                    {a.startDate}{a.endDate ? ` to ${a.endDate}` : ''}
                  </p>
                )}
                <p style={{ fontSize: 14, color: '#3d3d3d', margin: '0 0 12px', lineHeight: 1.5 }}>{a.message}</p>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="delete-btn-ann"
                  style={{
                    fontSize: 12,
                    background: 'transparent',
                    border: '1px solid #dcdad5',
                    color: '#6e6e6e',
                    borderRadius: 6,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                At a glance
              </p>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>{announcements.length}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Total posted</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2f6fa8', margin: 0 }}>{activeNow}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Active now</p>
              </div>
            </div>
          </div>

          {categoryCounts.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 12px' }}>
                By category
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categoryCounts.map(({ key, count }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, width: 20 }}>{categoryIcon[key]}</span>
                    <span style={{ fontSize: 13, color: '#3d3d3d', flex: 1, textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 10px' }}>
              Tips
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#6e6e6e', fontSize: 13, lineHeight: 1.8 }}>
              <li>Set an end date so time-sensitive posts fade out automatically</li>
              <li>Keep the message short — citizens scan these quickly</li>
              <li>Use "General" only when no other category fits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}