import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../lib/theme';
import { i18next } from '../lib/translations';

export interface MapPoint {
  id: string;
  code: string;
  description: string | null;
  pointClass: string | null;
  lat: number;
  lon: number;
}

interface SwissMapProps {
  points: MapPoint[];
  height?: number;
  onMapPress?: (lat: number, lon: number) => void;
}

const CLASS_COLORS = ['#B0692C', '#1F3D3A', '#2E6B4F', '#7A4FB5', '#C9483C', '#2E7DA3'];

function colorForClass(cls: string | null): string {
  if (!cls) return '#1F3D3A';
  let hash = 0;
  for (let i = 0; i < cls.length; i++) hash = (hash * 31 + cls.charCodeAt(i)) >>> 0;
  return CLASS_COLORS[hash % CLASS_COLORS.length];
}

function buildHtml(points: MapPoint[]): string {
  const markers = points.map((p) => ({
    id: p.id,
    lat: p.lat,
    lon: p.lon,
    label: p.code,
    popup: [p.code, p.pointClass, p.description].filter(Boolean).join(' — '),
    color: colorForClass(p.pointClass),
  }));

  const center = points.length > 0 ? [points[0].lat, points[0].lon] : [46.8182, 8.2275];
  const zoom = points.length > 0 ? 17 : 8;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #F5F4F0; }
  .opus-marker { display:flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.4); font-size:10px; font-weight:700; color:#fff; }
  .leaflet-control-layers { font-size: 13px; }
  .opus-me-dot { width:16px; height:16px; border-radius:50%; background:#1a73e8; border:3px solid #fff; box-shadow:0 0 0 3px rgba(26,115,232,0.35), 0 1px 4px rgba(0,0,0,0.4); }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map', { zoomControl: true }).setView([${center[0]}, ${center[1]}], ${zoom});

  var swissImage = L.tileLayer('https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg', {
    maxZoom: 20, attribution: 'swisstopo'
  });
  var swissPlan = L.tileLayer('https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
    maxZoom: 20, attribution: 'swisstopo'
  });
  var cadastre = L.tileLayer('https://wmts.geo.admin.ch/1.0.0/ch.kantone.cadastralwebmap-farbe/default/current/3857/{z}/{x}/{y}.png', {
    maxZoom: 20, opacity: 0.75, attribution: 'cadastre'
  });

  swissImage.addTo(map);
  cadastre.addTo(map);

  L.control.layers(
    { 'Orthophoto': swissImage, ${JSON.stringify(i18next.t('swissMap.colorPlan'))}: swissPlan },
    { ${JSON.stringify(i18next.t('swissMap.cadastre'))}: cadastre }
  ).addTo(map);

  var markers = ${JSON.stringify(markers)};
  var bounds = [];
  markers.forEach(function (m) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="opus-marker" style="background:' + m.color + '">' + (m.label || '').slice(0, 3) + '</div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([m.lat, m.lon], { icon: icon }).addTo(map).bindPopup(m.popup || m.label);
    bounds.push([m.lat, m.lon]);
  });
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }

  function post(msg) {
    window.parent.postMessage(JSON.stringify(msg), '*');
  }

  map.on('click', function (e) {
    post({ type: 'map-press', lat: e.latlng.lat, lon: e.latlng.lng });
  });

  var meMarker = null;
  var meCircle = null;
  var meIcon = L.divIcon({ className: '', html: '<div class="opus-me-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
  map.on('locationfound', function (e) {
    if (!meMarker) {
      meMarker = L.marker(e.latlng, { icon: meIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      meMarker.setLatLng(e.latlng);
    }
    if (e.accuracy) {
      if (!meCircle) {
        meCircle = L.circle(e.latlng, { radius: e.accuracy, color: '#1a73e8', weight: 1, fillColor: '#1a73e8', fillOpacity: 0.12 }).addTo(map);
      } else {
        meCircle.setLatLng(e.latlng);
        meCircle.setRadius(e.accuracy);
      }
    }
  });
  map.on('locationerror', function (e) {
    post({ type: 'location-error', message: e.message });
  });
  map.locate({ watch: true, enableHighAccuracy: true, setView: false });
</script>
</body>
</html>`;
}

// react-native-webview has no web implementation, so the web build uses a
// plain iframe with the same Leaflet page, talking to the parent via
// postMessage the same way WebView's onMessage bridge does on native.
export function SwissMap({ points, height = 340, onMapPress }: SwissMapProps) {
  const html = useMemo(() => buildHtml(points), [points]);
  const onMapPressRef = useRef(onMapPress);
  onMapPressRef.current = onMapPress;

  const handleRef = (iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    (iframe as any)._opusListenerAttached ||= (() => {
      const listener = (e: MessageEvent) => {
        if (e.source !== iframe.contentWindow) return;
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'map-press' && onMapPressRef.current) onMapPressRef.current(msg.lat, msg.lon);
        } catch {
          // ignore malformed messages
        }
      };
      window.addEventListener('message', listener);
      return true;
    })();
  };

  return (
    <View style={[styles.container, { height }]}>
      <iframe ref={handleRef} srcDoc={html} style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
});
