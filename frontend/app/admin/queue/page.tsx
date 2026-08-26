'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Report = {
  id: number;
  title: string;
  category: string;
  status: string;
  description: string;
};

type Technician = {
  id: number;
  name: string;
  email: string;
};

export default function AdminQueuePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignMsg, setAssignMsg] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    const token = localStorage.getItem('token');

    Promise.all([
      fetch('http://localhost:5000/api/reports').then((res) => res.json()),
      fetch('http://localhost:5000/api/auth/technicians', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ]).then(([reportsData, techData]) => {
      setReports(reportsData);
      setTechnicians(techData);
      setLoading(false);
    });
  }, [router]);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`http://localhost:5000/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } else {
      const data = await res.json();
      alert(`Update failed: ${data.error}`);
    }
  };

  const assignTechnician = async (reportId: number, assignedToId: number) => {
    if (!assignedToId) return;
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/workorders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reportId, assignedToId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAssignMsg((prev) => ({ ...prev, [reportId]: data.error }));
      return;
    }

    setAssignMsg((prev) => ({ ...prev, [reportId]: 'Assigned! Moved to in progress.' }));
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'in_progress' } : r)));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading queue...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reports queue</h1>
        <button onClick={logout}>Log out</button>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {reports.map((r) => (
          <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{r.title}</p>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{r.category} · currently {r.status}</p>

            <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} style={{ marginRight: 12 }}>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="in_progress">In progress</option>
              <option value="fixed">Fixed</option>
            </select>

            {r.status === 'verified' && (
              <select
                defaultValue=""
                onChange={(e) => assignTechnician(r.id, Number(e.target.value))}
              >
                <option value="" disabled>Assign to technician...</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            {assignMsg[r.id] && <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{assignMsg[r.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}