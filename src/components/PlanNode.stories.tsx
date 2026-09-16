import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { iconNames } from './IconSlot';
import { PlanNode } from './PlanNode';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> planNode: one stop on the exam plan path. 80px circle (Illustration/1000), icon in an iconSlot 400 (32px), swap the glyph for the activity.
>
> **state:** done (tone/bold fill, gloss, icon tone/onBold) | next (surface fill, 2px tone/onSubtle ring, icon tone/onSubtle) | todo (surface fill, icon text/tertiary; ignores tone so the eye goes to done and next).
>
> **tone:** blue | coral | magenta | green. Matches the goal-type icon colour chosen in exam plan onboarding (Quiz blue, Test coral, Final Exam magenta, Just Studying green) and the exam art above the plan switcher.
>
> Inner shadow from the hand-built version dropped: no effect token exists. The gloss band sits inside a 68px round clip frame inset 6px (glossClip), so the base colour shows as a ring all the way round; this reads as a border without a stroke token. The clip has to be circular: a square inset does nothing because the circle edge is well inside the square corners. Done nodes look the same regardless of activity type; the glyph carries the type.
>
> **size:** M (80, Illustration/1000, icon 32) | S (48, Illustration/600, icon 20; used as the badge in noteCard).

---

### How this build differs from the Figma set

**It is built on \`IconSlot\`.** The nested icon is the \`IconSlot\` component at 400 (M) or 250 (S), exactly as the Figma masters nest \`iconSlot\`. The node sets \`color\` and the slot inherits it, which is how the icon takes tone/onBold, tone/onSubtle or text/tertiary without a colour prop of its own.

**\`name\` is the glyph swap.** It passes straight through to the slot. Left unset, each state shows what its Figma master shows — \`star-01\`, \`microphone-01\`, \`file-question-02\` — so a bare node matches the file. In the app, pass the activity's glyph.

**The size-S ring is 2px, not the file's 1.5px.** The S masters draw the \`next\` ring at 1.5px, unbound to any token; no such stroke step exists. The description says "2px tone/onSubtle ring" with no size qualifier and the M ring is bound to \`Stroke/Heavy Border\`, so the description wins and both sizes use that token. If 1.5 is wanted, it is a new stroke step to name.

**The gloss is a \`clip-path\` polygon, not an effect.** The Figma vector is a 45° band with corners at 64.7%/35.3% of the clip at M and 65%/35% at S; one polygon at 65%/35% serves both. It is filled with \`highlight/gloss\`, whose 40% alpha is the token's own. There is no inner shadow — the file dropped it because no effect token exists, and so does the code.

**\`todo\` ignores tone by construction.** No tone class is applied for that state, so \`tone\` cannot leak in.
`;

