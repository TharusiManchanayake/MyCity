'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Budget = {
  id: number;
  category: string;
  allocated: number;
  spent: number;
};

const categories = ['streetlight', 'garbage', 'road', 'water'];

const categoryIcon: Record<string, string> = {
  streetlight: '💡',
  garbage: '🗑️',
  road: '🛣️',
  water: '💧',
};

export default function AdminBudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const loadBudgets = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/budgets', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBudgets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/login');
      return;
    }
    loadBudgets();
  }, [router]);

  const getBudgetFor = (category: string) => budgets.find((b) => b.category === category);

  const setAllocation = async (category: string) => {
    const allocated = parseFloat(edits[category]);
    if (isNaN(allocated) || allocated < 0) {
      alert('Enter a valid amount.');
      return;
    }

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category, allocated }),
    });

    if (res.ok) {
      setEdits((prev) => ({ ...prev, [category]: '' }));
      loadBudgets();
    } else {
      alert('Failed to save budget');
    }
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading budgets...</p>;

  const totalAllocated = categories.reduce((sum, cat) => sum + (getBudgetFor(cat)?.allocated || 0), 0);
  const totalSpent = categories.reduce((sum, cat) => sum + (getBudgetFor(cat)?.spent || 0), 0);
  const overallPercent = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;
  const overBudgetCategories = categories.filter((cat) => {
    const b = getBudgetFor(cat);
    return b && b.spent > b.allocated && b.allocated > 0;
  });

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .budget-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .save-budget-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
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
            Budgets
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 14, marginBottom: 24 }}>
            Set an allocated budget per category. Spent totals update automatically as technicians log repair costs.
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
          <div style={{ display: 'grid', gap: 14 }}>
            {categories.map((cat) => {
              const budget = getBudgetFor(cat);
              const allocated = budget?.allocated || 0;
              const spent = budget?.spent || 0;
              const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
              const overBudget = spent > allocated && allocated > 0;

              return (
                <div key={cat} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{categoryIcon[cat]}</span>
                    <p style={{ fontWeight: 700, color: '#2b2b2b', margin: 0, textTransform: 'capitalize', fontSize: 16 }}>{cat}</p>
                  </div>

                  <div style={{ background: '#f0efec', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: overBudget ? '#b91c1c' : '#22c55e',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>

                  <p style={{ fontSize: 13, margin: '0 0 12px', color: overBudget ? '#b91c1c' : '#6e6e6e', fontWeight: overBudget ? 700 : 400 }}>
                    Spent: LKR {spent.toLocaleString()} / Allocated: LKR {allocated.toLocaleString()}
                    {overBudget && ' — Over budget'}
                  </p>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="budget-input"
                      type="number"
                      placeholder={`Set allocation for ${cat}`}
                      value={edits[cat] || ''}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [cat]: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #dcdad5',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      }}
                    />
                    <button
                      onClick={() => setAllocation(cat)}
                      className="save-budget-btn"
                      style={{
                        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s ease',
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Overall
              </p>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 13, color: '#6e6e6e', margin: '0 0 4px' }}>Total spent</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', margin: '0 0 12px' }}>
                LKR {totalSpent.toLocaleString()}
              </p>

              <div style={{ background: '#f0efec', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                <div
                  style={{
                    width: `${overallPercent}%`,
                    height: '100%',
                    background: overBudgetCategories.length > 0 ? '#b91c1c' : '#22c55e',
                  }}
                />
              </div>
              <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>
                {overallPercent}% of LKR {totalAllocated.toLocaleString()} allocated
              </p>
            </div>
          </div>

          {overBudgetCategories.length > 0 ? (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: '0 0 6px' }}>
                ⚠️ Over budget
              </p>
              <p style={{ fontSize: 12, color: '#7f1d1d', margin: 0, lineHeight: 1.5, textTransform: 'capitalize' }}>
                {overBudgetCategories.join(', ')} {overBudgetCategories.length === 1 ? 'is' : 'are'} exceeding its allocation.
              </p>
            </div>
          ) : (
            <div style={{ background: '#e7fbec', border: '1px solid #bdf0ca', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>
                ✓ On track
              </p>
              <p style={{ fontSize: 12, color: '#3f6b4a', margin: 0, lineHeight: 1.5 }}>
                No categories are currently over budget.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}