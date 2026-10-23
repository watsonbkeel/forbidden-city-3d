// Reuse inside the owner's single unified production world; never creates a
// scene, filters the registry, overrides visibility, or substitutes positions.
import assert from 'node:assert/strict';
import fragment from '../../data/characters/fragments/r52-court-life.json' with {type:'json'};
const toWorld=(frame,p)=>{const c=Math.cos(frame.rotationYRad),s=Math.sin(frame.rotationYRad);return[frame.position[0]+p[0]*c+p[2]*s,frame.position[1]+p[1],frame.position[2]-p[0]*s+p[2]*c];};
export function courtLifeScenarios({registry,adapter}){
 return fragment.contexts.map(context=>{
  const anchor=adapter.resolveAnchor(context.sceneRef+'-r52-hall');assert.equal(anchor.status,'ready','Resolve actual courtyard '+context.sceneRef);
  const actorIds=fragment.actors.filter(a=>a.sceneRef===context.sceneRef).map(a=>a.id),actors=actorIds.map(id=>{const a=registry.actors.find(a=>a.id===id);assert.ok(a,'Missing required courtyard role '+id);return a;});
  const points=actors.flatMap(a=>a.placement.mode==='path'?registry.paths.find(p=>p.id===a.placement.pathRef).pointsLocalMeters:[a.placement.offsetMeters]);
  const center=[0,1,2].map(i=>(Math.min(...points.map(p=>p[i]))+Math.max(...points.map(p=>p[i])))/2);center[1]=1;
  return{sceneRef:context.sceneRef,zoneRef:context.zoneRef,building:context.building,actorIds,camera:toWorld(anchor,context.cameraLocalMeters),lookAt:toWorld(anchor,center),anchor:{position:anchor.position,rotationYRad:anchor.rotationYRad},routes:actors.filter(a=>a.placement.mode==='path').map(a=>({actorId:a.id,pathRef:a.placement.pathRef,surfaceRef:a.placement.surfaceRef,minimumFullCycles:2})),arrangement:context.arrangement};
 });
}
