import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { ChatInput } from './ChatInput';

/**
 * The block quote is the component's description, which is the source of
 * truth. Everything after it is what this build does and why.
 */
const description = `
> The input field to be used when a student chooses, or needs, to fall back to text entry over voice input.

---

### What each state means

**Status=Inactive.** Empty and not focused. The microphone is the trailing control, so voice stays one tap away.

**Status=Typing.** Focused and still empty. The caret is in the field; the microphone is still offered.

**Status=Ready to send.** One line of text. The microphone gives way to the send control.

**Status=Long input.** The text has wrapped. The field grows upward, its corners drop from a pill to \`Radius/600\`, and send stays at the bottom edge.

**Status=Loading.** Sent and waiting. The field is read-only and \`loading-01\` takes the trailing place.

### Don't

**Don't** show a recording state in this component. Recording is not shown inside the chat input in this prototype, and there is no transcript anywhere in the recording flow.

**Don't** use it as the primary way to answer. It is the fallback; voice is the route.

---

### How this build differs from the Figma set

**Recording is not built,** decided Sep 2026. The master's waveform bars are also collapsed to 1×1 in the file.

**Status can be left unset.** The field then derives it from focus and text: Inactive, Typing, Ready to send, Long input. Loading is never derived; pass it while the answer is judged. Setting \`Status\` forces a state, which is what the stories below do.

**The plus control is removed,** decided Sep 2026. It reads as adding a file, and this flow has no attachments. The masters still carry it.

**The round controls are \`buttonIcon\`,** not the file's \`OLD Icon Button\`. Send is Primary M: the master fills it \`background/inverse\` with a 16px glyph, \`buttonIcon\` M uses \`interactive/primary\` (the same colour) with 20px. The microphone is Text L so its bare 24px glyph gets a 56 tap target; the master has it as a plain \`iconSlot\` with no target.

**The \`OLD Icon Button\` radius \`Scale 06\` is not used.** It is 32 on a round control; \`buttonIcon\` uses \`Radius/Full\`.

**Loading does not spin.** \`loading-01\` is still, as on \`buttonIcon\`: no rotation duration was added.

**Text is Inter,** added Sep 2026 as \`typeScale.input.s-bold\` (14/17, SemiBold), matching the masters. Greed's OpenType features are switched off on the field.

**The placeholder is "Type your answer",** not the masters' "Ask anything...", which is AI Chat copy. \`placeholder\` is a code-only prop.

**Code-only props:** \`value\`, \`defaultValue\`, \`onValueChange\`, \`placeholder\`, \`label\` (the field's accessible name), \`onSend\`, \`onMicPress\`.

**Focus is outstanding,** as on every component. The field's caret is the only focus indicator; the controls keep the browser ring.
`;

const LONG =
  'Photosynthesis is how plants turn light into chemical energy. Chlorophyll absorbs the light, water is split, and the energy is stored in glucose while oxygen is released.';

const meta = {
  title: 'Components/chatInput',
  component: ChatInput,
  tags: ['autodocs'],
  args: {
    onSend: fn(),
    onMicPress: fn(),
    onValueChange: fn(),
  },
  argTypes: {
    Status: {
      control: 'inline-radio',
      options: ['Inactive', 'Typing', 'Loading', 'Ready to send', 'Long input'],
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  name: 'Status=Inactive',
  args: { Status: 'Inactive' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Your answer' })).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: 'Send' })).toBeNull();

    await expect(canvas.queryByRole('button', { name: 'Add' })).toBeNull();
    const mic = canvas.getByRole('button', { name: 'Answer by voice' }).getBoundingClientRect();
    await expect(mic.width).toBeGreaterThanOrEqual(44);
    await expect(mic.height).toBeGreaterThanOrEqual(44);
  },
};

export const Typing: Story = {
  name: 'Status=Typing',
  args: { Status: 'Typing' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Answer by voice' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Send' })).toBeNull();
  },
};

export const Loading: Story = {
  name: 'Status=Loading',
  args: { Status: 'Loading' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('textbox', { name: 'Your answer' })).toHaveAttribute('readonly');
    await expect(canvas.getByRole('img', { name: 'Sending' })).toBeInTheDocument();
    await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Send' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Answer by voice' })).toBeNull();
  },
};

export const ReadyToSend: Story = {
  name: 'Status=Ready to send',
  args: { Status: 'Ready to send', defaultValue: 'Plants turn light into energy' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Answer by voice' })).toBeNull();
    const send = canvas.getByRole('button', { name: 'Send' }).getBoundingClientRect();
    await expect(send.width).toBeGreaterThanOrEqual(44);
    await expect(send.height).toBeGreaterThanOrEqual(44);
  },
};

export const LongInput: Story = {
  name: 'Status=Long input',
  args: { Status: 'Long input', defaultValue: LONG },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Your answer' });
    const lineHeight = parseFloat(getComputedStyle(field).lineHeight);
    await expect(field.getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5);
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  },
};

/** Status left unset: focus and text drive it through every state but Loading. */
export const Derived: Story = {
  name: 'Status unset, derived from focus and text',
  play: async ({ canvas, canvasElement, args }) => {
    const root = canvasElement.querySelector('[data-status]');
    const field = canvas.getByRole('textbox', { name: 'Your answer' });
    await expect(root).toHaveAttribute('data-status', 'Inactive');

    await userEvent.click(canvas.getByRole('button', { name: 'Answer by voice' }));
    await expect(args.onMicPress).toHaveBeenCalled();

    await userEvent.click(field);
    await expect(root).toHaveAttribute('data-status', 'Typing');

    await userEvent.type(field, 'Light becomes energy');
    await expect(root).toHaveAttribute('data-status', 'Ready to send');

    await userEvent.type(field, ` ${LONG}`);
    await expect(root).toHaveAttribute('data-status', 'Long input');

    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onSend).toHaveBeenCalledWith(`Light becomes energy ${LONG}`);
    await expect(field).toHaveValue('');
  },
};
