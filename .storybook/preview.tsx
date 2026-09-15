import type { Preview } from '@storybook/nextjs-vite'
import { themes } from 'storybook/theming'
import '../build/css/tokens.css'
import './preview.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    // Dark mode only: the page token is the sole background on offer.
    backgrounds: {
      options: {
        page: { name: 'Page', value: 'var(--semantic-background-page)' },
      },
    },

    // 390 is the product width (docs/design-system.md → scaffold). Docs pages
    // ignore the viewport global, so they keep full width for swatches.
    viewport: {
      options: {
        scaffold: {
          name: 'Scaffold (390)',
          styles: { width: '390px', height: '100%' },
          type: 'mobile',
        },
      },
    },

    docs: {
      theme: themes.dark,
    },
  },

  initialGlobals: {
    backgrounds: { value: 'page' },
    viewport: { value: 'scaffold', isRotated: false },
  },
};

export default preview;
