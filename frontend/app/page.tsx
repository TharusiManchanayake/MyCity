'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Report = {
  id: number;
  status: string;
  category: string;
};

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/reports')
      .then((res) => res.json())
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]));
  }, []);

  const total = reports.length;
  const fixed = reports.filter((r) => r.status === 'fixed').length;
  const resolutionRate = total > 0 ? Math.round((fixed / total) * 100) : 0;
  const categories = new Set(reports.map((r) => r.category)).size;

  return (
    <div style={{ background: '#f6f8f2', minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero with photo background */}
      <div
        style={{
          position: 'relative',
          backgroundImage: 'url(/hero-city.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '96px 24px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15,45,25,0.75), rgba(15,45,25,0.6))',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', textAlign: 'left' }}>
          <h1
            style={{
              fontSize: 44,
              lineHeight: 1.1,
              margin: '0 0 20px',
              color: '#fff',
              fontWeight: 800,
            }}
          >
            Report it. Confirm it. Get it fixed.
          </h1>
          <p style={{ fontSize: 17, color: '#e7f0e5', maxWidth: 480, marginBottom: 28, lineHeight: 1.6 }}>
            MyCity connects citizens with the people who keep your streets, lights,
            and drains working. File a report in under a minute, and track it
            through to resolution.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              href="/report"
              style={{
                background: '#fff',
                color: '#1f5c2c',
                padding: '12px 22px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Report an issue
            </Link>
            <Link
              href="/reports"
              style={{
                border: '1px solid #fff',
                color: '#fff',
                padding: '12px 22px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              View reports
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '28px 24px',
          borderBottom: '1px solid #dfe6da',
          display: 'flex',
          gap: 0,
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Reports filed', value: total },
          { label: 'Resolution rate', value: `${resolutionRate}%` },
          { label: 'Issue categories tracked', value: categories },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: '1 1 200px',
              padding: '0 24px',
              borderLeft: i === 0 ? 'none' : '1px solid #dfe6da',
            }}
          >
            <p style={{ fontSize: 32, fontWeight: 800, color: '#1f5c2c', margin: '0 0 4px' }}>{stat.value}</p>
            <p style={{ fontSize: 14, color: '#5b6b5b', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={{ fontSize: 24, color: '#1f5c2c', marginBottom: 32, fontWeight: 700 }}>How MyCity works</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { n: 1, title: 'Report', text: 'Add a photo, a short description, and pin the location on the map.' },
            { n: 2, title: 'Confirm', text: 'Neighbors who\'ve seen the same issue confirm it, moving it toward verification.' },
            { n: 3, title: 'Assign', text: 'City staff verify the report and assign it to a field technician.' },
            { n: 4, title: 'Fixed', text: 'The technician resolves it and logs the cost against the ward budget.' },
          ].map((step) => (
            <div key={step.n} style={{ flex: '1 1 220px' }}>
              <p style={{ fontSize: 13, color: '#6cb33f', fontWeight: 700, margin: '0 0 6px' }}>{step.n}</p>
              <p style={{ fontWeight: 700, color: '#16231e', margin: '0 0 6px' }}>{step.title}</p>
              <p style={{ fontSize: 14, color: '#5b6b5b', margin: 0, lineHeight: 1.5 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <div style={{ background: '#2f7d3a', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#eaf5ea', fontSize: 14, margin: 0 }}>
          Looking for office hours or a power-cut notice?{' '}
          <Link href="/announcements" style={{ color: '#fff', fontWeight: 600 }}>
            Check announcements
          </Link>
        </p>
      </div>
    </div>
  );
}