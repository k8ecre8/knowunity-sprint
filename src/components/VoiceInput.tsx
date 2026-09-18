'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ButtonIcon } from './ButtonIcon';
import { IconSlot } from './IconSlot';
import styles from './VoiceInput.module.css';

/**
 * Where the turn is. The screen owns the timing: it moves to the `…Slow`
 * states at 4 seconds and to `error` at 10, and the control only draws them.
 */
export type VoiceInputState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'transcribingSlow'
  | 'transcript'
  | 'judging'
  | 'judgingSlow'
  | 'error';

export type VoiceInputProps = {
  state: VoiceInputState;
  /**
   * Overrides the second, quieter line under the label for this state. Leave it out to use
   * the default in `HELPER` below; pass an empty string to hide it. Sentence case.
   */
  helper?: string;
  /**
   * Idle only: what sits under the ring, placed `Space/1000` below it. The screen passes the
   * escapes (`button` Tertiary M "I don't know the answer", "Type instead"), because what they
   * do belongs to the screen. They fade out and keep their space in every other state.
   */
  idleActions?: ReactNode;
  /** The read-only words shown at the transcript step. */
  transcript?: string;
  /**
   * Sampled once per frame while listening: the voice level from 0 (silence)
   * to 1. In this prototype it comes from `src/mock/speech.ts`; no audio is read.
   */
  getLevel?: () => number;
  /** Idle: tapped the ring to start answering. */
  onStart?: () => void;
  /** Listening: tapped the ring to stop. */
  onStop?: () => void;
  /** Transcript step: tapped send. */
  onSend?: () => void;
  /** Listening, either wait (transcribing or judging), or the transcript step: tapped the trash. Always returns to idle. */
  onDiscard?: () => void;
  /** Error: tapped the ring to run judging again, without re-recording. */
  onRetry?: () => void;
  className?: string;
};

const LABEL: Record<VoiceInputState, string> = {
  idle: 'Tap to answer',
  listening: 'Listening',
  transcribing: 'Writing down what you said',
  transcribingSlow: 'Still writing, nearly there',
  transcript: 'Check it, then send',
  judging: 'Knowie is reading your answer',
  judgingSlow: 'Still reading, nearly there',
  error: 'That took too long. Tap to send again',
};

/**
 * The second, quieter line under the label, per state. Edit the copy here; a state with no
 * entry shows no second line.
 */
const HELPER: Partial<Record<VoiceInputState, string>> = {
  idle: 'Even a partial answer is a great start',
};

/** What each state asks of the drawing. Every part eases toward these. */
type Look = { gain: number; len: number; breathe: number; glow: number; ripple: number; spin: 'none' | 'spin'; dash: number; trash: number; card: number };
const LOOK: Record<VoiceInputState, Look> = {
  idle: { gain: 0, len: 1, breathe: 1, glow: 1, ripple: 1, spin: 'none', dash: 0, trash: 0, card: 0 },
  listening: { gain: 1, len: 1, breathe: 0, glow: 0.5, ripple: 0, spin: 'none', dash: 0, trash: 1, card: 0 },
  transcribing: { gain: 0, len: 0.8, breathe: 0, glow: 0.35, ripple: 0, spin: 'spin', dash: 0, trash: 1, card: 0 },
  transcribingSlow: { gain: 0, len: 0.8, breathe: 0, glow: 0.5, ripple: 0, spin: 'spin', dash: 1, trash: 1, card: 0 },
  transcript: { gain: 0, len: 1, breathe: 0, glow: 0.3, ripple: 0, spin: 'none', dash: 0, trash: 1, card: 1 },
  judging: { gain: 0, len: 0.8, breathe: 0, glow: 0.35, ripple: 0, spin: 'spin', dash: 0, trash: 1, card: 0 },
  judgingSlow: { gain: 0, len: 0.8, breathe: 0, glow: 0.5, ripple: 0, spin: 'spin', dash: 1, trash: 1, card: 0 },
  error: { gain: 0, len: 1, breathe: 0, glow: 0.2, ripple: 0, spin: 'none', dash: 0, trash: 1, card: 0 },
};

