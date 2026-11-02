"""Soft slide sound at each shot change of a reel, nothing else (no music).

    python3 slide-sound.py '[2.5, 3.4]' duration out.wav

The slide is band-passed pink noise whose centre glides up then down, with
an asymmetric swell, a slow left-to-right pan and a short room tail, kept
well under full scale so it sits behind any music added in Instagram.
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(3)


def pink(n):
    # Voss-McCartney style: sum of white noise held over octaves
    out = np.zeros(n)
    for k in range(10):
        step = 2 ** k
        vals = rng.standard_normal(n // step + 2)
        out += np.repeat(vals, step)[:n]
    return out / 10


def bandpass_sweep(x, f0, q):
    """State-variable filter with a moving centre frequency."""
    low = band = 0.0
    y = np.empty_like(x)
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * f0[i] / SR)
        high = x[i] - low - band / q
        band += f * high
        low += f * band
        y[i] = band
    return y


def slide(d=0.62):
    n = int(d * SR)
    t = np.arange(n) / n
    # centre glides 350 Hz -> 2.4 kHz -> 700 Hz
    f0 = 350 + 2050 * np.sin(np.pi * np.clip(t * 1.15, 0, 1)) ** 2
    f0 = np.where(t > 0.55, f0 * (1 - 0.45 * (t - 0.55) / 0.45), f0)
    s = bandpass_sweep(pink(n), f0, 1.4)
    # swell: slow rise, quicker release
    e = np.where(t < 0.58, (t / 0.58) ** 1.8, ((1 - t) / 0.42) ** 2.2)
    s *= e
    # a little body underneath
    body = np.sin(2 * np.pi * np.cumsum(140 - 60 * t) / SR) * e ** 2 * 0.18
    s = s / (np.abs(s).max() + 1e-9) + body
    pan = -0.55 + 1.1 * t
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    st = np.vstack([s * l, s * r])
    # short room: two damped echoes
    for delay, g in ((0.031, 0.28), (0.057, 0.16)):
        k = int(delay * SR)
        st[:, k:] += st[:, :-k] * g
    return st


def main():
    cuts = json.loads(sys.argv[1])
    dur = float(sys.argv[2])
    n = int(dur * SR)
    buf = np.zeros((2, n + SR))
    sl = slide()
    for c in cuts:
        i = int((c - 0.28) * SR)
        buf[:, i:i + sl.shape[1]] += sl
    buf = buf[:, :n]
    buf *= 10 ** (-9 / 20) / (np.abs(buf).max() + 1e-9)  # peak at -9 dBFS
    pcm = (buf.T * 32767).astype('<i2')
    with wave.open(sys.argv[3], 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
