import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { ResponseBubble } from './ResponseBubble';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> Knowie's response card. Carries the prompt on an idle turn, and the verdict plus feedback after an answer is judged.
>
> **USE:** the single container for everything Knowie says in the turn loop. It appears in every state from the first prompt through to the reveal.
>
> **DON'T:** put a student's own words in it. This is Knowie speaking; a transcript of the answer would need its own treatment.
>
> **PROPERTIES:** showVerdict toggles the verdict pill, off for a plain prompt and on after judging. showAction toggles the inline button, used for "Explain more" on an incorrect verdict. body swaps the text.
>
> **TOKENS:** background/surface fill, Radius/600 corners, Space/400 padding and gap, Body M Regular in text/primary.
>
> **body2 (undocumented until Sep 2026):** a second text node in Body M Bold, always visible, with no toggle. It gives a whole bold paragraph, not a bold term inside the prompt; that still needs rich text or a term slot — worth deciding before the prompt states are built. The nested verdictChip's tone is set by selecting it; there is no property. Action carries "Explain more", per the description, since Sep 2026.

---

### How this build differs from the Figma component

**It composes \`VerdictChip\` and \`Button\`,** as the file nests \`verdictChip\` and a Secondary M \`button\`. This is a single component with properties, not a variant set, so the stories below are its property states.

**\`verdictTone\` has no Figma property.** In the file you set the verdict's tone by selecting the nested chip; that selection is a prop here. It defaults to Partial, as the master does.

**\`body2\` renders only when given.** The file shows both text nodes always; the code omits the bold paragraph when there is nothing to put in it.

**\`actionLabel\` and \`onActionPress\` are code-only.** Nothing in the file sets the button's text as a property — the master now carries "Explain more" directly — and a real button needs something to do. The label defaults to the same string.

**The action button keeps its hug width.** In the file the button instance is stretched to the bubble's width with the pill centred inside it; here a full-width row centres the pill, which looks the same.
`;

const meta = {
  title: 'Components/responseBubble',
  component: ResponseBubble,
  tags: ['autodocs'],
  args: { onActionPress: fn() },
  argTypes: {
    verdictTone: { control: 'inline-radio', options: ['Correct', 'Partial', 'Incorrect', 'Skipped'] },
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof ResponseBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As the master ships: verdict on (Partial), no action, one paragraph. */
export const Default: Story = {
  name: 'showVerdict, verdict=Partial',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Almost there')).toBeVisible();
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

/** A plain prompt on an idle turn. */
export const Prompt: Story = {
  name: 'showVerdict=false',
  args: {
    showVerdict: false,
    body: 'What do inverse operations do to each other?',
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Almost there')).toBeNull();
  },
};

/** After an incorrect answer, with the inline action. */
export const IncorrectWithAction: Story = {
  name: 'showVerdict, verdict=Incorrect, showAction',
  args: {
    verdictTone: 'Incorrect',
    showAction: true,
    body: 'Not quite. Inverse operations undo each other — addition and subtraction, multiplication and division.',
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('Try again')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Explain more' }));
    await expect(args.onActionPress).toHaveBeenCalledTimes(1);
  },
};

/** Both paragraphs, as the master's two text nodes. */
export const TwoParagraphs: Story = {
  name: 'showVerdict, verdict=Correct, body2',
  args: {
    verdictTone: 'Correct',
    body: "That's it. Inverse operations undo each other.",
    body2: 'So to isolate the variable, you apply the inverse of whatever is being done to it.',
  },
  play: async ({ canvas }) => {
    const bold = canvas.getByText(/apply the inverse/);
    await expect(getComputedStyle(bold).fontWeight).not.toBe(
      getComputedStyle(canvas.getByText(/undo each other/)).fontWeight,
    );
  },
};
