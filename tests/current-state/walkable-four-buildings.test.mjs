import {registerR33WalkableFour} from '../lib/r33-walkable-four-native.mjs';

// Original no-jump/helper and obstacle assertions stay unmodified in the
// published R33 source replay. Current controller coverage is separate in
// qianqing-joined-passage-current.test.mjs.
await registerR33WalkableFour();
