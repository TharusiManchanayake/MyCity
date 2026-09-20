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

const statusColor: Record<string, string> = {
  reported: '#9a9a9a',
  verified: '#16a34a',
  in_progress: '#2f6fa8',
  fixed: '#15803d',
};

const statusBg: Record<string, string> = {
  reported: '#f0efec',
  verified: '#e7fbec',
  in_progress: '#e2ecf5',
  fixed: '#dcf5e2',
};

const categoryIcon: Record<string, string> = {
  streetlight: '💡',
  garbage: '🗑️',
  road: '🛣️',
  water: '💧',
  other: '📍',
};

export default function TechnicianPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<{ reportId: number; workOrderId: number } | null>(null);
  const [costValue, setCostValue] = useState('');
  const [costError, setCostError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
        setWorkOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const openCostModal = (reportId: number, workOrderId: number) => {
    setModalTarget({ reportId, workOrderId });
    setCostValue('');
    setCostError('');
  };

  const closeCostModal = () => {
    setModalTarget(null);
    setCostValue('');
    setCostError('');
  };

  const confirmMarkFixed = async () => {
    if (!modalTarget) return;

    const cost = parseFloat(costValue);
    if (isNaN(cost) || cost < 0) {
      setCostError('Please enter a valid cost.');
      return;
    }

    setSubmitting(true);
    const { reportId, workOrderId } = modalTarget;
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

    setSubmitting(false);

    if (statusRes.ok && costRes.ok) {
      setWorkOrders((prev) =>
        prev.map((wo) =>
          wo.report.id === reportId ? { ...wo, report: { ...wo.report, status: 'fixed' } } : wo
        )
      );
      closeCostModal();
    } else {
      setCostError('Failed to update. You may not have permission — check with your admin.');
    }
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading your assignments...</p>;

  const total = workOrders.length;
  const fixedCount = workOrders.filter((wo) => wo.report.status === 'fixed').length;
  const inProgressCount = workOrders.filter((wo) => wo.report.status === 'in_progress').length;
  const pendingCount = total - fixedCount;

  const categoryCounts = workOrders.reduce<Record<string, number>>((acc, wo) => {
    acc[wo.report.category] = (acc[wo.report.category] || 0) + 1;
    return acc;
  }, {});

  const activeReport = modalTarget
    ? workOrders.find((wo) => wo.report.id === modalTarget.reportId)?.report
    : null;

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .mark-fixed-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        .cost-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .modal-cancel-btn:hover { background: #f0efec !important; }
        .modal-confirm-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ padding: '40px 24px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
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
            My assigned work
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>
            Issues assigned to you — update status and log repair costs as you go.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 24px 48px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Main column */}
        <div style={{ flex: '1 1 480px', minWidth: 320 }}>
          {workOrders.length === 0 && (
            <p style={{ color: '#9a9a9a', fontSize: 14 }}>No work assigned to you yet.</p>
          )}

          <div style={{ display: 'grid', gap: 12 }}>
            {workOrders.map((wo) => (
              <div key={wo.workOrderId} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
                {wo.report.photoUrl && (
                  <img
                    src={wo.report.photoUrl}
                    alt={wo.report.title}
                    style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 12 }}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{categoryIcon[wo.report.category] || '📍'}</span>
                    <p style={{ fontWeight: 700, color: '#2b2b2b', margin: 0, fontSize: 16 }}>{wo.report.title}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: statusColor[wo.report.status] || '#6e6e6e',
                      background: statusBg[wo.report.status] || '#f0efec',
                      letterSpacing: 0.4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {wo.report.status.replace('_', ' ')}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#3d3d3d', margin: '0 0 14px', lineHeight: 1.5 }}>{wo.report.description}</p>

                {wo.report.status !== 'fixed' ? (
                  <button
                    onClick={() => openCostModal(wo.report.id, wo.workOrderId)}
                    className="mark-fixed-btn"
                    style={{
                      background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 18px',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.15s ease',
                    }}
                  >
                    Mark as fixed
                  </button>
                ) : (
                  <p style={{ fontSize: 13, color: '#15803d', fontWeight: 600, margin: 0 }}>✓ Fixed</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                My workload
              </p>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>{total}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Total assigned</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2f6fa8', margin: 0 }}>{pendingCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Pending</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#15803d', margin: 0 }}>{fixedCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Fixed</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#2f6fa8', margin: 0 }}>{inProgressCount}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>In progress</p>
              </div>
            </div>
          </div>

          {Object.keys(categoryCounts).length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 12px' }}>
                By category
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(categoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, count]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, width: 20 }}>{categoryIcon[key] || '📍'}</span>
                      <span style={{ fontSize: 13, color: '#3d3d3d', flex: 1, textTransform: 'capitalize' }}>{key}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {pendingCount > 0 && (
            <div style={{ background: '#e7fbec', border: '1px solid #bdf0ca', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>
                Keep it up 👍
              </p>
              <p style={{ fontSize: 12, color: '#3f6b4a', margin: 0, lineHeight: 1.5 }}>
                You have {pendingCount} {pendingCount === 1 ? 'job' : 'jobs'} left to complete.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cost entry modal */}
      {modalTarget && (
        <div
          onClick={closeCostModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 30, 24, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            animation: 'modalFadeIn 0.15s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 380,
              boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
              animation: 'modalSlideUp 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#e7fbec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#2b2b2b', margin: 0 }}>Mark as fixed</p>
            </div>

            {activeReport && (
              <p style={{ fontSize: 13, color: '#6e6e6e', margin: '8px 0 16px' }}>
                {activeReport.title}
              </p>
            )}

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d', display: 'block', marginBottom: 6 }}>
              Repair cost (LKR)
            </label>
            <input
              className="cost-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2500"
              value={costValue}
              onChange={(e) => {
                setCostValue(e.target.value);
                setCostError('');
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmMarkFixed();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 12px',
                border: costError ? '1px solid #fca5a5' : '1px solid #dcdad5',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                marginBottom: costError ? 6 : 20,
              }}
            />

            {costError && (
              <p style={{ fontSize: 12, color: '#b91c1c', margin: '0 0 14px' }}>{costError}</p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={closeCostModal}
                className="modal-cancel-btn"
                disabled={submitting}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#3d3d3d',
                  border: '1px solid #dcdad5',
                  borderRadius: 6,
                  padding: '10px',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkFixed}
                className="modal-confirm-btn"
                disabled={submitting}
                style={{
                  flex: 1,
                  background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'box-shadow 0.15s ease',
                }}
              >
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}