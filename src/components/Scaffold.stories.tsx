import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { AppBar } from './AppBar';
import { Button } from './Button';
import { ProgressIndicator } from './ProgressIndicator';
import { ResponseBubble } from './ResponseBubble';
import { Scaffold } from './Scaffold';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. The Figma description is one line and says nothing about
 * use, so the rules after it are the scaffold section of docs/design-system.md.
 * Everything after the rule is what this build does differently and why.
 */
const description = `
> Used to quickly create screens using our components, making use of Figma Slots. Allows for quickly testing how designs look on different device types.
>
> **topNavigation:** Placeholder for navigation items, such as back buttons, home top nav with streaks & similar.
>
> **bottomContent:** Placeholder for bottom navigation bar, chat input field & similar.

### What goes in each slot

\`\`\`
Panel Header      status bar, fixed, not a slot
topNavigation     appBar goes here
middleContent     the screen, scrolls, grows to fill
bottomContent     the call to action
bottomSheetOnly   home indicator area
\`\`\`

- **\`topNavigation\`** — one \`appBar\`. The app bar's own slot is where a \`progressIndicator\` sits during a session. Toggle the whole slot off with \`showTopNavSlot\` for a full-bleed screen.
- **\`middleContent\`** — everything the screen is about. This is the only slot that scrolls and the only one that grows. Mascot, prompt, response, lists, forms.
- **\`bottomContent\`** — the primary action, usually a \`button\` or a \`buttonGroup\`. Anchored, does not scroll.
- **\`bottomSheetOnly\`** — reserved for the home indicator. Leave it alone unless you are building a sheet, and pair it with \`showBottomSheetBackground\`.

### Don't

- **Don't put more than one thing in a slot.** Slots hold a single child; compose inside a frame if you need more.
- **Don't put an action in \`middleContent\` that belongs in \`bottomContent\`.** The anchored position is the affordance.
- **Don't resize the scaffold.** 390 is the product width.

---

### How this build differs from the Figma component

**No \`size\` prop.** Figma's \`size\` axis has eight devices; this prototype is iPhone 13 only (390×844), so the one remaining option is not a prop. The seven tablet, desktop and other-phone sizes are out of scope per \`docs/sprint-context.md\`.

**The status bar is a drawing, not a component.** Panel Header nests \`Status Bar / Mode=Night\` from Knowunity's Bricks library. It was exported from the iPhone 13 master as \`public/images/status-bar.svg\` (time 09:41 as outlines, cellular, wifi, battery) and is painted as a CSS mask in \`text/primary\`, so the file carries no hex and every screen built on the scaffold gets it. It is decorative and hidden from assistive tech. The area is sized at \`Size/StatusBar\` (48, added Sep 2026) with its \`border/default\` divider. On sizes other than iPhone 13 the divider was bound to Bricks' \`Core/Grayscale/Dividers\`; a hidden fill bound to \`Core/BG/Secondary Transparent\` is dropped.

**The home indicator is the device's safe area.** \`bottomSheetOnly\` is a loose 34 in the file; here its height is \`env(safe-area-inset-bottom)\`, which is 0 in Storybook. \`bottomContent\` adds the same inset to its bottom padding so the action clears the indicator; in Figma the two overlap.

**Dropped:** the root's 10px gap (no token, and no effect under space-between), and the hidden "Scrim" gradient inside \`middleContent\`, which no property toggles.

**The stories fill every slot with what belongs there:** \`topNavigation\` with an \`AppBar\` carrying a thickness-16 \`ProgressIndicator\`, \`middleContent\` with \`ResponseBubble\` and \`bottomContent\` with \`Button\`.

**Slots are props.** Each Figma slot is a \`ReactNode\` prop of the same name, and each stretches its child to the slot's width, as \`stretchChildOnInsert\` does.
`;

const prompt = (
  <ResponseBubble showVerdict={false} body="Explain to Knowie what inverse operations do to each other." />
);

