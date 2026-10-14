const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Losing the override or platform fallback must break these checks.
function resolve(options) {
  const helper = path.join(__dirname, 'lib/browser-path.cjs');
  assert.ok(fs.existsSync(helper), 'portable browser executable resolver is available');
  return require(helper).browserExecutablePath(options);
}

test('explicit browser executable takes precedence over system candidates', () => {
  assert.equal(resolve({ env: { BROWSER_EXECUTABLE_PATH: '/custom/chromium' }, platform: 'linux', exists: () => true }), '/custom/chromium');
});
test('Linux uses the first installed Chromium or Chrome candidate', () => {
  assert.equal(resolve({ env: {}, platform: 'linux', exists: p => p === '/usr/bin/chromium' }), '/usr/bin/chromium');
  assert.equal(resolve({ env: {}, platform: 'linux', exists: p => p === '/usr/bin/google-chrome' }), '/usr/bin/google-chrome');
});
test('macOS preserves system Google Chrome support', () => {
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  assert.equal(resolve({ env: {}, platform: 'darwin', exists: p => p === chrome }), chrome);
});
test('Windows checks the standard Chrome installation', () => {
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  assert.equal(resolve({ env: { PROGRAMFILES: 'C:\\Program Files' }, platform: 'win32', exists: p => p === chrome }), chrome);
});
test('without a system browser Playwright can use its managed Chromium', () => {
  assert.equal(resolve({ env: {}, platform: 'linux', exists: () => false }), undefined);
});
