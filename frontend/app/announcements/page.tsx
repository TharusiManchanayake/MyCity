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
  general: '#5b6b5b',
  power_cut: '#b8862e',
  road_repair: '#2f6fa8',
  water_cut: '#2f6fa8',
  cleaning_campaign: '#2f7d3a',
  health_camp: '#a13d4c',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Loading announcements...</p>;

  return (
    <div style={{ background: '#fdfcf8', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header banner */}
      <div
        style={{
          position: 'relative',
          backgroundImage: 'url(/hero-city.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(120deg, rgba(253,252,248,0.92), rgba(253,252,248,0.55))',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ color: '#1f5c2c', fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>Announcements</h1>
          <p style={{ color: '#3d4a3d', fontSize: 15, margin: 0 }}>
            Updates from your city council — power cuts, road repairs, campaigns, and health camps.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        {announcements.length === 0 && <p style={{ color: '#5b6b5b' }}>No announcements right now.</p>}

        <div style={{ display: 'grid', gap: 12 }}>
          {announcements.map((a) => (
            <div key={a.id} style={{ background: '#fff', border: '1px solid #e6e2d6', borderRadius: 10, padding: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: categoryColor[a.category] || '#5b6b5b',
                  letterSpacing: 0.4,
                }}
              >
                {categoryLabels[a.category] || a.category}
                {a.startDate && ` · ${a.startDate}${a.endDate ? ` to ${a.endDate}` : ''}`}
              </span>
              <p style={{ fontWeight: 700, color: '#16231e', margin: '8px 0 6px', fontSize: 16 }}>{a.title}</p>
              <p style={{ fontSize: 14, color: '#3d4a3d', margin: 0, lineHeight: 1.5 }}>{a.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}