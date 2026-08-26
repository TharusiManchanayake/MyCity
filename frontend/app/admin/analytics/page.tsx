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

const COLORS = ['#4b5563', '#f59e0b', '#3b82f6', '#22c55e'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/admin/login');
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

  if (loading || !stats) return <p style={{ padding: '2rem' }}>Loading analytics...</p>;

  const statusData = stats.byStatus.map((s) => ({ name: s.status, value: Number(s.count) }));
  const categoryData = stats.byCategory.map((c) => ({ name: c.category, count: Number(c.count) }));

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem' }}>
      <h1>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{stats.total}</p>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Total reports</p>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{stats.fixed}</p>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Fixed</p>
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{stats.resolutionRate}%</p>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Resolution rate</p>
        </div>
      </div>

      <h3>Reports by status</h3>
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

      <h3>Reports by category</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={categoryData}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}