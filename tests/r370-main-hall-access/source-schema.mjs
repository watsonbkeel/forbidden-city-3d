import {createHash} from 'node:crypto';
export const specs=[{zone:'east-six',index:9,name:'承乾宫',x:-93.6,z:381.8,start:368,end:377,maxFeet:Math.fround(.62)},{zone:'west-six',index:23,name:'储秀宫',x:94.8,z:429.3,start:418,end:426,maxFeet:Math.fround(.82)}];
export const data=v=>JSON.parse(JSON.stringify(v));
export const signature=v=>JSON.stringify(data(v));
export function intersects(b,s){return b.max.x>s.x-1&&b.min.x<s.x+1&&b.max.z>s.start-.5&&b.min.z<s.end+.5&&b.max.y>0&&b.min.y<3;}
export function supportIntersects(w,s){if(w.type==='box')return intersects({min:{...w.box.min,y:0},max:{...w.box.max,y:1}},s);return w.type==='ramp'&&w.maxX>s.x-1&&w.minX<s.x+1&&w.maxZ>s.start-.5&&w.minZ<s.end+.5;}
export const colliderRecord=b=>({bounds:[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z],sha256:createHash('sha256').update(signature(b)).digest('hex')});
export function snapshot(kit,zone){const s=specs.find(v=>v.zone===zone.id);if(!s)return null;kit.root.updateWorldMatrix(true,true);const frames=kit.root.children.filter(o=>o.isGroup&&o.position.x===s.x&&o.position.z===s.z);if(frames.length!==1)throw Error('unique canonical main frame');return{...s,item:data(zone.items[s.index]),matrix:frames[0].matrixWorld.elements.slice(),colliders:kit.colliders.filter(b=>intersects(b,s)).map(colliderRecord),walkables:kit.walkables.filter(w=>supportIntersects(w,s)).map(data)};}
