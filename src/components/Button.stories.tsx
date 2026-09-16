import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Button } from './Button';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
Four treatments. Text does not exist yet.

> **Primary:** interactive/primary fill, no stroke, lip.
> **Secondary:** interactive/secondary fill (translucent, so it takes on the colour of a tinted sheet), no stroke, lip.
> **Tertiary:** no fill, border/strong stroke, lip. The outlined variant, as shipped on the home screen.
> **Text:** no fill, no stroke, no lip. TO BUILD.
>
> **THE LIP.** A bottom edge that makes the button read as pressable. Depth follows control height: Elevation/Lip/sm on 48px (sizes S and M), Elevation/Lip/lg on 56px (size L).
>
> It is built two different ways, because a transparent button has no fill to darken:
> - Filled variants (Primary, Secondary): an INNER_SHADOW at the lip depth, applied to the component wrapper. Figma masks it to the child's shape, so the child must have a fill or nothing renders.
> - Outlined variant (Tertiary): a heavier bottom border. strokeBottomWeight is 2px at S and M, 3px at L, against a 1px border on the other three sides. This is roughly half the lip depth, not the full depth: a solid stroke at border/strong reads far heavier than a 15% inner shadow, so matching the numbers would over-weight it. Tuned by eye, not derived.
>
> **PRESS.** Anything with a lip: the lip goes to zero and the button sinks by the lip depth, achieved by moving the depth from paddingBottom to paddingTop on the wrapper. No colour change. Text, which has no lip, presses by filling with background/surface, no sink.
>
> Transition: motion/duration/instant.
>
> **FOCUS — OUTSTANDING.** There is no Focus state on any variant. This is a WCAG 2.2 gap, not a design choice: anyone using a Bluetooth keyboard, Switch Control or Voice Control on iOS needs a visible indicator of where they are.
>
> The tokens exist and are ready: border/focus for the colour, Focus/Width (2px, aliases Stroke/Heavy Border) for the ring, Focus/Offset (2px) for the gap.
>
> Two things to resolve when building it. The ring must wrap the lip as well as the pill, or it reads as floating off the bottom edge. And on Tertiary, which already carries a border/strong stroke, the ring becomes a second concentric outline — decide whether it replaces that stroke or sits outside it.
>
> Deferred deliberately during the design system pass, not overlooked.
>
> **DON'T:** use more than one Primary on a screen. It is the single action you want taken, and a second one makes neither read as the answer.
>
> **TONE.** Primary only, Default and Pressed states only. Success and Error are the action on the practice round's feedback sheet: "Continue" after a correct answer, "Got it" after an incorrect one. Fill feedback/{tone}/bold, label feedback/{tone}/onBold, lip unchanged. Measured from the shipped app. Whether the recall loop uses tone is not decided.
>
> **DON'T:** recolour an instance to make a destructive or a verdict button. For a verdict, use tone. There is no destructive variant in this product.
>
> **DON'T:** remove the lip to make a button look flatter. It is the only affordance telling a student the thing is pressable, and it is what moves when they press it.

---

### How this build differs from the Figma set

**Loading is not built.** The Figma Loading state hides the label and shows an \`iconSlot\` holding Untitled UI \`loading-01\` at 16/20/24px. This project has no \`iconSlot\` component, \`untitledui-js\` is not installed, and \`motion.duration\` has no rotation step for a spinner. Reported as a gap rather than worked around.

**\`showLeftIcon\` and \`showRightIcon\` are not built,** for the same reason: both slots are \`iconSlot\` instances, and icons are never placed directly.

**Text presses with no sink.** The 12 built Text variants shift by the lip depth on press, but both the Figma description and \`design-system.md\` say Text has no lip and presses by filling with background/surface alone. The description wins.

**Two tokens were added** for values the Figma set drew loose: \`primitive.control.800/1000/1200/1400\` (32/40/48/56, the control heights — 56 existed on no scale) and \`primitive.elevation.lip.outlined.sm/lg\` (2px/3px, the outlined lip).

**Focus is still outstanding.** The browser's own focus ring is left in place rather than removed, so keyboard and Switch Control users are not stranded, but the designed ring is not built. The two decisions named above are still open.
`;

