import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TokenDetails } from './TokenDetails';
import { collectTokens, dimension, getGroup, listStyle, resolveVar } from './tokens';

const meta = {
  title: 'Foundations/Radius',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function RadiusScale() {
  const radii = collectTokens(getGroup(['primitive', 'radius']), ['primitive', 'radius']).sort(
    (a, b) => dimension(a) - dimension(b),
  );

  return (
    <ul style={listStyle}>
      {radii.map((token) => (
        <li
          key={token.name}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--primitive-space-400)' }}
        >
          <div
            aria-hidden
            data-testid={token.name}
            style={{
              flexShrink: 0,
              width: 'var(--primitive-space-1600)',
              height: 'var(--primitive-space-1600)',
              borderRadius: `var(${token.name})`,
              background: 'var(--semantic-highlight-surface)',
              border: 'var(--primitive-stroke-heavy-border) solid var(--semantic-highlight-border)',
            }}
          />
          <TokenDetails name={token.name} value={resolveVar(token.name)} description={token.description} />
        </li>
      ))}
    </ul>
  );
}

export const Scale: Story = {
  render: () => <RadiusScale />,
  play: async ({ canvas }) => {
    const box = canvas.getByTestId('--primitive-radius-400');
    await expect(getComputedStyle(box).borderTopLeftRadius).toBe(resolveVar('--primitive-radius-400'));
  },
};
