import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TokenDetails } from './TokenDetails';
import { collectTokens, getGroup, listStyle, resolveVar, textStyle } from './tokens';

const meta = {
  title: 'Foundations/Type',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function TextStyles() {
  // File order is scale order: display, headline, body, caption, largest first.
  const steps = collectTokens(getGroup(['typeScale']), ['typeScale']).filter(
    (token) => token.type === 'typography',
  );

  return (
    <ul style={listStyle}>
      {steps.map((token) => {
        const spec = (property: string) => resolveVar(`${token.name}-${property}`);
        return (
          <li
            key={token.name}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--primitive-space-200)' }}
          >
            <p
              data-testid={token.name}
              style={{
                ...textStyle(token.path.slice(1)),
                margin: 'var(--primitive-space-0)',
                color: 'var(--semantic-text-primary)',
                overflowWrap: 'anywhere',
              }}
            >
              Explain It to Knowie
            </p>
            <TokenDetails
              name={token.name}
              value={`${spec('fontSize')} / ${spec('lineHeight')}, weight ${spec('fontWeight')}, tracking ${spec('letterSpacing')}`}
              description={token.description}
            />
          </li>
        );
      })}
    </ul>
  );
}

export const Scale: Story = {
  render: () => <TextStyles />,
  play: async ({ canvas }) => {
    // Rendered size must match the generated token, proving the style is applied.
    const sample = canvas.getByTestId('--typeScale-body-m-regular');
    const expected = resolveVar('--typeScale-body-m-regular-fontSize');
    await expect(expected).not.toBe('');
    await expect(getComputedStyle(sample).fontSize).toBe(expected);

    // The two things design-system.md says will break the build if missed.
    // Both fail silently: the type scale still resolves and the layout still
    // looks plausible while every string renders in the wrong face.
    await document.fonts.ready;
    // Greed must be loaded, not merely named by the token. Both the lightest
    // and heaviest faces the scale uses, so a missing @font-face is caught.
    await expect(document.fonts.check('400 16px "Greed Standard-TRIAL"')).toBe(true);
    await expect(document.fonts.check('700 16px "Greed Standard-TRIAL"')).toBe(true);
    // And its OpenType features must be on at the root, or the lowercase `l`
    // loses its tail and the question mark takes an angular form. `frac` stays
    // off: it superscripts every standalone digit, so `48 XP` renders wrong.
    const features = getComputedStyle(document.documentElement).fontFeatureSettings;
    for (const feature of ['ss02', 'ss03', 'ss06', 'ss07', 'lnum', 'pnum']) {
      await expect(features).toContain(feature);
    }
    await expect(features).not.toContain('frac');
  },
};
