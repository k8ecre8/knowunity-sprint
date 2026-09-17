import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { AppBarButtonIcon } from './AppBarButtonIcon';

const description = `
**This component has no Figma description.** The set's description field is empty. What follows is read from the masters and from how \`appBar\` uses it, and is not the source of truth — write a description in Figma and it replaces this.

An icon-only control for \`appBar\`: back on the left, overflow or share on the right. A 40px round area with no fill and no stroke, a 24px glyph in an \`iconSlot\` at 300, inside a 48px tap target. Not for use outside \`appBar\`; an icon button elsewhere is \`buttonIcon\`, which is not built in code yet.

---

### How this build differs from the Figma set

**Pressed and Disabled are visible.** The four masters are drawn identical to Default. Decided Sep 2026 to follow \`App Bar Button\`, the text control in the same bar: the glyph drops to \`text/secondary\` while pressed and \`text/disabled\` when disabled.

**Loading is not built.** Its master swaps the glyph to \`loading-01\`, and a spinner needs a rotation duration that \`motion.duration\` does not have — the same gap as \`button\` Loading. \`motion.duration.spin\` is the name to add.

**The glyph colour is \`text/primary\`,** inherited through \`currentColor\`. The masters' strokes are raw black and unbound; each \`appBar\` instance overrides them to \`text/primary\`, and the code does that once, here.

**The glyph swap is \`name\`,** defaulting to the master's placeholder, \`check\`. **\`label\` is code-only and required:** the glyph is the only thing carrying the meaning.
`;

const meta = {
  title: 'Components/App Bar Button Icon',
  component: AppBarButtonIcon,
  tags: ['autodocs'],
  args: { variant: 'default', state: 'Default', name: 'arrow-left', label: 'Back', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default'] },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Disabled'] },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof AppBarButtonIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'variant=default, state=Default',
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Back' });
    const box = button.getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(box.height).toBeGreaterThanOrEqual(44);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Pressed: Story = {
  name: 'variant=default, state=Pressed',
  args: { state: 'Pressed' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Back' });
    const probe = document.createElement('span');
    probe.style.color = 'var(--semantic-text-secondary)';
    document.body.append(probe);
    await expect(getComputedStyle(button).color).toBe(getComputedStyle(probe).color);
    probe.remove();
  },
};

export const Disabled: Story = {
  name: 'variant=default, state=Disabled',
  args: { state: 'Disabled' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Back' });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