/** The eased values the drawing reads each frame. */
type Params = { gain: number; len: number; breathe: number; glow: number; ripple: number; dash: number; trash: number; card: number; spinRate: number };
const EASED: (keyof Params)[] = ['gain', 'len', 'breathe', 'glow', 'ripple', 'dash', 'trash', 'card', 'spinRate'];

const BARS = 60;
const DASHES = 12;

/** Token values read off the rendered element, so the drawing never holds a number of its own. */
type Tokens = {
  ring: number; bold: number; nudge: number; breath: number; barMax: number; ripple: number;
  inset: number; target: number; radius: number; trashGap: number;
  instant: number; base: number; slow: number; fast: number; breathing: number; spin: number; spinSlow: number;
};
function readTokens(el: HTMLElement): Tokens {
  const cs = getComputedStyle(el);
  const px = (name: string) => parseFloat(cs.getPropertyValue(name)) || 0;
  const ms = (name: string) => {
    const v = cs.getPropertyValue(name).trim();
    return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000 || 0;
  };
  return {
    ring: px('--primitive-illustration-1500') / 2,
    bold: px('--primitive-stroke-bold'),
    nudge: px('--primitive-space-100'),
    breath: px('--primitive-space-050'),
    barMax: px('--primitive-space-600'),
    ripple: px('--primitive-space-800'),
    inset: px('--primitive-space-300'),
    target: px('--primitive-control-1200') / 2,
    radius: px('--primitive-radius-600'),
    trashGap: px('--primitive-space-1200'),
    instant: ms('--motion-duration-instant'),
    base: ms('--motion-duration-base'),
    slow: ms('--motion-duration-slow'),
    fast: ms('--motion-duration-fast'),
    breathing: ms('--motion-duration-breathing'),
    spin: ms('--motion-duration-spin'),
    spinSlow: ms('--motion-duration-spin-slow'),
  };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const out3 = (v: number) => 1 - (1 - v) ** 3;
const inOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);
const f2 = (v: number) => v.toFixed(2);

/**
 * `voiceInput`: the push-to-talk control and its helper label as one unit.
 * One `accent/brand/bold` line carries every state; the middle says what to do.
 */
