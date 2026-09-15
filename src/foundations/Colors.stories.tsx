import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Heading, TokenDetails } from './TokenDetails';
import {
  collectTokens,
  getGroup,
  listStyle,
  pageStyle,
  resolveVar,
  sectionStyle,
  toLabel,
  type Token,
  type TokenNode,
} from './tokens';

const meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Swatch({ token }: { token: Token }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--primitive-space-400)' }}>
      <div
        aria-hidden
        data-testid={token.name}
        style={{
          flexShrink: 0,
          width: 'var(--primitive-space-1200)',
          height: 'var(--primitive-space-1200)',
          background: `var(${token.name})`,
          border: 'var(--primitive-stroke-border) solid var(--semantic-border-strong)',
          borderRadius: 'var(--primitive-radius-200)',
        }}
      />
      <TokenDetails name={token.name} value={resolveVar(token.name)} description={token.description} />
    </li>
  );
}

function SemanticColors() {
  const semantic = getGroup(['semantic']);
  const groups = Object.keys(semantic)
    .filter((key) => !key.startsWith('$'))
    .map((group) => ({
      group,
      tokens: collectTokens(semantic[group] as TokenNode, ['semantic', group]).filter(
        (token) => token.type === 'color',
      ),
    }))
    .filter(({ tokens }) => tokens.length > 0);

  return (
    <div style={pageStyle}>
      {groups.map(({ group, tokens }) => {
        // feedback and accent nest one level deeper: category, concept, role.
        const subgroups = new Map<string, Token[]>();
        for (const token of tokens) {
          const key = token.path.length > 3 ? token.path[2] : '';
          subgroups.set(key, [...(subgroups.get(key) ?? []), token]);
        }
        return (
          <section key={group} style={sectionStyle}>
            <Heading level={2}>{toLabel(group)}</Heading>
            {[...subgroups].map(([subgroup, subTokens]) => (
              <div key={subgroup} style={sectionStyle}>
                {subgroup && <Heading level={3}>{toLabel(subgroup)}</Heading>}
                <ul style={listStyle}>
                  {subTokens.map((token) => (
                    <Swatch key={token.name} token={token} />
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

export const Semantic: Story = {
  render: () => <SemanticColors />,
  play: async ({ canvas }) => {
    // A swatch only has a fill if tokens.css loaded.
    const swatch = canvas.getByTestId('--semantic-background-page');
    await expect(getComputedStyle(swatch).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    const { $description } = getGroup(['semantic', 'background', 'page']);
    await expect(canvas.getByText($description as string)).toBeVisible();
  },
};
