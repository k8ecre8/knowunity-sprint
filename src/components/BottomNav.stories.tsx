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

The bar is app chrome outside this flow, so the tabs are inert. Three glyphs (\`myai-chat\`, \`target-04\`, \`trophy-02\`) are not in \`IconSlot\`; their tabs show placeholders marked \`data-placeholder-glyph\`.
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
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Plans' }).parentElement).toHaveAttribute('aria-current', 'page');
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
