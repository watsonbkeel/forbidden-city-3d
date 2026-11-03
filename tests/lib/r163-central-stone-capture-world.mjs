import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from './inner-palace-fixture.mjs';
import {centralStoneSnapshot} from './r163-central-stone-snapshot.mjs';
const scene=new THREE.Scene(),builder=new PalaceBuilder(scene,library());
try{
  builder.buildAll(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)));
  process.stdout.write(JSON.stringify(centralStoneSnapshot(scene,builder)));
}finally{builder.dispose();}
