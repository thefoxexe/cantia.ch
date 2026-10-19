# Earth textures for Cantia Panorama

Used by `lib/relief/globe.ts` (dashboard globe and full-screen Panorama).

- `earth-day-4k.jpg`, `earth-day-2k.jpg`: NASA Blue Marble (public domain), as shipped with the three-globe examples (MIT).
- `earth-night-2k.jpg`: NASA Earth at Night / Black Marble (public domain), same source.
- `earth-bump-2k.jpg`, `earth-water-2k.jpg`: topology and water mask, same source.
- `earth-clouds-1k.jpg`: cloud cover from the three.js examples (MIT, NASA imagery).

Resized and recompressed for the web; served from https://app.cantia.ch/globe/.

The Alps up close (lon 3.5 to 13.5, lat 44.4 to 49.4), made by `scripts/panorama-alps.py`:

- `alps-day.jpg`: the Blue Marble above, sharpened with real relief shading, rock, snow and lakes.
- `alps-height.png`: elevation (grey, 0 to 4800 m) and lakes (alpha), for the light of the sun on the slopes.

Elevation: AWS Terrain Tiles (Mapzen terrarium; SRTM and other public sources). Lakes: Natural Earth 10m (public domain).