const meta = {
  title: 'Components/planNode',
  component: PlanNode,
  tags: ['autodocs'],
  args: { state: 'done', tone: 'blue', size: 'M' },
  argTypes: {
    state: { control: 'inline-radio', options: ['done', 'next', 'todo'] },
    tone: { control: 'inline-radio', options: ['blue', 'coral', 'magenta', 'green'] },
    size: { control: 'inline-radio', options: ['M', 'S'] },
    name: { control: 'select', options: iconNames },
  },
  parameters: {
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof PlanNode>;

export default meta;
type Story = StoryObj<typeof meta>;

const node = (el: HTMLElement) => el.querySelector('[data-state]') as HTMLElement;

/* --- done: tone/bold fill, gloss, icon tone/onBold ---------------------- */

export const DoneBlueM: Story = {
  name: 'state=done, tone=blue, size=M',
  args: { state: 'done', tone: 'blue', size: 'M' },
  play: async ({ canvasElement }) => {
    const n = node(canvasElement);
    // Illustration/1000 and a gloss band, which only done carries.
    await expect(getComputedStyle(n).width).toBe('80px');
    await expect(n.querySelector('span[aria-hidden="true"] > span')).not.toBeNull();
  },
};

export const DoneCoralM: Story = {
  name: 'state=done, tone=coral, size=M',
  args: { state: 'done', tone: 'coral', size: 'M' },
};

export const DoneMagentaM: Story = {
  name: 'state=done, tone=magenta, size=M',
  args: { state: 'done', tone: 'magenta', size: 'M' },
};

export const DoneGreenM: Story = {
  name: 'state=done, tone=green, size=M',
  args: { state: 'done', tone: 'green', size: 'M' },
};

export const DoneBlueS: Story = {
  name: 'state=done, tone=blue, size=S',
  args: { state: 'done', tone: 'blue', size: 'S' },
  play: async ({ canvasElement }) => {
    // Illustration/600, with the slot stepping down to 250.
    await expect(getComputedStyle(node(canvasElement)).width).toBe('48px');
  },
};

export const DoneCoralS: Story = {
  name: 'state=done, tone=coral, size=S',
  args: { state: 'done', tone: 'coral', size: 'S' },
};

export const DoneMagentaS: Story = {
  name: 'state=done, tone=magenta, size=S',
  args: { state: 'done', tone: 'magenta', size: 'S' },
};

export const DoneGreenS: Story = {
  name: 'state=done, tone=green, size=S',
  args: { state: 'done', tone: 'green', size: 'S' },
};

/* --- next: surface fill, tone/onSubtle ring, icon tone/onSubtle --------- */

export const NextBlueM: Story = {
  name: 'state=next, tone=blue, size=M',
  args: { state: 'next', tone: 'blue', size: 'M' },
  play: async ({ canvasElement }) => {
    const n = node(canvasElement);
    // The ring is Stroke/Heavy Border, and there is no gloss.
    await expect(getComputedStyle(n).borderTopWidth).toBe('2px');
    await expect(n.querySelector('span[aria-hidden="true"] > span')).toBeNull();
  },
};

export const NextCoralM: Story = {
  name: 'state=next, tone=coral, size=M',
  args: { state: 'next', tone: 'coral', size: 'M' },
};

export const NextMagentaM: Story = {
  name: 'state=next, tone=magenta, size=M',
  args: { state: 'next', tone: 'magenta', size: 'M' },
};

export const NextGreenM: Story = {
  name: 'state=next, tone=green, size=M',
  args: { state: 'next', tone: 'green', size: 'M' },
};

export const NextBlueS: Story = {
  name: 'state=next, tone=blue, size=S',
  args: { state: 'next', tone: 'blue', size: 'S' },
  play: async ({ canvasElement }) => {
    // Description wins over the file's loose 1.5: the S ring is the same token.
    await expect(getComputedStyle(node(canvasElement)).borderTopWidth).toBe('2px');
  },
};

export const NextCoralS: Story = {
  name: 'state=next, tone=coral, size=S',
  args: { state: 'next', tone: 'coral', size: 'S' },
};

export const NextMagentaS: Story = {
  name: 'state=next, tone=magenta, size=S',
  args: { state: 'next', tone: 'magenta', size: 'S' },
};

export const NextGreenS: Story = {
  name: 'state=next, tone=green, size=S',
  args: { state: 'next', tone: 'green', size: 'S' },
};

/* --- todo: surface fill, icon text/tertiary; ignores tone --------------- */
/* Figma has one todo variant per tone, and all four render identically. One
   story per size stands in for the four, and the play proves tone is inert. */

export const TodoM: Story = {
  name: 'state=todo, tone=blue, size=M',
  args: { state: 'todo', tone: 'blue', size: 'M' },
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--primitive-space-400)' }}>
      <PlanNode {...args} tone="blue" />
      <PlanNode {...args} tone="coral" />
      <PlanNode {...args} tone="magenta" />
      <PlanNode {...args} tone="green" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // All four tones resolve to the same colours: tone is ignored.
    const nodes = Array.from(canvasElement.querySelectorAll('[data-state="todo"]')) as HTMLElement[];
    await expect(nodes).toHaveLength(4);
    const colours = new Set(nodes.map((n) => getComputedStyle(n).color));
    const fills = new Set(nodes.map((n) => getComputedStyle(n).backgroundColor));
    await expect(colours.size).toBe(1);
    await expect(fills.size).toBe(1);
  },
};

export const TodoS: Story = {
  name: 'state=todo, tone=blue, size=S',
  args: { state: 'todo', tone: 'blue', size: 'S' },
};
