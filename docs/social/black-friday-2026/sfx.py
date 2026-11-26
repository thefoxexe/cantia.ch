"""Sound of the Black Friday film: a driving 128 BPM pulse, and one sound
per event of video.html (window.sfx): tick, riser, hit, punch, pop, spin,
whoosh, alarm. Everything is synthesised here, no samples, no rights.

    python3 sfx.py '<json events>' duration out.wav
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def env(n, a, d):
    """Attack in samples, then exponential decay with time constant d (s)."""
    e = np.exp(-np.arange(n) / (d * SR))
    if a > 0:
        e[:a] *= np.linspace(0, 1, a)
    return e


def kick(level=1.0, dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 42 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env(n, 40, 0.16)
    click = rng.standard_normal(n) * env(n, 0, 0.004) * 0.5
    return level * np.tanh(1.6 * (body + click))


def noise_burst(dur, decay, hp=0.0):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    if hp:
        x = x - np.convolve(x, np.ones(int(hp)) / hp, mode='same')
    return x * env(n, 20, decay)


def hit():
    k = kick(1.0, 0.7)
    crash = noise_burst(0.9, 0.22, hp=6) * 0.35
    sub = np.sin(2 * np.pi * 38 * np.arange(int(0.7 * SR)) / SR) * env(int(0.7 * SR), 80, 0.35) * 0.6
    out = np.zeros(int(0.9 * SR))
    out[: len(k)] += k
    out[: len(sub)] += sub
    out += crash
    return out


def punch():
    k = kick(0.8, 0.4)
    snap = noise_burst(0.25, 0.05, hp=4) * 0.35
    out = np.zeros(len(k))
    out += k
    out[: len(snap)] += snap
    return out


def pop():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = 900 + 1400 * np.exp(-t * 60)
    return 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 10, 0.03)


def tick():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 3200 * t) * 0.5 + rng.standard_normal(n) * 0.25
    return 0.45 * s * env(n, 0, 0.006)


def riser(dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    # sweep a resonant band upward
    out = np.zeros(n)
    lp = 0.0
    bp = 0.0
    for i in range(n):
        fc = 300 + 5000 * (t[i] / dur) ** 2
        f = 2 * np.sin(np.pi * fc / SR)
        hp = x[i] - lp - 0.4 * bp
        bp += f * hp
        lp += f * bp
        out[i] = bp
    out *= np.linspace(0, 1, n) ** 2
    return 0.25 * out / (np.max(np.abs(out)) + 1e-9)


def whoosh(dur=0.35):
    n = int(dur * SR)
    w = np.hanning(n)
    return 0.3 * noise_burst(dur, 10, hp=3)[:n] * w


def spin(dur=0.7):
    # fast ratchet of ticks slowing down, like a slot machine
    out = np.zeros(int(dur * SR))
    t = 0.0
    gap = 0.025
    while t < dur - 0.05:
        i = int(t * SR)
        tk = tick() * 0.7
        out[i : i + len(tk)] += tk[: len(out) - i]
        t += gap
        gap *= 1.12
    return out


def alarm(dur=0.32):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * 880 * t)) * 0.5 + np.sin(2 * np.pi * 1320 * t) * 0.3
    return 0.22 * s * env(n, 60, 0.12)


SOUNDS = {'tick': tick, 'riser': riser, 'hit': hit, 'punch': punch, 'pop': pop, 'spin': spin, 'whoosh': whoosh, 'alarm': alarm}


def add(buf, t, x, gain=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * gain


def main():
    events = json.loads(sys.argv[1])
    dur = float(sys.argv[2])
    out = sys.argv[3]
    n = int(dur * SR)
    music = np.zeros(n)
    fx = np.zeros(n)

    # the pulse: 128 BPM, kick on every beat, hat on the off-beat,
    # from the first slam (1.6 s) to the alarm (16.8 s); the clock opening
    # and the end card stay without beat.
    beat = 60 / 128
    t = 1.6
    while t < 16.8:
        add(music, t, kick(0.55, 0.35))
        add(music, t + beat / 2, noise_burst(0.06, 0.012, hp=2) * 0.18)
        t += beat
    # a low drone under the end card
    tt = np.arange(int(3.2 * SR)) / SR
    drone = (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 82.5 * tt)) * 0.12 * np.minimum(1, tt / 0.3)
    add(music, 16.8, drone)

    for t, kind in events:
        add(fx, t, SOUNDS[kind]())

    mix = music * 0.8 + fx
    # gentle fades and a soft limiter
    fade = int(0.05 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)
    mix[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    mix *= 0.89 / (np.max(np.abs(mix)) + 1e-9)
    stereo = np.stack([mix, mix], axis=1)
    data = (stereo * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == '__main__':
    main()
