// Prefer an explicit browser, then an installed platform browser, then Playwright's
// managed Chromium (undefined executablePath). Shared by browser test runners.
const fs = require('node:fs');
const path = require('node:path');

function browserExecutablePath({ env = process.env, platform = process.platform, exists = fs.existsSync } = {}) {
  if (env.BROWSER_EXECUTABLE_PATH) return env.BROWSER_EXECUTABLE_PATH;
  const candidates = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
    linux: ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'],
    win32: [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA]
      .filter(Boolean).map(dir => path.win32.join(dir, 'Google', 'Chrome', 'Application', 'chrome.exe')),
  };
  return (candidates[platform] || []).find(exists);
}

module.exports = { browserExecutablePath };
