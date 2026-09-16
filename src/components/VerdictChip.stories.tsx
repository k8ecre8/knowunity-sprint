import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { VerdictChip } from './VerdictChip';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> The per-turn verdict pill. Four tones, one per outcome of an answer.
>
> **USE:** directly above Knowie's response text in the turn loop, reporting how the last answer was judged.
>
> **DON'T:** use it as a filter or a tag — that is what chips is for. A verdict pill says something was assessed.
>
> **TOKENS:** each tone pairs feedback/<tone>/bold as the fill with feedback/<tone>/onBold as the label and icon. Skipped uses background/inverse and text/inverse, because a skip is not a judgement.
>
> **BUILT FROM:** a detached chips size=S, so the geometry is Knowunity's — 32 tall, 12px side padding, 4px gap, a 16px leading icon slot.
>
> **ICONS (resolved Sep 2026):** check, refresh-cw-01, x-close, skip-forward, via the leading iconSlot; Incorrect uses a cross rather than the arrow first proposed. The icon strokes were raw black until Sep 2026 and are now bound to feedback/<tone>/onBold (text/inverse for Skipped), matching TOKENS above. The hidden trailing iconSlot is inherited from chips and has no property.

---

### How this build differs from the Figma set

**The icon takes the label colour.** It is an \`IconSlot\` inheriting \`color\`, so it renders in feedback/<tone>/onBold — which is now also what the masters do, since their strokes were rebound in Sep 2026. Before that they were raw black.

**Label and glyph are fixed per tone.** The set has no text or swap property; each variant bakes in "Correct", "Almost there", "Try again", "Skipped" and its glyph. The code does the same, with no override.

**The hidden trailing icon slot is not built.** It is inherited from chips and no property reveals it.

**Height is \`Control/800\`.** The 32 is a loose number in Figma; it is the same step as the button pill at size S.
`;

const meta = {
  title: 'Components/verdictChip',
  component: VerdictChip,
  tags: ['autodocs'],
  args: { tone: 'Correct' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['Correct', 'Partial', 'Incorrect', 'Skipped'] },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof VerdictChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Correct: Story = {
  name: 'tone=Correct',
  args: { tone: 'Correct' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Correct')).toBeVisible();
    const chip = canvasElement.querySelector('[data-tone]') as HTMLElement;
    await expect(getComputedStyle(chip).height).toBe('32px');
    // The icon inherits the label colour rather than the file's raw black.
    const svg = chip.querySelector('svg') as SVGElement;
    await expect(getComputedStyle(svg).color).toBe(getComputedStyle(chip).color);
  },
};

export const Partial: Story = {
  name: 'tone=Partial',
  args: { tone: 'Partial' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Almost there')).toBeVisible();
  },
};

export const Incorrect: Story = {
  name: 'tone=Incorrect',
  args: { tone: 'Incorrect' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Try again')).toBeVisible();
  },
};

export const Skipped: Story = {
  name: 'tone=Skipped',
  args: { tone: 'Skipped' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Skipped')).toBeVisible();
  },
};
