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
  const [search, setSearch] = useState('');

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

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );
  });

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .search-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .info-card:hover { border-color: #bdf0ca !important; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
      `}</style>

      <div style={{ padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              margin: '0 0 6px',
              background: 'linear-gradient(90deg, #16a34a, #15803d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Council info
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 15, margin: 0 }}>
            Office hours, contact details, and other useful information from your city council.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px 56px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Main column */}
        <div style={{ flex: '1 1 620px', minWidth: 320 }}>
          <input
            className="search-input"
            placeholder="Search council info..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              marginBottom: 20,
              padding: '12px 16px',
              border: '1px solid #dcdad5',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              background: '#fff',
            }}
          />

          {filtered.length === 0 && (
            <p style={{ color: '#9a9a9a' }}>
              {items.length === 0 ? 'No council info published yet.' : 'No results match your search.'}
            </p>
          )}

          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                className="info-card"
                style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, transition: 'all 0.15s ease' }}
              >
                {item.category && (
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#16a34a',
                      background: '#e7fbec',
                      letterSpacing: 0.4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      marginBottom: 10,
                    }}
                  >
                    {item.category}
                  </span>
                )}
                <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 6px', fontSize: 16 }}>{item.title}</p>
                <p style={{ fontSize: 14, color: '#3d3d3d', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                At a glance
              </p>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: 0 }}>{items.length}</p>
              <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>info items published</p>
            </div>
          </div>

          {categories.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 12px' }}>
                Browse by label
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((c) => (
                  <span
                    key={c}
                    onClick={() => setSearch(c)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#16a34a',
                      background: '#f0fdf4',
                      border: '1px solid #bdf0ca',
                      padding: '5px 12px',
                      borderRadius: 999,
                      cursor: 'pointer',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#e7fbec', border: '1px solid #bdf0ca', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>
              Can't find what you need?
            </p>
            <p style={{ fontSize: 12, color: '#3f6b4a', margin: 0, lineHeight: 1.5 }}>
              Check announcements for time-sensitive updates, or report an issue directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}