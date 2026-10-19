import * as THREE from 'three';
import { mergeByMaterial } from '../../../utils/MergeUtils.js';
import { JIAOTAI_ART, jiaotaiLandmarkMaterial, mapJiaotaiBoxUV, mapJiaotaiSolidUV } from './JiaotaiLandmarkArt.js';

/** Historical Qing-chi ratios are retained without assuming a metre conversion.
 * Absolute heights and stations are photo-fit model values inside the inherited
 * provisional 19m shell, not a new survey of the hall or the artifacts. */
export const JIAOTAI_LANDMARKS = Object.freeze({
  id:'jiaotai-timekeeping-landmarks-r27',
  source:'https://www.dpm.org.cn/explore/building/236467.html',
  clockSource:'https://img.dpm.org.cn/Uploads/pdf/2201/T00020_00.pdf',
  originalClockChi:{height:17.4,baseWidth:6.9,baseDepth:5.55,layers:[8.4,5.4,3.6],bodyWidth:4.35,bodyDepth:3,dialDiameter:3},
  heightStatus:'PHOTO_FIT_MODEL_METRES_NOT_CONVERTED_QING_CHI',
  placementStatus:'SIDE_BAY_AND_INWARD_ORIENTATION_SUPPORTED_EXACT_STATIONS_ESTIMATED',
  clock:{x:6.15,z:0,height:5.4,rotationY:Math.PI/2},
  clepsydra:{x:-6.15,z:0,height:5.6,width:2.25,depth:2.40,rotationY:-Math.PI/2},
  lodDistance:90,lodHysteresis:.10,
});
const C=JIAOTAI_ART.cells;

