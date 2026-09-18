import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TopBar } from './TopBar';

const description = `
**\`topBar\`** for the app bar on the two home screens, which fits none of \`appBar\`'s variants.

**Promoted Sep 2026** from the inline bars on the app home and the exam plan home.

**Axis:** \`variant\`.
- **home:** menu (\`list\`), three counters and the focus timer (\`clock\`). The counters are Body S Bold pills at Radius/full (pro/subtle, feedback/info/subtle, accent/coral/subtle) with an \`art/*\` asset at Icon/250; the Pro wordmark is Icon/500. The menu and timer are Control/1000, as drawn.
- **plan:** a kebab (\`dots-vertical\`) on the right in a Control/1200 box, nothing else.

**Properties (home only):** \`xp\`, \`streak\`.

Everything on the bar is app chrome outside this flow, so it is decoration: nothing is a target.
`;

const meta = {
  title: 'Components/topBar',
  component: TopBar,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'inline-radio', options: ['home', 'plan'] } },
  parameters: { docs: { description: { component: description } }, layout: 'fullscreen' },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** App home. */
export const Home: Story = {
  name: 'variant=home',
  args: { variant: 'home', xp: 48, streak: 1 },
  play: async ({ canvas }) => {
    const counters = canvas.getByRole('list', { name: 'Account' });
    await expect(counters.children).toHaveLength(3);
    await expect(canvas.getByText('48')).toBeVisible();
    // Decoration: nothing on the bar is a target.
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  },
};

/** Exam plan home. */
export const Plan: Story = {
  name: 'variant=plan',
  args: { variant: 'plan' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('list')).toBeNull();
  },
};

/** Larger counts widen the pills; the row scrolls sideways rather than clipping the timer. */
export const LongCounts: Story = {
  name: 'string expansion',
  args: { variant: 'home', xp: 12480, streak: 365 },
};
