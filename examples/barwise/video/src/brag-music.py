"""Brag soundtrack: 20 s, 120 BPM, D major, every part on one grid counted from frame 0.
Pure standard library. Writes a 48 kHz stereo 16-bit WAV."""
import math, struct, sys, wave

SR = 48000
DUR = 20.0
N = int(SR * DUR)
BEAT = 0.5           # 120 BPM
BAR = 4 * BEAT
L = [0.0] * N
R = [0.0] * N

def hz(m):           # MIDI note -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)

# D A Bm G, one per bar (roots in MIDI, octave 2)
CHORDS = [(38, [50, 54, 57]), (33, [45, 49, 52]), (35, [47, 50, 54]), (31, [43, 47, 50])]

seed = 12345
def noise():
    global seed
    seed = (1103515245 * seed + 12345) & 0x7FFFFFFF
    return seed / 0x3FFFFFFF - 1.0

def add(t0, samples, gain=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    gl, gr = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
    for k, v in enumerate(samples):
        i = i0 + k
        if 0 <= i < N:
            L[i] += v * gl
            R[i] += v * gr

def env_tone(freq, dur, attack=0.004, decay=None, harmonics=((1, 1.0),), sweep=None):
    n = int(dur * SR); out = []
    ph = 0.0
    for k in range(n):
        t = k / SR
        f = freq if sweep is None else sweep(t)
        ph += 2 * math.pi * f / SR
        a = min(1.0, t / attack) if attack else 1.0
        d = math.exp(-t / decay) if decay else max(0.0, 1 - t / dur)
        # cosine start so the first peak lands on the grid point
        out.append(a * d * sum(g * math.cos(h * ph) for h, g in harmonics))
    return out

def kick():
    return env_tone(0, 0.32, attack=0.0005, decay=0.09, sweep=lambda t: 45 + 75 * math.exp(-t / 0.03))

def hat(dur=0.05):
    out, prev = [], 0.0
    for k in range(int(dur * SR)):
        x = noise(); hp = x - prev; prev = x          # crude high-pass
        out.append(hp * math.exp(-k / SR / 0.012))
    return out

def tick():
    out, prev = [], 0.0
    for k in range(int(0.03 * SR)):
        x = noise(); bp = x - prev; prev = x
        out.append(bp * math.exp(-k / SR / 0.006) * 0.6 + 0.4 * math.cos(2 * math.pi * hz(86) * k / SR) * math.exp(-k / SR / 0.01))
    return out

def pluck(m, dur=0.35):
    return env_tone(hz(m), dur, attack=0.002, decay=0.12, harmonics=((1, 1.0), (2, 0.35), (3, 0.12)))

def bass(m, dur):
    return env_tone(hz(m), dur, attack=0.005, decay=0.25, harmonics=((1, 1.0), (2, 0.45), (3, 0.2)))

def pad(notes, dur):
    n = int(dur * SR); out = [0.0] * n
    for m in notes:
        f = hz(m); f2 = f * 1.003
        for k in range(n):
            t = k / SR
            a = min(1.0, t / 0.25) * min(1.0, (dur - t) / 0.3)
            out[k] += a * (math.sin(2 * math.pi * f * t) + 0.6 * math.sin(2 * math.pi * f2 * t) + 0.15 * math.sin(4 * math.pi * f * t))
    return out

def impact():
    body = env_tone(hz(26), 0.6, attack=0.001, decay=0.18)          # D1 thump, in key
    air, prev = [], 0.0
    for k in range(int(0.25 * SR)):
        x = noise(); air.append((x - prev) * 0.3 * math.exp(-k / SR / 0.06)); prev = x
    return [b + (air[i] if i < len(air) else 0) for i, b in enumerate(body)]

def riser(dur):
    out, prev = [], 0.0
    for k in range(int(dur * SR)):
        t = k / SR; x = noise(); hp = x - prev; prev = x
        out.append((t / dur) ** 2 * (0.5 * hp + 0.5 * math.sin(2 * math.pi * (hz(62) + 300 * t / dur) * t)))
    return out

bars = int(DUR / BAR)
for b in range(bars):
    root, tri = CHORDS[b % 4]
    t0 = b * BAR
    last = b == bars - 1
    add(t0, pad(tri, BAR + (0.0 if not last else 0.0)), 0.035 if b < 9 else 0.03, 0)
    # hats on offbeat 8ths through the whole piece, quieter in the hook
    for i in range(4):
        add(t0 + i * BEAT + BEAT / 2, hat(), 0.05 if t0 < 3 else 0.08, 0.3)

GROOVE = (3.0, 17.0)
for i in range(int(DUR / BEAT)):
    t = i * BEAT
    if GROOVE[0] <= t < GROOVE[1]:
        add(t, kick(), 0.55)
        root = CHORDS[int(t // BAR) % 4][0]
        add(t, bass(root, 0.22), 0.16)
        add(t + BEAT / 2, bass(root + 12, 0.18), 0.09)

# arpeggio from the live scene (6 s) to the outro
for i in range(int(6.0 / (BEAT / 2)), int(17.0 / (BEAT / 2))):
    t = i * BEAT / 2
    tri = CHORDS[int(t // BAR) % 4][1]
    m = tri[i % 3] + 12
    add(t, pluck(m), 0.05, -0.25 if i % 2 else 0.25)

# typing ticks on 16ths while the prompt types (frames 6..54 -> 0.2..1.8 s)
for i in range(1, 15):
    add(0.125 * i + 0.125, tick(), 0.05, 0.1)

add(1.5, riser(1.5), 0.08)
for t in (3.0, 6.0, 10.0, 14.0, 17.0):
    add(t, impact(), 0.28 if t in (3.0, 17.0) else 0.16)

# prototype taps (on beats inside scene 4) and check counters (scene 5)
for t in (11.0, 12.0, 13.0):
    add(t, tick(), 0.07)
for t in (14.5, 15.0, 15.5):
    add(t, pluck(74, 0.2), 0.05)

# final chord rings out from 17 s, fade to silence by 20 s
add(17.0, pad([50, 54, 57, 62], 3.0), 0.04)
add(17.0, bass(26, 2.5), 0.2)

# master: soft clip, normalise to -1 dBFS, 10 ms fades at the ends
peak = max(max(abs(x) for x in L), max(abs(x) for x in R))
g = 0.80 / peak
fade = int(0.01 * SR)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    frames = bytearray()
    for i in range(N):
        e = min(1.0, i / fade, (N - 1 - i) / fade)
        for ch in (L, R):
            v = math.tanh(ch[i] * g * 1.1) / math.tanh(1.1) * e
            frames += struct.pack("<h", int(max(-1, min(1, v)) * 32767))
    w.writeframes(bytes(frames))
print("peak before norm", round(peak, 3))
