'use client';

import { useEffect, useState } from 'react';

type InfoItem = {
  id: number;
  title: string;
  details: string;
  category: string | null;
};

export default function CouncilInfoPage() {
  const [items, setItems] = useState<InfoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/info-items')
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading...</p>;

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ color: '#2b2b2b', fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>Council info</h1>
        <p style={{ color: '#6e6e6e', fontSize: 15, marginBottom: 28 }}>
          Office hours, contact details, and other useful information from your city council.
        </p>

        {items.length === 0 && <p style={{ fontSize: 14, color: '#9a9a9a' }}>No information published yet.</p>}

        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20 }}>
              {item.category && (
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#d4a017',
                    background: '#fbf1d9',
                    letterSpacing: 0.4,
                    padding: '4px 10px',
                    borderRadius: 999,
                    marginBottom: 10,
                  }}
                >
                  {item.category}
                </span>
              )}
              <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 8px', fontSize: 17 }}>{item.title}</p>
              <p style={{ fontSize: 14, color: '#3d3d3d', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}