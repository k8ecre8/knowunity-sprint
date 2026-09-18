import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { BottomNav } from './BottomNav';

/**
 * Figma: `bottomNav`, 4 variants on one `active` axis. Code builds all four.
 */
const description = `
**\`bottomNav\`** for any screen that shows the app tab bar. Four tabs (chat, plans, trophy, profile) as 44 iconSlots, a border/default hairline on top, Space/400 vertical and Space/600 horizontal padding.

**Promoted Sep 2026** from the exam plan home's inline bar when the app home needed the same bar with \`chat\` active.

**active:** which tab is text/primary; the rest are text/tertiary. The plan and session screens have \`plans\` active; the app home has \`chat\`.

**hrefs:** where each tab goes. A tab with an entry is a link; the active tab and any tab left out stay inert. The app home and the exam plan home link Chat (\`/\`) and Plans (\`/plan\`), so a tester can move between them; trophy and profile are outside this flow and stay inert. One glyph, \`myai-chat\`, is not in \`IconSlot\`; its tab shows \`send-01\` as a placeholder, marked \`data-placeholder-glyph\`. \`target-04\` and \`trophy-02\` were added to \`IconSlot\` Sep 2026 and are the real glyphs.
`;

const meta = {
  title: 'Components/bottomNav',
  component: BottomNav,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: description } },
    // The bar pulls out of the scaffold's bottomContent padding by Space/400.
    layout: 'padded',
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** App home. */
export const Chat: Story = {
  name: 'active=chat',
  args: { active: 'chat' },
  play: async ({ canvas }) => {
    const current = canvas.getByRole('img', { name: 'Chat' }).parentElement;
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('img', { name: 'Plans' }).parentElement).not.toHaveAttribute('aria-current');
  },
};

/** Exam plan home and the session screens. */
export const Plans: Story = {
  name: 'active=plans',
  args: { active: 'plans' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('img', { name: 'Plans' }).parentElement).toHaveAttribute('aria-current', 'page');
    // Only Chat still stands in for a missing glyph.
    const placeholders = canvasElement.querySelectorAll('[data-placeholder-glyph]');
    await expect(placeholders).toHaveLength(1);
    await expect(placeholders[0]).toHaveAttribute('data-placeholder-glyph', 'myai-chat');
  },
};

/** App home and exam plan home: Chat and Plans link to each other; the active tab and the rest stay inert. */
export const WithLinks: Story = {
  name: 'hrefs: chat and plans',
  args: { active: 'chat', hrefs: { chat: '/', plans: '/plan' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Plans' })).toHaveAttribute('href', '/plan');
    // The active tab is not a link to itself, and tabs without an href are inert.
    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(canvas.getByRole('img', { name: 'Chat' }).parentElement).toHaveAttribute('aria-current', 'page');
  },
};

export const Trophy: Story = {
  name: 'active=trophy',
  args: { active: 'trophy' },
};

export const Profile: Story = {
  name: 'active=profile',
  args: { active: 'profile' },
};
