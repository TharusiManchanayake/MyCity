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
      router.push('/admin/login');
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

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '1rem' }}>
      <h1>Announcements</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }}>
          {categories.map((c) => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <label style={{ fontSize: 12 }}>Start date (optional)</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <label style={{ fontSize: 12 }}>End date (optional)</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button type="submit">Post announcement</button>
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        {announcements.map((a) => (
          <div key={a.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{a.title}</p>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px', textTransform: 'capitalize' }}>{a.category.replace('_', ' ')}</p>
            <p style={{ fontSize: 13, margin: '0 0 8px' }}>{a.message}</p>
            <button onClick={() => handleDelete(a.id)} style={{ fontSize: 12 }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}