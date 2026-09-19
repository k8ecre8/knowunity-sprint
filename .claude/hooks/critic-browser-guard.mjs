// PreToolUse guard for the critic subagents' Playwright tools.
// - No `filename`: Playwright resolves explicit names against the repo, so every
//   screenshot or dump must take the auto-named path in --output-dir, outside it.
// - The app and Storybook's story iframe only. The Storybook manager is blocked
//   because its controls panel can save a story back to its source file.

const ALLOWED_URL = /^http:\/\/localhost:(3000\/|6006\/iframe\.html\?)/;

let raw = '';
for await (const chunk of process.stdin) raw += chunk;

const input = JSON.parse(raw).tool_input ?? {};

if (input.filename !== undefined) {
  process.stderr.write('Blocked: omit `filename`. Output is saved to the output directory automatically; cite the path it returns.\n');
  process.exit(2);
}

if (typeof input.url === 'string' && !ALLOWED_URL.test(input.url)) {
  process.stderr.write(
    'Blocked: critics may open http://localhost:3000/… (the app) and http://localhost:6006/iframe.html?id=… (one story) only.\n',
  );
  process.exit(2);
}
