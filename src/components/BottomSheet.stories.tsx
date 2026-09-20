import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Scaffold } from './Scaffold';
import { MascotSlot } from './MascotSlot';
import { TextBlock } from './TextBlock';

/**
 * Figma's `bottomSheet` is not editable in the file (its source lives
 * elsewhere), so this is the code build of the same idea: one component for
 * the leave confirm and, later, the section intro tray.
 */
const description = `
**\`bottomSheet\`** for a decision or a tray that rises over the current screen: the confirm on tapping X during a round, and the section intro tray.

**Promoted Sep 2026** from the typed turn's inline leave confirm when the voice turn needed the same sheet. No editable Figma component exists; the geometry is the typed turn's, with the section intro tray frame's Radius/900 top corners (Sep 2026; the tray is the one frame drawn from Figma's \`bottomSheet\`): background/surface, Space/600 top padding, Space/400 sides and bottom plus the home-indicator inset, Space/400 between the text and the actions, actions Space/200 apart. It enters from below at motion.duration.slow, which reduced mode collapses.

**Properties:** \`headline\`, \`caption\`, \`showCaption\` (off by default). The actions are children, stacked and stretched; put the safe action first as the Primary and the escape under it as Text.

**middleSection and showAppBar (added Sep 2026)** for the section intro tray. \`middleSection\` is Figma's freeform slot between the app bar and the actions; it takes the headline block's place and scrolls if it outgrows the sheet, and \`headline\` then only names the dialog. \`showAppBar\` adds the Bottom-sheet App Bar (Control/1800, the handle Space/800 by Space/100 in background/floating); with \`onClose\` the bar is a close target.

**Where it goes.** The scaffold's \`bottomSheetOnly\` slot with \`showBottomSheetBackground\` on, and the slots behind it \`inert\`. The sheet is a \`dialog\` named by its headline.
`;

const onStay = fn();
const onLeave = fn();

const leaveActions = (
  <>
    <Button variant="Primary" size="L" onClick={onStay}>
      Stay
    </Button>
    <Button variant="Text" size="L" onClick={onLeave}>
      Leave
    </Button>
  </>
);

const meta = {
  title: 'Components/bottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  args: {
    headline: 'Leave this round?',
    caption: 'You’ll pick up this question at the same step when you come back.',
    showCaption: true,
    children: leaveActions,
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The leave confirm, as the typed and voice turns show it. */
export const LeaveConfirm: Story = {
  name: 'leave confirm',
  play: async ({ canvas }) => {
    // The dialog is named by the whole text block, headline and caption.
    const dialog = canvas.getByRole('dialog', { name: /^Leave this round\?/ });
    await expect(dialog).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Stay' }));
    await expect(onStay).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Leave' }));
    await expect(onLeave).toHaveBeenCalled();
  },
};

/** Headline alone, no caption. */
export const HeadlineOnly: Story = {
  name: 'showCaption=false',
  args: { showCaption: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/same step/)).toBeNull();
  },
};

/** Inside the scaffold: the scrim on, the slots behind it inert. */
export const InScaffold: Story = {
  name: 'in the scaffold',
  render: (args) => (
    <Scaffold showBottomSheetBackground middleContent={<div inert />} bottomSheetOnly={<BottomSheet {...args} />} />
  ),
  parameters: { layout: 'fullscreen' },
};

/** Both strings 40% longer wrap without clipping. */
export const LongStrings: Story = {
  name: 'string expansion',
  args: {
    headline: 'Leave this round before you finish the question?',
    caption:
      'Nothing is lost. You’ll pick up this exact question at the same hint step whenever you come back to the plan.',
    children: (
      <>
        <Button variant="Primary" size="L" onClick={fn()}>
          Stay and keep going
        </Button>
        <Button variant="Text" size="L" onClick={fn()}>
          Leave for now
        </Button>
      </>
    ),
  },
};

/** The section intro tray: app bar with the handle, a middle section, and the two actions. */
export const IntroTray: Story = {
  name: 'middleSection + showAppBar',
  args: {
    headline: 'Explain It to Knowie',
    showCaption: false,
    showAppBar: true,
    onClose: fn(),
    middleSection: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--primitive-space-400)' }}>
        <MascotSlot size="2XL" name="standby" />
        <TextBlock as="h1" headline="Explain It to Knowie" />
      </div>
    ),
    children: (
      <>
        <Button fullWidth variant="Primary" size="L">
          Talk to Knowie
        </Button>
        <Button fullWidth variant="Text" size="L">
          Type instead
        </Button>
      </>
    ),
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('dialog', { name: 'Explain It to Knowie' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
