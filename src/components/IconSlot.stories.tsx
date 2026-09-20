import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { IconSlot, iconNames } from './IconSlot';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> A fixed-size box holding one swappable icon. Six sizes from 8 to 32px, matching the Icon ramp.
>
> **USE:** anywhere an icon sits inside another component. This is the most-used component in the file at 165 instances, most of them nested inside chips.
>
> **DON'T:** set the size on the slot itself — the parent is meant to drive it.
>
> **GUESS:** the DON'T follows from the property being named "Size (IGNORE)". The property works and its options map exactly to the Icon tokens, so I do not know what the IGNORE is protecting against.

---

### How this build differs from the Figma set

**There are seven sizes, not six, and they run 8 to 40px.** The description predates \`Size (IGNORE)=500\`, which \`design-system.md\` records as added this sprint for the leading icon in \`listItem\` Filled.

**\`Size (IGNORE)\` became \`size\`,** because the Figma name is not a valid identifier. The option values are Figma's, unchanged. The DON'T resolves cleanly in code: a prop *is* the parent driving the size, which is exactly what the description asks for.

**The instance-swap property became \`name\`,** a union of 73 glyph names: the 69 on the Figma slot, three code-only additions, and one drawn locally, defaulting to \`check\`. Seventy-two resolve to an export in \`@untitled-ui/icons-react\`, so the Figma glyph and the built glyph are the same drawing. The exception is \`microphone-01-solid\`, which has no Figma counterpart: Untitled UI's free tier is line-only and voiceInput's filled idle button needed a solid glyph (see \`./icons/README.md\`). (\`plus\` was added for summaryCard's overflow row, and \`dots-vertical\` and \`share-02\` for appBar. Those three are still missing from the Figma list of 69: the \`plus\` its masters use is an unpublished orphan that cannot be put on the swap list, so parity waits on published copies of all three being imported.) A glyph outside that list is a gap to report, not something to source elsewhere — which is why there is no \`children\` escape hatch.

**The stroke is a constant 2px at every size.** Figma renders 2px at six of its seven sizes; the 32px variant renders 2.667 because its inner icon is bound to \`Icon/300\` and scaled up. That is a bug in the master, not a decision, so it is deliberately not reproduced. \`vector-effect: non-scaling-stroke\` holds the package's own stroke width steady across the ramp.

**There is no colour prop, by design.** \`design-system.md\`: *"iconSlot has no colour property on purpose: 325 instances carry 16 different bindings, and a tone axis would multiply the set by that."* The glyph draws in \`currentColor\`, so it inherits from whatever it sits inside — which also removes the Figma problem where swapping a glyph drops its colour binding.

**\`label\` is a code-only addition, and it renders nothing on screen.** It sets \`role="img"\` and \`aria-label\`, so it changes only what a screen reader announces — a named slot and a decorative one look identical. Slots are \`aria-hidden\` by default, because an icon inside another component normally repeats the label sitting next to it. Name one only when the icon carries the meaning alone, as in an icon-only control.
`;

const meta = {
  title: 'Components/iconSlot',
  component: IconSlot,
  tags: ['autodocs'],
  args: { size: '400', name: 'check' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['100', '150', '200', '250', '300', '400', '500'],
    },
    name: { control: 'select', options: iconNames },
  },
  parameters: {
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof IconSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- the size axis ----------------------------------------------------- */

export const Size100: Story = {
  name: 'Size (IGNORE)=100',
  args: { size: '100' },
};

export const Size150: Story = {
  name: 'Size (IGNORE)=150',
  args: { size: '150' },
};

export const Size200: Story = {
  name: 'Size (IGNORE)=200',
  args: { size: '200' },
};

export const Size250: Story = {
  name: 'Size (IGNORE)=250',
  args: { size: '250' },
};

export const Size300: Story = {
  name: 'Size (IGNORE)=300',
  args: { size: '300' },
};

/** The default variant in Figma. */
export const Size400: Story = {
  name: 'Size (IGNORE)=400',
  args: { size: '400' },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('span[aria-hidden="true"]');
    await expect(slot).not.toBeNull();
    // The box resolves to Icon/400, and the glyph fills it.
    await expect(getComputedStyle(slot as Element).width).toBe('32px');
    await expect(slot!.querySelector('svg')).not.toBeNull();

    // The glyph draws in currentColor, so the slot has to inherit a real
    // colour from its surroundings. The browser default is black, which is
    // invisible against background/page — that is exactly what hid every
    // unwrapped slot story until the canvas set a text colour.
    await expect(getComputedStyle(slot as Element).color).not.toBe('rgb(0, 0, 0)');
  },
};

