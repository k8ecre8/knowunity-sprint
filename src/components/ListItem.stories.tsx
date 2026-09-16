import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { ListItem } from './ListItem';
import { iconNames } from './IconSlot';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> **OUTLINED (added Sep 2026, replaces the retired listItemOutlined):** the list-item equivalent of button Tertiary, matching the outlined row on the app home and the single-choice rows in exam plan onboarding. No fill, border/strong 1px, 3px bottom lip, radius 24 (Radius/600).
> - Pressed: lip collapses to 1px and the content sinks 2px (paddingTop +2, paddingBottom -2), same rule as button Tertiary.
> - Selected: background/surface fill, no stroke, no lip. In the app this is a moment, not a resting state: press sinks, release fills, then the screen advances. Same idiom as the chosen grade in the grade picker.
> - No Switch trailing, mirroring Filled.
>
> **RESTORE NOTES:** this set was restored from Knowunity's remote listItem. Nested Icon Slot orphans were replaced with local iconSlot (24/32/40; 40 is the new Icon/500). Leading placeholder glyph is graduation-hat-02 because -01 is not reachable. Fixed widths and an absolute-positioned frame from the restore were set to fill so rows resize.
>
> **OUTLINED COMPACT (added Sep 2026):** Outlined at the Filled Compact size (60 tall, 12/16 padding, 32px leading icon). Same Default / Pressed / Selected rules as Outlined. Intended for the plan-home section row and any dense outlined list.

---

### How this build differs from the Figma set

**48 of 63 variants.** \`trailing\` offers Icon, Icon & Text and None. Switch and Checkbox nest components that do not exist in code yet, and \`showIllustration\` nests \`illustrationSlot\`, which doesn't either. All three are in Known gaps rather than approximated.

**Three row heights are tokens now.** Rows are fixed-height with clipping, as the file draws them: 56 was already \`Control/1400\`; 60 and 72 were loose and are now \`Control/1500\` and \`Control/1800\` (added Sep 2026). A Compact row still cuts its subtitle — that is the file's behaviour and the doc's warning.

**Knowunity's own states are followed literally, and they are uneven.** The description covers only Outlined. From the geometry: Transparent Pressed fills with surface and rounds to Radius/600; Transparent Selected is identical to Default; Filled Pressed is identical to Default; and Filled Selected flips to background/inverse **only with trailing None** — Icon and Icon & Text stay surface. The code does exactly that. Text on the inverse rows uses the inverse pair; the file does not say what it does there.

**Outlined Selected has no lip.** The file keeps an inner-shadow effect on that variant, which with a surface fill would draw one; the description says "no lip" and the description wins.

**Leading and trailing glyphs default to \`check\`.** The file's leading placeholder is \`graduation-hat-02\`, which is not on the iconSlot swap list; the trailing slot is unswapped. Pass \`leadingIcon\` / \`trailingIcon\` for the real ones.

**The image slot has no placeholder fill.** The file binds it to \`feedback/info\`, a variable with no leaf in tokens.json. With \`imageSrc\` it shows the image; without, it is an empty box.

**\`onClick\` decides the element.** With a handler the row is a \`<button>\` carrying \`aria-pressed\` from Selected; without, a plain row.
`;

const meta = {
  title: 'Components/listItem',
  component: ListItem,
  tags: ['autodocs'],
  args: { variant: 'Transparent', trailing: 'Icon', state: 'Default' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['Filled', 'Filled Compact', 'Transparent', 'Outlined', 'Outlined Compact'] },
    trailing: { control: 'inline-radio', options: ['Icon', 'Icon & Text', 'None'] },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Selected'] },
    leadingIcon: { control: 'select', options: iconNames },
    trailingIcon: { control: 'select', options: iconNames },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = (el: HTMLElement) => el.querySelector('[data-variant]') as HTMLElement;

/* --- Transparent -------------------------------------------------------- */

export const TransparentDefault: Story = {
  name: 'trailing=Icon, variant=Transparent, state=Default',
  args: { variant: 'Transparent', state: 'Default' },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(row(canvasElement)).height).toBe('56px');
  },
};
export const TransparentPressed: Story = {
  name: 'trailing=Icon, variant=Transparent, state=Pressed',
  args: { variant: 'Transparent', state: 'Pressed' },
};
export const TransparentSelected: Story = {
  name: 'trailing=Icon, variant=Transparent, state=Selected',
  args: { variant: 'Transparent', state: 'Selected' },
};
export const TransparentIconText: Story = {
  name: 'trailing=Icon & Text, variant=Transparent, state=Default',
  args: { variant: 'Transparent', trailing: 'Icon & Text' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('9th grade')).toBeVisible();
  },
};
export const TransparentNone: Story = {
  name: 'trailing=None, variant=Transparent, state=Default',
  args: { variant: 'Transparent', trailing: 'None' },
};

