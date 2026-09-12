'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Report = {
  id: number;
  title: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
};

export default function ReportsMap({ reports }: { reports: Report[] }) {
  return (
    <MapContainer key={reports.length} center={[6.9271, 79.8612]} zoom={12} style={{ height: '300px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {reports.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]}>
          <Popup>
            <strong>{r.title}</strong><br />
            {r.category} · {r.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}