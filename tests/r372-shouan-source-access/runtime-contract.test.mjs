import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Shouan exact source adapter exists without changing product collision',()=>{assert.ok(fs.existsSync(new URL('../lib/shouan-current-access.mjs',import.meta.url)));});
