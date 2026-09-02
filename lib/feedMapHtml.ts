import { getAppLocale, i18next } from './translations';

export interface FeedMapPoint {
  id: string;
  lat: number;
  lon: number;
  thumbUrl: string | null;
  caption: string | null;
  takenAt: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function buildFeedMapHtml(points: FeedMapPoint[]): string {
  const markers = points.map((p) => ({
    id: p.id,
    lat: p.lat,
    lon: p.lon,
    thumb: p.thumbUrl,
    popup: [
      p.caption ? escapeHtml(p.caption) : null,
      new Date(p.takenAt).toLocaleString(`${getAppLocale()}-CH`, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    ]
      .filter(Boolean)
      .join(' — '),
  }));

  const center = points.length > 0 ? [points[0].lat, points[0].lon] : [46.8182, 8.2275];
  const zoom = points.length > 0 ? 16 : 8;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #F5F4F0; }
  .opus-photo-marker { width:40px; height:40px; border-radius:10px; border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,0.45); background-size:cover; background-position:center; background-color:#1F3D3A; }
  .opus-photo-popup img { width:180px; max-width:55vw; border-radius:8px; display:block; margin-bottom:6px; }
  .opus-photo-popup-caption { font-size:12px; color:#40433D; }
  .leaflet-control-layers { font-size: 13px; }
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
  swissImage.addTo(map);
  L.control.layers({ 'Orthophoto': swissImage, ${JSON.stringify(i18next.t('feedMap.colorPlan'))}: swissPlan }).addTo(map);

  var markers = ${JSON.stringify(markers)};
  var bounds = [];
  markers.forEach(function (m) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="opus-photo-marker" style="' + (m.thumb ? "background-image:url('" + m.thumb + "')" : '') + '"></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
    var popupHtml = (m.thumb ? '<div class="opus-photo-popup"><img src="' + m.thumb + '" /></div>' : '')
      + '<div class="opus-photo-popup-caption">' + (m.popup || '') + '</div>';
    L.marker([m.lat, m.lon], { icon: icon }).addTo(map).bindPopup(popupHtml, { maxWidth: 220 });
    bounds.push([m.lat, m.lon]);
  });
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
</script>
</body>
</html>`;
}
