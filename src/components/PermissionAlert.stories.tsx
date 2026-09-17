import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { PermissionAlert } from './PermissionAlert';
import { Scaffold } from './Scaffold';

/**
 * No Figma component or frame exists for the OS prompt (SPEC.md Open 6);
 * this is the code build the voice turn tuned, promoted when the section
 * intro tray needed the same alert on Start.
 */
const description = `
**\`permissionAlert\`** for the mocked iOS microphone prompt, shown once per browser session on the first mic use: on Start in the section intro tray, or on the first tap of the voice control when a round is entered without the tray.

**Promoted Sep 2026** from the voice turn's inline alert when the section intro tray needed it. There is no Figma component: background/surface on a border/default edge at Radius/400, Body M Bold title over Body S Regular body, two Control/1200 actions split by a border/default divider in text/link, Allow in bold as iOS marks the preferred choice. The OS blur has no effect token, so it is not drawn.

**Properties:** \`title\`, \`body\`, \`onDeny\`, \`onAllow\`. The buttons keep iOS's own "Don't Allow" / "Allow", the one place the sentence-case rule is not applied, because the alert reproduces the OS.

**Where it goes.** The scaffold's \`bottomSheetOnly\` slot with \`showBottomSheetBackground\` on and the slots behind it \`inert\`. It is an \`alertdialog\` named by its title.
`;

const onDeny = fn();
const onAllow = fn();

const meta = {
  title: 'Components/permissionAlert',
  component: PermissionAlert,
  tags: ['autodocs'],
  args: {
    title: '“Knowunity” would like to access the microphone',
    body: 'Knowie listens while you explain, so your answer can be checked. Nothing is recorded in this prototype.',
    onDeny,
    onAllow,
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof PermissionAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The prompt as the tray and the voice turn show it. */
export const MicPrompt: Story = {
  name: 'mic prompt',
  play: async ({ canvas }) => {
    const dialog = canvas.getByRole('alertdialog', { name: /would like to access the microphone/ });
    await expect(dialog).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Don’t Allow' }));
    await expect(onDeny).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Allow' }));
    await expect(onAllow).toHaveBeenCalled();
  },
};

/** Inside the scaffold: the scrim on, the slots behind it inert. */
export const InScaffold: Story = {
  name: 'in the scaffold',
  render: (args) => (
    <Scaffold showBottomSheetBackground middleContent={<div inert />} bottomSheetOnly={<PermissionAlert {...args} />} />
  ),
  parameters: { layout: 'fullscreen' },
};

/** Both strings 40% longer wrap without clipping. */
export const LongStrings: Story = {
  name: 'string expansion',
  args: {
    title: '“Knowunity” would like to access the microphone on this device while you study',
    body: 'Knowie listens while you explain your answer out loud, so it can be checked against the section you just revised. Nothing is recorded or kept in this prototype.',
  },
};