function builderFor(parent,material){
  const mesh=(geometry,position,name)=>{
    const m=new THREE.Mesh(geometry,material);m.position.set(...position);m.name=name;
    m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  return {
    surface:mesh,
    box:(name,w,h,d,x,y,z,cell=C.panel,front=cell)=>mesh(mapJiaotaiBoxUV(new THREE.BoxGeometry(w,h,d),[cell,cell,cell,cell,cell,front]),[x,y,z],name),
    solid:(name,geometry,x,y,z,cell=C.gold)=>mesh(mapJiaotaiSolidUV(geometry,cell),[x,y,z],name),
  };
}

function roofGeometry(w,d,h,fine){
  // The near outline has raised corners and lower mid-eave points. Far roofs
  // retain the two-tier envelope but simplify this curvature below pixel scale.
  const lower=[[-w/2,.10,-d/2],[w/2,.10,-d/2],[w/2,.10,d/2],[-w/2,.10,d/2]];
  const upper=[[-w*.29,h,-d*.29],[w*.29,h,-d*.29],[w*.29,h,d*.29],[-w*.29,h,d*.29]];
  const positions=[],uv=[];
  const tri=(items)=>{for(const[p,u,v]of items){positions.push(...p);uv.push((3+(2/256+u*252/256))/4,.5+(2/256+v*252/256)/2);}};
  for(let k=0;k<4;k++){
    const n=(k+1)%4,A=lower[k],B=lower[n],U=upper[k],V=upper[n];
    if(fine){const M=[(A[0]+B[0])/2,0,(A[2]+B[2])/2];tri([[A,0,0],[U,0,1],[M,.5,0]]);tri([[M,.5,0],[U,0,1],[V,1,1]]);tri([[M,.5,0],[V,1,1],[B,1,0]]);}
    else{tri([[A,0,0],[U,0,1],[B,1,0]]);tri([[B,1,0],[U,0,1],[V,1,1]]);}
  }
  // A finial does not cover the entire truncated opening: retain the top cap.
  for(const i of[0,3,1,1,3,2]){positions.push(...upper[i]);uv.push(3.5/4,.75);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}

function clockModel(material,fine){
  const group=new THREE.Group();group.name='jiaotai-west-clock';
  const b=builderFor(group,material),p=JIAOTAI_LANDMARKS.clock,q=JIAOTAI_LANDMARKS.originalClockChi;
  const s=p.height/q.height,w=q.baseWidth*s,d=q.baseDepth*s,[low,mid,top]=q.layers.map(v=>v*s),bw=q.bodyWidth*s,bd=q.bodyDepth*s;
  b.box('clock-stepped-foot',w,.20,d,0,.10,0);
  b.box('clock-lower-case',bw,low-.20,bd,0,(low+.20)/2,0);
  if(fine)b.box('clock-middle-cornice',w,.16,d,0,low,0,C.gold);
  b.box('clock-dial-case',bw*1.10,mid,bd,0,low+mid/2,0,C.panel);
  if(fine){
    b.box('clock-upper-cornice',w*.88,.15,d*.85,0,low+mid,0,C.gold);
    const dial=q.dialDiameter*s;
    b.box('clock-dial',dial,dial,.035,0,low+mid*.49,-bd/2-.035,C.dark,C.dial);
    b.box('clock-foot-lip',w*.94,.12,d*.95,0,.24,0,C.gold);
    for(const x of [-1,1])for(const z of [-1,1]){
      b.solid('clock-carved-column',new THREE.CylinderGeometry(.065,.075,low-.40,8),x*bw*.57,(low+.20)/2,z*bd*.56);
      const px=x*w*.38,pz=z*d*.36;
      b.box('clock-crown-post',.055,top*.75,.055,px,low+mid+top*.375,pz,C.gold);
      b.solid('clock-crown-point',new THREE.ConeGeometry(.075,top*.25,6),px,p.height-top*.125,pz);
      b.solid('clock-gallery-finial',new THREE.ConeGeometry(.065,.23,6),x*w*.40,low+.38,z*d*.39);
    }
    for(const z of [-d*.42,d*.42]){
      b.box('clock-gallery-top',w*.90,.045,.045,0,low+.35,z,C.gold);
      for(const x of [-.33,-.165,0,.165,.33])b.box('clock-gallery-baluster',.035,.24,.035,x*w,low+.21,z,C.gold);
    }
    for(const x of [-w*.45,w*.45])b.box('clock-gallery-side',.045,.045,d*.84,x,low+.35,0,C.gold);
    const crown=new THREE.Shape();crown.moveTo(-bw*.48,0);crown.lineTo(-bw*.39,.16);crown.lineTo(-bw*.22,.22);crown.lineTo(-bw*.13,.44);crown.lineTo(0,top*.70);crown.lineTo(bw*.13,.44);crown.lineTo(bw*.22,.22);crown.lineTo(bw*.39,.16);crown.lineTo(bw*.48,0);crown.closePath();
    b.solid('clock-sculpted-crown-silhouette',new THREE.ExtrudeGeometry(crown,{depth:.055,bevelEnabled:false,curveSegments:1}),0,low+mid+.05,-bd*.43);
    b.solid('clock-central-finial',new THREE.ConeGeometry(.12,top*.22,8),0,low+mid+.05+top*.81-.01,-bd*.43+.0275);
  }else{
    // A two-triangle dial preserves the same diameter rather than stretching
    // its circle over the entire coarse cabinet face.
    const dial=q.dialDiameter*s,plane=new THREE.PlaneGeometry(dial,dial),uv=plane.attributes.uv,pad=2/256;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(1+pad+uv.getX(i)*(1-2*pad))/4,.5+(pad+uv.getY(i)*(1-2*pad))/2);
    plane.rotateY(Math.PI);b.surface(plane,[0,low+mid*.49,-bd/2-.018],'clock-far-dial');
    // Keep a non-roof crown silhouette at distance, not a second Chinese pavilion.
    b.solid('clock-far-crown',new THREE.ConeGeometry(bw*.32,top,4),0,low+mid+top/2,0);
  }
  group.userData.landmark={kind:'mechanical-clock',side:'west',front:'east',sourceUnit:'Qing chi',ratios:q,geometryDetail:fine?'near':'far'};
  return group;
}

function clepsydraModel(material,fine){
  const group=new THREE.Group();group.name='jiaotai-east-clepsydra';
  const b=builderFor(group,material),p=JIAOTAI_LANDMARKS.clepsydra,w=p.width,d=p.depth,h=p.height;
  // The longitudinal projecting lower platform is included in both LODs and collision.
  b.box('clepsydra-platform',w*.74,.20,d,0,.10,-d*.16,C.woodwork);
  b.box('clepsydra-sculpted-pedestal',w*.76,h*.24,d*.59,0,.20+h*.12,d*.05,C.woodwork);
  if(fine){
    b.box('clepsydra-upper-deck',w,.14,d*.72,0,h*.28,0,C.woodwork);
    // Continuous front pedestal and small shelves support the visible vessels.
    b.box('clepsydra-front-step',w*.32,h*.175,d*.35,0,.20+h*.0875,-d*.38,C.woodwork);
    for(const x of [-w*.38,w*.38])for(const z of [-d*.27,d*.27])b.box('clepsydra-frame-column',.10,h*.42,.10,x,h*.49,z,C.red);
    for(const x of [-w*.38,w*.38]){
      b.box('clepsydra-side-rail',.07,.07,d*.56,x,h*.38,0,C.woodwork);
      for(const z of [-.20,0,.20])b.box('clepsydra-rail-baluster',.035,.36,.035,x,h*.345,z*d,C.red);
    }
    // Three visible stepped reservoirs. The other two and hidden pipework are
    // intentionally not invented from the five-vessel textual description.
    for(const [cy,cz,scale]of [[h*.57,0,.85],[h*.43,-d*.15,.72],[h*.24,-d*.38,.58]]){
      const ww=w*.30*scale,hh=h*.14*scale,dd=d*.24*scale;
      const pot=new THREE.CylinderGeometry(1,.72,1,4,1,false);pot.rotateY(Math.PI/4);pot.scale(ww/Math.SQRT2,hh,dd/Math.SQRT2);
      b.solid('clepsydra-visible-tapered-reservoir',pot,0,cy,cz,C.bronze);
      const bottom=cy-hh/2;
      if(cy>h*.3)b.box('clepsydra-reservoir-shelf',w*.80,.07,d*.57,0,bottom-.035,-d*.005,C.woodwork);
      b.box('clepsydra-reservoir-lip',ww*1.08,.035,dd*1.08,0,cy+hh/2,cz,C.bronze);
    }
    b.box('clepsydra-back-panel',w*.64,h*.34,.07,0,h*.47,d*.28,C.woodwork);
  }else{
    // Open front remains a dark recess; do not turn it into a solid clock face.
    // Single recessed panel is the explicit distant proxy for the open frame.
    b.box('clepsydra-far-recess',w*.86,h*.42+.03,d*.50,0,h*.49-.015,0,C.woodwork,C.dark);
  }
  const addRoof=(name,width,depth,rise,cy)=>{
    const m=new THREE.Mesh(roofGeometry(width,depth,rise,fine),material);m.name=name;m.position.y=cy;m.castShadow=true;m.receiveShadow=true;group.add(m);
  };
  // The eave frieze meets the frame heads; a short upper drum connects tiers.
  b.box('clepsydra-eave-frieze',w*1.10,.20,d*.86,0,h*.70+.05,0,C.woodwork);
  b.box('clepsydra-upper-drum',w*.46,h*.11,d*.36,0,h*.905,0,C.woodwork);
  addRoof('clepsydra-lower-eave',w*1.12,d*.88,h*.15,h*.70);
  addRoof('clepsydra-upper-eave',w*.86,d*.69,h*.10,h*.86);
  b.solid('clepsydra-top-vessel',fine?new THREE.CylinderGeometry(.055,.11,h*.04,8):new THREE.ConeGeometry(.11,h*.04,4),0,h*.98,0,C.gold);
  group.userData.landmark={kind:'water-clock-pavilion',side:'east',front:'west',visibleReservoirs:fine?3:'simplified',geometryDetail:fine?'near':'far'};
  return group;
}

export function buildJiaotaiLandmarkLevel(material,fine){
  if(typeof fine!=='boolean')throw Error('Explicit landmark detail level required');
  const root=new THREE.Group();root.name=fine?'jiaotai-landmarks-near':'jiaotai-landmarks-far';
  for(const [kind,group]of [['clock',clockModel(material,fine)],['clepsydra',clepsydraModel(material,fine)]]){
    const p=JIAOTAI_LANDMARKS[kind];group.position.set(p.x,0,p.z);group.rotation.y=p.rotationY;root.add(group);
  }
  return root;
}

export function installJiaotaiLandmarks(builder,root){
  if(builder.ox!==0||builder.oz!==0||root.position.lengthSq()!==0)throw Error('Jiaotai installation requires the world-aligned palace root');
  if(root.userData.jiaotaiLandmarks)throw Error('Jiaotai landmarks already installed');
  const halls=root.userData.architecture?.filter(x=>x.id==='jiaotaidian');
  if(halls?.length!==1||!Number.isFinite(halls[0].floorY)||halls[0].bodyH!==6.2)throw Error('Unregistered Jiaotai shell');
  const hall=halls[0],south=hall.portals.find(x=>x.side==='south'),north=hall.portals.find(x=>x.side==='north');
  if(!south||!north)throw Error('Missing Jiaotai axis anchors');
  const x0=(south.center[0]+north.center[0])/2,z0=(south.center[1]+north.center[1])/2,y=hall.floorY;
  const material=jiaotaiLandmarkMaterial(builder),lod=new THREE.LOD();lod.name='jiaotai-timekeeping-detail';lod.position.set(x0,y,z0);
  for(const fine of[true,false]){
    const raw=buildJiaotaiLandmarkLevel(material,fine),merged=mergeByMaterial(raw,{name:raw.name});
    if(merged.children.length!==1)throw Error('Jiaotai landmarks require one shared material batch per level');
    lod.addLevel(merged,fine?0:JIAOTAI_LANDMARKS.lodDistance,fine?0:JIAOTAI_LANDMARKS.lodHysteresis);
    if(!fine)merged.visible=false;
  }
  root.add(lod);
  // Fixed whole-object footprints retain the full nearest-detail envelope.
  // Navigation never switches with distance or matches a tiny distant proxy.
  const q=JIAOTAI_LANDMARKS.originalClockChi,c=JIAOTAI_LANDMARKS.clock,s=c.height/q.height;
  builder.col(x0+c.x-q.baseDepth*s/2,y,z0+c.z-q.baseWidth*s/2,x0+c.x+q.baseDepth*s/2,y+c.height,z0+c.z+q.baseWidth*s/2);
  const p=JIAOTAI_LANDMARKS.clepsydra;
  builder.col(x0+p.x-p.depth*.44,y,z0+p.z-p.width*.56,x0+p.x+p.depth*.66,y+p.height,z0+p.z+p.width*.56);
  root.userData.jiaotaiLandmarks={...structuredClone(JIAOTAI_LANDMARKS),frame:{x:x0,y,z:z0},navigation:'FIXED_NEAR_ENVELOPES_BOTH_LODS',artStatus:JIAOTAI_ART.status};
  return lod;
}
