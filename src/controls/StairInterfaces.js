import * as THREE from 'three';
export const STAIR_IDS=Object.freeze(['chengqian-front-stair','jingfu-rear-stair','chuxiu-corridor-east-ramp','chuxiu-corridor-west-ramp']);
const fields=['minX','maxX','minZ','maxZ','a0','a1','y0','y1'];
/** Original registered rectangular engineering ramp, not a closed solid or a
 * new render surface. Copy its exact source values before any owner translation. */
export function cloneStairRamp(input,origin,ownerBox){
 if(!input||input.axis!=='z'||!fields.every(k=>Number.isFinite(input[k]))||input.minX>=input.maxX||input.minZ>=input.maxZ||input.a0===input.a1||Math.min(input.a0,input.a1)!==input.minZ||Math.max(input.a0,input.a1)!==input.maxZ||input.y0<0||input.y1<0||input.y0===input.y1||['crossMin0','crossMax0','crossMin1','crossMax1'].some(k=>input[k]!==undefined)||!Array.isArray(origin)||origin.length!==3||!origin.every(Number.isFinite))throw new TypeError('Stair interface needs its existing finite rectangular z ramp');
 const dx=ownerBox.min.x-origin[0],dy=ownerBox.min.y-origin[1],dz=ownerBox.min.z-origin[2];
 return Object.freeze({type:'ramp',axis:'z',minX:input.minX+dx,maxX:input.maxX+dx,minZ:input.minZ+dz,maxZ:input.maxZ+dz,a0:input.a0+dz,a1:input.a1+dz,y0:input.y0+dy,y1:input.y1+dy});
}
export function stairRampContact(scope,x,z,maxTop,radius=.5){
 const r=scope.ramp;if(scope.kind!=='stair-interface'||!r)return null;
 const x0=Math.max(x-radius,r.minX),x1=Math.min(x+radius,r.maxX),z0=Math.max(z-radius,r.minZ),z1=Math.min(z+radius,r.maxZ);
 if(x0>=x1||z0>=z1)return null;
 const heightAt=a=>r.y0+(r.y1-r.y0)*Math.max(0,Math.min(1,(a-r.a0)/(r.a1-r.a0)));
 const h0=heightAt(z0),h1=heightAt(z1),height=Math.max(h0,h1);
 if(height>maxTop)return null;
 return{height,witness:new THREE.Vector3((x0+x1)/2,height,h0>=h1?z0:z1),owner:null,source:'existing-engineering-ramp',regionId:scope.id};
}
/** Identity-specific registration after actual builders, no new geometry or
 * walkable. Source selection is validated completely before a marker is added. */
export function registerStairInterfaces(kit,zoneJson){
 const target=zoneJson.id==='east-six'?{id:STAIR_IDS[0],item:zoneJson.items.find(i=>i.name==='承乾宫'&&i.interior==='A:palace-front'),rear:false}:zoneJson.id==='ningshou'?{id:STAIR_IDS[1],item:zoneJson.items.find(i=>i.name==='景福宫'),rear:true}:null;
 if(!target)return;const item=target.item;if(!item)return;
 const ramps=kit.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&Math.max(w.y0,w.y1)===item.ph&&w.minX>=item.x-item.w/2&&w.maxX<=item.x+item.w/2&&w.minZ>=item.z-item.d/2-(item.pad??0)-3&&w.maxZ<=item.z+item.d/2+(item.pad??0)+3&&(target.rear?w.minZ>item.z:w.maxZ<item.z));
 const owners=kit.colliders.filter(b=>b.isBox3&&b.min.y===0&&b.max.y===item.ph&&b.min.x<item.x&&b.max.x>item.x&&b.min.z<item.z&&b.max.z>item.z);
 if(ramps.length!==1||owners.length!==1)throw Error(`Stair interface source mismatch: ${target.id} ramps=${ramps.length} owners=${owners.length}`);
 const ramp=ramps[0],owner=owners[0],origin=owner.min.toArray();cloneStairRamp(ramp,origin,owner);
 if(owner.furnitureMotionScope)throw Error('Stair interface owner already scoped');
 owner.furnitureMotionScope={kind:'stair-interface',id:target.id,groundY:0,ramp:{...ramp},rampOrigin:origin,minOffsetX:-.8,maxOffsetX:owner.max.x+.8-owner.min.x,minOffsetZ:ramp.minZ-.8-owner.min.z,maxOffsetZ:ramp.maxZ+.8-owner.min.z};
}

/** One-way feet crossing of the ORIGINAL engineering support sheet. It has no
 * below-sheet volume/parity and is not used as a head/side obstacle. Piecewise
 * affine maxima change only at footprint/ramp edge events, not sampled steps. */
export function stairRampSweep(scope,from,to,radius=.5){
 const r=scope.ramp;if(scope.kind!=='stair-interface'||!r)return null;
 const dx=to.x-from.x,dz=to.z-from.z,dy=to.y-from.y;let enter=0,leave=1;
 for(const [start,v,lo,hi] of[[from.x,dx,r.minX-radius,r.maxX+radius],[from.z,dz,r.minZ-radius,r.maxZ+radius]]){
  if(v===0){if(start<=lo||start>=hi)return null;}else{const a=(lo-start)/v,b=(hi-start)/v;enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));if(enter>=leave)return null;}
 }
 const rising=(r.y1-r.y0)/(r.a1-r.a0)>0,edge=z=>Math.max(r.minZ,Math.min(r.maxZ,z+(rising?radius:-radius))),height=t=>{const a=edge(from.z+dz*t);return r.y0+(r.y1-r.y0)*Math.max(0,Math.min(1,(a-r.a0)/(r.a1-r.a0)));};
 const times=[enter,leave];if(dz!==0)for(const boundary of[r.minZ,r.maxZ]){const t=(boundary-(rising?radius:-radius)-from.z)/dz;if(t>enter&&t<leave)times.push(t);}times.sort((a,b)=>a-b);
 for(let i=1;i<times.length;i++){const a=times[i-1],b=times[i],ha=height(a),hb=height(b),ga=from.y+dy*a-ha,gb=from.y+dy*b-hb;
  if(ga>=0&&gb<0){const fraction=a+(b-a)*ga/(ga-gb);return{fraction,kind:'stair-ramp',surface:{height:height(fraction),source:'existing-engineering-ramp',regionId:scope.id}};}
 }
 return null;
}
