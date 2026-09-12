'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const MapPicker = dynamic(() => import('../components/MapPicker'), { ssr: false });

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('streetlight');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (latitude === null || longitude === null) {
      setStatus('Please click the map to select a location.');
      return;
    }

    setStatus('Submitting...');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      if (photo) formData.append('photo', photo);

      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to submit');
      setStatus('Report submitted successfully! Redirecting...');
      setTimeout(() => router.push('/reports'), 1000);
    } catch (err) {
      setStatus('Something went wrong. Try again.');
    }
  };

  const inputStyle = { display: 'block', width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ color: '#2b2b2b', fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>Report an issue</h1>
          <p style={{ color: '#6e6e6e', fontSize: 15, margin: 0 }}>
            Add a photo, a short description, and pin the location on the map.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 24px 48px' }}>
        <form
          onSubmit={handleSubmit}
          style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 24 }}
        >
          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Title</label>
          <input
            placeholder="e.g. Broken streetlight on Main St"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={inputStyle}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Description</label>
          <textarea
            placeholder="What's the problem?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: 70 }}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="streetlight">Streetlight</option>
            <option value="garbage">Garbage</option>
            <option value="road">Road</option>
            <option value="water">Water leak</option>
          </select>

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 14 }}
          />

          <p style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d', marginBottom: 6 }}>Tap the map to set the location:</p>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #dcdad5' }}>
            <MapPicker onLocationSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
          </div>
          {latitude !== null && longitude !== null && (
            <p style={{ fontSize: 12, color: '#9a9a9a', marginTop: 8 }}>Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
          )}

          <button
            type="submit"
            style={{ width: '100%', background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 18 }}
          >
            Submit report
          </button>
        </form>
        {status && <p style={{ textAlign: 'center', marginTop: 12, color: '#6e6e6e', fontSize: 14 }}>{status}</p>}
      </div>
    </div>
  );
}