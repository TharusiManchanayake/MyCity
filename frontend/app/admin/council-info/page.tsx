'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type InfoItem = {
  id: number;
  title: string;
  details: string;
  category: string | null;
};

export default function AdminCouncilInfoPage() {
  const [items, setItems] = useState<InfoItem[]>([]);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadItems = () => {
    fetch('http://localhost:5000/api/info-items')
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/login');
      return;
    }
    loadItems();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/info-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, details, category: category || null }),
    });

    if (res.ok) {
      setTitle('');
      setDetails('');
      setCategory('');
      loadItems();
    } else {
      alert('Failed to add info item');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/info-items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadItems();
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading...</p>;

  const inputStyle = { display: 'block', width: '100%', marginBottom: 12, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ color: '#2b2b2b', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Council info</h1>
        <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>
          Publish any reference information for citizens — office hours, staff working hours, contact details, or anything else.
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: 28, background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Title</label>
          <input
            placeholder="e.g. Town Council Opening Hours"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={inputStyle}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Details</label>
          <textarea
            placeholder="e.g. Monday to Friday, 9:00 AM - 4:00 PM"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            style={{ ...inputStyle, minHeight: 80 }}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Label (optional)</label>
          <input
            placeholder="e.g. Office Hours, Contact, Staff"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{ width: '100%', background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Add info item
          </button>
        </form>

        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
              {item.category && (
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#d4a017', letterSpacing: 0.4 }}>
                  {item.category}
                </span>
              )}
              <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '6px 0 6px', fontSize: 16 }}>{item.title}</p>
              <p style={{ fontSize: 14, color: '#3d3d3d', margin: '0 0 12px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{item.details}</p>
              <button
                onClick={() => handleDelete(item.id)}
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