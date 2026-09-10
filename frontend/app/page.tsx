'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Report = {
  id: number;
  title: string;
  category: string;
  status: string;
  photoUrl: string | null;
};

const stepIcons: Record<string, React.ReactElement> = {
  camera: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="1.75">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7l1.5-2.5h5L16 7" />
      <circle cx="12" cy="13.5" r="3.2" />
    </svg>
  ),
  check: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  ),
  clipboard: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="1.75">
      <rect x="6" y="4" width="12" height="17" rx="1.5" />
      <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  ),
  wrench: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="1.75">
      <path d="M14.7 6.3a4 4 0 00-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 005.4-5.4l-2.3 2.3-2-2 2.3-2.3z" />
    </svg>
  ),
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
  const recent = [...reports].sort((a, b) => b.id - a.id).slice(0, 3);

  const statusColor: Record<string, string> = {
    reported: '#9a9a9a',
    verified: '#d4a017',
    in_progress: '#6e6e6e',
    fixed: '#5c7a5c',
  };

  return (
    <div style={{ background: '#fbfbfa', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        .cta-primary:hover { box-shadow: 0 4px 14px rgba(212,160,23,0.35); }
        .cta-secondary:hover { background: #f0efec; border-color: #9a9a9a !important; }
        .report-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.07); border-color: #c7c5c0 !important; }
      `}</style>

      {/* Hero */}
      <div style={{ padding: '88px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 44,
              lineHeight: 1.15,
              margin: '0 0 20px',
              color: '#2b2b2b',
              fontWeight: 700,
              maxWidth: 600,
              letterSpacing: '-0.5px',
            }}
          >
            Report it. Confirm it. Get it fixed.
          </h1>
          <p style={{ fontSize: 16, color: '#6e6e6e', maxWidth: 480, marginBottom: 30, lineHeight: 1.6 }}>
            MyCity connects citizens with the people who keep your streets, lights,
            and drains working. File a report in under a minute, and track it
            through to resolution.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              href="/report"
              className="cta-primary"
              style={{
                background: 'linear-gradient(90deg, #e6b800, #d4a017)',
                color: '#2b2b2b',
                padding: '11px 22px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 14,
                transition: 'box-shadow 0.15s ease',
              }}
            >
              Report an issue
            </Link>
            <Link
              href="/reports"
              className="cta-secondary"
              style={{
                border: '1px solid #dcdad5',
                color: '#2b2b2b',
                padding: '11px 22px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.15s ease',
                background: '#fff',
              }}
            >
              View reports
            </Link>
          </div>
        </div>
      </div>

      {/* Stats band */}
      <div style={{ background: '#f0efec', borderTop: '1px solid #dcdad5', borderBottom: '1px solid #dcdad5', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
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
                borderLeft: i === 0 ? 'none' : '1px solid #dcdad5',
              }}
            >
              <p style={{ fontSize: 32, fontWeight: 700, color: '#d4a017', margin: '0 0 4px' }}>{stat.value}</p>
              <p style={{ fontSize: 14, color: '#6e6e6e', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 48px' }}>
        <h2 style={{ fontSize: 24, color: '#2b2b2b', marginBottom: 36, fontWeight: 700 }}>How MyCity works</h2>
        <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
          {[
            { n: 1, icon: 'camera', title: 'Report', text: 'Add a photo, a short description, and pin the location on the map.' },
            { n: 2, icon: 'check', title: 'Confirm', text: "Neighbors who've seen the same issue confirm it, moving it toward verification." },
            { n: 3, icon: 'clipboard', title: 'Assign', text: 'City staff verify the report and assign it to a field technician.' },
            { n: 4, icon: 'wrench', title: 'Fixed', text: 'The technician resolves it and logs the cost against the ward budget.' },
          ].map((step) => (
            <div key={step.n} style={{ flex: '1 1 220px' }}>
              <div style={{ marginBottom: 12 }}>{stepIcons[step.icon]}</div>
              <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '0 0 6px', fontSize: 15 }}>
                {step.n}. {step.title}
              </p>
              <p style={{ fontSize: 14, color: '#6e6e6e', margin: 0, lineHeight: 1.5 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent reports preview */}
      {recent.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px 64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, color: '#2b2b2b', fontWeight: 700, margin: 0 }}>Recent reports</h2>
            <Link href="/reports" style={{ color: '#d4a017', fontWeight: 600, fontSize: 14 }}>
              View all →
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {recent.map((r) => (
              <Link
                key={r.id}
                href="/reports"
                className="report-card"
                style={{
                  flex: '1 1 300px',
                  background: '#fff',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #dcdad5',
                  transition: 'all 0.15s ease',
                }}
              >
                {r.photoUrl ? (
                  <img src={r.photoUrl} alt={r.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: 150, background: '#f0efec' }} />
                )}
                <div style={{ padding: 14 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: statusColor[r.status] || '#6e6e6e',
                      letterSpacing: 0.4,
                    }}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                  <p style={{ fontWeight: 700, color: '#2b2b2b', margin: '6px 0 4px' }}>{r.title}</p>
                  <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0, textTransform: 'capitalize' }}>{r.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer strip */}
      <div style={{ background: '#f0efec', borderTop: '1px solid #dcdad5', padding: '24px', textAlign: 'center' }}>
  <p style={{ color: '#6e6e6e', fontSize: 14, margin: 0 }}>
    Looking for office hours?{' '}
    <Link href="/council-info" style={{ color: '#d4a017', fontWeight: 600 }}>
      Check council info
    </Link>
    {' '}·{' '}
    <Link href="/announcements" style={{ color: '#d4a017', fontWeight: 600 }}>
      View announcements
    </Link>
  </p>
</div>
    </div>
  );
}