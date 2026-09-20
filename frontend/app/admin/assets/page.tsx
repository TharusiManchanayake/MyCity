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
  good: '#16a34a',
  fair: '#b45309',
  poor: '#b91c1c',
};

const conditionBg: Record<string, string> = {
  good: '#e7fbec',
  fair: '#fef3c7',
  poor: '#fee2e2',
};

const assetTypeIcon: Record<string, string> = {
  streetlight: '💡',
  road_segment: '🛣️',
  drain: '🕳️',
  sidewalk: '🚶',
  park: '🌳',
  other: '📍',
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
        setAssets(Array.isArray(data) ? data : []);
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

  const conditionCounts = conditions.map((c) => ({
    key: c,
    count: assets.filter((a) => a.condition === c).length,
  }));

  const typeCounts = assetTypes
    .map((t) => ({ key: t, count: assets.filter((a) => a.type === t).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  const poorCount = assets.filter((a) => a.condition === 'poor').length;

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .admin-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .add-asset-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        .delete-asset-btn:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #b91c1c !important; }
        .cond-select:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
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
            Asset inventory
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 14, margin: '0 0 24px' }}>
            Track city infrastructure and its condition.
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
            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Asset name</label>
            <input
              className="admin-input"
              placeholder="e.g. Streetlight #42"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Type</label>
            <select
              className="admin-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={inputStyle}
            >
              {assetTypes.map((t) => (
                <option key={t} value={t}>{assetTypeIcon[t]} {t.replace('_', ' ')}</option>
              ))}
            </select>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d', marginBottom: 6 }}>Tap the map to place the asset:</p>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #dcdad5', marginBottom: 12 }}>
              <MapPicker onLocationSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
            </div>
            {latitude !== null && longitude !== null && (
              <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 12 }}>
                Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}

            <button
              type="submit"
              className="add-asset-btn"
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
              Add asset
            </button>
          </form>

          <div style={{ display: 'grid', gap: 12 }}>
            {assets.length === 0 && <p style={{ color: '#9a9a9a', fontSize: 14 }}>No assets tracked yet.</p>}
            {assets.map((a) => (
              <div key={a.id} style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{assetTypeIcon[a.type] || '📍'}</span>
                    <div>
                      <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 4px', fontSize: 16 }}>{a.name}</p>
                      <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0, textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: conditionColor[a.condition] || '#6e6e6e',
                      background: conditionBg[a.condition] || '#f0efec',
                      letterSpacing: 0.4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.condition}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select
                    className="cond-select"
                    value={a.condition}
                    onChange={(e) => updateCondition(a.id, e.target.value)}
                    style={{ border: '1px solid #dcdad5', borderRadius: 6, padding: '6px 10px', fontSize: 13, background: '#fff', outline: 'none' }}
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteAsset(a.id)}
                    className="delete-asset-btn"
                    style={{
                      fontSize: 12,
                      background: 'transparent',
                      border: '1px solid #dcdad5',
                      color: '#6e6e6e',
                      borderRadius: 6,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Inventory overview
              </p>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: '0 0 12px' }}>{assets.length}</p>
              <p style={{ fontSize: 12, color: '#6e6e6e', margin: '0 0 14px' }}>assets tracked</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {conditionCounts.map(({ key, count }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: conditionColor[key],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: '#3d3d3d', flex: 1, textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: conditionColor[key] }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {typeCounts.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 12px' }}>
                By type
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {typeCounts.map(({ key, count }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, width: 20 }}>{assetTypeIcon[key]}</span>
                    <span style={{ fontSize: 13, color: '#3d3d3d', flex: 1, textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {poorCount > 0 && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: '0 0 6px' }}>
                ⚠️ Needs attention
              </p>
              <p style={{ fontSize: 12, color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
                {poorCount} {poorCount === 1 ? 'asset is' : 'assets are'} in poor condition.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}