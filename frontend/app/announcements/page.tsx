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
  general: '#9a9a9a',
  power_cut: '#d4a017',
  road_repair: '#2f6fa8',
  water_cut: '#2f6fa8',
  cleaning_campaign: '#5c7a5c',
  health_camp: '#a13d4c',
};

const categoryBg: Record<string, string> = {
  general: '#f0efec',
  power_cut: '#fbf1d9',
  road_repair: '#e2ecf5',
  water_cut: '#e2ecf5',
  cleaning_campaign: '#e6efe6',
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

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading announcements...</p>;

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ color: '#2b2b2b', fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>Announcements</h1>
          <p style={{ color: '#6e6e6e', fontSize: 15, margin: 0 }}>
            Updates from your city council — power cuts, road repairs, campaigns, and health camps.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        {announcements.length === 0 && <p style={{ color: '#9a9a9a' }}>No announcements right now.</p>}

        <div style={{ display: 'grid', gap: 12 }}>
          {announcements.map((a) => (
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
    </div>
  );
}