import {createHash} from 'node:crypto';import {buildR52World} from './r52-world.mjs';
const hash=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');
export async function navSnapshot(){const W=await buildR52World({loadAll:true});try{return{colliders:hash(W.cm.colliders),walkables:hash(W.cm.walkables),rooms:hash(W.rooms),mapItems:hash(W.mapItems),counts:{colliders:W.cm.colliders.length,walkables:W.cm.walkables.length,rooms:W.rooms.length,mapItems:W.mapItems.length}};}finally{W.dispose();}}
