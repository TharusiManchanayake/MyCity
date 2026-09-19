'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const MapPicker = dynamic(() => import('../components/MapPicker'), { ssr: false });

type User = {
  name: string;
  role: string;
};

const categoryMeta: Record<string, { label: string; icon: string }> = {
  streetlight: { label: 'Streetlight', icon: '💡' },
  garbage: { label: 'Garbage', icon: '🗑️' },
  road: { label: 'Road', icon: '🛣️' },
  water: { label: 'Water leak', icon: '💧' },
  other: { label: 'Other', icon: '📍' },
};

const timelineIcons: Record<string, React.ReactElement> = {
  camera: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.75">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7l1.5-2.5h5L16 7" />
      <circle cx="12" cy="13.5" r="3.2" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  ),
  clipboard: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.75">
      <rect x="6" y="4" width="12" height="17" rx="1.5" />
      <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  ),
  wrench: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.75">
      <path d="M14.7 6.3a4 4 0 00-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 005.4-5.4l-2.3 2.3-2-2 2.3-2.3z" />
    </svg>
  ),
};

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('streetlight');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const handlePhotoChange = (file: File | null) => {
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

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

  const inputStyle = {
    display: 'block',
    width: '100%',
    marginTop: 6,
    marginBottom: 14,
    padding: '10px 12px',
    border: '1px solid #dcdad5',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const descLength = description.length;

  return (
    <div style={{ background: '#fbfffc', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .form-input:focus { border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        .submit-btn:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
        .cat-pill { transition: all 0.15s ease; cursor: pointer; }
        .cat-pill:hover { border-color: #86efac !important; background: #f0fdf4 !important; }
        .photo-drop:hover { border-color: #4ade80 !important; background: #e7fbec !important; }
        .signup-cta:hover { box-shadow: 0 4px 14px rgba(34,197,94,0.4); }
      `}</style>

      <div style={{ padding: '48px 24px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              margin: '0 0 6px',
              background: 'linear-gradient(90deg, #16a34a, #15803d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Report an issue
          </h1>
          <p style={{ color: '#6e6e6e', fontSize: 15, margin: 0 }}>
            Add a photo, a short description, and pin the location on the map.
          </p>
        </div>
      </div>

      {/* Personalized banner */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 8px' }}>
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#e7fbec',
              border: '1px solid #bdf0ca',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                Hello, {user.name}! 👋
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#3f6b4a' }}>
                Thanks for keeping an eye on your neighborhood. Ready to report something?
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              background: 'linear-gradient(90deg, #f0fdf4, #e7fbec)',
              border: '1px solid #bdf0ca',
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 24,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                👋 Reporting as a guest
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4b4b4b', maxWidth: 480 }}>
                You can still submit this report — but signing up lets you track its progress, get notified when it's fixed, and confirm issues from others too.
              </p>
            </div>
            <Link
              href="/signup"
              className="signup-cta"
              style={{
                background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: 'nowrap',
                transition: 'box-shadow 0.15s ease',
              }}
            >
              Sign up — it's free
            </Link>
          </div>
        )}
      </div>

      {/* Two-column: form + sidebar */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px 56px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Form column */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            border: '1px solid #dcdad5',
            borderRadius: 10,
            padding: 24,
            flex: '1 1 460px',
            minWidth: 320,
          }}
        >
          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Title</label>
          <input
            className="form-input"
            placeholder="e.g. Broken streetlight on Main St"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={inputStyle}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Description</label>
          <textarea
            className="form-input"
            placeholder="What's the problem?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            style={{ ...inputStyle, minHeight: 70, marginBottom: 4 }}
          />
          <p style={{ fontSize: 11, color: '#9a9a9a', margin: '0 0 14px', textAlign: 'right' }}>
            {descLength}/300
          </p>

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d', marginBottom: 8, display: 'block' }}>
            Category
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {Object.entries(categoryMeta).map(([key, meta]) => (
              <div
                key={key}
                className="cat-pill"
                onClick={() => setCategory(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 20,
                  border: category === key ? '1.5px solid #22c55e' : '1px solid #dcdad5',
                  background: category === key ? '#e7fbec' : '#fff',
                  fontSize: 13,
                  fontWeight: category === key ? 700 : 500,
                  color: category === key ? '#16a34a' : '#3d3d3d',
                }}
              >
                <span>{meta.icon}</span>
                {meta.label}
              </div>
            ))}
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d' }}>Photo</label>
          <label
            htmlFor="photo-upload"
            className="photo-drop"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 6,
              marginBottom: 14,
              padding: '18px 12px',
              border: '2px dashed #bdf0ca',
              borderRadius: 8,
              background: '#f7fdf8',
              cursor: 'pointer',
              fontSize: 13,
              color: '#16a34a',
              fontWeight: 600,
              transition: 'border-color 0.15s ease, background 0.15s ease',
              textAlign: 'center',
            }}
          >
            📷 {photo ? photo.name : 'Click to add a photo'}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />

          <p style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d', marginBottom: 6 }}>Tap the map to set the location:</p>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #dcdad5' }}>
            <MapPicker onLocationSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
          </div>
          {latitude !== null && longitude !== null && (
            <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 8 }}>
              Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}

          <button
            type="submit"
            className="submit-btn"
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
              marginTop: 18,
              transition: 'box-shadow 0.15s ease',
            }}
          >
            Submit report
          </button>

          {status && (
            <p
              style={{
                textAlign: 'center',
                marginTop: 12,
                fontSize: 14,
                color: status.toLowerCase().includes('wrong') || status.toLowerCase().includes('please')
                  ? '#b91c1c'
                  : status.toLowerCase().includes('success')
                  ? '#16a34a'
                  : '#6e6e6e',
                fontWeight: status === 'Submitting...' ? 400 : 600,
              }}
            >
              {status}
            </p>
          )}
        </form>

        {/* Sidebar column */}
        <div style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live preview card */}
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#e7fbec', borderBottom: '1px solid #bdf0ca' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Preview
              </p>
            </div>
            {photoPreview ? (
              <img src={photoPreview} alt="preview" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 140,
                  background: '#f5f5f4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b5b3ae',
                  fontSize: 13,
                }}
              >
                No photo yet
              </div>
            )}
            <div style={{ padding: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                Reported
              </span>
              <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '6px 0 4px', fontSize: 14 }}>
                {title || 'Your report title will appear here'}
              </p>
              <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>
                {categoryMeta[category].icon} {categoryMeta[category].label}
              </p>
            </div>
          </div>

          {/* Tips card */}
          <div style={{ background: '#fff', border: '1px solid #dcdad5', borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: '0 0 10px' }}>
              Tips for a good report
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#6e6e6e', fontSize: 13, lineHeight: 1.8 }}>
              <li>Take a clear, well-lit photo of the issue</li>
              <li>Pin the exact location on the map</li>
              <li>Report one issue at a time for faster review</li>
              <li>Avoid including personal information in the description</li>
            </ul>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div style={{ background: '#e7fbec', borderTop: '1px solid #bdf0ca', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 20, color: '#2b2b2b', fontWeight: 700, marginBottom: 28 }}>What happens after you submit</h2>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: 1, icon: 'camera', title: 'Reported', text: 'Your report is logged and visible to nearby residents.' },
              { n: 2, icon: 'check', title: 'Confirmed', text: 'Neighbors who see the same issue confirm it.' },
              { n: 3, icon: 'clipboard', title: 'Assigned', text: 'City staff verify it and assign a technician.' },
              { n: 4, icon: 'wrench', title: 'Fixed', text: 'The technician resolves it and closes the report.' },
            ].map((step) => (
              <div key={step.n} style={{ flex: '1 1 220px', display: 'flex', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1px solid #bdf0ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {timelineIcons[step.icon]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 4px', fontSize: 14 }}>{step.title}</p>
                  <p style={{ fontSize: 13, color: '#4b4b4b', margin: 0, lineHeight: 1.5 }}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}