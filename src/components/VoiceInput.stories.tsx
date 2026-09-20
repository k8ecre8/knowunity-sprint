import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { Button } from './Button';
import { VoiceInput, type VoiceInputState } from './VoiceInput';
import { createSpeechLevel } from '../mock/speech';

/**
 * The block quote is the component's description, which is the source of
 * truth. Everything after it is what this build does and why.
 */
const description = `
> The push-to-talk control and its helper label as one unit: how a student answers Knowie out loud. One \`accent/brand/bold\` line at \`Stroke/Bold\` carries every state, and the middle of the ring says what to do next.

---

### What each state means

**The label sits above the ring,** with a quieter second line under it (defaults in \`LABEL\` and \`HELPER\` in the component, overridable with \`label\` and \`helper\`; an empty string hides either and keeps its space). It is a live region, so a screen reader hears each state. Idle's line is an instruction, not a status — the voice turn shows "Tap to answer" on the first term of a round's main pass and passes \`label=""\` after that. Knowie is the subject of every state he is acting in; the states where the student has to act address the student instead.

**idle.** A 120 (\`Illustration/1500\`) solid \`interactive/primary\` fill inside the ring, carrying \`microphone-01-solid\` at \`Icon/700\` (56). The whole button breathes at \`motion.duration.breathing\`: the ring and the fill share a radius and the glyph scales by that ratio, so it swells as one shape. The instruction is in the label above. Revised twice in Sep 2026 — the words went into the disc and came back out, and the glyph went from the outlined \`microphone-01\` at 40 to a solid one at 56, which is what stopped it reading as weak.

**listening.** Tapping squeezes the middle like a press and swaps the microphone for "Tap when done". Waveform bars stand out of the ring and follow the voice, up to \`Space/600\` long, inside the stage's \`Space/800\` inset so they never reach the label. The trash appears to the left.

**transcribing.** The ring opens into an arc turning at \`motion.duration.spin\`, with three dots stepping in the middle. **transcribingSlow** is the 4-second beat: the arc becomes twelve dashes circling at \`motion.duration.spin-slow\`.

**transcript.** The ring's own line eases out into the card that holds the words, read-only, with send inside it. The trash rides with the growing edge into the card's bottom-left corner.

**judging.** Sending eases the card back into the ring, which opens straight into the same arc and dots; **judgingSlow** is the same 4-second beat. The trash stays: discarding from the wait returns to idle.

**error.** Past 10 seconds the wait stops: the line closes and goes \`border/strong\`, and the middle offers \`refresh-cw-01\` with "Tap to send again". Tapping re-runs judging on the same take, without re-recording. Not "try again": that is the miss verdict's chip. Grey, not red: red reads as a wrong answer in this app, and nothing has been judged.

**idleActions** is a slot for idle's escapes, \`Space/1000\` under the ring: the screen passes \`button\` Tertiary M "I don't know the answer" (and "Type instead"), because what they do belongs to the screen. They fade out and keep their space in every other state, so the ring never moves.

### Don't

**Don't** show a check anywhere in this control. A check means correct here, and sending is not judging.

**Don't** time the states inside the control. The screen moves it to the slow states at 4 seconds and to error at 10.

---

### How this build works

**Every number is a token read off the element.** Sizes, strokes and durations come from \`build/css/tokens.css\` at mount, so reduced motion (a mode on the duration tokens) reaches the drawing too: \`spin\` reads 0, the loop stops, and each state draws one still frame. The middle and the label carry the state.

**The glow is a shape, not an effect:** a radial fill of \`accent/brand/bold\` fading to transparent. Decided Sep 2026 in place of an effect token.

**Send and discard are \`buttonIcon\`:** Primary M \`send-01\` and Tertiary M \`trash-01\`.

**The voice level is mocked.** \`getLevel\` is sampled once per frame while listening; the stories and the screen pass \`createSpeechLevel()\` from \`src/mock/speech.ts\`. No audio is read.
`;

