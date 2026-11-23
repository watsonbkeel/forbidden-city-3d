import {registerNativeTaiheGeometry} from '../lib/r34-taihe-geometry-native.mjs';

// Keep the original historical geometry/fingerprints and Taihe geometry cases
// in the exact delivered R34 source tree. Current Taihe navigation stays in
// taihe-core-navigation.test.mjs and never uses this private test tree.
await registerNativeTaiheGeometry();
