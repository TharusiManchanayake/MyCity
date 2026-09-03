'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Schedule = {
  id: number;
  officerName: string;
  title: string;
  meetingDay: string;
  timeSlot: string | null;
  notes: string | null;
};

export default function AdminCouncilInfoPage() {
  const [officeHours, setOfficeHours] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [officerName, setOfficerName] = useState('');
  const [title, setTitle] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAll = () => {
    Promise.all([
      fetch('http://localhost:5000/api/council-info').then((r) => r.json()),
      fetch('http://localhost:5000/api/officer-schedule').then((r) => r.json()),
    ]).then(([info, sched]) => {
      setOfficeHours(info.officeHours || '');
      setAddress(info.address || '');
      setPhone(info.phone || '');
      setEmail(info.email || '');
      setSchedules(sched);
      setLoading(false);
    });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user || JSON.parse(user).role !== 'admin') {
      router.push('/login');
      return;
    }
    loadAll();
  }, [router]);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/council-info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ officeHours, address, phone, email }),
    });
    if (res.ok) alert('Council info updated');
  };

  const addSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/officer-schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ officerName, title, meetingDay, timeSlot }),
    });
    if (res.ok) {
      setOfficerName('');
      setTitle('');
      setMeetingDay('');
      setTimeSlot('');
      loadAll();
    }
  };

  const deleteSchedule = async (id: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/officer-schedule/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadAll();
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '1rem' }}>
      <h1>Council info</h1>

      <form onSubmit={saveInfo} style={{ marginBottom: 24, border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>General info</p>
        <input placeholder="Office hours (e.g. Mon-Fri, 9 AM - 4 PM)" value={officeHours} onChange={(e) => setOfficeHours(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button type="submit">Save info</button>
      </form>

      <form onSubmit={addSchedule} style={{ marginBottom: 24, border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Add officer meeting schedule</p>
        <input placeholder="Officer name" value={officerName} onChange={(e) => setOfficerName(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Title (e.g. Ward Officer)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Meeting day (e.g. Wednesdays)" value={meetingDay} onChange={(e) => setMeetingDay(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Time slot (e.g. 10 AM - 12 PM)" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button type="submit">Add schedule entry</button>
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        {schedules.map((s) => (
          <div key={s.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{s.officerName} — {s.title}</p>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{s.meetingDay}{s.timeSlot && `, ${s.timeSlot}`}</p>
            <button onClick={() => deleteSchedule(s.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}