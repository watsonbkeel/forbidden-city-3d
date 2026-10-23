import {buildR52World} from './lib/r52-world.mjs';
import {proveR53LifeCandidates} from './lib/r53-life-candidate-proof.mjs';
const world=await buildR52World();try{const r=await proveR53LifeCandidates(world,{worldState:'frozen-r52'});console.log(JSON.stringify({success:r.success,registered:r.registered,bindings:r.bindings.length,views:r.views.length,routes:r.motion.length,lifecycle:r.lifecycle.length}));}finally{world.dispose();}
