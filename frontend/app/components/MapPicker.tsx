'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Props = {
  onLocationSelect: (lat: number, lng: number) => void;
};

function LocationMarker({ onLocationSelect }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onLocationSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Clear any stale Leaflet instance id left on this div from a previous
    // mount (React 18 Strict Mode / Fast Refresh double-invokes effects in dev)
    const el = containerRef.current as any;
    if (el && el._leaflet_id) {
      delete el._leaflet_id;
    }
    setReady(true);
  }, []);

  return (
    <div ref={containerRef} style={{ height: '250px', width: '100%', marginBottom: 8 }}>
      {ready && (
        <MapContainer
          center={[6.9271, 79.8612]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
      )}
    </div>
  );
}