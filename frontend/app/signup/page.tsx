'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'citizen' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Log them in immediately after signup
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
    <div style={{ maxWidth: 340, margin: '4rem auto', padding: '1.5rem', border: '1px solid #ddd', borderRadius: 10 }}>
      <h2 style={{ textAlign: 'center' }}>Create an account</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%' }}>Sign up</button>
      </form>
      {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
    </div>
  );
}