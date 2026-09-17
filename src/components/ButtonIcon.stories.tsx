import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { ButtonIcon } from './ButtonIcon';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> Four treatments. Text does not exist yet.
>
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
> **DON'T:** recolour an instance to make a destructive or a verdict button. There is no destructive variant in this product, and the red in the recall loop is feedback rather than a control — use verdictChip.
>
> **DON'T:** remove the lip to make a button look flatter. It is the only affordance telling a student the thing is pressable, and it is what moves when they press it.

---

### How this build differs from the Figma set

**Loading does not spin.** It swaps the glyph for \`loading-01\` and blocks presses (\`aria-busy\`), but the glyph is still. A rotation needs a duration \`motion.duration\` does not have, and the decision in Sep 2026 was not to add one.

**Primary has no stroke.** The Primary masters draw a \`border/default\` stroke; the description says "no stroke" and wins, matching \`button\`.

**Text presses with no sink.** The Text Pressed masters shift the pill by the lip depth; the description says Text has no lip and presses by filling with background/surface alone. The description wins, as it does on \`button\`.

**The glyph colour is set on the control.** Most masters draw the glyph in raw black, the dropped-binding problem in \`design-system.md\`. The glyph inherits \`interactive/onPrimary\` on Primary and \`text/primary\` elsewhere, the colours \`button\`'s label uses; Disabled drops it to \`text/disabled\`.

**Size is a token pair.** Pill 32 / 40 / 56 is \`Control/800\`, \`/1000\`, \`/1400\`; the glyph is \`iconSlot\` 200 / 250 / 300; the wrapper is \`Control/1200\` at S and M. No new tokens.

**The glyph swap is \`name\`,** defaulting to the masters' \`check\`. **\`label\` is code-only and required:** the glyph is the only thing carrying the meaning.
`;

const meta = {
  title: 'Components/buttonIcon',
  component: ButtonIcon,
  tags: ['autodocs'],
  args: {
    variant: 'Primary',
    size: 'M',
    state: 'Default',
    name: 'check',
    label: 'Done',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['Primary', 'Secondary', 'Tertiary', 'Text'] },
    size: { control: 'inline-radio', options: ['S', 'M', 'L'] },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Disabled', 'Loading'] },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof ButtonIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- Primary ---------------------------------------------------------- */

export const PrimarySDefault: Story = {
  name: 'variant=Primary, size=S, state=Default',
  args: { size: 'S' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Done' });
    const box = button.getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(box.height).toBeGreaterThanOrEqual(44);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const PrimaryMDefault: Story = {
  name: 'variant=Primary, size=M, state=Default',
};

export const PrimaryLDefault: Story = {
  name: 'variant=Primary, size=L, state=Default',
  args: { size: 'L' },
};

export const PrimaryMPressed: Story = {
  name: 'variant=Primary, size=M, state=Pressed',
  args: { state: 'Pressed' },
};

export const PrimaryMDisabled: Story = {
  name: 'variant=Primary, size=M, state=Disabled',
  args: { state: 'Disabled' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Done' });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const PrimaryMLoading: Story = {
  name: 'variant=Primary, size=M, state=Loading',
  args: { state: 'Loading' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Done' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/* --- Secondary -------------------------------------------------------- */

export const SecondaryMDefault: Story = {
  name: 'variant=Secondary, size=M, state=Default',
  args: { variant: 'Secondary' },
};

export const SecondaryLDefault: Story = {
  name: 'variant=Secondary, size=L, state=Default',
  args: { variant: 'Secondary', size: 'L', name: 'plus', label: 'Add' },
};

export const SecondaryMPressed: Story = {
  name: 'variant=Secondary, size=M, state=Pressed',
  args: { variant: 'Secondary', state: 'Pressed' },
};

export const SecondaryMDisabled: Story = {
  name: 'variant=Secondary, size=M, state=Disabled',
  args: { variant: 'Secondary', state: 'Disabled' },
};

export const SecondaryMLoading: Story = {
  name: 'variant=Secondary, size=M, state=Loading',
  args: { variant: 'Secondary', state: 'Loading' },
};

/* --- Tertiary --------------------------------------------------------- */

export const TertiaryMDefault: Story = {
  name: 'variant=Tertiary, size=M, state=Default',
  args: { variant: 'Tertiary' },
};

/** Size L is the only place the outlined lip is 3px rather than 2px. */
export const TertiaryLDefault: Story = {
  name: 'variant=Tertiary, size=L, state=Default',
  args: { variant: 'Tertiary', size: 'L' },
};

export const TertiaryMPressed: Story = {
  name: 'variant=Tertiary, size=M, state=Pressed',
  args: { variant: 'Tertiary', state: 'Pressed' },
};

export const TertiaryMDisabled: Story = {
  name: 'variant=Tertiary, size=M, state=Disabled',
  args: { variant: 'Tertiary', state: 'Disabled' },
};

export const TertiaryMLoading: Story = {
  name: 'variant=Tertiary, size=M, state=Loading',
  args: { variant: 'Tertiary', state: 'Loading' },
};

/* --- Text ------------------------------------------------------------- */

export const TextMDefault: Story = {
  name: 'variant=Text, size=M, state=Default',
  args: { variant: 'Text', name: 'microphone-01', label: 'Answer by voice' },
};

export const TextMPressed: Story = {
  name: 'variant=Text, size=M, state=Pressed',
  args: { variant: 'Text', state: 'Pressed', name: 'microphone-01', label: 'Answer by voice' },
};

export const TextMDisabled: Story = {
  name: 'variant=Text, size=M, state=Disabled',
  args: { variant: 'Text', state: 'Disabled', name: 'microphone-01', label: 'Answer by voice' },
};

export const TextMLoading: Story = {
  name: 'variant=Text, size=M, state=Loading',
  args: { variant: 'Text', state: 'Loading', name: 'microphone-01', label: 'Answer by voice' },
};
