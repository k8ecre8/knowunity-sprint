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
              Explain it to Knowie
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
  },
};
