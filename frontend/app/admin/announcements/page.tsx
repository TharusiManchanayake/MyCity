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
  general: '#9a9a9a',
  power_cut: '#d4a017',
  road_repair: '#2f6fa8',
  water_cut: '#2f6fa8',
  cleaning_campaign: '#5c7a5c',
  health_camp: '#a13d4c',
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
        setAnnouncements(data);
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

  const inputStyle = { display: 'block', width: '100%', marginBottom: 12, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ color: '#2b2b2b', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Announcements</h1>
        <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>Post updates for citizens — power cuts, road repairs, and more.</p>

        <form onSubmit={handleSubmit} style={{ marginBottom: 28, background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required style={{ ...inputStyle, minHeight: 70 }} />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {categories.map((c) => (
              <option key={c} value={c}>{c.replace('_', ' ')}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#6e6e6e' }}>Start date (optional)</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#6e6e6e' }}>End date (optional)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <button
            type="submit"
            style={{ width: '100%', background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}
          >
            Post announcement
          </button>
        </form>

        <div style={{ display: 'grid', gap: 12 }}>
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
                {a.category.replace('_', ' ')}
              </span>
              <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '8px 0 6px', fontSize: 16 }}>{a.title}</p>
              <p style={{ fontSize: 14, color: '#3d3d3d', margin: '0 0 12px', lineHeight: 1.5 }}>{a.message}</p>
              <button
                onClick={() => handleDelete(a.id)}
                style={{ fontSize: 12, background: 'transparent', border: '1px solid #dcdad5', color: '#6e6e6e', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}