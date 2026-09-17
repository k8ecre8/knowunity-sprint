import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { MascotSlot, mascotNames } from './MascotSlot';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> mascotSlot: a fixed square box that holds Knowie. Wherever Knowie appears, it sits in a mascotSlot; never place the artwork directly.
>
> **size:** XL (64, Illustration/800) | 2XL (120, Illustration/1500) | 3XL (200, Illustration/2500) | 4XL (320, Illustration/4000). Space/300 padding on every side, so the artwork never touches the box edge. The size is the box, not Knowie.
>
> **Expression:** swapped on the nested .mascotSlotBase (Homie). Default standby. Pick the face for what Knowie is reacting to; the slot does not choose.
>
> **USE:** the mascot on a screen, above or beside what Knowie says. Knowie's words go in responseBubble, never in the slot.
>
> **DON'T:** make Knowie speak. Knowie replies in text and has no voice, speech-bubble tail or audio.
>
> **DON'T:** scale an instance to a size between steps. Add an Illustration step and a variant.
>
> **DON'T:** recolour Knowie. mascot/* tokens are Knowie's own and never used by the interface; interface tokens never go on Knowie.
>
> **DON'T:** make the slot a button. It is decoration; the action belongs to a control beside it.
>
> Description drafted Sep 2026; the set had none.

---

### How this build differs from the Figma set

**\`name\` is the Homie swap.** Same pattern as \`IconSlot\`. It offers the twelve expressions in \`public/images/\`. Figma's swap list points at 16 faces in a library this file cannot reach, and \`dazed\`, a local master, has no asset, so it is left out.

**Knowie keeps its proportions.** The artwork is 200×217. The Figma masters stretch it to fill the square; the code uses \`object-fit: contain\` in the same box.

**Decorative by default.** The image is hidden from assistive tech unless you pass \`label\`, which has no Figma counterpart.
`;

const meta = {
  title: 'Components/mascotSlot',
  component: MascotSlot,
  tags: ['autodocs'],
  args: { size: 'XL', name: 'standby' },
  argTypes: {
    size: { control: 'inline-radio', options: ['XL', '2XL', '3XL', '4XL'] },
    name: { control: 'select', options: mascotNames },
  },
  parameters: {
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof MascotSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const slot = (el: HTMLElement) => el.querySelector('[data-size]') as HTMLElement;

export const XL: Story = {
  name: 'size=XL',
  args: { size: 'XL' },
  play: async ({ canvasElement }) => {
    const s = getComputedStyle(slot(canvasElement));
    // Illustration/800 box, Space/300 padding.
    await expect(s.width).toBe('64px');
    await expect(s.height).toBe('64px');
    await expect(s.paddingTop).toBe('12px');
  },
};

export const Size2XL: Story = {
  name: 'size=2XL',
  args: { size: '2XL' },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(slot(canvasElement)).width).toBe('120px');
  },
};

export const Size3XL: Story = {
  name: 'size=3XL',
  args: { size: '3XL' },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(slot(canvasElement)).width).toBe('200px');
  },
};

export const Size4XL: Story = {
  name: 'size=4XL',
  args: { size: '4XL' },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(slot(canvasElement)).width).toBe('320px');
    // 320 fits inside the 390 product width.
    await expect(slot(canvasElement).getBoundingClientRect().width).toBeLessThanOrEqual(390);
  },
};

/** Every face the Homie swap offers in code, at XL. Not a Figma variant. */
export const Expressions: Story = {
  name: 'Homie (all expressions)',
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--primitive-space-200)' }}>
      {mascotNames.map((name) => (
        <MascotSlot key={name} {...args} size="XL" name={name} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const imgs = [...canvasElement.querySelectorAll('img')];
    await expect(imgs).toHaveLength(mascotNames.length);
    // Every asset loads: a missing file would leave naturalWidth at 0.
    await Promise.all(imgs.map((img) => img.decode()));
    for (const img of imgs) await expect(img.naturalWidth).toBeGreaterThan(0);
  },
};

export const Labelled: Story = {
  name: 'label (code-only)',
  args: { size: '2XL', name: 'approving', label: 'Knowie approves' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Knowie approves' })).toBeVisible();
  },
};
