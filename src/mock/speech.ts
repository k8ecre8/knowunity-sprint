/**
 * A fake voice level for the mocked recall: words, fillers and pauses of
 * varied length, pace and loudness, with a long thinking pause now and then.
 * Nothing repeats on a fixed period. No audio is read.
 *
 * `createSpeechLevel()` returns a sampler for `VoiceInput`'s `getLevel`:
 * call it once per frame and it returns a level from 0 (silence) to 1.
 */

type Segment =
  | { kind: 'pause'; dur: number }
  | { kind: 'filler'; dur: number; peak: number }
  | { kind: 'word'; dur: number; syl: number; peak: number; rate: number };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export function createSpeechLevel(): () => number {
  let seg: Segment | null = null;
  let segT = 0;
  let sinceThink = 0;
  let last = 0;

  const next = (): Segment => {
    sinceThink += seg ? seg.dur : 0;
    if (sinceThink > rnd(14, 26)) {
      sinceThink = 0;
      return { kind: 'pause', dur: rnd(2.5, 5) };
    }
    if (seg && seg.kind !== 'pause') {
      const r = Math.random();
      if (r < 0.62) return { kind: 'pause', dur: rnd(0.05, 0.22) };
      if (r < 0.9) return { kind: 'pause', dur: rnd(0.5, 1.6) };
      return { kind: 'filler', dur: rnd(0.4, 0.9), peak: rnd(0.28, 0.42) };
    }
    const syl = Math.random() < 0.5 ? 1 : Math.random() < 0.6 ? 2 : Math.floor(rnd(3, 5));
    return { kind: 'word', dur: syl * rnd(0.12, 0.24), syl, peak: rnd(0.45, 1), rate: rnd(0.85, 1.15) };
  };

  return () => {
    const now = performance.now();
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (!seg || segT >= seg.dur) {
      seg = next();
      segT = 0;
    }
    segT += dt;
    const u = Math.min(1, segT / seg.dur);
    if (seg.kind === 'pause') return 0;
    if (seg.kind === 'filler') return seg.peak * Math.max(0, Math.sin(u * Math.PI)) ** 0.6;
    const bump = Math.max(0, Math.sin(((u * seg.syl * seg.rate) % 1) * Math.PI)) ** 0.8;
    return seg.peak * (0.35 + 0.65 * bump) * (u > 0.8 ? (1 - u) / 0.2 : 1);
  };
}