const TRANSCRIPT =
  'The mantle has convection currents, so hot rock rises and spreads out and drags the plates with it, then sinks when it cools.';

const meta = {
  title: 'Components/voiceInput',
  component: VoiceInput,
  tags: ['autodocs'],
  args: {
    state: 'idle',
    transcript: TRANSCRIPT,
    onStart: fn(),
    onStop: fn(),
    onSend: fn(),
    onDiscard: fn(),
    onRetry: fn(),
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'listening', 'transcribing', 'transcribingSlow', 'transcript', 'judging', 'judgingSlow', 'error'],
    },
    getLevel: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof VoiceInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  name: 'state=idle',
  args: {
    state: 'idle',
    idleActions: (
      <Button variant="Tertiary" size="M">
        I don&rsquo;t know the answer
      </Button>
    ),
  },
  play: async ({ canvas, args }) => {
    // The instruction is the label's job again, Sep 2026: the middle carries the solid glyph.
    // Every state's middle is rendered at once and faded, so the others are in the DOM here.
    await expect(canvas.getByRole('status')).toHaveTextContent('Tap to answer');
    // Idle carries no second line: the encouragement moved into the question bubble, Sep 2026.
    await expect(canvas.queryByText('Even a partial answer is a great start')).toBeNull();
    const ring = canvas.getByRole('button', { name: 'Start answering' });
    const box = ring.getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(box.height).toBeGreaterThanOrEqual(44);
    // The label is above the ring and the escape below it.
    const label = canvas.getByRole('status').getBoundingClientRect();
    const escape = canvas.getByRole('button', { name: 'I don’t know the answer' }).getBoundingClientRect();
    await expect(label.bottom).toBeLessThanOrEqual(box.top);
    await expect(escape.top).toBeGreaterThanOrEqual(box.bottom);
    await expect(canvas.queryByRole('button', { name: 'Discard and start over' })).toBeNull();
    await userEvent.click(ring);
    await expect(args.onStart).toHaveBeenCalledOnce();
  },
};

