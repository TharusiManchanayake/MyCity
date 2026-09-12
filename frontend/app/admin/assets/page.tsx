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

const conditionColor: Record<string, string> = {
  good: '#5c7a5c',
  fair: '#d4a017',
  poor: '#a13d3d',
};

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
      router.push('/login');
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

  if (loading) return <p style={{ padding: '2rem', color: '#6e6e6e' }}>Loading assets...</p>;

  const inputStyle = { display: 'block', width: '100%', marginBottom: 12, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ color: '#2b2b2b', fontSize: 28, fontWeight: 700, margin: '0 0 4px' }}>Asset inventory</h1>
        <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>Track city infrastructure and its condition.</p>

        <form onSubmit={handleSubmit} style={{ marginBottom: 28, background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Asset name</label>
          <input
            placeholder="e.g. Streetlight #42"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            {assetTypes.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>

          <p style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d', marginBottom: 6 }}>Tap the map to place the asset:</p>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #dcdad5', marginBottom: 12 }}>
            <MapPicker onLocationSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
          </div>

          <button
            type="submit"
            style={{ width: '100%', background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Add asset
          </button>
        </form>

        <div style={{ display: 'grid', gap: 12 }}>
          {assets.map((a) => (
            <div key={a.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 4px', fontSize: 16 }}>{a.name}</p>
                  <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0, textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: conditionColor[a.condition] || '#6e6e6e',
                    letterSpacing: 0.4,
                  }}
                >
                  {a.condition}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select
                  value={a.condition}
                  onChange={(e) => updateCondition(a.id, e.target.value)}
                  style={{ border: '1px solid #dcdad5', borderRadius: 6, padding: '6px 10px', fontSize: 13, background: '#fff' }}
                >
                  {conditions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={() => deleteAsset(a.id)}
                  style={{ fontSize: 12, background: 'transparent', border: '1px solid #dcdad5', color: '#6e6e6e', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}