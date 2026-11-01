import * as THREE from 'three';
import {buildWallCap} from '../RoofBuilder.js';
/** Historic plan controls the east footprint; the 2020 published photograph
 * supports the long upper coping, intermediate small door and outer descent.
 * Door1.6x2.6, X=-37 and wall heights are explicit photo-bounded engineering
 * fits, not measurements; capture date/camera calibration remain unknown. */
export function createBaoheEastFirewallProfile({terrace,linkWall}) {
  if(terrace?.id!=='baohe-east-terrace'||terrace.side!=='east'||linkWall?.kind!=='wall'||linkWall.from?.[1]!==123||linkWall.from[0]!==terrace.outerWallStartX||linkWall.gaps?.[0]?.gate!=='后左门')throw Error('Baohe east firewall binding mismatch');
  const [low,mid,high]=terrace.eastEdges,[y1,y2,y3]=terrace.levels;
  return {id:'baohe-east-stepped-firewall',objectId:'FC-526ABE19BB',side:'east',z:123,thickness:.65,
    dimensionStatus:'HISTORICAL_PLAN_AND_PHOTO_BOUNDED_ENGINEERING_FIT',
    source:{planYear:1941,photoPublicationYear:2020,captureDate:null,unknownGalleryArchExcluded:true},
    terminalJoin:{x:linkWall.from[0],height:7,item:'axis-courts/items/17'},hallJoin:{x:-25.3},
    passage:{centerX:-37,clearWidth:1.6,clearHeight:2.6,floorY:y3},
    spans:[{id:'ground-join',x0:linkWall.from[0],x1:low,floorY:0,topY:7},
      {id:'lower',x0:low,x1:mid,floorY:y1,topY:7},
      {id:'middle',x0:mid,x1:high,floorY:y2,topY:y2+3.6},
      {id:'upper',x0:high,x1:-25.3,floorY:y3,topY:y3+3.6}]};
}
export function buildBaoheEastFirewall(builder,parent,p) {
  const spans=p?.spans,d=p?.passage;
  if(p?.id!=='baohe-east-stepped-firewall'||p.side!=='east'||!Array.isArray(spans)||spans.length!==4||
    ![p.z,p.thickness,d?.centerX,d?.clearWidth,d?.clearHeight,d?.floorY,p.terminalJoin?.x,p.hallJoin?.x].every(Number.isFinite)||p.thickness<=0||d.clearWidth<=0||d.clearHeight<=0||
    spans.some((s,i)=>![s.x0,s.x1,s.floorY,s.topY].every(Number.isFinite)||s.x0>=s.x1||s.x1>=0||s.floorY<0||s.topY<=s.floorY||(i>0&&Math.abs(s.x0-spans[i-1].x1)>1e-8))||
    spans[0].x0!==p.terminalJoin.x||spans.at(-1).x1!==p.hallJoin.x||d.floorY!==spans.at(-1).floorY||d.centerX-d.clearWidth/2<=spans.at(-1).x0||d.centerX+d.clearWidth/2>=spans.at(-1).x1||d.floorY+d.clearHeight>=spans.at(-1).topY||builder.ox!==0||builder.oz!==0)throw Error('Malformed Baohe firewall profile');
  if(parent.getObjectByName(p.id))throw Error('Baohe firewall already installed');
  const g=new THREE.Group();g.name=p.id;g.userData.structure=structuredClone(p);
  const solid=(id,a,b,lo,hi)=>{const m=builder.libBox(g,'wall_red',b-a,hi-lo,p.thickness,(a+b)/2,(hi+lo)/2,p.z);m.name=`${p.id}:${id}`;m.userData.firewallPart='masonry';builder.col(a,lo,p.z-p.thickness/2,b,hi,p.z+p.thickness/2);};
  for(const s of spans){
    if(s.id==='upper') {const a=d.centerX-d.clearWidth/2,b=d.centerX+d.clearWidth/2;solid('upper-outer-jamb',s.x0,a,s.floorY,s.topY);solid('upper-inner-jamb',b,s.x1,s.floorY,s.topY);solid('upper-lintel',a,b,d.floorY+d.clearHeight,s.topY);}
    else solid(s.id,s.x0,s.x1,s.floorY,s.topY);
    if(s.id==='ground-join')continue;
    const start=s.id==='lower'?p.terminalJoin.x:s.x0;
    const cap=buildWallCap(builder.library,{length:s.x1-start,thickness:p.thickness});cap.position.set((start+s.x1)/2,s.topY,p.z);cap.name=`${p.id}:${s.id}:coping`;builder.ownedMaterials.push(...(cap.userData.ownedMaterials??[]));g.add(cap);
  }
  // Own named south/north panorama views establish timber, not an all-stone
  // surround. Keep the inherited aperture/coordinates as engineering fit.
  const a=d.centerX-d.clearWidth/2,b=d.centerX+d.clearWidth/2,top=d.floorY+d.clearHeight;
  const part=(role,id,mat,w,h,depth,x,y,z)=>{const m=builder.libBox(g,mat,w,h,depth,x,y,z);m.name=`${p.id}:${id}`;m.userData.firewallPart=role;return m;};
  for(const sign of [-1,1]){
    const face=p.z+sign*p.thickness/2,z0=sign<0?face-.08:face-.02,z1=sign<0?face+.02:face+.08,side=sign<0?'south':'north';
    for(const [id,x0,x1,y0,y1] of [['left',a-.12,a,d.floorY,top],['right',b,b+.12,d.floorY,top],['head',a-.12,b+.12,top,top+.16]]) {
      // Wood and small stone foot abut, never overlap as full opaque boxes.
      const foot=id==='head'?0:.14;
      part(sign<0?'door-surround':'north-door-support',`${side}-door-surround:${id}`,'wood_column',x1-x0,y1-y0-foot,z1-z0,(x0+x1)/2,(y0+foot+y1)/2,(z0+z1)/2);
      if(foot)part('door-stone-foot',`${side}-door-stone-foot:${id}`,'stone_slab',x1-x0,foot,z1-z0,(x0+x1)/2,y0+foot/2,(z0+z1)/2);
      // Original three south boxes remain exact; north independently bounded.
      builder.col(x0,y0,z0,x1,y1,z1);
    }
    const width=d.clearWidth+.9,height=.28,cy=top+.30,depth=.10,cz=face+sign*.03;
    part('door-painted-lintel',`${side}-painted-lintel`,'caihua_beam',width,height,depth,d.centerX,cy,cz);
    builder.col(d.centerX-width/2,cy-height/2,cz-depth/2,d.centerX+width/2,cy+height/2,cz+depth/2);
    if(sign<0)for(let i=0;i<4;i++){
      const x=d.centerX+(i-1.5)*d.clearWidth/4,y=top+.08,z=face-.10;
      const pin=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.10,6),builder.library.material('wood_column'));
      pin.rotation.x=Math.PI/2;pin.position.set(x,y,z);pin.name=`${p.id}:south-door-pin:${i}`;pin.userData.firewallPart='south-door-pin';pin.castShadow=pin.receiveShadow=true;g.add(pin);
      builder.col(x-.065,y-.065,z-.05,x+.065,y+.065,z+.05);
    }
  }
  g.userData.structure.doorObservation={south:{vp:'1766',sph:'1943166966322479104'},north:{vp:'2013451112382566400',sph:'2013472884427427840'},scope:'OWN_TIMBER_FRAME_AND_LINTEL_ONLY',fit:'Inherited aperture/position; frame/stone-foot/hex-pin sizes visual fit, not survey',wholeObjectAccepted:false,unresolved:['door leaves and opening state','complete steps and wall ends','exact measurements','GPU runtime']};
  parent.add(g);return g;
}
