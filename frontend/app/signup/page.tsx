'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Ward = {
  id: number;
  name: string;
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [wardId, setWardId] = useState('');
  const [wards, setWards] = useState<Ward[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:5000/api/wards')
      .then((res) => res.json())
      .then((data) => setWards(Array.isArray(data) ? data : []))
      .catch(() => setWards([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'citizen',
          phone: phone || null,
          wardId: wardId ? Number(wardId) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      router.push('/reports');
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 380, width: '100%', background: '#fff', borderRadius: 10, padding: '36px 32px', border: '1px solid #dcdad5' }}>
        <h2 style={{ textAlign: 'center', color: '#2b2b2b', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>Create an account</h2>
        <p style={{ fontSize: 13, color: '#6e6e6e', textAlign: 'center', marginTop: 0, marginBottom: 24 }}>
          Sign up to report issues and confirm reports from your neighbors
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, color: '#3d3d3d', fontWeight: 600 }}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
          />

          <label style={{ fontSize: 13, color: '#3d3d3d', fontWeight: 600 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
          />

          <label style={{ fontSize: 13, color: '#3d3d3d', fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
          />

          <label style={{ fontSize: 13, color: '#3d3d3d', fontWeight: 600 }}>Phone (optional)</label>
          <input
            type="tel"
            placeholder="e.g. 0771234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 14, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
          />

          <label style={{ fontSize: 13, color: '#3d3d3d', fontWeight: 600 }}>Ward (optional)</label>
          <select
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
          >
            <option value="">Select your ward</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <button
            type="submit"
            style={{ width: '100%', background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Sign up
          </button>
        </form>
        {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}