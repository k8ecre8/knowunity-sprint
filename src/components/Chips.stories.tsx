import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Chips } from './Chips';
import { iconNames } from './IconSlot';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> A small pill carrying a short label, with optional icons either side. Sizes XXS through M, in Primary or pro, with an active state. Each icon sits in an iconSlot.
>
> **USE:** topic tags, filters and counts. In the example screens it appears in horizontal chipsGroup rows and inside the top navigation.
>
> **DON'T:** use it for verdicts. The color property offers only Primary and pro, so there is no success, error, warning, info or partial tone, and recolouring an instance breaks the link to the system.
>
> **NOTE:** the property named color mixes a role (Primary) with a product tier (pro). It is closer to a tone property than a colour one.

---

### How this build differs from the Figma set

**It is built on \`IconSlot\`,** stepping down with the chip: 150 at XXS and XS, 200 at S, 250 at M. \`leftIcon\` and \`rightIcon\` are the two swap properties, both defaulting to \`check\` as the masters do.

**The icons take the label colour.** The slot inherits \`color\` from the chip, so an icon always matches the text beside it: \`text/primary\` when inactive, \`interactive/onPrimary\` on active Primary, \`pro/onBold\` on active pro. The masters' 32 icon strokes were raw black and unbound until Sep 2026, when they were rebound to those same tokens — so the file and the code now agree.

**Two heights are new tokens.** XXS (20) and XS (24) were loose numbers with no step on any scale; they are now \`Control/500\` and \`Control/600\`, next to the S and M heights the button already used. Added Sep 2026.

**\`active\` keeps the file's string values,** \`'False'\` and \`'True'\`, rather than a boolean, so the prop's options match the Figma variant's exactly.

**\`onClick\` is code-only.** A filter is pressed; a tag or count is not. With a handler the chip is a \`<button>\` carrying \`aria-pressed\` from \`active\`; without one it is a plain span. \`Text\` is \`children\`.

**The M-size icon in the file is a 16px glyph scaled to 20,** rendering a 2.5px stroke — the same fault as the 32px iconSlot had. \`IconSlot\` renders one stroke weight at every size, so the code does not reproduce it.

**Caption S Bold at XXS and XS is 12px,** which the type token itself flags as below the readable minimum. The code follows the file; the type scale is where that decision lives.
`;

const meta = {
  title: 'Components/chips',
  component: Chips,
  tags: ['autodocs'],
  args: { children: 'Algebra', size: 'XXS', color: 'Primary', active: 'False' },
  argTypes: {
    size: { control: 'inline-radio', options: ['XXS', 'XS', 'S', 'M'] },
    color: { control: 'inline-radio', options: ['Primary', 'pro'] },
    active: { control: 'inline-radio', options: ['False', 'True'] },
    leftIcon: { control: 'select', options: iconNames },
    rightIcon: { control: 'select', options: iconNames },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof Chips>;

export default meta;
type Story = StoryObj<typeof meta>;

const chip = (el: HTMLElement) => el.querySelector('[data-size]') as HTMLElement;

/* --- Primary ---------------------------------------------------------- */

export const XXSPrimaryFalse: Story = {
  name: 'size=XXS, color=Primary, active=False',
  args: { size: 'XXS', color: 'Primary', active: 'False' },
  play: async ({ canvasElement }) => {
    // Control/500, and both icons on by default.
    const c = chip(canvasElement);
    await expect(getComputedStyle(c).height).toBe('20px');
    await expect(c.querySelectorAll('svg')).toHaveLength(2);
  },
};

export const XXSPrimaryTrue: Story = {
  name: 'size=XXS, color=Primary, active=True',
  args: { size: 'XXS', color: 'Primary', active: 'True' },
};

export const XSPrimaryFalse: Story = {
  name: 'size=XS, color=Primary, active=False',
  args: { size: 'XS', color: 'Primary', active: 'False' },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(chip(canvasElement)).height).toBe('24px');
  },
};

export const XSPrimaryTrue: Story = {
  name: 'size=XS, color=Primary, active=True',
  args: { size: 'XS', color: 'Primary', active: 'True' },
};

export const SPrimaryFalse: Story = {
  name: 'size=S, color=Primary, active=False',
  args: { size: 'S', color: 'Primary', active: 'False' },
};

export const SPrimaryTrue: Story = {
  name: 'size=S, color=Primary, active=True',
  args: { size: 'S', color: 'Primary', active: 'True' },
};

export const MPrimaryFalse: Story = {
  name: 'size=M, color=Primary, active=False',
  args: { size: 'M', color: 'Primary', active: 'False' },
};

export const MPrimaryTrue: Story = {
  name: 'size=M, color=Primary, active=True',
  args: { size: 'M', color: 'Primary', active: 'True' },
};

/* --- pro -------------------------------------------------------------- */

export const XXSProFalse: Story = {
  name: 'size=XXS, color=pro, active=False',
  args: { size: 'XXS', color: 'pro', active: 'False' },
};

export const XXSProTrue: Story = {
  name: 'size=XXS, color=pro, active=True',
  args: { size: 'XXS', color: 'pro', active: 'True' },
};

export const XSProFalse: Story = {
  name: 'size=XS, color=pro, active=False',
  args: { size: 'XS', color: 'pro', active: 'False' },
};

export const XSProTrue: Story = {
  name: 'size=XS, color=pro, active=True',
  args: { size: 'XS', color: 'pro', active: 'True' },
};

export const SProFalse: Story = {
  name: 'size=S, color=pro, active=False',
  args: { size: 'S', color: 'pro', active: 'False' },
};

export const SProTrue: Story = {
  name: 'size=S, color=pro, active=True',
  args: { size: 'S', color: 'pro', active: 'True' },
};

export const MProFalse: Story = {
  name: 'size=M, color=pro, active=False',
  args: { size: 'M', color: 'pro', active: 'False' },
};

export const MProTrue: Story = {
  name: 'size=M, color=pro, active=True',
  args: { size: 'M', color: 'pro', active: 'True' },
  play: async ({ canvasElement }) => {
    // Inactive pro looks like inactive Primary; only active carries the tier colour.
    const c = chip(canvasElement);
    await expect(getComputedStyle(c).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

/* --- property states -------------------------------------------------- */

/** A filter: pressable, with aria-pressed from `active`. */
export const Filter: Story = {
  name: 'size=S, color=Primary, active=True, onClick',
  args: { size: 'S', color: 'Primary', active: 'True', showLeftIcon: false, showRightIcon: false, onClick: fn(), children: 'Fractions' },
  play: async ({ canvas, args }) => {
    const b = canvas.getByRole('button', { name: 'Fractions', pressed: true });
    await userEvent.click(b);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** A count: no icons, not pressable. */
export const Count: Story = {
  name: 'size=XXS, color=Primary, showLeftIcon=false, showRightIcon=false',
  args: { size: 'XXS', showLeftIcon: false, showRightIcon: false, children: '12' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(chip(canvasElement).querySelectorAll('svg')).toHaveLength(0);
  },
};
