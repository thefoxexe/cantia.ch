"""Cantia Panorama: the ground of the full-screen world.

Builds public/globe/ch-terrain.png for lon 5.6..10.9, lat 45.6..48.1
(Switzerland and its edges): elevation in metres as R * 256 + G, lakes in B.
lib/relief/terrain.ts cuts the company's piece of land out of it.

Elevation: AWS Terrain Tiles (terrarium, Mapzen / SRTM). Lakes: Natural Earth 10m.

  pip install numpy pillow
  python3 scripts/panorama-terrain.py <work dir with ne_10m_lakes.geojson and ne_10m_lakes_europe.geojson>
"""
import json, math, os, sys, urllib.request
import numpy as np
from PIL import Image, ImageDraw

WORK = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'globe', 'ch-terrain.png')
W0, E0, S0, N0 = 5.6, 10.9, 45.6, 48.1
W = round((E0 - W0) * 300)
H = round((N0 - S0) * 420)
Z = 10

def mx(lon): return (lon + 180) / 360 * (1 << Z)
def my(lat):
    r = math.radians(lat)
    return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * (1 << Z)

def tile(x, y):
    path = os.path.join(WORK, f't{Z}_{x}_{y}.png')
    if not os.path.exists(path):
        url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png'
        with urllib.request.urlopen(url, timeout=60) as r:
            open(path, 'wb').write(r.read())
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float64)
    return a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768

x0, x1 = int(mx(W0)), int(mx(E0))
y0, y1 = int(my(N0)), int(my(S0))
mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256))
for ty in range(y0, y1 + 1):
    for tx in range(x0, x1 + 1):
        mosaic[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = tile(tx, ty)

lon = W0 + (np.arange(W) + 0.5) / W * (E0 - W0)
lat = N0 - (np.arange(H) + 0.5) / H * (N0 - S0)
LON, LAT = np.meshgrid(lon, lat)
px = np.clip((np.vectorize(mx)(LON) - x0) * 256, 0, mosaic.shape[1] - 1.001)
py = np.clip((np.vectorize(my)(LAT) - y0) * 256, 0, mosaic.shape[0] - 1.001)
ix, iy = px.astype(int), py.astype(int)
fx, fy = px - ix, py - iy
elev = (mosaic[iy, ix] * (1 - fx) * (1 - fy) + mosaic[iy, ix + 1] * fx * (1 - fy)
        + mosaic[iy + 1, ix] * (1 - fx) * fy + mosaic[iy + 1, ix + 1] * fx * fy)
elev = np.clip(np.round(elev), 0, 65535).astype(np.uint16)

img = Image.new('L', (W * 2, H * 2), 0)
d = ImageDraw.Draw(img)
to = lambda c: ((c[0] - W0) / (E0 - W0) * W * 2, (N0 - c[1]) / (N0 - S0) * H * 2)
for name in ('ne_10m_lakes.geojson', 'ne_10m_lakes_europe.geojson'):
    for f in json.load(open(os.path.join(WORK, name)))['features']:
        g = f['geometry']
        for p in ([g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']):
            if not any(W0 - 1 < c[0] < E0 + 1 and S0 - 1 < c[1] < N0 + 1 for c in p[0]):
                continue
            d.polygon([to(c) for c in p[0]], fill=255)
            for hole in p[1:]:
                d.polygon([to(c) for c in hole], fill=0)
lakes = np.asarray(img.resize((W, H), Image.LANCZOS))

rgb = np.stack([(elev >> 8).astype(np.uint8), (elev & 255).astype(np.uint8), lakes], axis=-1)
Image.fromarray(rgb, 'RGB').save(OUT, optimize=True)
print('ok', W, H, int(elev.max()), os.path.getsize(OUT))
