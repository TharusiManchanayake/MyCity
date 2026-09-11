'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin/queue');
      } else if (data.user.role === 'technician') {
        router.push('/technician');
      } else {
        router.push('/reports');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 380, width: '100%', background: '#fff', borderRadius: 10, padding: '36px 32px', border: '1px solid #dcdad5' }}>
        <h2 style={{ textAlign: 'center', color: '#2b2b2b', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: '#6e6e6e', textAlign: 'center', marginTop: 0, marginBottom: 24 }}>
          Sign in as a citizen, technician, or city staff member
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, color: '#3d3d3d', fontWeight: 600 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 16, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
          />
          <label style={{ fontSize: 13, color: '#3d3d3d', fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 12px', border: '1px solid #dcdad5', borderRadius: 6, fontSize: 14 }}
          />
          <button
            type="submit"
            style={{ width: '100%', background: 'linear-gradient(90deg, #e6b800, #d4a017)', color: '#2b2b2b', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Sign in
          </button>
        </form>
        {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}
        <p style={{ fontSize: 13, textAlign: 'center', marginTop: 20, color: '#6e6e6e' }}>
          New here?{' '}
          <Link href="/signup" style={{ color: '#d4a017', fontWeight: 600 }}>
            Create a citizen account
          </Link>
        </p>
      </div>
    </div>
  );
}