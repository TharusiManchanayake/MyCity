'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Ward = {
  id: number;
  name: string;
  description: string | null;
  population: number | null;
};

export default function AdminWardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [population, setPopulation] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadWards = () => {
    fetch('http://localhost:5000/api/wards')
      .then((res) => res.json())
      .then((data) => {
        setWards(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/login');
      return;
    }
    loadWards();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/wards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description: description || null,
        population: population ? parseInt(population) : null,
      }),
    });

    if (res.ok) {
      setName('');
      setDescription('');
      setPopulation('');
      loadWards();
    } else {
      alert('Failed to add ward');
    }
  };

  const deleteWard = async (id: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/wards/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadWards();
  };

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading wards...</p>;

  const inputStyle = {
    display: 'block',
    width: '100%',
    marginBottom: 12,
    padding: '10px 12px',
    border: '1px solid #dcdad5',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const totalPopulation = wards.reduce((sum, w) => sum + (w.population || 0), 0);
  const wardsWithPopulation = wards.filter((w) => w.population).length;

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .admin-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .add-ward-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        .delete-ward-btn:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #b91c1c !important; }
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
            Ward registry
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>
            Manage the city's wards — used to organize reports, budgets, and assignments by area.
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
        {/* Main column: form + list */}
        <div style={{ flex: '1 1 480px', minWidth: 320 }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: 28, background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Ward name</label>
            <input
              className="admin-input"
              placeholder="e.g. Piliyandala"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Description (optional)</label>
            <textarea
              className="admin-input"
              placeholder="e.g. Covers the northern residential district"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: 70 }}
            />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Population (optional)</label>
            <input
              className="admin-input"
              type="number"
              placeholder="e.g. 42000"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              style={inputStyle}
            />

            <button
              type="submit"
              className="add-ward-btn"
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'box-shadow 0.15s ease',
              }}
            >
              Add ward
            </button>
          </form>

          <div style={{ display: 'grid', gap: 12 }}>
            {wards.length === 0 && <p style={{ color: '#9a9a9a', fontSize: 14 }}>No wards added yet.</p>}
            {wards.map((w) => (
              <div key={w.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
                <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 4px', fontSize: 16 }}>{w.name}</p>
                {w.population && (
                  <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, margin: '0 0 6px' }}>
                    Population: {w.population.toLocaleString()}
                  </p>
                )}
                {w.description && (
                  <p style={{ fontSize: 13, color: '#3d3d3d', margin: '0 0 12px', lineHeight: 1.5 }}>{w.description}</p>
                )}
                <button
                  onClick={() => deleteWard(w.id)}
                  className="delete-ward-btn"
                  style={{
                    fontSize: 12,
                    background: 'transparent',
                    border: '1px solid #dcdad5',
                    color: '#6e6e6e',
                    borderRadius: 6,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Overview
              </p>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>{wards.length}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Wards registered</p>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>{totalPopulation.toLocaleString()}</p>
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: 0 }}>Total population</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 10px' }}>
              Tips
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#6e6e6e', fontSize: 13, lineHeight: 1.8 }}>
              <li>Ward names should match how citizens and officers refer to areas locally</li>
              <li>Population figures help prioritize budget allocation by area</li>
              <li>{wardsWithPopulation} of {wards.length} wards have population data set</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}