const meta = {
  title: 'Components/button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Continue',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['Primary', 'Secondary', 'Tertiary', 'Text'],
    },
    size: { control: 'inline-radio', options: ['S', 'M', 'L'] },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Disabled'] },
    tone: { control: 'inline-radio', options: ['Default', 'Success', 'Error'] },
  },
  parameters: {
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- Primary ---------------------------------------------------------- */

export const PrimarySDefault: Story = {
  name: 'variant=Primary, size=S, state=Default, tone=Default',
  args: { variant: 'Primary', size: 'S' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const PrimaryMDefault: Story = {
  name: 'variant=Primary, size=M, state=Default, tone=Default',
  args: { variant: 'Primary', size: 'M' },
};

export const PrimaryLDefault: Story = {
  name: 'variant=Primary, size=L, state=Default, tone=Default',
  args: { variant: 'Primary', size: 'L' },
};

export const PrimaryMPressed: Story = {
  name: 'variant=Primary, size=M, state=Pressed, tone=Default',
  args: { variant: 'Primary', size: 'M', state: 'Pressed' },
};

export const PrimaryMDisabled: Story = {
  name: 'variant=Primary, size=M, state=Disabled, tone=Default',
  args: { variant: 'Primary', size: 'M', state: 'Disabled' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Continue' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const PrimaryMDefaultSuccess: Story = {
  name: 'variant=Primary, size=M, state=Default, tone=Success',
  args: { variant: 'Primary', size: 'M', tone: 'Success' },
};

export const PrimaryMPressedSuccess: Story = {
  name: 'variant=Primary, size=M, state=Pressed, tone=Success',
  args: { variant: 'Primary', size: 'M', state: 'Pressed', tone: 'Success' },
};

export const PrimaryMDefaultError: Story = {
  name: 'variant=Primary, size=M, state=Default, tone=Error',
  args: { variant: 'Primary', size: 'M', tone: 'Error', children: 'Got it' },
};

export const PrimaryMPressedError: Story = {
  name: 'variant=Primary, size=M, state=Pressed, tone=Error',
  args: { variant: 'Primary', size: 'M', state: 'Pressed', tone: 'Error', children: 'Got it' },
};

/* --- Secondary -------------------------------------------------------- */

export const SecondaryMDefault: Story = {
  name: 'variant=Secondary, size=M, state=Default, tone=Default',
  args: { variant: 'Secondary', size: 'M' },
};

export const SecondaryMPressed: Story = {
  name: 'variant=Secondary, size=M, state=Pressed, tone=Default',
  args: { variant: 'Secondary', size: 'M', state: 'Pressed' },
};

export const SecondaryMDisabled: Story = {
  name: 'variant=Secondary, size=M, state=Disabled, tone=Default',
  args: { variant: 'Secondary', size: 'M', state: 'Disabled' },
};

/* --- Tertiary --------------------------------------------------------- */

export const TertiaryMDefault: Story = {
  name: 'variant=Tertiary, size=M, state=Default, tone=Default',
  args: { variant: 'Tertiary', size: 'M' },
};

export const TertiaryMPressed: Story = {
  name: 'variant=Tertiary, size=M, state=Pressed, tone=Default',
  args: { variant: 'Tertiary', size: 'M', state: 'Pressed' },
};

export const TertiaryMDisabled: Story = {
  name: 'variant=Tertiary, size=M, state=Disabled, tone=Default',
  args: { variant: 'Tertiary', size: 'M', state: 'Disabled' },
};

/** Size L is the only place the outlined lip is 3px rather than 2px. */
export const TertiaryLDefault: Story = {
  name: 'variant=Tertiary, size=L, state=Default, tone=Default',
  args: { variant: 'Tertiary', size: 'L' },
};

/* --- Text ------------------------------------------------------------- */

export const TextMDefault: Story = {
  name: 'variant=Text, size=M, state=Default, tone=Default',
  args: { variant: 'Text', size: 'M', children: 'Skip' },
};

export const TextMPressed: Story = {
  name: 'variant=Text, size=M, state=Pressed, tone=Default',
  args: { variant: 'Text', size: 'M', state: 'Pressed', children: 'Skip' },
};

export const TextMDisabled: Story = {
  name: 'variant=Text, size=M, state=Disabled, tone=Default',
  args: { variant: 'Text', size: 'M', state: 'Disabled', children: 'Skip' },
};
