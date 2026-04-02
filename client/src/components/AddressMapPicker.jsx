import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [27.7172, 85.3240];
const DEFAULT_ZOOM = 13;

function makePinIcon() {
  return L.divIcon({
    className: 'address-map-marker',
    html:
      '<div style="width:22px;height:22px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 2px 8px rgba(15,23,42,.35)"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

export default function AddressMapPicker({ apiBase, value, onChange }) {
  const wrapRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const mapHeight = isSmallScreen ? 240 : 280;

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const res = await fetch(
          `${apiBase}/api/auth/geo/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,
          { credentials: 'include' }
        );
        if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const data = await res.json();
        return typeof data.displayName === 'string' && data.displayName.trim()
          ? data.displayName.trim()
          : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
    },
    [apiBase]
  );

  const setLocation = useCallback(
    async (lat, lng, map, marker) => {
      const formattedAddress = await reverseGeocode(lat, lng);
      onChangeRef.current({ lat, lng, formattedAddress });
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], Math.max(map.getZoom(), 15));
    },
    [reverseGeocode]
  );

  const applyCoords = useCallback(
    async (lat, lng) => {
      const map = mapRef.current;
      if (!map || !Number.isFinite(lat) || !Number.isFinite(lng)) return false;

      const icon = makePinIcon();
      let marker = markerRef.current;

      if (!marker) {
        marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
        markerRef.current = marker;
        marker.on('dragend', async (e) => {
          const p = e.target.getLatLng();
          await setLocation(p.lat, p.lng, map, marker);
        });
      }

      await setLocation(lat, lng, map, marker);
      return true;
    },
    [setLocation]
  );

  const handleLocateMe = useCallback(async () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const ok = await applyCoords(pos.coords.latitude, pos.coords.longitude);
          if (!ok) setGeoError('Could not update the map with your location.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err?.code === 1) setGeoError('Location permission was denied. You can still pick on the map.');
        else if (err?.code === 2) setGeoError('Location position is unavailable. Please try again or pick on the map.');
        else if (err?.code === 3) setGeoError('Location request timed out. Please try again or pick on the map.');
        else setGeoError('Failed to fetch your current location. Please pick on the map instead.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [applyCoords]);

  useEffect(() => {
    const update = () => setIsSmallScreen(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = makePinIcon();

    const ensureMarker = (lat, lng) => {
      if (!markerRef.current) {
        const m = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
        markerRef.current = m;
        m.on('dragend', async (e) => {
          const p = e.target.getLatLng();
          await setLocation(p.lat, p.lng, map, m);
        });
        return m;
      }
      markerRef.current.setLatLng([lat, lng]);
      return markerRef.current;
    };

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      const m = ensureMarker(lat, lng);
      await setLocation(lat, lng, map, m);
    });

    map.whenReady(() => setMapReady(true));

    return () => {
      setMapReady(false);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [setLocation]);

  useEffect(() => {
    const el = wrapRef.current;
    const map = mapRef.current;
    if (!map || !el) return;

    // Leaflet often needs an invalidateSize() after layout/size changes.
    // Keep it lightweight to avoid breaking click/interaction on some devices.
    requestAnimationFrame(() => map.invalidateSize());
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [mapReady, isSmallScreen, value?.lat, value?.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || value == null || !Number.isFinite(value.lat) || !Number.isFinite(value.lng)) return;

    const icon = makePinIcon();
    if (!markerRef.current) {
      const m = L.marker([value.lat, value.lng], { draggable: true, icon }).addTo(map);
      markerRef.current = m;
      m.on('dragend', async (e) => {
        const p = e.target.getLatLng();
        await setLocation(p.lat, p.lng, map, m);
      });
    } else {
      markerRef.current.setLatLng([value.lat, value.lng]);
    }
    map.setView([value.lat, value.lng], Math.max(map.getZoom(), 14));
  }, [mapReady, value?.lat, value?.lng, setLocation]);

  return (
    <div style={{ position: 'relative', height: mapHeight, width: '100%' }}>
      <div
        ref={wrapRef}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          zIndex: 0,
        }}
      />

      <button
        type="button"
        onClick={handleLocateMe}
        disabled={locating || !mapReady}
        style={{
          position: 'absolute',
          top: isSmallScreen ? 'auto' : 12,
          bottom: isSmallScreen ? 12 : 'auto',
          right: isSmallScreen ? 12 : 12,
          left: isSmallScreen ? 12 : 'auto',
          zIndex: 10,
          padding: '8px 10px',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          background: 'rgba(255,255,255,.92)',
          cursor: locating ? 'not-allowed' : 'pointer',
          fontWeight: 700,
          color: '#0f172a',
          boxShadow: '0 6px 18px rgba(15,23,42,.12)',
          width: isSmallScreen ? 'calc(100% - 24px)' : 'auto',
        }}
      >
        {locating ? 'Locating…' : !mapReady ? 'Loading map…' : '📍 Use my location'}
      </button>

      {geoError && (
        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, zIndex: 10, pointerEvents: 'none' }}>
          <p style={{ margin: 0, padding: '10px 12px', borderRadius: 10, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.875rem', fontWeight: 600 }}>
            {geoError}
          </p>
        </div>
      )}
    </div>
  );
}
