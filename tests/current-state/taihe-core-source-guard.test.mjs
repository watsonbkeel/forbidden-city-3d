import {registerR34LegacySourceGuard} from '../lib/r34-legacy-source-guard-replay.mjs';

// Run the original authored assertions against their published source epoch.
await registerR34LegacySourceGuard('tests/current-state/taihe-core-source-guard.test.mjs');
