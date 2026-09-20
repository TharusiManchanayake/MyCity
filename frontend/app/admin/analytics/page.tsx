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

const STATUS_COLORS: Record<string, string> = {
  reported: '#9a9a9a',
  verified: '#16a34a',
  'in progress': '#2f6fa8',
  in_progress: '#2f6fa8',
  fixed: '#15803d',
};

const FALLBACK_COLORS = ['#9a9a9a', '#22c55e', '#2f6fa8', '#15803d', '#0891b2'];

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

  const topCategory = [...categoryData].sort((a, b) => b.count - a.count)[0];
  const openCount = stats.total - stats.fixed;

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ padding: '40px 24px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
            Analytics
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>An overview of report activity across the city.</p>
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
        <div style={{ flex: '1 1 700px', minWidth: 320 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#16a34a', margin: '0 0 4px' }}>{stats.total}</p>
              <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>Total reports</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#16a34a', margin: '0 0 4px' }}>{stats.fixed}</p>
              <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>Fixed</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#16a34a', margin: '0 0 4px' }}>{stats.resolutionRate}%</p>
              <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>Resolution rate</p>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <h3 style={{ color: '#2b2b2b', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Reports by status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={STATUS_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
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
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Quick read
              </p>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2f6fa8', margin: 0 }}>{openCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Still open</p>
              </div>
              {topCategory && (
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: '#15803d', margin: 0, textTransform: 'capitalize' }}>
                    {topCategory.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Most reported category ({topCategory.count})</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#e7fbec', border: '1px solid #bdf0ca', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>
              About these numbers
            </p>
            <p style={{ fontSize: 12, color: '#3f6b4a', margin: 0, lineHeight: 1.5 }}>
              Resolution rate reflects reports marked "fixed" out of all reports ever filed. Figures update live as the queue changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}