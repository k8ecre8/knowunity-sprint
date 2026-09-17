import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import {
  ProgressIndicator,
  type ProgressIndicatorProgress,
  type ProgressIndicatorThickness,
  type ProgressIndicatorVariant,
} from './ProgressIndicator';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> A horizontal progress bar with an optional count label. Twenty variants: Primary or Coral, 16 or 24 thick, in five progress steps.
>
> **USE:** position in a multi-step session. Every use in the example screens is Primary at thickness 16, inside an appBar slot.
>
> **DON'T:** treat the five progress steps as the full range. 0, 25, 50, 75 and 100 are design references; real progress needs the bar driven directly.
>
> **NOTE:** the variant property is named Coral, an appearance word, where every other component in this file names variants by role.

---

### How this build differs from the Figma set

**The bar is driven directly with \`current\` and \`total\`.** That is the DON'T above, made a prop. Both are code-only; given together, they set the fill and the count label, and \`progress\` is ignored. \`progress\` keeps Figma's five options as the design references they are.

**\`showText\` needs a count and a thick bar.** The label is "3/12", a count, so it renders only when \`current\` and \`total\` are given. The thickness-16 masters have no text layer, so \`showText\` does nothing at 16 — one axis ignoring another. It is Caption S Bold, 9px, which its own type token marks as below the readable minimum, so it is hidden from assistive tech and the bar carries the count as \`aria-valuetext\` instead.

**Progress 0 is a dot, not an empty track.** The fill never goes narrower than it is tall, as every progress-0 master draws it.

**Width fills the parent.** 350 is the master's size, not a rule.

**Thickness 16 is \`Control/400\`,** added Sep 2026: 16 was on no scale. Thickness 24 is \`Control/600\`, inset by \`Space/050\` so the \`background/stacking\` track shows as a rim.

**The fill animates** at \`motion.duration.base\` when progress changes, which drops to 1ms in reduced-motion mode. The masters are static.

**\`variant\` keeps \`Coral\`,** per the NOTE: renaming it would break parity with the file. Primary fills \`accent/brand/bold\`, Coral \`accent/coral/bold\`.

**Code-only \`label\`** is the progress bar's accessible name, defaulting to "Session progress".

**Known gap, Figma only:** \`progressIndicator\` instances come in 28px tall on a 16px bar because the wrapper does not hug. This build is fixed at the token height, so it does not inherit that.
`;

const meta = {
  title: 'Components/progressIndicator',
  component: ProgressIndicator,
  tags: ['autodocs'],
  args: { variant: 'Primary', thickness: '24', progress: '0', showText: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['Primary', 'Coral'] },
    thickness: { control: 'inline-radio', options: ['24', '16'] },
    progress: { control: 'inline-radio', options: ['0', '25', '50', '75', '100'] },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const variantStory = (
  variant: ProgressIndicatorVariant,
  thickness: ProgressIndicatorThickness,
  progress: ProgressIndicatorProgress,
): Story => ({
  name: `variant=${variant}, thickness=${thickness}, progress=${progress}`,
  args: { variant, thickness, progress },
  play: async ({ canvas, canvasElement }) => {
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', progress);
    await expect(getComputedStyle(bar).height).toBe(`${thickness}px`);
    const fill = canvasElement.querySelector('[data-part="fill"]') as HTMLElement;
    const container = fill.parentElement as HTMLElement;
    const fillBox = fill.getBoundingClientRect();
    const containerBox = container.getBoundingClientRect();
    // At 0 the fill is a dot as wide as it is tall; otherwise it is the share.
    const expected = Math.max(containerBox.height, (containerBox.width * Number(progress)) / 100);
    await expect(Math.abs(fillBox.width - expected)).toBeLessThan(1);
  },
});

export const Primary24Progress0 = variantStory('Primary', '24', '0');
export const Primary24Progress25 = variantStory('Primary', '24', '25');
export const Primary24Progress50 = variantStory('Primary', '24', '50');
export const Primary24Progress75 = variantStory('Primary', '24', '75');
export const Primary24Progress100 = variantStory('Primary', '24', '100');
export const Primary16Progress0 = variantStory('Primary', '16', '0');
export const Primary16Progress25 = variantStory('Primary', '16', '25');
export const Primary16Progress50 = variantStory('Primary', '16', '50');
export const Primary16Progress75 = variantStory('Primary', '16', '75');
export const Primary16Progress100 = variantStory('Primary', '16', '100');
export const Coral24Progress0 = variantStory('Coral', '24', '0');
export const Coral24Progress25 = variantStory('Coral', '24', '25');
export const Coral24Progress50 = variantStory('Coral', '24', '50');
export const Coral24Progress75 = variantStory('Coral', '24', '75');
export const Coral24Progress100 = variantStory('Coral', '24', '100');
export const Coral16Progress0 = variantStory('Coral', '16', '0');
export const Coral16Progress25 = variantStory('Coral', '16', '25');
export const Coral16Progress50 = variantStory('Coral', '16', '50');
export const Coral16Progress75 = variantStory('Coral', '16', '75');
export const Coral16Progress100 = variantStory('Coral', '16', '100');

/** The count label on, driven by a real count as the masters' "3/12" sample. */
export const ShowText: Story = {
  name: 'variant=Primary, thickness=24, showText',
  args: { thickness: '24', showText: true, current: 3, total: 12 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('3/12')).toBeVisible();
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 of 12');
  },
};

/** showText does nothing at 16: the masters have no text layer there. */
export const ShowTextIgnoredAt16: Story = {
  name: 'variant=Primary, thickness=16, showText (ignored)',
  args: { thickness: '16', showText: true, current: 3, total: 12 },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('3/12')).toBeNull();
  },
};

/** Real progress, off the five steps: 7 of 12 in a session, as it sits in an appBar. */
export const DrivenDirectly: Story = {
  name: 'variant=Primary, thickness=16, current=7, total=12',
  args: { thickness: '16', current: 7, total: 12 },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toHaveAttribute('aria-valuenow', '58');
    await expect(bar).not.toHaveAttribute('data-progress');
  },
};
