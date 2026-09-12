'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type Stats = {
  total: number;
  fixed: number;
  resolutionRate: number;
  byStatus: { status: string; count: string }[];
  byCategory: { category: string; count: string }[];
};

const COLORS = ['#9a9a9a', '#d4a017', '#2f6fa8', '#5c7a5c'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading || !stats) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading analytics...</p>;

  const statusData = stats.byStatus.map((s) => ({ name: s.status.replace('_', ' '), value: Number(s.count) }));
  const categoryData = stats.byCategory.map((c) => ({ name: c.category, count: Number(c.count) }));

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ color: '#2b2b2b', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Analytics</h1>
        <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 28px' }}>An overview of report activity across the city.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#d4a017', margin: '0 0 4px' }}>{stats.total}</p>
            <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>Total reports</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#d4a017', margin: '0 0 4px' }}>{stats.fixed}</p>
            <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>Fixed</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#d4a017', margin: '0 0 4px' }}>{stats.resolutionRate}%</p>
            <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>Resolution rate</p>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: '#2b2b2b', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Reports by status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20 }}>
          <h3 style={{ color: '#2b2b2b', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Reports by category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#6e6e6e" fontSize={13} />
              <YAxis allowDecimals={false} stroke="#6e6e6e" fontSize={13} />
              <Tooltip />
              <Bar dataKey="count" fill="#d4a017" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}