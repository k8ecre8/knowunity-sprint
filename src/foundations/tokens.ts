import type { CSSProperties } from 'react';
import tokens from '../../tokens/tokens.json';

export type TokenNode = {
  $type?: string;
  $value?: unknown;
  $description?: string;
  [key: string]: unknown;
};

export type Token = {
  path: string[];
  /** The CSS custom property Style Dictionary generates for this token. */
  name: string;
  type?: string;
  description?: string;
  /** The source $value from tokens.json, before resolution. */
  value: unknown;
};

export const NO_DESCRIPTION = 'No description in tokens.json';

const tree = tokens as unknown as TokenNode;

// Mirrors the name/path transform in style-dictionary.config.mjs.
export const cssVar = (path: string[]) => `--${path.join('-')}`;

export function getGroup(path: string[]): TokenNode {
  return path.reduce((node, key) => node[key] as TokenNode, tree);
}

/** Every token under a node, in file order. $type inherits from parent groups, as in DTCG. */
export function collectTokens(node: TokenNode, path: string[], inheritedType?: string): Token[] {
  const type = node.$type ?? inheritedType;
  if ('$value' in node) {
    return [{ path, name: cssVar(path), type, description: node.$description, value: node.$value }];
  }
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => collectTokens(child as TokenNode, [...path, key], type));
}

/** The value the browser resolved from build/css/tokens.css. */
export function resolveVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** The numeric part of a dimension token's source value. */
export const dimension = (token: Token) => (token.value as { value: number }).value;

export const toLabel = (key: string) => {
  const words = key.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Applies a typeScale step, e.g. textStyle(['body', 's-regular']). */
export function textStyle(step: string[]): CSSProperties {
  const base = cssVar(['typeScale', ...step]);
  return {
    fontFamily: `var(${base}-fontFamily)`,
    fontWeight: `var(${base}-fontWeight)`,
    fontSize: `var(${base}-fontSize)`,
    lineHeight: `var(${base}-lineHeight)`,
    letterSpacing: `var(${base}-letterSpacing)`,
  };
}

export const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--primitive-space-600)',
  margin: 'var(--primitive-space-0)',
  padding: 'var(--primitive-space-0)',
  listStyle: 'none',
};

export const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--primitive-space-400)',
};

export const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--primitive-space-1200)',
};
