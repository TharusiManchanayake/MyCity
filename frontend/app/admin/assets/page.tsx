'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('../../components/MapPicker'), { ssr: false });

type Asset = {
  id: number;
  name: string;
  type: string;
  condition: string;
  latitude: number;
  longitude: number;
  notes: string | null;
};

const assetTypes = ['streetlight', 'road_segment', 'drain', 'sidewalk', 'park', 'other'];
const conditions = ['good', 'fair', 'poor'];

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('streetlight');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAssets = () => {
    fetch('http://localhost:5000/api/assets')
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadAssets();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude === null || longitude === null) {
      alert('Click the map to place the asset.');
      return;
    }

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, type, latitude, longitude }),
    });

    if (res.ok) {
      setName('');
      setType('streetlight');
      setLatitude(null);
      setLongitude(null);
      loadAssets();
    } else {
      alert('Failed to add asset');
    }
  };

  const updateCondition = async (id: number, condition: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/assets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ condition }),
    });
    if (res.ok) {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, condition } : a)));
    }
  };

  const deleteAsset = async (id: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/assets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadAssets();
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading assets...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>Asset inventory</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <input placeholder="Asset name (e.g. Streetlight #42)" value={name} onChange={(e) => setName(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }}>
          {assetTypes.map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
        <p style={{ fontSize: 13, marginBottom: 4 }}>Tap the map to place the asset:</p>
        <MapPicker onLocationSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
        <button type="submit" style={{ marginTop: 8 }}>Add asset</button>
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        {assets.map((a) => (
          <div key={a.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{a.name}</p>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px', textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</p>
            <select value={a.condition} onChange={(e) => updateCondition(a.id, e.target.value)} style={{ marginRight: 12 }}>
              {conditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button onClick={() => deleteAsset(a.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}