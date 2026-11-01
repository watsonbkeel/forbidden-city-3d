import {tagTaiheOverhead,addTaiheEastWallDoor,addTaiheWestWallDoor,validateTaiheEastWallDoorProfile,validateTaiheWestWallDoorProfile} from './TaiheEastWallDoor.js';
import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {buildWallCap} from '../../RoofBuilder.js';

/** Own east/west three-level masonry chains. Existing terraces remain the
 * physical datum; source-calibrated metres and browser acceptance are pending. */
export function validateTaiheFirewall(builder,parent,profile) {
  const west=profile?.side==='west';
  if(profile?.id!==`taihe-${west?'west':'east'}-stepped-firewall`||!['east','west'].includes(profile.side)||profile.objectId!=='FC-1ABC6622CB')throw Error('Unsupported axis firewall profile');
  const p=profile.passage,spans=profile.spans,last=spans?.at(-1);
  const numbers=[profile.z,profile.thickness,profile.terminalJoin?.x,profile.hallJoin?.x,p?.centerX,p?.floorY,p?.clearWidth,p?.clearHeight];
  if(!numbers.every(Number.isFinite)||profile.thickness<=0||p.clearWidth<=0||p.clearHeight<=0||!Array.isArray(spans)||spans.length<3||spans.length>4||spans.some((s,i)=>![s.x0,s.x1,s.floorY,s.topY].every(Number.isFinite)||s.x1<=s.x0||(west?s.x0<=0:s.x1>=0)||s.topY<=s.floorY||s.floorY<0||(i&&Math.abs(west?s.x1-spans[i-1].x0:s.x0-spans[i-1].x1)>1e-8))||last.id!=='tier-3'||p.floorY!==last.floorY||p.centerX-p.clearWidth/2<=last.x0||p.centerX+p.clearWidth/2>=last.x1||p.floorY+p.clearHeight>=last.topY||profile.terminalJoin.x!==(west?spans[0].x1:spans[0].x0)||profile.hallJoin.x!==(west?last.x0:last.x1))throw Error('Malformed Taihe firewall dimensions or opening');
  const inherited=profile.inherited,tiers=spans.filter(s=>s.id!=='retained-wall-join'),eq=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-8;
  if(!inherited||inherited.layers!==3||![inherited.lh,inherited.setback,inherited.hallWidth,inherited.terraceUpperHalfWidth,profile.terminalJoin.height].every(Number.isFinite)||inherited.lh<=0||inherited.setback<=0||profile.terminalJoin.item!==`axis-courts/items/${west?15:13}`||profile.terminalJoin.gate!==(west?'中右门':'中左门')||profile.terminalJoin.z!==profile.z||profile.hallJoin.z!==profile.z||tiers.length!==3||!Array.isArray(profile.terraceTiers)||profile.terraceTiers.length!==3)throw Error('Taihe wall terminal/three-tier contract mismatch');
  const outer=inherited.terraceUpperHalfWidth+2*inherited.setback,inner=inherited.hallWidth/2+.45;
  for(let i=0;i<3;i++){const t=tiers[i],a=outer-i*inherited.setback,b=i===2?inner:outer-(i+1)*inherited.setback,expected={id:`tier-${i+1}`,x0:west?b:-a,x1:west?a:-b,floorY:(i+1)*inherited.lh,topY:profile.terminalJoin.height+i*inherited.lh};if(t.id!==expected.id||!['x0','x1','floorY','topY'].every(k=>eq(t[k],expected[k])&&eq(profile.terraceTiers[i]?.[k],t[k]))||profile.terraceTiers[i]?.id!==t.id)throw Error('Taihe tier geometry/terrace contract mismatch');}
  if(spans.length===4&&(spans[0].id!=='retained-wall-join'||spans[0].floorY!==0||!eq(spans[0].topY,profile.terminalJoin.height)))throw Error('Taihe short join contract mismatch');
  (west?validateTaiheWestWallDoorProfile:validateTaiheEastWallDoorProfile)(profile);
  if(parent.getObjectByName(profile.id))throw Error('Taihe east firewall is already installed');
  if(builder.ox!==0||builder.oz!==0)throw Error('Taihe firewall requires the existing zero-origin three-hall group');
  const identity=new THREE.Matrix4();for(let p=parent;p;p=p.parent){if(p.matrixAutoUpdate)p.updateMatrix();if(!p.matrix.equals(identity))throw Error('Taihe firewall parent transform must be identity');}
}
export function buildTaiheEastFirewall(builder,parent,profile) {
 if(profile?.side!=='east')throw Error('Expected own east firewall');return buildTaiheFirewall(builder,parent,profile);
}
export function buildTaiheWestFirewall(builder,parent,profile) {
 if(profile?.side!=='west')throw Error('Expected own west firewall');return buildTaiheFirewall(builder,parent,profile);
}
function buildTaiheFirewall(builder,parent,profile) {
  validateTaiheFirewall(builder,parent,profile);const west=profile.side==='west';
  const group=new THREE.Group();group.name=profile.id;group.userData.structure=structuredClone(profile);
  const {z,thickness,passage}=profile,half=thickness/2;
  const solid=(id,x0,x1,y0,y1)=>{
    if(x1-x0<=1e-8||y1-y0<=1e-8)return;
    // Disjoint volumes: no red face remains hidden under a brick skin.
    const floor=profile.spans.find(s=>x0>=s.x0-1e-8&&x1<=s.x1+1e-8)?.floorY??y0,footTop=Math.max(y0,Math.min(y1,floor+(west?1.15:1.05)));
    if(footTop>y0){const foot=builder.libBox(group,'wall_brick',x1-x0,footTop-y0,thickness,(x0+x1)/2,(y0+footTop)/2,z);foot.name=`${profile.id}:${id}:brick`;foot.userData.firewallPart='masonry-brick-foot';}
    if(y1>footTop){const m=builder.libBox(group,'wall_red',x1-x0,y1-footTop,thickness,(x0+x1)/2,(footTop+y1)/2,z);m.name=`${profile.id}:${id}`;m.userData.firewallPart='masonry';}
    builder.col(x0,y0,z-half,x1,y1,z+half);
    if(id.endsWith(':lintel'))tagTaiheOverhead(builder.colliders.at(-1),`${profile.id}:${id}`);
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
    const start=!west&&span.id==='tier-1'?profile.terminalJoin.x:span.x0,end=west&&span.id==='tier-1'?profile.terminalJoin.x:span.x1;
    const cap=buildWallCap(builder.library,{length:end-start,thickness});
    cap.position.set((start+end)/2,span.topY,z);cap.name=`${profile.id}:${span.id}:cap`;
    const green=builder.ownMat('taihe-wall-green-glaze-fit',{color:0x275344,roughness:.42,metalness:0});green.name='taihe-wall-green-glaze-fit';
    cap.traverse(m=>{if(m.isMesh){if(m.material===builder.library.material('wall_red'))m.material=green;m.castShadow=m.receiveShadow=true;m.userData.firewallPart='glazed-cap';}});
    builder.ownedMaterials.push(...(cap.userData.ownedMaterials??[]));group.add(cap);
  }
  (west?addTaiheWestWallDoor:addTaiheEastWallDoor)(builder,group,profile);
  group.userData.structure.brickFoot={upperHeightFit:west?1.15:1.05,lowerLevels:'CONTINUITY_FIT_OBSCURED_NOT_MEASURED',volumes:'DISJOINT_FROM_RED_MASONRY'};
  // Cap contact uses its actual transformed visible triangles, never a tall box.
  group.updateMatrixWorld(true);
  for(const cap of group.children.filter(c=>c.name.endsWith(':cap'))){const vertices=[];cap.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position,ix=g.index;for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld));if(new THREE.Triangle(...v).getArea()<1e-12)continue;for(const q of v)vertices.push(...q.toArray());}});const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));try{const owner=triangleInstance(createTriangleTemplate(geometry),[0,0,0],`${profile.id}:cap:${cap.name.split(':')[1]}`),box=owner.box.clone();box.triangleSupport=owner;builder.colliders.push(box);}finally{geometry.dispose();}}
  parent.add(group);return group;
}
