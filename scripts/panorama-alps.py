"""Cantia Panorama: the sharp patch of the Alps laid over the planet.

Builds public/globe/alps-day.jpg (colour) and public/globe/alps-height.png
(height in L, lakes in A) for lon 3.5..13.5, lat 44.4..49.4, used by
lib/relief/globe.ts when the camera comes close to Switzerland.

Colour comes from the Blue Marble picture already in public/globe (so the
patch melts into the planet), sharpened by real relief: elevation from the AWS
Terrain Tiles (terrarium, Mapzen / SRTM), lakes from Natural Earth 10m.

  pip install numpy pillow
  python3 scripts/panorama-alps.py <work dir with ne_10m_lakes.geojson and ne_10m_lakes_europe.geojson>
"""
import io, json, math, os, sys, urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

WORK = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'globe')
W0, E0, S0, N0 = 3.5, 13.5, 44.4, 49.4
W, H = 2560, 1280
HW, HH = 1280, 640
Z = 9

def tile(x, y):
    path = os.path.join(WORK, f't{Z}_{x}_{y}.png')
    if not os.path.exists(path):
        url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png'
        with urllib.request.urlopen(url, timeout=60) as r:
            open(path, 'wb').write(r.read())
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float64)
    return a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768

def mx(lon): return (lon + 180) / 360 * (1 << Z)
def my(lat):
    r = math.radians(lat)
    return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * (1 << Z)

x0, x1 = int(mx(W0)), int(mx(E0))
y0, y1 = int(my(N0)), int(my(S0))
mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256))
for ty in range(y0, y1 + 1):
    for tx in range(x0, x1 + 1):
        mosaic[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = tile(tx, ty)

def sample(img, px, py):
    px = np.clip(px, 0, img.shape[1] - 1.001)
    py = np.clip(py, 0, img.shape[0] - 1.001)
    ix, iy = px.astype(int), py.astype(int)
    fx, fy = px - ix, py - iy
    return (img[iy, ix] * (1 - fx) * (1 - fy) + img[iy, ix + 1] * fx * (1 - fy)
            + img[iy + 1, ix] * (1 - fx) * fy + img[iy + 1, ix + 1] * fx * fy)

def grid(w, h):
    lon = W0 + (np.arange(w) + 0.5) / w * (E0 - W0)
    lat = N0 - (np.arange(h) + 0.5) / h * (N0 - S0)
    return np.meshgrid(lon, lat)

def elevation(w, h):
    lon, lat = grid(w, h)
    px = (np.vectorize(mx)(lon) - x0) * 256
    py = (np.vectorize(my)(lat) - y0) * 256
    return np.maximum(sample(mosaic, px, py), 0)

def lakes(w, h, scale=2):
    img = Image.new('L', (w * scale, h * scale), 0)
    d = ImageDraw.Draw(img)
    to = lambda c: ((c[0] - W0) / (E0 - W0) * w * scale, (N0 - c[1]) / (N0 - S0) * h * scale)
    for name in ('ne_10m_lakes.geojson', 'ne_10m_lakes_europe.geojson'):
        for f in json.load(open(os.path.join(WORK, name)))['features']:
            g = f['geometry']
            polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
            for p in polys:
                if not any(W0 - 1 < c[0] < E0 + 1 and S0 - 1 < c[1] < N0 + 1 for c in p[0]):
                    continue
                d.polygon([to(c) for c in p[0]], fill=255)
                for hole in p[1:]:
                    d.polygon([to(c) for c in hole], fill=0)
    return np.asarray(img.resize((w, h), Image.LANCZOS)).astype(np.float64) / 255

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

# Colour: Blue Marble upsampled, then relief, rock, snow and lakes.
day = Image.open(os.path.join(OUT, 'earth-day-4k.jpg')).convert('RGB')
bw, bh = day.size
box = ((W0 + 180) / 360 * bw, (90 - N0) / 180 * bh, (E0 + 180) / 360 * bw, (90 - S0) / 180 * bh)
base = day.resize((W, H), Image.BICUBIC, box=box).filter(ImageFilter.GaussianBlur(3))
col = np.asarray(base).astype(np.float64) / 255

elev = elevation(W, H)
water = lakes(W, H)
# Ambient shading from several directions so valleys read, even before the sun.
gy, gx = np.gradient(elev)
px_m = 111000 * (E0 - W0) / W * math.cos(math.radians(46.8))
py_m = 111000 * (N0 - S0) / H
nx, ny = -gx / px_m * 3.0, gy / py_m * 3.0
nz = np.ones_like(nx)
n = np.sqrt(nx * nx + ny * ny + nz * nz)
shade = np.zeros_like(elev)
for az in (315, 0, 270, 45):
    a = math.radians(az)
    lx, ly, lz = math.sin(a) * 0.7, math.cos(a) * 0.7, 0.71
    shade += np.clip((nx * lx + ny * ly + nz * lz) / n, 0, 1)
shade /= 4
col *= (0.55 + 0.6 * shade)[:, :, None]

rock = np.array([0.5, 0.47, 0.42])
snow = np.array([0.9, 0.93, 0.96])
r = smooth(2000, 2900, elev)[:, :, None] * 0.55
col = col * (1 - r) + rock * (0.6 + 0.5 * shade[:, :, None]) * r
s = smooth(3000, 3700, elev)[:, :, None]
col = col * (1 - s) + snow * (0.75 + 0.3 * shade[:, :, None]) * s
lake = np.array([0.07, 0.13, 0.22])
col = col * (1 - water[:, :, None]) + lake * water[:, :, None]
Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'alps-day.jpg'), quality=86, optimize=True, progressive=True)

# Height (for the light of the real sun on the slopes) and the lakes.
he = elevation(HW, HH)
hw = lakes(HW, HH)
L = (np.clip(he / 4800, 0, 1) * 255).astype(np.uint8)
A = (hw * 255).astype(np.uint8)
Image.merge('LA', (Image.fromarray(L), Image.fromarray(A))).save(os.path.join(OUT, 'alps-height.png'), optimize=True)
print('ok', elev.max(), water.mean())
