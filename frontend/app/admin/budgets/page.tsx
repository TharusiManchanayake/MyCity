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
      router.push('/admin/login');
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

  if (loading) return <p style={{ padding: '2rem' }}>Loading budgets...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>Budgets</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        Set an allocated budget per category. Spent totals update automatically as technicians log repair costs.
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {categories.map((cat) => {
          const budget = getBudgetFor(cat);
          const allocated = budget?.allocated || 0;
          const spent = budget?.spent || 0;
          const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
          const overBudget = spent > allocated && allocated > 0;

          return (
            <div key={cat} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <p style={{ fontWeight: 600, margin: '0 0 8px', textTransform: 'capitalize' }}>{cat}</p>

              <div style={{ background: '#eee', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 8 }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: overBudget ? '#dc2626' : '#22c55e',
                  }}
                />
              </div>

              <p style={{ fontSize: 13, margin: '0 0 8px', color: overBudget ? '#dc2626' : '#666' }}>
                Spent: LKR {spent.toLocaleString()} / Allocated: LKR {allocated.toLocaleString()}
                {overBudget && ' — Over budget'}
              </p>

              <input
                type="number"
                placeholder={`Set allocation for ${cat}`}
                value={edits[cat] || ''}
                onChange={(e) => setEdits((prev) => ({ ...prev, [cat]: e.target.value }))}
                style={{ marginRight: 8 }}
              />
              <button onClick={() => setAllocation(cat)}>Save</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}