export function VoiceInput({ state, helper, idleActions, transcript = '', getLevel, onStart, onStop, onSend, onDiscard, onRetry, className }: VoiceInputProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const dashRef = useRef<SVGPathElement>(null);
  const barsRef = useRef<SVGPathElement>(null);
  const rippleRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLButtonElement>(null);
  const sendIconRef = useRef<HTMLSpanElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [cardHeight, setCardHeight] = useState(0);
  const [reduced, setReduced] = useState(false);

  // Everything the frame loop needs, kept off React state so the ring redraws without re-rendering.
  const live = useRef({
    state, prev: state, changedAt: 0, sendAt: -Infinity, pressAt: -Infinity,
    p: { ...LOOK[state], spinRate: 0 } as Params,
    m: 0, mFrom: 0, amp: 0, lv: new Array<number>(BARS).fill(0), start: 0, dashAngle: 0,
    getLevel, tokens: null as Tokens | null, w: 0, h: 0, cardW: 0, cardH: 0,
  });
  useLayoutEffect(() => {
    live.current.getLevel = getLevel;
  }, [getLevel]);

  // A state change restarts the card tween from wherever it is, and marks the send and press moments.
  useLayoutEffect(() => {
    const L = live.current;
    if (L.state === state) return;
    const now = performance.now();
    L.prev = L.state;
    L.state = state;
    L.changedAt = now;
    L.mFrom = L.m;
    if (L.prev === 'transcript' && state === 'judging') L.sendAt = now;
    if (L.prev === 'idle' && state === 'listening') L.pressAt = now;
  }, [state]);

  // Reduced motion is a mode on the duration tokens: spin reads 0 there, so read it back.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (rootRef.current) live.current.tokens = readTokens(rootRef.current);
      setReduced(mq.matches || live.current.tokens?.spin === 0);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // The stage and the card are measured so the line can be drawn round them.
  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;
    const ro = new ResizeObserver(() => {
      const L = live.current;
      L.w = stage.clientWidth;
      L.h = stage.clientHeight;
      L.cardW = card.offsetWidth;
      L.cardH = card.offsetHeight;
      setCardHeight(card.offsetHeight);
    });
    ro.observe(stage);
    ro.observe(card);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const draw = (t: number, dt: number, still: boolean) => {
      const L = live.current;
      const T = L.tokens;
      if (!T || !L.w) return;
      const look = LOOK[L.state];
      const target: Params = { ...look, spinRate: look.spin === 'spin' && T.spin ? 360 / T.spin : 0 };
      const k = still ? 1 : 1 - Math.exp(-dt / T.base);
      const p = L.p;
      EASED.forEach((key) => {
        p[key] = still ? target[key] : p[key] + (target[key] - p[key]) * k;
      });
      const since = (at: number, dur: number) => (still || at === -Infinity ? 1 : clamp((t - at) / dur));

      // Voice: rises at motion.duration.instant, settles at motion.duration.base, whatever the frame rate.
      const rise = still ? 1 : 1 - Math.exp(-dt / Math.max(1, T.instant));
      const fall = still ? 1 : 1 - Math.exp(-dt / Math.max(1, T.base));
      const lvlTarget = !still && L.state === 'listening' && L.getLevel ? clamp(L.getLevel()) : 0;
      L.amp += (lvlTarget - L.amp) * (lvlTarget > L.amp ? rise : fall);
      const a = L.amp * p.gain;

      L.start = (L.start + dt * p.spinRate) % 360;
      L.dashAngle = (L.dashAngle + (T.spinSlow ? (dt * 360) / T.spinSlow : 0)) % 360;

      // Card morph: a timed ease in and out from wherever it was.
      const mTo = look.card;
      const openDelay = mTo > L.mFrom ? T.fast : 0;
      const mk = still ? 1 : clamp((t - L.changedAt - openDelay) / T.slow);
      L.m = L.mFrom + (mTo - L.mFrom) * inOut(mk);
      const m = L.m;

      const cx = L.w / 2, cy = L.h / 2;
      const breath = still || !T.breathing ? 0 : 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / T.breathing);
      const swell = T.nudge * Math.sin(Math.PI * since(L.sendAt, T.slow));
      const R = T.ring + T.breath * p.breathe * breath + swell;

      // One outline for every state: a rounded rectangle that is exactly the circle when m is 0,
      // walked by distance from the top centre, so an arc, a closing gap and the card are one line.
      const hw = R + m * (L.cardW / 2 - R), hh = R + m * (L.cardH / 2 - R), cr = R - m * (R - T.radius);
      const sx = hw - cr, sy = hh - cr, q = (Math.PI / 2) * cr;
      const per = 4 * sx + 4 * sy + 4 * q;
      const at = (u: number): [number, number] => {
        let d = (((u % 1) + 1) % 1) * per;
        if (d < sx) return [d, -hh]; d -= sx;
        if (d < q) { const ang = -Math.PI / 2 + d / cr; return [sx + cr * Math.cos(ang), -sy + cr * Math.sin(ang)]; } d -= q;
        if (d < 2 * sy) return [hw, -sy + d]; d -= 2 * sy;
        if (d < q) { const ang = d / cr; return [sx + cr * Math.cos(ang), sy + cr * Math.sin(ang)]; } d -= q;
        if (d < 2 * sx) return [sx - d, hh]; d -= 2 * sx;
        if (d < q) { const ang = Math.PI / 2 + d / cr; return [-sx + cr * Math.cos(ang), sy + cr * Math.sin(ang)]; } d -= q;
        if (d < 2 * sy) return [-hw, sy - d]; d -= 2 * sy;
        if (d < q) { const ang = Math.PI + d / cr; return [-sx + cr * Math.cos(ang), -sy + cr * Math.sin(ang)]; } d -= q;
        return [-sx + d, -hh];
      };
      // Opening into the card, the gap is shut by the time the card is a third open.
      const len = mTo === 1 ? Math.min(1, p.len + (1 - p.len) * clamp(m * 3)) : p.len;
      const full = len > 0.995;
      const N = Math.max(24, Math.round(240 * len));
      const u0 = L.start / 360;
      let d = '';
      for (let i = 0; i <= N; i++) {
        if (full && i === N) break;
        const pt = at(u0 + (i / N) * len);
        d += (i ? ' L' : 'M') + f2(cx + pt[0]) + ' ' + f2(cy + pt[1]);
      }
      if (full) d += ' Z';
      lineRef.current?.setAttribute('d', d);
      lineRef.current?.style.setProperty('opacity', (1 - p.dash).toFixed(3));

      // Past 4 seconds: the arc becomes circling dashes.
      if (dashRef.current) {
        const r = T.ring;
        dashRef.current.setAttribute('d', `M${f2(cx - r)} ${f2(cy)} A${r} ${r} 0 1 0 ${f2(cx + r)} ${f2(cy)} A${r} ${r} 0 1 0 ${f2(cx - r)} ${f2(cy)} Z`);
        const step = (2 * Math.PI * r) / DASHES;
        dashRef.current.style.setProperty('stroke-dasharray', `${f2(step * 0.45)} ${f2(step * 0.55)}`);
        dashRef.current.style.setProperty('transform', `rotate(${L.dashAngle.toFixed(1)}deg)`);
        dashRef.current.style.setProperty('transform-origin', `${f2(cx)}px ${f2(cy)}px`);
        dashRef.current.style.setProperty('opacity', p.dash.toFixed(3));
      }

      // Listening: bars stand straight out of the ring, each following the voice with its own wobble.
      let bars = '';
      for (let i = 0; i < BARS; i++) {
        // Each bar wobbles on its own phase, at a tenth and a seventh of a spin.
        const n = T.spin ? 0.5 + 0.5 * Math.sin(t / (T.spin / 10) + i * 2.3) * Math.cos(t / (T.spin / 7) + i * 1.1) : 0;
        const want = still ? 0 : a * (0.25 + 0.75 * n);
        L.lv[i] += (want - L.lv[i]) * (want > L.lv[i] ? rise : fall);
        const th = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const r0 = R + T.nudge + T.bold / 2, r1 = r0 + L.lv[i] * T.barMax;
        bars += `M${f2(cx + Math.cos(th) * r0)} ${f2(cy + Math.sin(th) * r0)} L${f2(cx + Math.cos(th) * r1)} ${f2(cy + Math.sin(th) * r1)} `;
      }
      barsRef.current?.setAttribute('d', bars);
      barsRef.current?.style.setProperty('opacity', p.gain.toFixed(3));

      // Idle: one ripple per breath.
      if (rippleRef.current) {
        const rk = still || !T.breathing ? 1 : clamp(((t % T.breathing) / T.breathing) / 0.7);
        const rr = T.ring + T.ripple * out3(rk);
        rippleRef.current.setAttribute('d', `M${f2(cx - rr)} ${f2(cy)} A${f2(rr)} ${f2(rr)} 0 1 0 ${f2(cx + rr)} ${f2(cy)} A${f2(rr)} ${f2(rr)} 0 1 0 ${f2(cx - rr)} ${f2(cy)} Z`);
        rippleRef.current.style.setProperty('opacity', (0.7 * p.ripple * (1 - rk)).toFixed(3));
      }

      if (glowRef.current) {
        const g = Math.min(1, p.glow * (1 - 0.5 * p.breathe * (1 - breath)) + a * 0.4);
        glowRef.current.style.setProperty('opacity', g.toFixed(3));
        // Breathes and swells up to its full size, never past it.
        const gs = Math.min(1, 0.8 + 0.2 * breath * p.breathe + a * 0.2 + 0.1 * (1 - p.breathe));
        glowRef.current.style.setProperty('transform', `translate(-50%, -50%) scale(${gs.toFixed(3)})`);
      }

      const press = 0.06 * Math.sin(Math.PI * since(L.pressAt, T.fast));
      coreRef.current?.style.setProperty('transform', `translate(-50%, -50%) scale(${(1 - press).toFixed(3)})`);
      sendIconRef.current?.style.setProperty('opacity', L.state === 'judging' ? (1 - since(L.sendAt, T.slow)).toFixed(3) : '0');

      // The trash rides from beside the ring into the card's bottom-left corner as the card grows.
      if (trashRef.current) {
        const fromX = -(T.ring + T.trashGap + T.target);
        const toX = -L.cardW / 2 + T.inset + T.target, toY = L.cardH / 2 - T.inset - T.target;
        trashRef.current.style.setProperty('opacity', p.trash.toFixed(3));
        trashRef.current.style.setProperty('transform', `translate(calc(-50% + ${f2(fromX + (toX - fromX) * m)}px), calc(-50% + ${f2(toY * m)}px))`);
      }
      cardRef.current?.style.setProperty('opacity', clamp((m - 0.75) / 0.25).toFixed(3));
    };

    const loop = (t: number) => {
      const dt = Math.min(50, Math.max(0, t - last));
      last = t;
      draw(t, dt, false);
      raf = requestAnimationFrame(loop);
    };
    if (reduced) {
      // One still frame per state; the middle and the label carry it.
      draw(performance.now(), 0, true);
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [reduced, state, cardHeight]);

  const coreAction = state === 'idle' ? onStart : state === 'listening' ? onStop : state === 'error' ? onRetry : undefined;
  const coreLabel = state === 'idle' ? 'Start answering' : state === 'listening' ? 'Stop recording' : state === 'error' ? 'Send again' : LABEL[state];
  const waiting = state === 'transcribing' || state === 'transcribingSlow' || state === 'judging' || state === 'judgingSlow';
  const trashOn = LOOK[state].trash === 1;
  const cardOn = state === 'transcript';

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(' ')} data-state={state}>
      <div className={styles.labels}>
        <p className={styles.label} role="status">
          {LABEL[state]}
        </p>
        {(helper ?? HELPER[state]) ? <p className={styles.helper}>{helper ?? HELPER[state]}</p> : null}
      </div>
      <div
        ref={stageRef}
        className={styles.stage}
        style={
          cardOn && cardHeight
            ? { height: `max(calc(var(--primitive-illustration-1500) + 2 * var(--primitive-space-800)), calc(${cardHeight}px + 2 * var(--primitive-space-400)))` }
            : undefined
        }
      >
        <div ref={glowRef} className={styles.glow} aria-hidden="true" />
        <svg className={styles.svg} aria-hidden="true">
          <path ref={rippleRef} className={`${styles.line} ${styles.ripple}`} />
          <path ref={barsRef} className={styles.line} />
          <path ref={lineRef} className={styles.line} />
          <path ref={dashRef} className={styles.line} />
        </svg>

        <button
          ref={coreRef}
          type="button"
          className={styles.core}
          aria-label={coreLabel}
          disabled={!coreAction}
          inert={cardOn || undefined}
          onClick={coreAction}
        >
          <span className={styles.item} data-on={state === 'idle'}>
            <IconSlot size="500" name="microphone-01" />
          </span>
          <span className={`${styles.item} ${styles.word}`} data-on={state === 'listening'} aria-hidden="true">
            Tap when done
          </span>
          <span className={styles.item} data-on={waiting}>
            <span className={styles.dots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </span>
          </span>
          <span ref={sendIconRef} className={styles.item} style={{ opacity: 0 }}>
            <IconSlot size="400" name="send-01" />
          </span>
          <span className={styles.item} data-on={state === 'error'}>
            <IconSlot size="400" name="refresh-cw-01" />
          </span>
        </button>

        <div ref={cardRef} className={styles.card} inert={!cardOn || undefined} aria-hidden={!cardOn || undefined}>
          <p className={styles.cardTitle}>Here&rsquo;s what Knowie heard</p>
          <p className={styles.cardText}>{transcript}</p>
          <div className={styles.cardActions}>
            <ButtonIcon variant="Primary" size="M" name="send-01" label="Send answer" onClick={onSend} />
          </div>
        </div>

        <div ref={trashRef} className={styles.trash} inert={!trashOn || undefined} aria-hidden={!trashOn || undefined}>
          <ButtonIcon variant="Tertiary" size="M" name="trash-01" label="Discard and start over" onClick={onDiscard} />
        </div>
      </div>

      {idleActions ? (
        <div
          className={styles.idleActions}
          data-on={state === 'idle'}
          inert={state !== 'idle' || undefined}
          aria-hidden={state !== 'idle' || undefined}
        >
          {idleActions}
        </div>
      ) : null}
    </div>
  );
}
