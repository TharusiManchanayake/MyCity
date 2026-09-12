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
        setBudgets(data);
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
      loadBudgets();
    } else {
      alert('Failed to save budget');
    }
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading budgets...</p>;

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ color: '#2b2b2b', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Budgets</h1>
        <p style={{ color: '#6e6e6e', fontSize: 14, marginBottom: 24 }}>
          Set an allocated budget per category. Spent totals update automatically as technicians log repair costs.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {categories.map((cat) => {
            const budget = getBudgetFor(cat);
            const allocated = budget?.allocated || 0;
            const spent = budget?.spent || 0;
            const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
            const overBudget = spent > allocated && allocated > 0;

            return (
              <div key={cat} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
                <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 10px', textTransform: 'capitalize', fontSize: 16 }}>{cat}</p>

                <div style={{ background: '#f0efec', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: overBudget ? '#a13d3d' : '#d4a017',
                    }}
                  />
                </div>

                <p style={{ fontSize: 13, margin: '0 0 12px', color: overBudget ? '#a13d3d' : '#6e6e6e', fontWeight: overBudget ? 700 : 400 }}>
                  Spent: LKR {spent.toLocaleString()} / Allocated: LKR {allocated.toLocaleString()}
                  {overBudget && ' — Over budget'}
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    placeholder={`Set allocation for ${cat}`}
                    value={edits[cat] || ''}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [cat]: e.target.value }))}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
                  />
                  <button
                    onClick={() => setAllocation(cat)}
                    style={{ background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}