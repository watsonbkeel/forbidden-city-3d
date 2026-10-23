// Read-only horizontal exclusion against the unchanged configured registry.
// This is NOT live support, character rendering or all-actor acceptance.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as registry} from '../../data/characters/index.js';
import {CharacterWorldAdapter} from '../../src/scene/characters/CharacterWorldAdapter.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {loadZoneJsons} from '../lib/world.mjs';
import {closestHorizontalSegments} from '../lib/r57-staff-clearance.mjs';
import {createTaiheEastFirewallProfile} from '../../src/scene/palace/special/AxisFirewallProfiles.js';
import {axisFirewallBaseline} from './baseline.mjs';
const W=axisFirewallBaseline(),cm=new CollisionManager();cm.addColliders([...W.builder.colliders,...W.kit.colliders]);cm.addWalkables([...W.builder.walkables,...W.kit.walkables]);
const profile=createTaiheEastFirewallProfile({hall:W.builderData.halls[0],rect:W.builderData.rects[0],...W.builderData.options,linkWall:W.axis.items[13]});
const adapter=new CharacterWorldAdapter({scene:W.scene,collisionManager:cm,registry,zones:loadZoneJsons().map(z=>z.json)});
const transform=(frame,p)=>{const c=Math.cos(frame.rotationYRad),s=Math.sin(frame.rotationYRad);return[frame.position[0]+p[0]*c+p[2]*s,0,frame.position[2]-p[0]*s+p[2]*c];};
const x0=profile.spans[0].x0,x1=profile.spans.at(-1).x1,z0=profile.z-profile.thickness/2,z1=profile.z+profile.thickness/2;
const corners=[[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1]],edges=corners.map((p,i)=>[p,corners[(i+1)%4]]),actors=[],errors=[];
for(const actor of registry.actors){
 const p=actor.placement,path=registry.paths.find(x=>x.id===p.pathRef),seat=registry.seats.find(x=>x.id===p.seatRef);
 const anchor=adapter.resolveAnchor(path?.anchorRef??seat?.anchorRef??p.anchorRef);if(anchor.status!=='ready'){errors.push({id:actor.id,error:anchor});continue;}
 const local=path?.pointsLocalMeters??[seat?.localPelvisMeters??p.offsetMeters],points=local.map(v=>transform(anchor,v)),legs=points.length>1?points.slice(1).map((p,i)=>[points[i],p]):[[points[0],points[0]]];
 let separation=Infinity;for(const [a,b]of legs){if([a,b].some(p=>p[0]>=x0&&p[0]<=x1&&p[2]>=z0&&p[2]<=z1))separation=0;else for(const [c,d]of edges)separation=Math.min(separation,closestHorizontalSegments(a,b,c,d).distanceMeters);}
 actors.push({id:actor.id,mode:p.mode,pathRef:p.pathRef??null,points,minimumHorizontalSeparationMeters:separation,overlapsConservative2mEnvelope:separation<=2});
}
const sourceHashes=Object.fromEntries(['actors','paths','anchors','seats'].map(p=>[p+'.json',createHash('sha256').update(fs.readFileSync(new URL(`../../data/characters/${p}.json`,import.meta.url))).digest('hex')]));
const report={pass:errors.length===0&&actors.every(a=>!a.overlapsConservative2mEnvelope),scope:'read-only configured paths/static/seat horizontal exclusion, not actual binding/support/render/lifecycle acceptance',sourceHashes,actorCount:actors.length,pathActors:actors.filter(a=>a.mode==='path').length,nearest:actors.reduce((a,b)=>a.minimumHorizontalSeparationMeters<b.minimumHorizontalSeparationMeters?a:b),intersections:actors.filter(a=>a.overlapsConservative2mEnvelope),errors,actors};
fs.writeFileSync(process.argv[2]??'/tmp/r58-configured-route-check.json',JSON.stringify(report,null,2)+'\n');adapter.dispose();console.log(JSON.stringify({...report,actors:undefined}));if(!report.pass)process.exitCode=1;
