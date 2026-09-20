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

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .admin-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .add-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        .delete-btn:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #b91c1c !important; }
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
            Council info
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>
            Publish any reference information for citizens — office hours, staff working hours, contact details, or anything else.
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
              placeholder="e.g. Town Council Opening Hours"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Details</label>
            <textarea
              className="admin-input"
              placeholder="e.g. Monday to Friday, 9:00 AM - 4:00 PM"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              style={{ ...inputStyle, minHeight: 80 }}
            />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Label (optional)</label>
            <input
              className="admin-input"
              placeholder="e.g. Office Hours, Contact, Staff"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            />

            <button
              type="submit"
              className="add-btn"
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
                transition: 'box-shadow 0.15s ease',
              }}
            >
              Add info item
            </button>
          </form>

          <div style={{ display: 'grid', gap: 12 }}>
            {items.length === 0 && <p style={{ color: '#9a9a9a', fontSize: 14 }}>No info items published yet.</p>}
            {items.map((item) => (
              <div key={item.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
                {item.category && (
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', letterSpacing: 0.4 }}>
                    {item.category}
                  </span>
                )}
                <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '6px 0 6px', fontSize: 16 }}>{item.title}</p>
                <p style={{ fontSize: 14, color: '#3d3d3d', margin: '0 0 12px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{item.details}</p>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="delete-btn"
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
                Published items
              </p>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: 0 }}>{items.length}</p>
              <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>currently visible to citizens</p>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 10px' }}>
              Tips
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#6e6e6e', fontSize: 13, lineHeight: 1.8 }}>
              <li>Use a clear label (e.g. "Office Hours") so citizens can scan quickly</li>
              <li>Keep details concise — this appears directly on the public page</li>
              <li>Remove outdated items instead of leaving stale info up</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}