export const Listening: Story = {
  name: 'state=listening',
  args: {
    state: 'listening',
    idleActions: (
      <Button variant="Tertiary" size="M">
        I don&rsquo;t know the answer
      </Button>
    ),
  },
  render: function Render(args) {
    const getLevel = useMemo(() => createSpeechLevel(), []);
    return <VoiceInput {...args} getLevel={getLevel} />;
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Knowie’s listening…');
    // Idle's escape keeps its space but is out of reach while listening.
    await expect(canvas.queryByRole('button', { name: 'I don’t know the answer' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Discard and start over' }));
    await expect(args.onDiscard).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole('button', { name: 'Stop recording' }));
    await expect(args.onStop).toHaveBeenCalledOnce();
  },
};

export const Transcribing: Story = {
  name: 'state=transcribing',
  args: { state: 'transcribing' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Knowie’s writing down what you said…');
    await expect(canvas.getByRole('button', { name: 'Knowie’s writing down what you said…' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Discard and start over' })).toBeEnabled();
  },
};

export const TranscribingSlow: Story = {
  name: 'state=transcribingSlow',
  args: { state: 'transcribingSlow' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Knowie’s still writing, nearly there…');
  },
};

export const Transcript: Story = {
  name: 'state=transcript',
  args: { state: 'transcript' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(TRANSCRIPT)).toBeInTheDocument();
    await expect(canvas.getByRole('status')).toHaveTextContent('Check it, then send');
    await userEvent.click(canvas.getByRole('button', { name: 'Send answer' }));
    await expect(args.onSend).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole('button', { name: 'Discard and start over' }));
    await expect(args.onDiscard).toHaveBeenCalledOnce();
  },
};

export const LongTranscript: Story = {
  name: 'state=transcript, long',
  args: {
    state: 'transcript',
    transcript: `${TRANSCRIPT} The plates float on the asthenosphere, which is soft enough to flow slowly, so where two plates pull apart new crust forms and where they push together one sinks under the other.`,
  },
  play: async ({ canvas }) => {
    // The card grows with its words rather than clipping them.
    const text = canvas.getByText(/asthenosphere/);
    const card = text.parentElement!.getBoundingClientRect();
    const words = text.getBoundingClientRect();
    await expect(words.bottom).toBeLessThanOrEqual(card.bottom);
    await expect(canvas.getByRole('button', { name: 'Send answer' })).toBeVisible();
  },
};

const LONGER_TRANSCRIPT = `${TRANSCRIPT} Where two plates pull apart, new crust forms along the ridge.`;

export const TranscriptGrowsAfterSizing: Story = {
  name: 'state=transcript, text grows after sizing',
  args: { state: 'transcript' },
  render: function Render(args) {
    // Half again as long (past the 40% expansion rule), swapped in after the card has already sized itself.
    const [text, setText] = useState(TRANSCRIPT);
    useEffect(() => {
      const t = setTimeout(() => setText(LONGER_TRANSCRIPT), 300);
      return () => clearTimeout(t);
    }, []);
    return <VoiceInput {...args} transcript={text} />;
  },
  play: async ({ canvas }) => {
    const text = await canvas.findByText(/new crust forms/);
    const card = text.parentElement!;
    const stage = card.parentElement!;
    await waitFor(
      async () => {
        await expect(card.scrollHeight).toBeLessThanOrEqual(card.clientHeight);
        await expect(card.getBoundingClientRect().bottom).toBeLessThanOrEqual(stage.getBoundingClientRect().bottom);
      },
      { timeout: 2000 },
    );
  },
};

export const Judging: Story = {
  name: 'state=judging',
  args: { state: 'judging' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Knowie’s reading your answer…');
    // Discard works from the wait too, and returns to idle.
    await userEvent.click(canvas.getByRole('button', { name: 'Discard and start over' }));
    await expect(args.onDiscard).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('button', { name: 'Send answer' })).toBeNull();
  },
};

export const JudgingSlow: Story = {
  name: 'state=judgingSlow',
  args: { state: 'judgingSlow' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Knowie’s still reading, nearly there…');
  },
};

export const ErrorState: Story = {
  name: 'state=error',
  args: { state: 'error' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Small glitch. Tap to send again');
    await userEvent.click(canvas.getByRole('button', { name: 'Send again' }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

/** The whole turn on short mock timings, driven by the component's own callbacks. */
export const FullTurn: Story = {
  name: 'Full turn',
  render: function Render(args) {
    const [state, setState] = useState<VoiceInputState>('idle');
    const getLevel = useMemo(() => createSpeechLevel(), []);
    useEffect(() => {
      if (state === 'transcribing') {
        const t = setTimeout(() => setState('transcript'), 1200);
        return () => clearTimeout(t);
      }
      if (state === 'judging') {
        const t = setTimeout(() => setState('idle'), 1200);
        return () => clearTimeout(t);
      }
    }, [state]);
    return (
      <VoiceInput
        {...args}
        state={state}
        getLevel={getLevel}
        onStart={() => setState('listening')}
        onStop={() => setState('transcribing')}
        onSend={() => setState('judging')}
        onDiscard={() => setState('idle')}
        onRetry={() => setState('judging')}
      />
    );
  },
  play: async ({ canvas }) => {
    const status = canvas.getByRole('status');
    await userEvent.click(canvas.getByRole('button', { name: 'Start answering' }));
    await expect(status).toHaveTextContent('Knowie’s listening…');
    await userEvent.click(canvas.getByRole('button', { name: 'Stop recording' }));
    await expect(status).toHaveTextContent('Knowie’s writing down what you said…');
    await waitFor(() => expect(status).toHaveTextContent('Check it, then send'), { timeout: 3000 });
    await userEvent.click(canvas.getByRole('button', { name: 'Send answer' }));
    await expect(status).toHaveTextContent('Knowie’s reading your answer…');
    await waitFor(() => expect(status).toHaveTextContent('Tap to answer'), { timeout: 3000 });
  },
};
