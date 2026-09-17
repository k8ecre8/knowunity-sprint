import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { AppBar } from './AppBar';
import { ProgressIndicator } from './ProgressIndicator';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> The top bar of a screen. 375 wide, 56 tall, with a SLOT across the middle that holds whatever the screen needs. Six variants covering a left control plus one or two right controls.
>
> **USE:** the top edge of any full screen. In the example screens the slot carries the progress indicator during a recall session.
>
> **DON'T:** expect the slot to lay out more than one thing.
>
> **GUESS:** the DON'T is inferred from the slot holding a single child; I have not tested it with more. Also note that no instance of this component set appears anywhere in the file, yet frames named appBar sit above five progress indicators — those are likely detached or renamed, so the component may not be what is actually in use.

---

### How this build differs from the Figma set

**Width fills the parent.** 375 predates the 390 product width. Height hugs to 56: a \`Control/1200\` row of controls plus \`Space/200\` bottom padding, so no height token was needed.

**The slot is \`slot\`,** a \`ReactNode\` stretched to the slot's width. Its loose 10px vertical padding and 10px gap are dropped: with one child centred in a 48 row they change nothing, and neither is a token.

**The nested controls are \`App Bar Button Icon\` and \`App Bar Button\`,** built as their own components. Their glyphs, labels and handlers are code-only props on the bar, since in Figma you select the nested instance: \`leftIcon\` / \`leftLabel\` / \`onLeftPress\`, \`rightIcon\` / \`rightLabel\` / \`onRightPress\` for the rightmost icon button, \`secondRightIcon\` / \`secondRightLabel\` / \`onSecondRightPress\` for the share button, and \`buttonText\` / \`onButtonPress\`. Defaults are the masters' glyphs (\`arrow-left\`, \`dots-vertical\`, \`share-02\`) and "Skip".

**\`dots-vertical\` and \`share-02\` are code-only glyphs.** Neither is on \`iconSlot\`'s Figma swap list; both were added to \`IconSlot\` in Sep 2026 from the same package. Figma parity waits on published copies being imported.

**The fade is two layers,** \`background/page\` to transparent top to bottom, stacked as the master stacks them.

**Stories put a thickness-16 \`progressIndicator\` in the slot,** as the USE line describes; \`variant=default, empty slot\` shows the master as drawn.
`;

const slot = <ProgressIndicator thickness="16" current={4} total={12} />;

const meta = {
  title: 'Components/appBar',
  component: AppBar,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    slot,
    onLeftPress: fn(),
    onRightPress: fn(),
    onSecondRightPress: fn(),
    onButtonPress: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'leftIconButtonOnly',
        'leftAndRightIconButton',
        'leftAndRightButton',
        'leftAndTwoRightIconButtons',
        'leftAnd2RightButtons',
      ],
    },
    slot: { control: false },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

async function expectTargets(buttons: HTMLElement[]) {
  for (const button of buttons) {
    const box = button.getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

export const Default: Story = {
  name: 'variant=default',
  args: { variant: 'default' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.getByRole('progressbar')).toBeVisible();
    const bar = canvasElement.querySelector('[data-variant="default"]') as HTMLElement;
    await expect(bar.getBoundingClientRect().height).toBe(56);
  },
};

export const DefaultEmptySlot: Story = {
  name: 'variant=default, empty slot',
  args: { variant: 'default', slot: undefined },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector('[data-variant="default"]') as HTMLElement;
    await expect(bar.getBoundingClientRect().height).toBe(56);
  },
};

export const LeftIconButtonOnly: Story = {
  name: 'variant=leftIconButtonOnly',
  args: { variant: 'leftIconButtonOnly' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(args.onLeftPress).toHaveBeenCalled();
  },
};

export const LeftAndRightIconButton: Story = {
  name: 'variant=leftAndRightIconButton',
  args: { variant: 'leftAndRightIconButton' },
  play: async ({ canvas, args }) => {
    await expectTargets(canvas.getAllByRole('button'));
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await expect(args.onRightPress).toHaveBeenCalled();
  },
};

export const LeftAndRightButton: Story = {
  name: 'variant=leftAndRightButton',
  args: { variant: 'leftAndRightButton' },
  play: async ({ canvas, args }) => {
    await expectTargets(canvas.getAllByRole('button'));
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onButtonPress).toHaveBeenCalled();
  },
};

export const LeftAndTwoRightIconButtons: Story = {
  name: 'variant=leftAndTwoRightIconButtons',
  args: { variant: 'leftAndTwoRightIconButtons' },
  play: async ({ canvas, args }) => {
    const buttons = canvas.getAllByRole('button');
    await expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Back',
      'Share',
      'More options',
    ]);
    await expectTargets(buttons);
    await userEvent.click(canvas.getByRole('button', { name: 'Share' }));
    await expect(args.onSecondRightPress).toHaveBeenCalled();
  },
};

export const LeftAnd2RightButtons: Story = {
  name: 'variant=leftAnd2RightButtons',
  args: { variant: 'leftAnd2RightButtons' },
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button');
    await expect(buttons.map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual([
      'Back',
      'More options',
      'Skip',
    ]);
    await expectTargets(buttons);
  },
};