const meta = {
  title: 'Components/scaffold',
  component: Scaffold,
  tags: ['autodocs'],
  args: {
    topNavigation: (
      <AppBar
        variant="leftAndRightButton"
        slot={<ProgressIndicator thickness="16" current={1} total={12} />}
        onLeftPress={fn()}
        onButtonPress={fn()}
      />
    ),
    middleContent: prompt,
    bottomContent: (
      <Button variant="Primary" size="L" onClick={fn()}>
        Start explaining
      </Button>
    ),
  },
  argTypes: {
    topNavigation: { control: false },
    middleContent: { control: false },
    bottomContent: { control: false },
    bottomSheetOnly: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof Scaffold>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As the master ships at size=iPhone 13: both nav slots on, no scrim. */
export const Default: Story = {
  name: 'showTopNavSlot, showBottomNavSlot',
  play: async ({ canvasElement, canvas }) => {
    await expect(canvasElement.querySelector('[data-slot="topNavigation"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="bottomContent"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="bottomSheetBackground"]')).toBeNull();
    // The status bar drawing is carried by the Panel Header on every screen.
    const header = canvasElement.querySelector('[data-slot="panelHeader"]') as HTMLElement;
    await expect(getComputedStyle(header, '::before').maskImage).toContain('status-bar.svg');
    await expect(canvas.getByRole('button', { name: 'Start explaining' })).toBeVisible();
  },
};

/** Full-bleed: the top navigation slot is off; Panel Header stays. */
export const TopNavOff: Story = {
  name: 'showTopNavSlot=false',
  args: { showTopNavSlot: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="topNavigation"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-slot="panelHeader"]')).not.toBeNull();
  },
};

/** Both bottom slots off together, as the one Figma property does. */
export const BottomNavOff: Story = {
  name: 'showBottomNavSlot=false',
  args: { showBottomNavSlot: false },
  play: async ({ canvasElement, canvas }) => {
    await expect(canvasElement.querySelector('[data-slot="bottomContent"]')).toBeNull();
    await expect(canvasElement.querySelector('[data-slot="bottomSheetOnly"]')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Start explaining' })).toBeNull();
  },
};

/** The scrim on, over every slot except bottomSheetOnly. */
export const BottomSheetBackground: Story = {
  name: 'showBottomSheetBackground',
  args: { showBottomSheetBackground: true },
  play: async ({ canvasElement }) => {
    const scrim = canvasElement.querySelector('[data-slot="bottomSheetBackground"]');
    await expect(scrim).not.toBeNull();
    await expect(scrim?.nextElementSibling?.getAttribute('data-slot')).toBe('bottomSheetOnly');
  },
};

/** middleContent overflows: it scrolls while bottomContent stays anchored. */
export const MiddleContentScrolls: Story = {
  name: 'middleContent overflow',
  args: {
    middleContent: (
      <>
        {prompt}
        {[1, 2].map((round) => (
          <div key={round} style={{ display: 'contents' }}>
            <ResponseBubble verdictTone="Correct" body="That's it. Addition undoes subtraction." />
            <ResponseBubble verdictTone="Partial" body="Close. Multiplication and division undo each other too." />
            <ResponseBubble verdictTone="Incorrect" body="Not quite. Squaring is undone by a square root, not by halving." />
            <ResponseBubble verdictTone="Skipped" body="No problem. Inverse operations undo each other." />
            <ResponseBubble verdictTone="Correct" body="Right. So to isolate a variable, apply the inverse of what is done to it." />
          </div>
        ))}
      </>
    ),
  },
  play: async ({ canvasElement, canvas }) => {
    const middle = canvasElement.querySelector<HTMLElement>('[data-slot="middleContent"]')!;
    await expect(middle.scrollHeight).toBeGreaterThan(middle.clientHeight);
    const action = canvas.getByRole('button', { name: 'Start explaining' });
    const before = action.getBoundingClientRect().top;
    middle.scrollTop = middle.scrollHeight;
    await expect(action.getBoundingClientRect().top).toBe(before);
    await userEvent.click(action);
  },
};
