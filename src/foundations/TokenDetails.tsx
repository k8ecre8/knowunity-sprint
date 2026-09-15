import type { ReactNode } from 'react';
import { NO_DESCRIPTION, textStyle } from './tokens';

type TokenDetailsProps = {
  name: string;
  value: string;
  description?: string;
};

/** Token name, resolved value and $description, with the fallback when there is none. */
export function TokenDetails({ name, value, description }: TokenDetailsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--primitive-space-050)',
        minWidth: 'var(--primitive-space-0)',
      }}
    >
      <code
        style={{
          ...textStyle(['body', 's-bold']),
          color: 'var(--semantic-text-primary)',
          overflowWrap: 'anywhere',
        }}
      >
        {name}
      </code>
      <span style={{ ...textStyle(['body', 's-regular']), color: 'var(--semantic-text-secondary)' }}>
        {value}
      </span>
      <p
        style={{
          ...textStyle(['body', 's-regular']),
          margin: 'var(--primitive-space-0)',
          color: description ? 'var(--semantic-text-secondary)' : 'var(--semantic-text-tertiary)',
        }}
      >
        {description ?? NO_DESCRIPTION}
      </p>
    </div>
  );
}

export function Heading({ level, children }: { level: 2 | 3; children: ReactNode }) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <Tag
      style={{
        ...textStyle(level === 2 ? ['headline', 's'] : ['headline', 'xxs-bold']),
        margin: 'var(--primitive-space-0)',
        color: 'var(--semantic-text-primary)',
      }}
    >
      {children}
    </Tag>
  );
}
