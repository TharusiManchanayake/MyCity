'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type WorkOrder = {
  workOrderId: number;
  dueDate: string | null;
  notes: string | null;
  report: {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    photoUrl: string | null;
  };
};

export default function TechnicianPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'technician') {
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/workorders/mine', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setWorkOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const markFixed = async (reportId: number, workOrderId: number) => {
    const costInput = window.prompt('Enter the cost for this repair (LKR):');
    if (costInput === null) return;

    const cost = parseFloat(costInput);
    if (isNaN(cost) || cost < 0) {
      alert('Please enter a valid cost.');
      return;
    }

    const token = localStorage.getItem('token');

    const statusRes = await fetch(`http://localhost:5000/api/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'fixed' }),
    });

    const costRes = await fetch(`http://localhost:5000/api/workorders/${workOrderId}/cost`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cost }),
    });

    if (statusRes.ok && costRes.ok) {
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.report.id === reportId ? { ...wo, report: { ...wo.report, status: 'fixed' } } : wo
        )
      );
    } else {
      alert('Failed to update. You may not have permission — check with your admin.');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading your assignments...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem' }}>
      <h1>My assigned work</h1>

      {workOrders.length === 0 && <p>No work assigned to you yet.</p>}

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {workOrders.map((wo) => (
          <div key={wo.workOrderId} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            {wo.report.photoUrl && (
              <img src={wo.report.photoUrl} alt={wo.report.title} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
            )}
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{wo.report.title}</p>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>{wo.report.category} · currently {wo.report.status}</p>
            <p style={{ fontSize: 13, margin: '0 0 8px' }}>{wo.report.description}</p>
            {wo.report.status !== 'fixed' ? (
              <button onClick={() => markFixed(wo.report.id, wo.workOrderId)}>Mark as fixed</button>
            ) : (
              <p style={{ fontSize: 13, color: 'green' }}>✓ Fixed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}