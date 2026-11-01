import * as T from 'three';
import {buildWallCap} from '../RoofBuilder.js';
import {withTaihemenCandidateTransaction as transaction} from './TaihemenObservedTransaction.js';

export function createBaoheWestFirewallProfile({terrace,linkWall}){
 if(terrace?.id!=='baohe-west-terrace'||terrace.side!=='west'||linkWall?.kind!=='wall'||linkWall.from?.[1]!==123||linkWall.from[0]!==terrace.outerWallStartX||linkWall.gaps?.[0]?.gate!=='后右门')throw Error('Baohe west firewall binding mismatch');
 const[low,mid,high]=terrace.westEdges,[y1,y2,y3]=terrace.levels;
 return{id:'baohe-west-stepped-firewall',objectId:'FC-526ABE19BB',side:'west',z:123,thickness:.65,
  dimensionStatus:'OWN_PLAN_AND_RECORDED_PHOTO_GAME_SCALE_FIT_NOT_SURVEY',
  source:{planYear:1941,southViewpoint:'1796',southSphere:'1943171662604976128',northViewpoint:'2013451816782368768',northSphere:'2013474569988182016',captureDate:null},
  terminalJoin:{x:linkWall.from[0],height:7,item:'axis-courts/items/19'},hallJoin:{x:25.3},
  passage:{centerX:39,clearWidth:2.4,clearHeight:2.6,floorY:y3,leafState:'OPEN_FOR_GAME_ROUTE_NOT_CURRENT_VISITOR_POLICY'},
  // Own recorded low-angle study indicates unequal drops about 2.3 / 2.0 m.
  // These rounded heights keep the inherited 7 m external wall connection.
  spans:[{id:'ground-join',x0:low,x1:linkWall.from[0],floorY:0,topY:7},
   {id:'lower',x0:mid,x1:low,floorY:y1,topY:7},
   {id:'middle',x0:high,x1:mid,floorY:y2,topY:9},
   {id:'upper',x0:25.3,x1:high,floorY:y3,topY:11.3}],
  wholeObjectAccepted:false,unknown:['fine relief and painted patterns','modern surveyed dimensions','actual browser/GPU view']};
}

export function buildBaoheWestFirewall(builder,parent,p){
 const s=p?.spans,d=p?.passage;
 if(p?.id!=='baohe-west-stepped-firewall'||p.side!=='west'||parent?.name!=='三台'||builder.ox!==0||builder.oz!==0||!Array.isArray(s)||s.length!==4||
  ![p.z,p.thickness,p.terminalJoin?.x,p.hallJoin?.x,d?.centerX,d?.clearWidth,d?.clearHeight,d?.floorY].every(Number.isFinite)||p.thickness<=0||d.clearWidth<=0||d.clearHeight<=0||
  s.some((v,i)=>![v.x0,v.x1,v.floorY,v.topY].every(Number.isFinite)||v.x0<=0||v.x0>=v.x1||v.floorY<0||v.topY<=v.floorY||(i>0&&Math.abs(v.x1-s[i-1].x0)>.001))||
  s[0].x1!==p.terminalJoin.x||s[3].x0!==p.hallJoin.x||d.floorY!==s[3].floorY||d.centerX-d.clearWidth/2<=s[3].x0||d.centerX+d.clearWidth/2>=s[3].x1||d.floorY+d.clearHeight+.45>=s[3].topY)throw Error('Malformed Baohe west firewall profile');
 if(parent.getObjectByName(p.id)||parent.userData.architecture?.some(a=>a.id===p.id))throw Error('Baohe west firewall already installed');
 return transaction(builder,parent,{},()=>{
  const g=new T.Group();g.name=p.id;g.userData.structure=structuredClone(p);parent.add(g);
  const col=(a,y0,z0,b,y1,z1)=>{builder.col(a,y0,z0,b,y1,z1);builder.colliders.at(-1).structureId=p.id;};
  const part=(role,id,mat,w,h,depth,x,y,z,physical=true)=>{const m=builder.libBox(g,mat,w,h,depth,x,y,z);m.name=p.id+':'+id;m.userData.firewallPart=role;if(physical)col(x-w/2,y-h/2,z-depth/2,x+w/2,y+h/2,z+depth/2);return m;};
  const solid=(id,a,b,lo,hi)=>part('masonry',id,'wall_red',b-a,hi-lo,p.thickness,(a+b)/2,(lo+hi)/2,p.z);
  const a=d.centerX-d.clearWidth/2,b=d.centerX+d.clearWidth/2,top=d.floorY+d.clearHeight;
  for(const span of s){
   if(span.id==='upper'){solid('upper-inner-jamb',span.x0,a,span.floorY,span.topY);solid('upper-outer-jamb',b,span.x1,span.floorY,span.topY);solid('upper-lintel',a,b,top,span.topY);}
   else solid(span.id,span.x0,span.x1,span.floorY,span.topY);
   if(span.id==='ground-join')continue;
   const end=span.id==='lower'?p.terminalJoin.x:span.x1;
   const cap=buildWallCap(builder.library,{length:end-span.x0,thickness:p.thickness});cap.position.set((span.x0+end)/2,span.topY,p.z);cap.name=`${p.id}:${span.id}:coping`;builder.ownedMaterials.push(...(cap.userData.ownedMaterials??[]));g.add(cap);
  }
  for(const sign of[-1,1]){
   const face=p.z+sign*(p.thickness/2+.025),side=sign<0?'south':'north';
   for(const[x,label]of[[a-.06,'left'],[b+.06,'right']]){
    part('door-stone-foot',`${side}-${label}-foot`,'stone_slab',.12,.16,.12,x,d.floorY+.08,face);
    part('timber-frame',`${side}-${label}-jamb`,'wood_column',.12,d.clearHeight-.16,.12,x,d.floorY+.16+(d.clearHeight-.16)/2,face);
   }
   part('timber-frame',`${side}-head`,'wood_column',d.clearWidth+.24,.16,.12,d.centerX,top+.08,face);
   part('painted-lintel',`${side}-painted-lintel`,'caihua_beam',d.clearWidth+.9,.26,.12,d.centerX,top+.30,face);
   if(sign<0)for(let i=0;i<4;i++){
    const x=d.centerX+(i-1.5)*d.clearWidth/4,z=face-.11,m=new T.Mesh(new T.CylinderGeometry(.065,.065,.10,6),builder.library.material('wood_column'));
    m.rotation.x=Math.PI/2;m.position.set(x,top+.08,z);m.name=`${p.id}:south-plain-pin:${i}`;m.userData.firewallPart='plain-door-pin';m.castShadow=m.receiveShadow=true;g.add(m);col(x-.065,top+.015,z-.05,x+.065,top+.145,z+.05);
   }
  }
  // Both real plank leaves are folded north, outside the clear opening.
  const leafDepth=d.clearWidth/2-.04;
  for(const[x,side]of[[a-.04,'inner'],[b+.04,'outer']])part('opened-door-leaf',`${side}-opened-leaf`,'wood_column',.10,d.clearHeight-.10,leafDepth,x,d.floorY+d.clearHeight/2,p.z+p.thickness/2+leafDepth/2);
  return g;
 });
}
