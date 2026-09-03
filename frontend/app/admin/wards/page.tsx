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
        setWards(data);
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

  if (loading) return <p style={{ padding: '2rem' }}>Loading wards...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '1rem' }}>
      <h1>Ward registry</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <input placeholder="Ward name (e.g. Piliyandala)" value={name} onChange={(e) => setName(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input type="number" placeholder="Population (optional)" value={population} onChange={(e) => setPopulation(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button type="submit">Add ward</button>
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        {wards.map((w) => (
          <div key={w.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{w.name}</p>
            {w.population && <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>Population: {w.population.toLocaleString()}</p>}
            {w.description && <p style={{ fontSize: 13, margin: '0 0 8px' }}>{w.description}</p>}
            <button onClick={() => deleteWard(w.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}