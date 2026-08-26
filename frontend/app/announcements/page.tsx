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
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>Announcements</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        Updates from your city council — power cuts, road repairs, campaigns, and health camps.
      </p>

      {announcements.length === 0 && <p>No announcements right now.</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {announcements.map((a) => (
          <div key={a.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px' }}>
              {categoryLabels[a.category] || a.category}
              {a.startDate && ` · ${a.startDate}${a.endDate ? ` to ${a.endDate}` : ''}`}
            </p>
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>{a.title}</p>
            <p style={{ fontSize: 14, margin: 0 }}>{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}