/* --- Filled ------------------------------------------------------------- */

export const FilledDefault: Story = {
  name: 'trailing=Icon, variant=Filled, state=Default',
  args: { variant: 'Filled' },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(row(canvasElement)).height).toBe('72px');
  },
};
export const FilledPressed: Story = {
  name: 'trailing=Icon, variant=Filled, state=Pressed',
  args: { variant: 'Filled', state: 'Pressed' },
};
export const FilledSelected: Story = {
  name: 'trailing=Icon, variant=Filled, state=Selected',
  args: { variant: 'Filled', state: 'Selected' },
};
/** The one Filled Selected that changes: trailing None flips to the inverse fill. */
export const FilledNoneSelected: Story = {
  name: 'trailing=None, variant=Filled, state=Selected',
  args: { variant: 'Filled', trailing: 'None', state: 'Selected' },
  play: async ({ canvasElement }) => {
    const a = getComputedStyle(row(canvasElement)).backgroundColor;
    await expect(a).not.toBe('rgba(0, 0, 0, 0)');
  },
};

/* --- Filled Compact ----------------------------------------------------- */

export const FilledCompactDefault: Story = {
  name: 'trailing=Icon, variant=Filled Compact, state=Default',
  args: { variant: 'Filled Compact', showSubtitle: false },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(row(canvasElement)).height).toBe('60px');
  },
};
export const FilledCompactPressed: Story = {
  name: 'trailing=Icon, variant=Filled Compact, state=Pressed',
  args: { variant: 'Filled Compact', state: 'Pressed', showSubtitle: false },
};
export const FilledCompactSelected: Story = {
  name: 'trailing=Icon, variant=Filled Compact, state=Selected',
  args: { variant: 'Filled Compact', state: 'Selected', showSubtitle: false },
};

/* --- Outlined ----------------------------------------------------------- */

export const OutlinedDefault: Story = {
  name: 'trailing=Icon, variant=Outlined, state=Default',
  args: { variant: 'Outlined' },
  play: async ({ canvasElement }) => {
    const r = row(canvasElement);
    await expect(getComputedStyle(r).borderBottomWidth).toBe('3px');
    await expect(getComputedStyle(r).borderTopWidth).toBe('1px');
  },
};
export const OutlinedPressed: Story = {
  name: 'trailing=Icon, variant=Outlined, state=Pressed',
  args: { variant: 'Outlined', state: 'Pressed' },
  play: async ({ canvasElement }) => {
    // Lip collapses to 1px; content sinks 2px via padding.
    const r = row(canvasElement);
    await expect(getComputedStyle(r).borderBottomWidth).toBe('1px');
    await expect(getComputedStyle(r).paddingTop).toBe('18px');
    await expect(getComputedStyle(r).paddingBottom).toBe('14px');
  },
};
export const OutlinedSelected: Story = {
  name: 'trailing=Icon, variant=Outlined, state=Selected',
  args: { variant: 'Outlined', state: 'Selected' },
  play: async ({ canvasElement }) => {
    // Surface fill, no stroke, no lip — the description's rule, not the file's.
    const r = row(canvasElement);
    await expect(getComputedStyle(r).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(r).borderBottomWidth).toBe('0px');
  },
};

/* --- Outlined Compact --------------------------------------------------- */

export const OutlinedCompactDefault: Story = {
  name: 'trailing=Icon, variant=Outlined Compact, state=Default',
  args: { variant: 'Outlined Compact', showSubtitle: false },
};
export const OutlinedCompactPressed: Story = {
  name: 'trailing=Icon, variant=Outlined Compact, state=Pressed',
  args: { variant: 'Outlined Compact', state: 'Pressed', showSubtitle: false },
};
export const OutlinedCompactSelected: Story = {
  name: 'trailing=Icon, variant=Outlined Compact, state=Selected',
  args: { variant: 'Outlined Compact', state: 'Selected', showSubtitle: false },
};

/* --- property states ---------------------------------------------------- */

/** The single-choice row from onboarding: pressable, one leading icon, a chevron. */
export const Pressable: Story = {
  name: 'trailing=Icon, variant=Outlined, state=Default, onClick',
  args: {
    variant: 'Outlined',
    title: 'Quiz',
    subtitle: 'A short check on one topic',
    showImage: false,
    showEmoji: false,
    leadingIcon: 'zap',
    trailingIcon: 'chevron-right',
    onClick: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Quiz/ }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** The doc's warning made visible: a Compact row is fixed at 60 and clips a subtitle. */
export const CompactClips: Story = {
  name: 'trailing=Icon, variant=Filled Compact, showSubtitle (clips)',
  args: { variant: 'Filled Compact', showSubtitle: true, showImage: false, showEmoji: false },
};
