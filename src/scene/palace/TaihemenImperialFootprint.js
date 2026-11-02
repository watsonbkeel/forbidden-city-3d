import * as T from'three';
import{PLAYER}from '../../config/constants.js';
import{wumenJointBodySweep}from '../../controls/WumenJointAscentSweep.js';
// Local gameplay contact envelope of the retained solid stone, not a new mesh,
// generic stair permission, centre-point floating floor, or visitor-access claim.
export const TAIHEMEN_IMPERIAL_CONTACT_ID='axis/taihemen-user-central-stone-footprint';
export function registerTaihemenImperialFootprint(builder,parent,p){
 const c=p?.centralGroup,r=.5,clearance=1e-4;
 if(parent?.name!=='太和门'||builder.ox!==0||builder.oz!==0||c?.gameAccessOverride!=='USER_REQUESTED_REMOVE_HEAD_AND_TOE_BLACK_BARRIERS_ONLY_2026_11_02'||c.stoneWidth<=2*r||builder.walkables.some(w=>w.structureId===TAIHEMEN_IMPERIAL_CONTACT_ID))throw Error('Taihemen imperial footprint requires one explicit real-stone host');
 for(const [name,id]of[['taihemen-c-central-stone-body',c.physicsOwnerIds[0]],['taihemen-c-central-carved-stone',c.physicsOwnerIds[1]]]){
  const meshes=[];parent.traverse(m=>{if(m.name===name)meshes.push(m)});const owners=builder.colliders.filter(b=>b.triangleSupport?.id===id);
  if(meshes.length!==1||owners.length!==1||!meshes[0].isMesh)throw Error('Taihemen imperial contact has no unique visible stone and collision owner');
  const m=meshes[0],shape=owners[0].triangleSupport;m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position,ix=m.geometry.index,actual=[];for(let i=0;i<(ix?.count??a.count);i++)actual.push(...new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld).toArray());const expected=shape.template.triangles.flatMap(t=>[t.triangle.a,t.triangle.b,t.triangle.c].flatMap(v=>v.clone().add(shape.offset).toArray()));
  if(actual.length!==expected.length||actual.some((v,i)=>Math.abs(v-expected[i])>1e-9))throw Error('Taihemen imperial support must bind exact current stone triangles');
 }
 // The full 1m-wide player footprint first touches the uphill stone at z+.5.
 // Continue that plane through the half-metre head transition to avoid a
 // concave swept-body corner. The conservative gap stays below 0.142m.
 // Restrict x to a fully stone-supported footprint; never extend over side voids.
 const row={type:'ramp',axis:'z',minX:-c.stoneWidth/2+r,maxX:c.stoneWidth/2-r,minZ:c.zToe-r,maxZ:p.zEdge+r,a0:c.zToe-r,a1:p.zEdge,y0:p.y0+clearance,y1:p.y1+(p.y1-p.y0)/c.run*r+clearance,structureId:TAIHEMEN_IMPERIAL_CONTACT_ID};
 row.imperialFootprintId=TAIHEMEN_IMPERIAL_CONTACT_ID;authored.set(row,{row:{...row},owners:c.physicsOwnerIds.slice(0,2).map(id=>({id,signature:shapeSignature(builder.colliders.find(b=>b.triangleSupport?.id===id).triangleSupport)}))});builder.walkables.push(row);c.explicitNavWalkables=1;c.footprintContact={id:row.structureId,radius:r,sourceOwnerIds:c.physicsOwnerIds.slice(0,2),numericalTriangleClearance:clearance,maximumCentreToStoneHeight:(p.y1-p.y0)/c.run*r+clearance,semantics:'FULL_BODY_FOOTPRINT_WITH_CONSERVATIVE_HEAD_TRANSITION_MAX_0_142M_NOT_SURVEY',lifecycle:'REGISTER_WITH_EXACT_STONE_OWNERS_AND_REMOVE_WITH_SAME_WORLD_TAG'};return row;
}

const authored=new WeakMap(),live=new WeakMap(),previous=new WeakMap();
const keys=['minX','maxX','minZ','maxZ','a0','a1','y0','y1'];
const shapeSignature=s=>JSON.stringify({offset:s.offset.toArray(),triangles:s.template.triangles.map(t=>[t.triangle.a,t.triangle.b,t.triangle.c].map(v=>v.toArray()))});
export function preserveTaihemenImperialContact(target,source){
 if(source.imperialFootprintId===undefined)return;
 const record=authored.get(source);
 if(!record||source.imperialFootprintId!==TAIHEMEN_IMPERIAL_CONTACT_ID||keys.some(k=>source[k]!==record.row[k]||target[k]!==record.row[k]))throw Error('Imperial contact requires the authored exact stone capability');
 target.imperialFootprintId=TAIHEMEN_IMPERIAL_CONTACT_ID;live.set(target,record);
}
export function resolveTaihemenImperialContact(cm,state,delta,radius=.5){
 const prior=previous.get(cm);previous.delete(cm);
 if(!state||state.airborne!==false||state.verticalVelocity>0||radius!==.5||![state.x,state.z,state.feetY,state.groundY,state.verticalVelocity,delta].every(Number.isFinite)||delta<=0||delta>.100001)return null;
 const rows=cm.walkables.filter(w=>w.imperialFootprintId===TAIHEMEN_IMPERIAL_CONTACT_ID);if(rows.length!==1)return null;
 const w=rows[0],record=live.get(w);if(!record||keys.some(k=>w[k]!==record.row[k]))return null;
 for(const owner of record.owners){const found=cm.colliders.filter(c=>c.triangleSupport?.id===owner.id);if(found.length!==1||shapeSignature(found[0].triangleSupport)!==owner.signature)return null;}
 if(state.x<w.minX+.5||state.x>w.maxX-.5||state.z<w.minZ-1||state.z>w.maxZ+1)return null;
 const ground=cm.getGroundHeight(state.x,state.z,Math.max(state.feetY,state.groundY),.6);
 if(Math.abs(state.feetY-ground)>.65)return null;
 previous.set(cm,{x:state.x,z:state.z,ground});
 if(!prior||Math.abs(state.feetY-prior.ground)>.3||Math.abs(state.groundY-prior.ground)>.3||Math.hypot(state.x-prior.x,state.z-prior.z)>PLAYER.SPRINT_SPEED*delta+1e-6)return null;
 const from=new T.Vector3(prior.x,state.feetY,prior.z),to=new T.Vector3(state.x,ground,state.z);
 if(wumenJointBodySweep(cm,from,to,.5).blocked)return null;
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,taihemenImperialContact:true};
}
