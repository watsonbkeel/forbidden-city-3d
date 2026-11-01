import { applyXihuaOuterWindowBand } from './XihuaOuterWindowBand.js';
import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
import { gateRailFacade } from '../gateRailFacade.js';

/** Source-supported topology, provisional retained-model dimensions.
 * Museum entries 236502/236501: three tunnels, square outer portals and
 * arched interiors, five-by-three-bay tower, two-eave hipped roof/veranda.
 * No platform/tunnel survey is implied by these engineering-fit numbers.
 */
export const EAST_WEST_CITY_GATE_FIT = Object.freeze({
  width:30, depth:15, platformHeight:9, portalWidth:5.5,
  portalCenters:Object.freeze([-8.4,0,8.4]), portalHeight:6.5,
  vaultRise:1, vaultSegments:10, faceDepth:.6,
  towerWidth:24, towerDepth:9, towerColumnHeight:6,
  status:'OFFICIAL_TOPOLOGY_MODEL_FIT_NOT_SURVEYED',
});
export function eastWestCityGateGeometry(item) {
  const rot=typeof item.rot==='number'?item.rot:({east:Math.PI/2,west:-Math.PI/2}[item.rot]);
  const expected=item.name==='东华门'?Math.PI/2:item.name==='西华门'?-Math.PI/2:NaN;
  if(item.cityGateProfile!=='east-west'||!Number.isFinite(item.x)||!Number.isFinite(item.z)||rot!==expected)throw new Error('Invalid east/west city gate profile or cardinal anchor');
  return {...EAST_WEST_CITY_GATE_FIT,x:item.x,z:item.z,rot,name:item.name};
}

export function buildEastWestCityGate(kit,item) {
  const p=eastWestCityGateGeometry(item),f=kit.frame(p.x,p.z,p.rot);
  f.name=`city-gate-${p.name}`;
  const {width:W,depth:D,platformHeight:PH,portalWidth:w,portalHeight:h}=p;
  const openings=p.portalCenters.map(x=>({x,left:x-w/2,right:x+w/2}));
  let edge=-W/2;
  for(const next of [...openings.map(o=>o.left),W/2]){
    const len=next-edge;
    if(len>0){
      const xc=(edge+next)/2;
      kit.box(f,'wall_brick',len,1,D,xc,.5,0);
      kit.box(f,'wall_red',len,PH-1,D,xc,1+(PH-1)/2,0);
      kit.col(f,edge,0,-D/2,next,3,D/2);
    }
    const opening=openings.find(o=>o.left===next);
    edge=opening?opening.right:next;
  }
  const lintel=kit.lib.material('stone_slab',{color:0xe3ce94});
  for(const o of openings){
    // Rectangular outer openings conceal the vault's springing section at
    // each facade. The real interior barrel surface rises behind the lintel.
    for(const sign of [-1,1]){
      kit.box(f,'wall_red',w,PH-h,p.faceDepth,o.x,h+(PH-h)/2,sign*(D/2-p.faceDepth/2));
      const lg=applyBoxUV(new THREE.BoxGeometry(w+.6,.28,.5),kit.lib.tileSize('stone_slab'));
      kit.mesh(f,lg,lintel,o.x,h+.14,sign*(D/2+.12));
    }
    const shape=new THREE.Shape();
    shape.moveTo(-w/2,PH);shape.lineTo(w/2,PH);shape.lineTo(w/2,h);
    for(let i=1;i<=p.vaultSegments;i++){
      const a=Math.PI*i/p.vaultSegments;
      shape.lineTo(Math.cos(a)*w/2,h+Math.sin(a)*p.vaultRise);
    }
    shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:D-2*p.faceDepth,bevelEnabled:false,steps:1,curveSegments:1});
    applyBoxUV(geo,kit.lib.tileSize('wall_brick'));
    kit.mesh(f,geo,kit.lib.material('wall_brick'),o.x,0,-D/2+p.faceDepth);
    const portal=new THREE.Group();portal.name=`portal-${o.x}`;portal.position.x=o.x;f.add(portal);portal.updateMatrixWorld(true);
    kit.doors(portal,{jamb:w/2,height:h-.5,zHinge:-D/2+1,leaf:w*.48});
    portal.updateMatrixWorld(true);
    for(const leaf of portal.children){
      const b=new THREE.Box3().setFromObject(leaf);
      kit.colliders.push(new THREE.Box3(new THREE.Vector3(b.min.x,0,b.min.z),new THREE.Vector3(b.max.x,3,b.max.z)));
    }
  }
  kit.box(f,'stone_slab',W+.4,.3,D+.4,0,PH+.15,0);
  const y=PH+.3,bw=p.towerWidth,bd=p.towerDepth,bh=p.towerColumnHeight;
  kit.box(f,'wall_red',bw-2.4,bh,bd-2.4,0,y+bh/2,0);
  kit.box(f,'lattice_doors',bw-2.3,bh*.82,bd-2.3,0,y+bh*.41,0,'band');
  kit.box(f,'caihua_beam',bw+.3,.7,bd+.3,0,y+bh-.35,0,'band');
  const column=(x,z)=>kit.mesh(f,new THREE.CylinderGeometry(.24,.28,bh,8),kit.lib.material('wood_column'),x,y+bh/2,z);
  for(let i=0;i<=5;i++)for(const z of [-bd/2,bd/2])column(-bw/2+bw*i/5,z);
  for(const x of [-bw/2,bw/2])for(let i=1;i<3;i++)column(x,-bd/2+bd*i/3);
  const roof=kit.roof(f,{type:'wudian',width:bw+2.8,depth:bd+2.8,baseY:y+bh,layers:2,brackets:true});
  const railMat=kit.lib.material('balustrade',{alphaTest:.5,side:THREE.DoubleSide});
  for(const [rw,rd,rx,rz] of [[W,.16,0,-D/2],[W,.16,0,D/2],[.16,D,-W/2,0],[.16,D,W/2,0]]){
    const geo=applyBoxUV(new THREE.BoxGeometry(rw,1.05,rd),kit.lib.tileSize('balustrade'));gateRailFacade(geo,true);
    kit.mesh(f,geo,railMat,rx,y+.525,rz);
  }
  // Mount on the actual inter-eave band, rather than below the lower roof.
  // This simple font/frame and its dimensions are provisional, not a tracing.
  const band=roof.userData.doubleEaveMountingBand, plaqueWidth=1, plaqueHeight=1.3;
  if(!band || band.upperY-band.lowerY < plaqueHeight+.24)throw new Error('City-gate plaque cannot clear its generated inter-eave band');
  const plaqueY=(band.lowerY+band.upperY)/2,plaqueZ=-band.halfDepth-.3;
  kit.plaque(f,p.name==='东华门'?'東華門':'西華門',0,plaqueY,plaqueZ,plaqueWidth,plaqueHeight);
  f.userData.plaqueMount={lowerY:band.lowerY,upperY:band.upperY,y:plaqueY,z:plaqueZ,width:plaqueWidth,height:plaqueHeight,
    status:'MODEL_FIT_SYSTEM_FONT_NOT_SURVEY_OR_ORIGINAL_CALLIGRAPHY'};
  kit.mapRect(f,'gate',p.name,W,D);
  f.userData.cityGate={...p,portalCount:3,bays:5,depthBays:3,eaveCount:2,roof:'wudian',upperAccess:false};
  f.userData.structure={id:`city-gates/${p.name==='东华门'?'donghua':'xihua'}`,...f.userData.cityGate,plaqueMount:f.userData.plaqueMount};
  applyXihuaOuterWindowBand(kit,f,item);
  return f;
}
