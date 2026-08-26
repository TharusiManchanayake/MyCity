'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      } else {
        router.push('/reports');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div style={{ maxWidth: 340, margin: '4rem auto', padding: '1.5rem', border: '1px solid #ddd', borderRadius: 10 }}>
      <h2 style={{ textAlign: 'center' }}>Sign in</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%' }}>Sign in</button>
      </form>
      {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
    </div>
  );
}