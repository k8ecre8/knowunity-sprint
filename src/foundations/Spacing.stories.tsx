import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TokenDetails } from './TokenDetails';
import {
  NO_DESCRIPTION,
  collectTokens,
  dimension,
  getGroup,
  listStyle,
  resolveVar,
  type Token,
} from './tokens';

const meta = {
  title: 'Foundations/Spacing',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Positive steps smallest first, then negative steps by size.
const byScale = (a: Token, b: Token) => {
  const [x, y] = [dimension(a), dimension(b)];
  if (x < 0 !== y < 0) return x < 0 ? 1 : -1;
  return Math.abs(x) - Math.abs(y);
};

const spaceTokens = () => collectTokens(getGroup(['primitive', 'space']), ['primitive', 'space']).sort(byScale);

function SpaceScale() {
  return (
    <ul style={listStyle}>
      {spaceTokens().map((token) => {
        const negative = dimension(token) < 0;
        const resolved = resolveVar(token.name);
        return (
          <li
            key={token.name}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--primitive-space-200)' }}
          >
            <div
              aria-hidden
              data-testid={token.name}
              style={{
                width: negative ? `calc(var(${token.name}) * -1)` : `var(${token.name})`,
                height: 'var(--primitive-space-200)',
                background: 'var(--semantic-accent-brand-bold)',
              }}
            />
            <TokenDetails
              name={token.name}
              value={negative ? `${resolved}, bar drawn at its absolute size` : resolved}
              description={token.description}
            />
          </li>
        );
      })}
    </ul>
  );
}

export const Scale: Story = {
  render: () => <SpaceScale />,
  play: async ({ canvas }) => {
    const bar = canvas.getByTestId('--primitive-space-400');
    await expect(getComputedStyle(bar).width).toBe(resolveVar('--primitive-space-400'));
    const undescribed = spaceTokens().filter((token) => !token.description);
    if (undescribed.length > 0) {
      await expect(canvas.getAllByText(NO_DESCRIPTION)).toHaveLength(undescribed.length);
    }
  },
};
