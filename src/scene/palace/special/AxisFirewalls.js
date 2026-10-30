import {addTaiheEastWallDoor,validateTaiheEastWallDoorProfile} from './TaiheEastWallDoor.js';
import * as THREE from 'three';
import {buildWallCap} from '../../RoofBuilder.js';

/** Add only the reviewed east connector. Existing halls, platforms, rails and
 * stairs are untouched. Low rails crossing its solid body remain inside it;
 * their exact surviving geometry is checked separately by the fragment QA.
 */
export function buildTaiheEastFirewall(builder,parent,profile) {
  if(profile?.id!=='taihe-east-stepped-firewall'||profile.side!=='east'||profile.objectId!=='FC-1ABC6622CB')throw Error('Unsupported axis firewall profile');
  const p=profile.passage,spans=profile.spans,last=spans?.at(-1);
  const numbers=[profile.z,profile.thickness,profile.terminalJoin?.x,profile.hallJoin?.x,p?.centerX,p?.floorY,p?.clearWidth,p?.clearHeight];
  if(!numbers.every(Number.isFinite)||profile.thickness<=0||p.clearWidth<=0||p.clearHeight<=0||!Array.isArray(spans)||spans.length<3||spans.length>4||spans.some((s,i)=>![s.x0,s.x1,s.floorY,s.topY].every(Number.isFinite)||s.x1<=s.x0||s.x1>=0||s.topY<=s.floorY||s.floorY<0||(i&&Math.abs(s.x0-spans[i-1].x1)>1e-8))||last.id!=='tier-3'||p.floorY!==last.floorY||p.centerX-p.clearWidth/2<=last.x0||p.centerX+p.clearWidth/2>=last.x1||p.floorY+p.clearHeight>=last.topY||profile.terminalJoin.x!==spans[0].x0||profile.hallJoin.x!==last.x1)throw Error('Malformed Taihe firewall dimensions or opening');
  validateTaiheEastWallDoorProfile(profile);
  if(parent.getObjectByName(profile.id))throw Error('Taihe east firewall is already installed');
  if(builder.ox!==0||builder.oz!==0)throw Error('Taihe firewall requires the existing zero-origin three-hall group');
  const group=new THREE.Group();group.name=profile.id;group.userData.structure=structuredClone(profile);
  const {z,thickness,passage}=profile,half=thickness/2;
  const solid=(id,x0,x1,y0,y1)=>{
    if(x1-x0<=1e-8||y1-y0<=1e-8)return;
    const m=builder.libBox(group,'wall_red',x1-x0,y1-y0,thickness,(x0+x1)/2,(y0+y1)/2,z);
    m.name=`${profile.id}:${id}`;m.userData.firewallPart='masonry';
    builder.col(x0,y0,z-half,x1,y1,z+half);
  };
  for(const span of profile.spans){
    if(span===profile.spans.at(-1)){
      const a=passage.centerX-passage.clearWidth/2,b=passage.centerX+passage.clearWidth/2;
      solid(`${span.id}:outer-jamb`,span.x0,a,span.floorY,span.topY);
      solid(`${span.id}:inner-jamb`,b,span.x1,span.floorY,span.topY);
      solid(`${span.id}:lintel`,a,b,passage.floorY+passage.clearHeight,span.topY);
    }else solid(span.id,span.x0,span.x1,span.floorY,span.topY);
    // The sub-metre ground join is a continuation of tier1, not another cap
    // with a fake finial. One horizontal cap per inherited platform level.
    if(span.id==='retained-wall-join')continue;
    const start=span.id==='tier-1'?profile.terminalJoin.x:span.x0;
    const cap=buildWallCap(builder.library,{length:span.x1-start,thickness});
    cap.position.set((start+span.x1)/2,span.topY,z);cap.name=`${profile.id}:${span.id}:cap`;
    cap.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;m.userData.firewallPart='glazed-cap';}});
    builder.ownedMaterials.push(...(cap.userData.ownedMaterials??[]));group.add(cap);
  }
  addTaiheEastWallDoor(builder,group,profile);
  parent.add(group);return group;
}
