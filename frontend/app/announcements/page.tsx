'use client';

import { useEffect, useState } from 'react';

type Announcement = {
  id: number;
  title: string;
  message: string;
  category: string;
  startDate: string | null;
  endDate: string | null;
};

const categoryLabels: { [key: string]: string } = {
  general: 'General',
  power_cut: 'Power Cut',
  road_repair: 'Road Repair',
  water_cut: 'Water Cut',
  cleaning_campaign: 'Cleaning Campaign',
  health_camp: 'Health Camp',
};

const categoryColor: Record<string, string> = {
  general: '#6e6e6e',
  power_cut: '#b45309',
  road_repair: '#2f6fa8',
  water_cut: '#0891b2',
  cleaning_campaign: '#16a34a',
  health_camp: '#a13d4c',
};

const categoryBg: Record<string, string> = {
  general: '#f0efec',
  power_cut: '#fef3c7',
  road_repair: '#e2ecf5',
  water_cut: '#e0f7fa',
  cleaning_campaign: '#e7fbec',
  health_camp: '#f6e4e7',
};

const categoryIcon: Record<string, string> = {
  general: '📋',
  power_cut: '⚡',
  road_repair: '🛣️',
  water_cut: '💧',
  cleaning_campaign: '🧹',
  health_camp: '🩺',
};

const filterOptions = ['all', ...Object.keys(categoryLabels)];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('http://localhost:5000/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading announcements...</p>;

  const filtered = filter === 'all' ? announcements : announcements.filter((a) => a.category === filter);

  const categoryCounts = Object.keys(categoryLabels)
    .map((key) => ({ key, count: announcements.filter((a) => a.category === key).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const activeNow = announcements.filter((a) => {
    if (!a.endDate) return true;
    return new Date(a.endDate) >= new Date();
  }).length;

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .filter-pill:hover { background: #f0fdf4; }
        .cat-stat-row:hover { background: #f7fdf8; }
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
            Announcements
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 15, margin: 0 }}>
            Updates from your city council — power cuts, road repairs, campaigns, and health camps.
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
        <div style={{ flex: '1 1 620px', minWidth: 320 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {filterOptions.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className="filter-pill"
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: filter === c ? 'none' : '1px solid #dcdad5',
                  background: filter === c ? '#22c55e' : '#fff',
                  color: filter === c ? '#ffffff' : '#3d3d3d',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {c === 'all' ? 'All' : `${categoryIcon[c]} ${categoryLabels[c]}`}
              </button>
            ))}
          </div>

          {filtered.length === 0 && <p style={{ color: '#9a9a9a' }}>No announcements right now.</p>}

          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map((a) => (
              <div key={a.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, color: '#2b2b2b', margin: 0, fontSize: 16 }}>{a.title}</p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: categoryColor[a.category] || '#6e6e6e',
                      background: categoryBg[a.category] || '#f0efec',
                      letterSpacing: 0.4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {categoryIcon[a.category] || '📋'} {categoryLabels[a.category] || a.category}
                  </span>
                </div>

                {a.startDate && (
                  <p style={{ fontSize: 12, color: '#9a9a9a', margin: '0 0 10px' }}>
                    {a.startDate}{a.endDate ? ` to ${a.endDate}` : ''}
                  </p>
                )}

                <p style={{ fontSize: 14, color: '#3d3d3d', margin: 0, lineHeight: 1.6 }}>{a.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categoryCounts.map(({ key, count }) => {
                  const pct = announcements.length > 0 ? Math.round((count / announcements.length) * 100) : 0;
                  return (
                    <div
                      key={key}
                      className="cat-stat-row"
                      onClick={() => setFilter(key)}
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
                      <span style={{ fontSize: 13, color: '#3d3d3d', flex: 1 }}>{categoryLabels[key]}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{count}</span>
                      <div style={{ width: 50, height: 6, background: '#f0fdf4', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#22c55e' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ background: '#e7fbec', border: '1px solid #bdf0ca', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>
              Missed something reported?
            </p>
            <p style={{ fontSize: 12, color: '#3f6b4a', margin: 0, lineHeight: 1.5 }}>
              Check the reports page to see live issues from residents, or file one yourself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}