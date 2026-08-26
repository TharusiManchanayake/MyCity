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

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem' }}>
      <h1>Report an issue</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }}>
          <option value="streetlight">Streetlight</option>
          <option value="garbage">Garbage</option>
          <option value="road">Road</option>
          <option value="water">Water leak</option>
        </select>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <p style={{ fontSize: 13, marginBottom: 4 }}>Tap the map to set the location:</p>
        <MapPicker onLocationSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
        {latitude !== null && longitude !== null && (
          <p style={{ fontSize: 12, color: '#666' }}>Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        )}
        <button type="submit">Submit report</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}