export const Size500: Story = {
  name: 'Size (IGNORE)=500',
  args: { size: '500' },
};

/* --- not Figma variants ------------------------------------------------ */

/** Every glyph on the Figma slot's swap property, at Icon/300. */
export const AllGlyphs: Story = {
  name: 'All glyphs',
  parameters: { viewport: { value: undefined } },
  render: () => (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--primitive-space-400)',
        margin: 'var(--primitive-space-0)',
        padding: 'var(--primitive-space-0)',
        listStyle: 'none',
        color: 'var(--semantic-text-primary)',
      }}
    >
      {iconNames.map((name) => (
        <li
          key={name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--primitive-space-200)',
          }}
        >
          <IconSlot size="300" name={name} />
          <span
            style={{
              fontFamily: 'var(--typeScale-caption-m-regular-fontFamily)',
              fontSize: 'var(--typeScale-caption-m-regular-fontSize)',
              lineHeight: 'var(--typeScale-caption-m-regular-lineHeight)',
              color: 'var(--semantic-text-secondary)',
            }}
          >
            {name}
          </span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvas }) => {
    // The swap list's 69, plus three code-only glyphs from the package, plus one drawn
    // locally (`microphone-01-solid`, Sep 2026 — see ./icons/README.md): 73.
    await expect(iconNames).toHaveLength(73);
    await expect(canvas.getByText('microphone-01')).toBeVisible();
    // The ten added Sep 2026 to clear the screens' placeholders.
    for (const name of [
      'globe-01',
      'target-04',
      'book-open-02',
      'clipboard-check',
      'thumbs-up',
      'lock-01',
      'trophy-02',
      'list',
      'graduation-hat-02',
      'upload-cloud-02',
    ]) {
      await expect(canvas.getByText(name)).toBeVisible();
    }
  },
};

/**
 * The slot has no colour of its own. Each row sets `color` on the parent and
 * the glyph follows, which is what replaces Figma's per-vector binding.
 */
export const ColourInherits: Story = {
  name: 'Colour inherits from the parent',
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 'var(--primitive-space-400)',
        alignItems: 'center',
      }}
    >
      <span style={{ color: 'var(--semantic-text-primary)' }}>
        <IconSlot size="300" name="check" />
      </span>
      <span style={{ color: 'var(--semantic-feedback-success-bold)' }}>
        <IconSlot size="300" name="check-circle" />
      </span>
      <span style={{ color: 'var(--semantic-feedback-error-bold)' }}>
        <IconSlot size="300" name="x-circle" />
      </span>
      <span style={{ color: 'var(--semantic-text-tertiary)' }}>
        <IconSlot size="300" name="clock" />
      </span>
    </div>
  ),
};

const captionStyle = {
  fontFamily: 'var(--typeScale-caption-m-regular-fontFamily)',
  fontSize: 'var(--typeScale-caption-m-regular-fontSize)',
  lineHeight: 'var(--typeScale-caption-m-regular-lineHeight)',
  color: 'var(--semantic-text-secondary)',
} as const;

/**
 * `label` is an accessible name, not visible text: it renders nothing on
 * screen. Both rows below look the same on purpose — the only difference is
 * what a screen reader announces. The captions are part of the story, not the
 * component.
 *
 * Decorative is the default, because an icon inside another component repeats
 * what the label beside it already says. Name it only when the icon carries
 * the meaning alone, as in an icon-only control.
 */
export const Labelled: Story = {
  name: 'With an accessible name',
  args: { size: '300', name: 'microphone-01', label: 'Start recording' },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--primitive-space-400)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--primitive-space-300)',
        }}
      >
        <IconSlot size={args.size} name={args.name} />
        <span style={captionStyle}>Decorative — announced as nothing</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--primitive-space-300)',
        }}
      >
        <IconSlot {...args} />
        <span style={captionStyle}>Named — announced as “{args.label}”</span>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    // Exactly one of the two slots reaches assistive tech, and it carries the
    // name. The decorative one is aria-hidden and must not appear at all.
    const named = canvas.getAllByRole('img');
    await expect(named).toHaveLength(1);
    await expect(named[0]).toHaveAccessibleName('Start recording');
  },
};
