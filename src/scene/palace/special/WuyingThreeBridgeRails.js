import {createWuyingCrownRecoveryContract} from './WuyingCrownRecovery.js';
import {wuyingBridgePlinthGeometry,WUYING_PLINTH_METADATA} from './WuyingBridgePlinths.js';
import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance,triangleBodyIntersects,triangleBodySweepFraction} from '../../../utils/TriangleSupport.js';
const OBJECT='FC-B9097C61D8';
const issuedTemplates=new WeakMap();
const SPHERES=['1943422345238663168','1943418509719621632','1943421490288513024'];
/** The THREE retained Wuying bridge instances only. Whole-bridge census,
 * vaults, exact carving and GPU remain unaccepted. No river/deck changes. */
export function buildWuyingThreeBridgeRails(library,b){
 const index=['wuying-1','wuying-2','wuying-3'].indexOf(b?.id),expectedZ=-249.8-(17.9+1.6)/2-.8*1.6-4.8-18.4/2;
 if(index<0||b.family!=='wuying'||b.axis!=='z'||b.x!==220.8+(index-1)*34.9/5||b.z!==expectedZ||b.length!==18.4||b.crest!==.45||b.width!==(index===1?5:3.8)||b.minWidth!==b.width||JSON.stringify(b.railSides)!=='[-1,1]')throw Error('Wuying three-bridge retained identity mismatch');
 const group=new T.Group();group.name=`${b.id}-source-fitted-rails`;const colliders=[],marble=library.material('marble'),geometries=new Set(),runs=[];
 const top=a=>b.crest*(1-(a/(b.length/2))**2),stations=Array.from({length:10},(_,i)=>-7.85+15.7*i/9);
 const mesh=(geometry,role,parts)=>{geometries.add(geometry);if(role!=='low-beveled-rail-plinth')geometry.translate(0,WUYING_PLINTH_METADATA.railAssemblyLift,0);const tileSize=library.tileSize('marble');let g=geometry;if(geometry.index){g=geometry.toNonIndexed();geometries.add(g);geometries.delete(geometry);geometry.dispose();}applyBoxUV(g,tileSize);const m=new T.Mesh(g,marble);m.castShadow=m.receiveShadow=true;m.name=`${b.id}-${role}`;m.userData.wuyingBridgeRail={bridgeId:b.id,role};group.add(m);parts.push(m);return m;};
 const box=(parts,role,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),role,parts);
 // Closed radial body without degenerate axis quads; optional fluting is a
 // coarse visible-type fit, not an attested number of carved leaves.
 const radial=(parts,role,x,y,z,profile,fluted=false)=>{const n=fluted?12:6,pos=[],idx=[];for(let k=0;k<profile.length;k++){const[height,r]=profile[k];for(let i=0;i<n;i++){const a=i*2*Math.PI/n,rr=r*(fluted?(1+.055*Math.cos(6*a)):1);pos.push(x+rr*Math.cos(a),y+height,z+rr*Math.sin(a));}}
  for(let k=0;k<profile.length-1;k++)for(let i=0;i<n;i++){const a=k*n+i,c=k*n+(i+1)%n,d=c+n,e=a+n;idx.push(a,e,c,c,e,d);}const bottom=pos.length/3;pos.push(x,y+profile[0][0],z);const end=pos.length/3;pos.push(x,y+profile.at(-1)[0],z);for(let i=0;i<n;i++){idx.push(bottom,i,(i+1)%n);const a=(profile.length-1)*n+i,c=(profile.length-1)*n+(i+1)%n;idx.push(end,c,a);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return mesh(g,role,parts);};
 // A true sloping solid, not a rotated horizontal box or flat rescue top.
 const strip=(parts,role,x,a,c,y0a,y0c,y1a,y1c,thickness=.20)=>{const s=new T.Shape();s.moveTo(-a,y0a);s.lineTo(-c,y0c);s.lineTo(-c,y1c);s.lineTo(-a,y1a);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:thickness,steps:1,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(x-thickness/2,0,b.z);return mesh(g,role,parts);};
 const cloud=(parts,x,a,y,half=.23)=>{const s=new T.Shape();s.moveTo(-a-half,y+.08);s.lineTo(-a+half,y+.08);s.lineTo(-a+half,y);s.quadraticCurveTo(-a+half*.7,y-.06,-a+half*.45,y);s.quadraticCurveTo(-a,y-.10,-a-half*.45,y);s.quadraticCurveTo(-a-half*.7,y-.06,-a-half,y);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:.21,curveSegments:2,steps:1,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(x-.105,0,b.z);return mesh(g,'plain-cloud-opening-head-fit',parts);};
 const register=(parts,id)=>{const values=[];for(const m of parts){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i++){const k=ix?ix.getX(i):i;values.push(p.getX(k),p.getY(k),p.getZ(k));}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(values,3));try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],`wuying-bridge-rails:${b.id}:${id}`),box=owner.box.clone();box.triangleSupport=owner;const flat=[];for(const q of owner.template.triangles)for(const v of[q.triangle.a,q.triangle.b,q.triangle.c,q.normal,q.box.min,q.box.max])flat.push(v.x,v.y,v.z);issuedTemplates.set(owner.template,{id:owner.id,bridge:{id:b.id,x:b.x,z:b.z,width:b.width,length:b.length,crest:b.crest},box:box.clone(),flat:new Float64Array(flat)});colliders.push(box);}finally{g.dispose();}};
 try{for(const side of[-1,1]){const x=b.x+side*(b.width/2-.12);
  for(const[i,a]of stations.entries()){const parts=[],y=top(a);mesh(wuyingBridgePlinthGeometry(b,side,a-.145,a+.145),'low-beveled-rail-plinth',parts);box(parts,'square-post-stem',.29,.98,.29,x,y+.49,b.z+a);radial(parts,'pointed-lobed-crown-fit',x,y,b.z+a,[[.97,.135],[1.025,.165],[1.09,.145],[1.20,.20],[1.30,.14],[1.405,.018]],true);register(parts,`${side}:post:${i}`);}
  for(let i=1;i<stations.length;i++){const a=stations[i-1]+.145,c=stations[i]-.145,ya=top(a),yc=top(c),mid=(a+c)/2,ym=(ya+yc)/2,parts=[];
   mesh(wuyingBridgePlinthGeometry(b,side,a,c),'low-beveled-rail-plinth',parts);
   strip(parts,'lower-solid-panel',x,a,c,ya-.01,yc-.01,ya+.60,yc+.60);strip(parts,'continuous-top-rail',x,a,c,ya+.96,yc+.96,ya+1.08,yc+1.08,.23);
   radial(parts,'single-middle-drum-support',x,ym+.60,b.z+mid,[[0,.07],[.095,.125],[.17,.09],[.225,.07],[.29,.10]],false);cloud(parts,x,mid,ym+.92);
   // End half-corbel silhouettes are distinct from the one full middle prop.
   cloud(parts,x,a,ya+.92,.14);cloud(parts,x,c,yc+.92,.14);
   for(const sideFace of[-1,1]){const aa=a+.065,cc=c-.065,yy=top(aa),zz=top(cc),shape=new T.Shape();shape.moveTo(-aa,yy+.13);shape.lineTo(-cc,zz+.13);shape.lineTo(-cc,zz+.51);shape.lineTo(-aa,yy+.51);shape.closePath();const hole=new T.Path();hole.moveTo(-aa-.035,yy+.165);hole.lineTo(-aa-.035,yy+.475);hole.lineTo(-cc+.035,zz+.475);hole.lineTo(-cc+.035,zz+.165);hole.closePath();shape.holes.push(hole);const g=new T.ExtrudeGeometry(shape,{depth:.016,steps:1,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(x+sideFace*.106-.008,0,b.z);mesh(g,'plain-lower-panel-frame',parts);}
   register(parts,`${side}:panel:${i-1}`);
  }
  for(const dir of[-1,1]){const parts=[],start=dir*7.85;mesh(wuyingBridgePlinthGeometry(b,side,...(dir<0?[-9.04,-7.995]:[7.995,9.04])),'low-beveled-rail-plinth',parts);const point=(u,h)=>[-(start+dir*u),top(start+dir*u)+h],s=new T.Shape();s.moveTo(...point(0,-.01));s.lineTo(...point(1,-.01));s.lineTo(...point(1,.16));s.quadraticCurveTo(...point(.92,.32),...point(.78,.35));s.quadraticCurveTo(...point(.58,.25),...point(.52,.50));s.quadraticCurveTo(...point(.56,.70),...point(.36,.75));s.quadraticCurveTo(...point(.50,1.05),...point(.22,1.07));s.quadraticCurveTo(...point(.03,1.10),...point(0,1.02));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:.25,curveSegments:3,steps:1,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(x-.125,0,b.z);mesh(g,'descending-volute-end-panel',parts);register(parts,`${side}:end:${dir}`);}
  runs.push({side,posts:stations.length,panels:stations.length-1,endSlopes:2,stations:[...stations]});
 }}catch(error){for(const g of geometries)g.dispose();throw error;}
 const metadata={parentObjectId:OBJECT,bridgeId:b.id,instanceId:`INSTANCE-A-WUYING-BRIDGE-${index+1}`,sourceSphere:SPHERES[index],source:'https://www.dpm.org.cn/architectural_art/246281.html',sourcePhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefdd3c1950.jpg',scope:'BOTH_COMPLETE_RAIL_RUNS_ONLY_DECK_AND_VAULT_RETAINED',countStatus:'RETAINED_COUNT_FIT_NOT_PHOTOGRAPHIC_CENSUS',dimensions:'INHERITED_BRIDGE_ENVELOPE_AND_PHOTO_FITTED_RAILS_NOT_SURVEY',shortSupportsPerPanel:1,endHalfCorbelsPerPanel:2,carving:'COARSE_TYPE_SILHOUETTE_AND_PLAIN_PANEL_FRAMES_NOT_EXACT_RELIEF',plinths:{...WUYING_PLINTH_METADATA},wholeObjectAccepted:false,roofOrVaultAccepted:false,backAndUnderside:'VAULT_SIDE_AND_UNDERSIDE_UNKNOWN_NOT_OTHER_BRIDGE_COPY',runs};group.userData.wuyingBridgeRails=metadata;return{group,colliders,metadata};
}


/** Private-authored issuer shared by production and isolated contract tests. */
export function createAuthoredWuyingCrownRecovery(){
 return createWuyingCrownRecoveryContract((manager,q)=>{
  const river=manager.rivers.find(r=>r.southWaterProfile==='r36-south-precinct'&&r.position?.x===0&&r.position?.z===-310.8);
  if(!river)return null;
  for(const c of manager.colliders){
   const shape=c.triangleSupport,record=shape&&issuedTemplates.get(shape.template);
   if(!record||!/:post:[0-9]$/.test(record.id))continue;
   const b=record.bridge,side=Math.sign(q.x-b.x);
   if(side*(q.x-b.x)<b.width/2+.20||q.feet<record.box.max.y-.44||q.feet>record.box.max.y+.002)continue;
   const from=new T.Vector3(q.x,q.feet+1.7,q.z),to=from.clone().add(new T.Vector3(-side*.001,0,0));
   if(!canRecoverInwardFromWuyingRailLegacy(manager,river,from,to,.5,q.feet,q.feet))continue;
   const box=new T.Box3(new T.Vector3(q.x-.5,q.feet+1e-8,q.z-.5),new T.Vector3(q.x+.5,q.feet+1.7,q.z+.5));
   if(triangleBodyIntersects(shape,box)||triangleBodySweepFraction(shape,box,box.clone().translate(new T.Vector3(0,-.002,0)),{includeBoundary:true})===null)continue;
   const foot=manager.supportContact(q.x,q.z,q.feet+1e-7);if(foot&&Math.abs(foot.height-q.feet)<1e-6)continue;
   return {bridge:b,side,river,authenticate:()=>manager.colliders.includes(c)&&canRecoverInwardFromWuyingRailLegacy(manager,river,from,to,.5,q.feet,q.feet)};
  }
  return null;
 });
}

const productionCrownRecovery=createAuthoredWuyingCrownRecovery();
// Controls used outside the real palace collision system keep their exact old
// behavior. This session cannot issue recovery authority or change physics.
const noCrownRecovery=Object.freeze({observe(){},tryJump(){return null;},withMovement(from,to,move){return move();},limitVertical(from,to){return to;},cancel(){},reset(){},dispose(){}});
export function attachWuyingCrownRecovery(player){
 const m=player?.collisionManager;
 if(!m||!player.camera?.isCamera||![m.colliders,m.walkables,m.rivers].every(Array.isArray)||typeof m.queryBox!=='function'||typeof m.checkDynamicCollision!=='function')return noCrownRecovery;
 return productionCrownRecovery.attach(player);
}
export function canRecoverInwardFromWuyingRail(...args){
 return canRecoverInwardFromWuyingRailLegacy(...args)||productionCrownRecovery.allowsRiver(...args);
}

/** A narrow escape from a REAL rail-top impact, not a raised water floor.
 * Ground crossing is unchanged. Only monotonic lateral inward substeps with
 * exact live authored triangles and all 32 original deck ramps may proceed;
 * CollisionManager still checks every static/dynamic body normally afterward. */
function canRecoverInwardFromWuyingRailLegacy(manager,river,from,to,radius,fromFeet,toFeet){
 if(river?.southWaterProfile!=='r36-south-precinct'||river.position?.x!==0||river.position?.z!==-310.8||!from||radius!==.5||![from.x,from.z,to.x,to.z,fromFeet,toFeet].every(Number.isFinite)||fromFeet<.8||fromFeet>2.5||toFeet>fromFeet+1e-7||Math.abs(to.z-from.z)>1e-7||Math.abs(to.x-from.x)>.251)return false;
 const possible=manager.colliders.filter(c=>c.triangleSupport&&issuedTemplates.has(c.triangleSupport.template));
 for(const live of possible){const shape=live.triangleSupport,record=issuedTemplates.get(shape.template),b=record.bridge;
  if(Math.abs(from.z-b.z)>b.length/2-.3||Math.abs(from.x-b.x)>b.width/2+.65||Math.abs(to.x-b.x)>=Math.abs(from.x-b.x)-1e-8||fromFeet<record.box.min.y-.002||fromFeet>record.box.max.y+.002||from.x+radius<record.box.min.x||from.x-radius>record.box.max.x||from.z+radius<record.box.min.z||from.z-radius>record.box.max.z)continue;
  const same=possible.filter(c=>issuedTemplates.get(c.triangleSupport.template).bridge.id===b.id);if(same.length!==42||new Set(same.map(c=>c.triangleSupport.id)).size!==42)return false;
  if(same.some(c=>{const r=issuedTemplates.get(c.triangleSupport.template);return c.triangleSupport.id!==r.id||c.triangleSupport.offset.lengthSq()!==0||!c.box.equals(r.box)||!c.triangleSupport.box.equals(r.box)||!c.triangleSupport.template.bounds.equals(r.box);}))return false;
  // The original physical deck is required, not just an auth-looking rail ID.
  const ramps=manager.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&w.minX===b.x-b.width/2&&w.maxX===b.x+b.width/2);if(ramps.length!==32)return false;
  const seen=new Set();let valid=true;for(const w of ramps){const i=Math.round((w.a0-b.z+b.length/2)/(b.length/32)),a=(-1+2*i/32)*b.length/2,c=(-1+2*(i+1)/32)*b.length/2,y0=b.crest*(1-(-1+2*i/32)**2),y1=b.crest*(1-(-1+2*(i+1)/32)**2);if(i<0||i>=32||seen.has(i)||Math.abs(w.a0-(b.z+a))>1e-9||Math.abs(w.a1-(b.z+c))>1e-9||w.minZ!==w.a0||w.maxZ!==w.a1||w.y0!==y0||w.y1!==y1||w.crossMin0!==b.x-b.width/2+.24||w.crossMin1!==w.crossMin0||w.crossMax0!==b.x+b.width/2-.24||w.crossMax1!==w.crossMax0){valid=false;break;}seen.add(i);}if(!valid)return false;
  // Mutable templates, normals and per-face bounds cannot retain the grant.
  for(const c of same){const template=c.triangleSupport.template,r=issuedTemplates.get(template);let k=0;for(const q of template.triangles){for(const v of[q.triangle.a,q.triangle.b,q.triangle.c,q.normal,q.box.min,q.box.max])for(const axis of['x','y','z'])if(v[axis]!==r.flat[k++])return false;}if(k!==r.flat.length)return false;}
  const body=new T.Box3(new T.Vector3(from.x-radius,fromFeet+1e-8,from.z-radius),new T.Vector3(from.x+radius,fromFeet+1.7,from.z+radius));
  if(triangleBodyIntersects(shape,body))return false;
  const below=body.clone().translate(new T.Vector3(0,-.002,0));if(triangleBodySweepFraction(shape,body,below)!==null)return true;
 }
 return false;
}
