import * as T from 'three';
import {applyBoxUV,applyBandUV,scaleCylinderUV} from '../../../utils/GeometryUV.js';
import {WUMEN_PRACTICAL_FIT as contract} from './WumenPracticalFit.js';
import {createRoofSection} from './WumenPracticalRoofSection.js';
import {buildRoofSectionSurfaces} from './WumenPracticalRoofSurfaces.js';
import {buildRoofSectionTrims} from './WumenPracticalRoofTrims.js';

/** Construct only the six closed fitted upper bodies and two historical-region
 * links. Original source nodes are never moved until the installer commits. */
export function buildWumenPracticalUpper(B) {
 const root=new T.Group();root.name='wumen-practical-upper';
 const owned=new Set(),handles=[],sourceMaterials=new Set(),nodeByPath=new Map();
 function visit(o,p=[]){nodeByPath.set(JSON.stringify(p),o);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])sourceMaterials.add(m);o.children.forEach((n,i)=>visit(n,[...p,i]));}visit(B.group);
 const own=g=>{owned.add(g);return g;},addHandle=h=>{handles.push(h);return h;};
 const mat=name=>B.lib.material(name);
 const textureKeys=new Map(['wall_red','lattice_doors','caihua_beam','wood_column'].map(key=>[mat(key),key]));
 const box=(parent,name,material,size,pos,band=false,copy=null)=>{
  const key=textureKeys.get(material);if(!key)throw Error('unregistered practical box material');
  const tile=B.lib.tileSize(key);
  const geo=own((band?applyBandUV:applyBoxUV)(new T.BoxGeometry(...size),tile)),m=new T.Mesh(geo,material);
  m.castShadow=m.receiveShadow=true;if(copy){m.castShadow=copy.castShadow;m.receiveShadow=copy.receiveShadow;m.visible=copy.visible;m.layers.mask=copy.layers.mask;m.renderOrder=copy.renderOrder;}
  m.name=name;m.position.set(...pos);parent.add(m);return m;
 };
 const upperInstances=[],shafts=[],links=[],roofConstructionRoles=[],roofLayers=[];
 let disposed=false;const dispose=()=>{if(disposed)return;disposed=true;for(const h of handles)h.dispose();for(const g of owned)g.dispose();};
 try {
  for(const t of contract.targetGroups.filter(t=>t.kind!=='link')){
   const old=nodeByPath.get(JSON.stringify(t.originalBTargetPaths[0])),oldBody=t.kind==='wing'?old.children[0]:old;
   const g=new T.Group();g.name=t.id;g.position.set(...t.bodyFrame.translationXYZ);g.rotation.y=t.bodyFrame.rotationY;g.userData={structure:{id:t.id,status:'PRACTICAL_SOURCE_REGISTERED_ENGINEERING_BODY',wholeObjectAccepted:false},sourceStructure:structuredClone(old.userData.structure??{}),localPhysicsStatus:'BUILDER_MATCHING_SOLIDS'};root.add(g);
   const height=t.bodyHeight,beamH=T.MathUtils.clamp(height*.12,.6,2),wallH=height-beamH,[w,d]=t.columnAxisSize;
   const body=box(g,'closed-body',oldBody.children[0].material,[w-1.6,wallH,d-1.6],[0,wallH/2,0],false,oldBody.children[0]);
   const facade=oldBody.children[1];box(g,'south-closed-facade',facade.material,[w-1.6+.02,wallH*.9,.2],[0,wallH*.45,-(d/2-.8)-.1],true,facade);
   let north;
   if(t.id==='INSTANCE-A-WUMEN-EAST-NORTH-PAVILION')north=buildNE(g,nodeByPath.get('[8,2]'),contract.enclosure.NE.northEnclosure,own);
   else{north=box(g,'north-closed-facade',facade.material,[w-1.6+.02,wallH*.9,.2],[0,wallH*.45,(d/2-.8)+.1],true,facade);north.rotation.y=Math.PI;}
   const beamSource=oldBody.children.find(o=>o.isMesh&&o.material===mat('caihua_beam'));const beam=box(g,'retained-height-wide-beam',beamSource.material,[w+.4,beamH,d+.4],[0,wallH+beamH/2,0],true,beamSource);
   const ownRows=contract.shafts.filter(r=>r.owner===t.id&&['MOVE_ONLY_PRESERVE_COLUMN_GEOMETRY_MATERIAL','ADD_SOURCE_READ_NON_INTERFACE_SHAFT'].includes(r.action));
   const template=oldBody.children.find(m=>m.geometry?.type==='CylinderGeometry');
   for(const r of ownRows){let m;if(r.path){m=nodeByPath.get(JSON.stringify(r.path)).clone();}else{m=new T.Mesh(own(template.geometry.clone()),template.material);m.castShadow=template.castShadow;m.receiveShadow=template.receiveShadow;m.position.y=template.position.y;}const [x,z]=r.proposedAxisXZ;const dx=x-t.positionXZ[0],dz=z-t.positionXZ[1];m.position.x=t.kind==='wing'?-dz:dx;m.position.z=t.kind==='wing'?dx:dz;g.add(m);shafts.push({mesh:m,role:r});}
   upperInstances.push({id:t.id,group:g,source:old,closedBody:body,beam,northFacade:north});
  }
  // Borrow actual B-owned source materials, including RoofBuilder's explicit
  // ridge/finial colours. A remains independent; the B fixture ledger owns them.
  const sourceMaterial=(t,name)=>{const old=nodeByPath.get(JSON.stringify(t.originalBTargetPaths[t.kind==='wing'?0:1])),roofOwned=['roof_ridge_glaze','roof_finial_gold'].includes(name),expected=roofOwned?null:mat(name);let found;old.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])if(roofOwned?m.name===name:m===expected)found??=m;});if(!found&&name==='roof_finial_gold')for(const r of sourceMaterials)if(r.isMaterial&&r.name===name){found=r;break;}if(!found)throw Error('missing actual source roof material '+t.id+'/'+name);return found;};
  const paletteFor=t=>({tile:sourceMaterial(t,'roof_tile'),soffit:sourceMaterial(t,'rafters'),fascia:sourceMaterial(t,'rafters'),ridge:sourceMaterial(t,'roof_ridge_glaze'),gold:sourceMaterial(t,'roof_finial_gold'),tileSizes:{tile:B.lib.tileSize('roof_tile'),soffit:B.lib.tileSize('rafters'),fascia:B.lib.tileSize('rafters')}});
  for(const t of contract.targetGroups.filter(t=>t.kind!=='link'))for(const layer of t.kind==='pavilion'?['lower','upper']:['single']){
   const palette=paletteFor(t),section=createRoofSection(t.id,layer,'proposal'),surface=addHandle(buildRoofSectionSurfaces(section,palette)),trim=addHandle(buildRoofSectionTrims(section,palette));for(const g of [surface.group,trim.group])g.traverse(m=>{if(m.isMesh)m.castShadow=m.receiveShadow=true;});root.add(surface.group,trim.group);roofLayers.push({instanceId:t.id,layer,section,surface,trim});
  }
  for(const r of contract.roofConstructionRoles){const t=contract.targetGroups.find(t=>t.id===r.instance),layer=r.layer==='inter-eave'?'upper':r.layer,q=createRoofSection(r.instance,layer,'proposal');const g=own(buildRoleGeometry(r,q));const m=new T.Mesh(g,sourceMaterial(t,{rafters:'rafters',dougong:'dougong_band',wood:'wood_column',caihua:'caihua_beam'}[r.materialRole]));m.name=r.id;m.castShadow=m.receiveShadow=true;const frame=t.roofFrame;m.position.set(...frame.translationXYZ);m.rotation.y=frame.rotationY;root.add(m);roofConstructionRoles.push({mesh:m,role:r});}
  for(const l of contract.links){const g=new T.Group();g.name=l.id;g.userData={structure:{id:l.id,status:'PRACTICAL_ENGINEERING_LINK',parentId:'FC-08AF02314B',attribution:'HISTORICAL_REGION_NOT_CURRENT_INSTRUMENT_INVENTORY'}};root.add(g);const posts=[];const geo=own(scaleCylinderUV(new T.CylinderGeometry(.19,.22,4.1,12),.22,4.1,B.lib.tileSize('wood_column')));for(const p of l.posts){const m=new T.Mesh(geo,mat('wood_column'));m.position.set(...p);m.castShadow=m.receiveShadow=true;g.add(m);posts.push(m);}const sign=l.side==='east'?-1:1,[x0,,,x1]=l.absXKnots,[z0,,,z1]=l.zKnots;for(const z of[z0,z1])box(g,'longitudinal-beam',mat('caihua_beam'),[x1-x0+.45,.66,.38],[sign*(x0+x1)/2,16.39,z]);for(const x of l.absXKnots)box(g,'transverse-beam',mat('caihua_beam'),[.38,.66,z1-z0+.38],[sign*x,16.39,(z0+z1)/2]);const roof=new T.Mesh(own(buildLinkRoof(l)),mat('roof_tile'));roof.name='mapped-low-link-roof';roof.castShadow=roof.receiveShadow=true;g.add(roof);links.push({id:l.id,group:g,posts,roof});}

 root.updateMatrixWorld(true);
 return {group:root,upperInstances,shafts,links,roofConstructionRoles,roofLayers,dispose};
 }catch(error){dispose();throw error;}
}
function buildNE(parent,old,fit,own){
 const root=new T.Group();root.name=old.name;root.userData=structuredClone(old.userData);root.position.z=fit.faceCenterZ;parent.add(root);
 const boxes=[];old.traverse(m=>{if(m.isMesh)boxes.push(m);});const source=(name,index=0)=>boxes.filter(m=>m.name===name)[index];
 const box=(p,role,x0,x1,y0,y1,depth=.2,z=0)=>{const oldMesh=source(role),m=new T.Mesh(oldMesh.geometry,oldMesh.material);m.name=role;m.userData=structuredClone(oldMesh.userData);m.scale.set(x1-x0,y1-y0,depth);m.position.set((x0+x1)/2,(y0+y1)/2,z);m.castShadow=oldMesh.castShadow;m.receiveShadow=oldMesh.receiveShadow;p.add(m);return m;};
 const frame=(p,role,[x0,x1,y0,y1],w)=>{box(p,role,x0,x0+w,y0,y1);box(p,role,x1-w,x1,y0,y1);box(p,role,x0+w,x1-w,y0,y0+w);box(p,role,x0+w,x1-w,y1-w,y1);return[x0+w,x1-w,y0+w,y1-w];};
 const b=fit.boundariesX,[lo,hi]=fit.outerX;box(root,'wumen-ne-north-stone-foot',lo,hi,0,.42);box(root,'wumen-ne-north-top-band',lo,hi,5.65,5.94);box(root,'wumen-ne-north-end-strip',lo,b[0],.42,5.65);box(root,'wumen-ne-north-end-strip',b[3],hi,.42,5.65);
 for(let i=0;i<3;i++){const group=new T.Group();group.name='wumen-ne-north-window-group';group.userData=structuredClone(old.children.find(o=>o.userData.groupIndex===i).userData);root.add(group);const inner=frame(group,'wumen-ne-north-red-frame',[b[i],b[i+1],.42,5.65],.12),[x0,x1,y0,y1]=frame(group,'wumen-ne-north-gold-frame',inner,.035);box(group,'wumen-ne-north-closed-pane',x0,x1,y0,y1,.1,-.05);box(group,'wumen-ne-north-crossband-gold',x0,x1,4.19,4.235);box(group,'wumen-ne-north-crossband',x0,x1,4.235,4.365);box(group,'wumen-ne-north-crossband-gold',x0,x1,4.365,4.41);for(let j=1;j<[2,3,2][i];j++){const x=x0+(x1-x0)*j/[2,3,2][i];box(group,'wumen-ne-north-lower-coarse-divider',x-.0225,x+.0225,y0,4.19);}}
 return root;
}
function buildRoleGeometry(r,q){
 const p=[],uv=[],ix=[],poly=r.footprintHalf,ys=r.Y,n=q.recipe.sampleCounts.nU;
 const corners=[[-poly[0],-poly[1]],[poly[0],-poly[1]],[poly[0],poly[1]],[-poly[0],poly[1]]];let perimeter=0;
 for(let face=0;face<4;face++){const a=corners[face],b=corners[(face+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<n;j++){const s0=(1-Math.cos(Math.PI*j/n))/2,s1=(1-Math.cos(Math.PI*(j+1)/n))/2,A=[a[0]+(b[0]-a[0])*s0,a[1]+(b[1]-a[1])*s0],B=[a[0]+(b[0]-a[0])*s1,a[1]+(b[1]-a[1])*s1],start=p.length/3;
  if(r.kind==='fan'){p.push(0,ys[0],0,A[0],ys[0],A[1],B[0],ys[0],B[1]);uv.push(0,0,...A,...B);ix.push(start,start+1,start+2);}else{p.push(A[0],ys[0],A[1],B[0],ys[0],B[1],B[0],ys[1],B[1],A[0],ys[1],A[1]);const band=r.uv.mode==='band-height-times-aspect',den=band?(r.uv.height??r.uv.caihuaHeight):1,u0=(perimeter+s0*len)/den,u1=(perimeter+s1*len)/den;uv.push(u0,band?0:ys[0],u1,band?0:ys[0],u1,band?1:ys[1],u0,band?1:ys[1]);ix.push(start,start+2,start+1,start,start+3,start+2);}}
 perimeter+=len;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function buildLinkRoof(l){const p=l.roofMapping.samples.flatMap(s=>s.proposalXYZ),uv=l.roofMapping.samples.flatMap(s=>s.proposalUV),ix=[],at=(layer,i,j)=>layer*42+i*7+j,quad=(a,b,c,d)=>ix.push(a,b,c,a,c,d);for(let i=0;i<5;i++)for(let j=0;j<6;j++){quad(at(0,i,j),at(0,i,j+1),at(0,i+1,j+1),at(0,i+1,j));quad(at(1,i,j),at(1,i+1,j),at(1,i+1,j+1),at(1,i,j+1));}for(let i=0;i<5;i++){quad(at(0,i,0),at(0,i+1,0),at(1,i+1,0),at(1,i,0));quad(at(0,i,6),at(1,i,6),at(1,i+1,6),at(0,i+1,6));}for(let j=0;j<6;j++){quad(at(0,0,j),at(1,0,j),at(1,0,j+1),at(0,0,j+1));quad(at(0,5,j),at(0,5,j+1),at(1,5,j+1),at(1,5,j));}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;}
