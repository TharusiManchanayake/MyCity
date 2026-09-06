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
    <div style={{ background: '#f6f8f2', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 380, width: '100%', background: '#fff', borderRadius: 10, padding: '36px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', color: '#1f5c2c', fontSize: 24, margin: '0 0 6px' }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: '#5b6b5b', textAlign: 'center', marginTop: 0, marginBottom: 24 }}>
          Sign in as a citizen, technician, or city staff member
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, color: '#3d4a3d', fontWeight: 600 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 16, padding: '10px 12px', border: '1px solid #d7ddd2', borderRadius: 6, fontSize: 14 }}
          />
          <label style={{ fontSize: 13, color: '#3d4a3d', fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 12px', border: '1px solid #d7ddd2', borderRadius: 6, fontSize: 14 }}
          />
          <button
            type="submit"
            style={{ width: '100%', background: '#2f7d3a', color: '#fff', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
          >
            Sign in
          </button>
        </form>
        {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}
        <p style={{ fontSize: 13, textAlign: 'center', marginTop: 20, color: '#5b6b5b' }}>
          New here?{' '}
          <Link href="/signup" style={{ color: '#2f7d3a', fontWeight: 600 }}>
            Create a citizen account
          </Link>
        </p>
      </div>
    </div>
  );
}