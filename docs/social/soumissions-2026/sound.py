"""Soundtrack of a reel, synthesised from scratch (no samples, no rights to
clear): a 120 bpm loop (kick, clap, hats, bass, pad) and the sound effects
listed by window.events() in reels.html.

    python3 sound.py events.json duration out.wav
"""
import json
import sys
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(7)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def env(n, attack=0.002, release=None):
    """Fast attack, exponential decay over the sound."""
    x = np.arange(n) / SR
    a = np.clip(x / attack, 0, 1)
    r = np.exp(-x / (release or (n / SR) / 4))
    return a * r


def lowpass(x, cutoff):
    """One-pole lowpass; cutoff can be an array (a sweep)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def noise(d):
    return rng.uniform(-1, 1, int(d * SR))


def tone(freq, d, shape='sine'):
    t = t_axis(d)
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(freq, t.shape)) / SR
    if shape == 'saw':
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if shape == 'square':
        return np.sign(np.sin(ph))
    return np.sin(ph)


# --- instruments -----------------------------------------------------------

def kick():
    d = 0.32
    t = t_axis(d)
    f = 45 + 95 * np.exp(-t * 28)
    return tone(f, d) * env(len(t), 0.001, 0.09) * 1.0


def clap():
    d = 0.2
    n = highpass(noise(d), 900)
    e = env(len(n), 0.001, 0.045)
    return lowpass(n, 5000) * e * 0.55


def hat(open_=False):
    d = 0.12 if open_ else 0.04
    n = highpass(noise(d), 7000)
    return n * env(len(n), 0.0005, 0.03 if open_ else 0.008) * 0.22


def bass(freq, d):
    s = tone(freq, d, 'saw') * 0.6 + tone(freq / 2, d) * 0.5
    s = lowpass(s, 700)
    return s * env(len(s), 0.005, d * 0.6) * 0.42


def pad(freqs, d):
    s = sum(tone(f, d, 'saw') + tone(f * 1.006, d, 'saw') for f in freqs) / (2 * len(freqs))
    s = lowpass(s, 1600)
    n = len(s)
    a = np.clip(np.arange(n) / (0.25 * SR), 0, 1) * np.clip((n - np.arange(n)) / (0.3 * SR), 0, 1)
    return s * a * 0.12


# A minor, F, C, G: one chord per bar (2 s)
CHORDS = [(110.0, [220.0, 261.63, 329.63]), (87.31, [174.61, 220.0, 261.63]), (130.81, [261.63, 329.63, 392.0]), (98.0, [196.0, 246.94, 293.66])]


def music(dur):
    out = np.zeros(int((dur + 1) * SR))
    duck = np.ones_like(out)

    def add(sig, at, gain=1.0):
        i = int(at * SR)
        j = min(len(out), i + len(sig))
        if j > i:
            out[i:j] += sig[: j - i] * gain

    beats = int(dur / BEAT) + 1
    for b in range(beats):
        at = b * BEAT
        add(kick(), at)
        # side-chain: the loop breathes under each kick
        i = int(at * SR)
        k = np.linspace(0.45, 1, int(0.18 * SR))
        duck[i:i + len(k)] = np.minimum(duck[i:i + len(k)], k[: len(duck[i:i + len(k)])])
        if b % 2 == 1:
            add(clap(), at)
        add(hat(open_=(b % 4 == 3)), at + BEAT / 2)
        add(hat(), at + BEAT / 4, 0.5)
        add(hat(), at + 3 * BEAT / 4, 0.5)
    for bar in range(int(dur / (4 * BEAT)) + 1):
        root, chord = CHORDS[bar % 4]
        at = bar * 4 * BEAT
        for k in range(8):
            add(bass(root * (2 if k in (3, 6) else 1), BEAT / 2 * 0.9), at + k * BEAT / 2)
        add(pad(chord, 4 * BEAT), at)
    out = out * duck
    return out[: int(dur * SR)]


# --- sound effects ---------------------------------------------------------

def whoosh(d=0.38):
    n = noise(d)
    t = t_axis(d)
    sweep = 300 + 5000 * np.sin(np.pi * t / d) ** 2
    s = lowpass(n, sweep)
    a = np.sin(np.pi * t / d) ** 1.5
    return s * a * 0.75


def hit():
    d = 0.6
    t = t_axis(d)
    boom = tone(38 + 70 * np.exp(-t * 18), d) * env(len(t), 0.001, 0.22)
    click = highpass(noise(0.03), 2500) * env(int(0.03 * SR), 0.0005, 0.006)
    s = boom * 0.9
    s[: len(click)] += click * 0.5
    return s


def pop():
    d = 0.09
    t = t_axis(d)
    return tone(520 + 900 * (t / d), d) * env(len(t), 0.001, 0.025) * 0.55


def tick():
    d = 0.03
    return tone(2400, d) * env(int(d * SR), 0.0005, 0.005) * 0.35


def ding():
    d = 1.4
    t = t_axis(d)
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(1046.5, 1, 3.2), (1568, 0.5, 4.5), (2093, 0.3, 6), (2637, 0.15, 8)])
    return s * np.clip(t / 0.002, 0, 1) * 0.42


def beep():
    d = 0.11
    return tone(1850, d, 'square') * 0.12 * np.clip((d - t_axis(d)) / 0.01, 0, 1)


def blip():
    d = 0.16
    t = t_axis(d)
    f = np.where(t < d / 2, 660, 990)
    return tone(f, d) * 0.35 * np.clip((d - t) / 0.02, 0, 1) * np.clip(t / 0.003, 0, 1)


def keyclick():
    d = 0.025
    n = highpass(noise(d), 1800)
    return n * env(len(n), 0.0003, 0.004) * 0.45


def thud():
    d = 0.18
    t = t_axis(d)
    return tone(90 * np.exp(-t * 6), d) * env(len(t), 0.001, 0.05) * 0.6


def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    j = min(buf.shape[1], i + len(sig))
    if j <= i or i < 0:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += sig[: j - i] * gain * l * 1.41
    buf[1, i:j] += sig[: j - i] * gain * r * 1.41


def main():
    events = json.load(open(sys.argv[1]))
    dur = float(sys.argv[2])
    out_path = sys.argv[3]
    n = int(dur * SR)
    fx = np.zeros((2, n + SR * 2))

    for ev in events:
        kind, a = ev[0], float(ev[1])
        b = float(ev[2]) if len(ev) > 2 else None
        if kind == 'cut':
            place(fx, whoosh(0.22), a - 0.12, 0.45, pan=rng.uniform(-0.4, 0.4))
        elif kind == 'whoosh':
            place(fx, whoosh(), a - 0.05, 0.6)
        elif kind == 'hit':
            place(fx, hit(), a, 0.62)
        elif kind == 'pop':
            place(fx, pop(), a, 0.8, pan=0.2)
        elif kind == 'tick':
            place(fx, tick(), a, 0.6)
        elif kind == 'ding':
            place(fx, ding(), a, 0.7)
        elif kind == 'beep':
            place(fx, beep(), a, 0.8)
        elif kind == 'blip':
            place(fx, blip(), a, 0.7)
        elif kind == 'slide':
            place(fx, whoosh(0.2), a - 0.05, 0.5, pan=-0.5)
            place(fx, thud(), a + 0.18, 0.8)
        elif kind == 'count':
            # ticks that speed up while the number climbs, then a bell
            t, k = a, 0
            while t < b:
                place(fx, tone(1500 + 900 * (t - a) / (b - a), 0.018) * env(int(0.018 * SR), 0.0005, 0.004) * 0.3, t)
                k += 1
                t += 0.07 - 0.04 * (t - a) / (b - a)
            place(fx, ding(), b, 0.55)
        elif kind == 'type':
            t = a
            while t < b:
                place(fx, keyclick(), t, rng.uniform(0.6, 1.0), pan=rng.uniform(-0.3, 0.3))
                t += rng.uniform(0.045, 0.095)
        elif kind == 'scribble':
            d = b - a
            s = lowpass(highpass(noise(d), 1200), 4200)
            tt = t_axis(d)
            s *= (0.5 + 0.5 * np.abs(np.sin(tt * 2 * np.pi * 7))) * np.clip(tt / 0.03, 0, 1) * np.clip((d - tt) / 0.05, 0, 1)
            place(fx, s, a, 0.35)
        elif kind == 'voice':
            # muffled murmur, like a voice memo playing (no words)
            d = b - a
            tt = t_axis(d)
            s = lowpass(noise(d), 900) * (0.4 + 0.6 * np.abs(np.sin(tt * 2 * np.pi * 3.3) * np.sin(tt * 2 * np.pi * 1.1)))
            place(fx, s, a, 0.45)

    m = music(dur)
    # the loop fades in fast, sits under the effects, fades out on the end card
    fade = np.ones(n)
    fade[: int(0.15 * SR)] = np.linspace(0, 1, int(0.15 * SR))
    fo = int(0.8 * SR)
    fade[-fo:] = np.linspace(1, 0, fo)
    mix = fx[:, :n] + np.vstack([m, m]) * 0.62 * fade
    mix = np.tanh(mix * 1.1)
    mix /= max(1e-9, np.abs(mix).max()) / 0.89
    pcm = (mix.T * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
