import {after} from 'node:test';
import {stageR32QinanExterior} from '../lib/r32-qinan-exterior-native.mjs';

// R32 exterior-only/no-jump acceptance. The current virtual east/west
// interior round trips are independently tested in qinan-side-entry-current.
const replay=stageR32QinanExterior();
after(replay.dispose);
await import(replay.original.href);
