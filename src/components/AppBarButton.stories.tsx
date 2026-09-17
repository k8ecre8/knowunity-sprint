import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { AppBarButton } from './AppBarButton';

const description = `
**This component has no Figma description.** The set's description field is empty. What follows is read from the masters and from how \`appBar\` uses it, and is not the source of truth — write a description in Figma and it replaces this.

A text control for the right side of \`appBar\`, as "Skip" on a session screen. No fill, no stroke, no lip; the label is Headline XXS Bold in \`text/primary\`, dropping to \`text/secondary\` while pressed and \`text/disabled\` when disabled. Not a \`button\` variant=Text: that one is Body S Bold, carries side padding and presses by filling with \`background/surface\`. Use this one only inside \`appBar\`.

---

### How this build differs from the Figma set

**The tap target is at least 48 wide.** The master hugs its label, so "Skip" is a 30-wide target, below the 44 minimum. The wrapper takes \`Control/1200\` as a minimum width and keeps the label at its end edge, where the hugging frame put it, so the bar looks the same.

**Loading is not built.** Its master replaces the label with a 20px \`iconSlot\`, and a spinner needs a rotation duration that \`motion.duration\` does not have — the same gap as \`button\` Loading. \`motion.duration.spin\` is the name to add.

**The label is \`children\`.** Figma calls the property \`Text\`, with the placeholder "CTA Text".
`;

const meta = {
  title: 'Components/App Bar Button',
  component: AppBarButton,
  tags: ['autodocs'],
  args: { variant: 'text', state: 'Default', children: 'Skip', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text'] },
    state: { control: 'inline-radio', options: ['Default', 'Pressed', 'Disabled'] },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof AppBarButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'variant=text, state=Default',
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Skip' });
    const box = button.getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(box.height).toBeGreaterThanOrEqual(44);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Pressed: Story = {
  name: 'variant=text, state=Pressed',
  args: { state: 'Pressed' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Skip' });
    const probe = document.createElement('span');
    probe.style.color = 'var(--semantic-text-secondary)';
    document.body.append(probe);
    await expect(getComputedStyle(button).color).toBe(getComputedStyle(probe).color);
    probe.remove();
  },
};

export const Disabled: Story = {
  name: 'variant=text, state=Disabled',
  args: { state: 'Disabled' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Skip' });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** 30–40% string expansion: a longer label widens the target, it does not wrap. */
export const LongLabel: Story = {
  name: 'variant=text, state=Default, long label',
  args: { children: 'Skip this question' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Skip this question' });
    await expect(button.getBoundingClientRect().height).toBeLessThanOrEqual(48);
  },
};
