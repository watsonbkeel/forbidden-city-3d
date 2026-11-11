import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='dafotang-upper-pendants-partial-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const LAYOUT='dafotang-historic-spatial-fit-v1',OFFSET=[221.9,0,241.1];
const SCALE=1.62/346,REFERENCE_Y=316,TOP=6.23,FRONT=4.43,BACK=4.51;
// Four independent coarse pixel readings. No mirror, interpolation or carved petals.
const OBJECTS=[{"id":"west-outer","axis":516,"column":2.43,"points":[[505,347],[530,347],[534,353],[534,369],[530,373],[523,375],[522,379],[519,382],[516,380],[514,376],[507,374],[502,371],[502,355],[503,351]]},{"id":"west-inner","axis":859,"column":0.81,"points":[[845,348],[872,348],[875,354],[875,371],[871,375],[866,377],[864,381],[860,384],[856,382],[853,378],[849,375],[844,371],[844,355]]},{"id":"east-inner","axis":1205,"column":-0.81,"points":[[1189,348],[1217,348],[1219,354],[1219,370],[1215,375],[1209,378],[1208,382],[1204,384],[1200,382],[1197,378],[1191,376],[1187,371],[1187,355]]},{"id":"east-outer","axis":1545,"column":-2.43,"points":[[1533,348],[1556,348],[1560,354],[1560,371],[1555,375],[1551,379],[1550,383],[1546,386],[1542,383],[1540,379],[1534,376],[1529,372],[1528,356],[1530,351]]}];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value'in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
const identity=o=>o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
const unchanged=o=>identity(o)&&o.visible&&o.matrixAutoUpdate&&o.matrixWorldAutoUpdate;
function metadata(){return{id:ID,status:'FOUR_FRONT_SHORT_PENDANT_COARSE_OUTLINES_ONLY',dimensionStatus:'MODEL_FIT_NOT_SURVEY',
 sourceUrls:['https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf','https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf'],sourceFigures:['2014:printed079:fig8'],sourceText:'2015:printed300:upper-storey pendant columns',evidenceCount:1,
 sourceImage:{width:2054,height:1235,sha256:'cad1cefcb0767d94ed76415206e8b6ab642a0c0ba52fdabbe7b249a538ad2c48'},
 commonMapping:{scaleXY:SCALE,referenceY:REFERENCE_Y,modelReferenceY:TOP,formulaX:'modelColumnX - (sourceX - sourceAxisX) * scaleXY',formulaY:'6.23 - (sourceY - 316) * scaleXY',scaleStatus:'BORROWED_LOCAL_CENTRAL_BAY_CALIBRATION_NOT_SURVEY'},
 objects:OBJECTS.map(o=>({id:o.id,sourceAxisX:o.axis,axisTolerancePx:4,modelColumnX:o.column,sourcePoints:o.points.map(p=>[...p]),perPointToleranceXYpx:o.points.map(()=>[3,4]),topClosure:'PLAIN_STRAIGHT_CLOSURE_AT_VISIBLE_COLLAR_TOP_NOT_JOINERY',detailStatus:'NO_CARVED_PETALS_OR_MIRROR_COPY',frontZ:FRONT,backZ:BACK,depthStatus:'MODEL_FIT_NOT_SURVEY',mountStatus:'FRONT_ADDITION_TO_RETAINED_LONG_COLUMN__HISTORICAL_RELATION_UNKNOWN'})),
 mount:{front:FRONT,back:BACK,thickness:BACK-FRONT,status:'MODEL_FIT_NOT_SURVEY'},historicalDepth:null,historicalBack:null,historicalAttachment:null,
 wholeHeightRegistered:false,complete:false,newReligiousFigures:0,newWalkables:0,newRooms:0,upperVisitorAccess:false,visualAcceptance:'PENDING_ACTUAL_UPPER_PENDANT_HALL_VIEWS',
 fit:['plain straight upper closure, sealed back, thickness, depth and attachment overlap are MODEL_FIT','borrowed existing plain gold material is not a historical finish','existing long round columns retained unchanged; these additions are not complete pendant columns'],
 unmodeled:['carved petals and internal lines','side and back historical form','historical attachment and joinery','whole-height measured registration']};}

/** Piecewise-straight closed shallow solid. Model XY is CCW; explicitly
 * orient front triangles toward -Z rather than trusting image field names.
 * Flat duplicated face vertices keep sharp shoulders and closed welded edges. */
function geometry(o){
 const xy=o.points.map(([x,y])=>new T.Vector2(o.column-(x-o.axis)*SCALE,TOP-(y-REFERENCE_Y)*SCALE));
 const positions=[],indices=[],at=(i,z)=>[xy[i].x,xy[i].y,z];
 const tri=(a,b,c)=>{const n=positions.length/3;positions.push(...a,...b,...c);indices.push(n,n+1,n+2);};
 for(const face of T.ShapeUtils.triangulateShape(xy,[])){
  let[a,b,c]=face;const cross=(xy[b].x-xy[a].x)*(xy[c].y-xy[a].y)-(xy[b].y-xy[a].y)*(xy[c].x-xy[a].x);
  if(cross<0)[b,c]=[c,b];
  tri(at(a,FRONT),at(c,FRONT),at(b,FRONT));tri(at(a,BACK),at(b,BACK),at(c,BACK));
 }
 for(let a=0;a<xy.length;a++){const b=(a+1)%xy.length;tri(at(a,FRONT),at(b,FRONT),at(b,BACK));tri(at(a,FRONT),at(b,BACK),at(a,BACK));}
 const g=new T.BufferGeometry();try{g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();return g;}catch(error){g.dispose();throw error;}
}

/** Owns only four new geometries, never the borrowed retained material. */
export function createDafotangUpperPendants({material}={}){
 if(!material?.isMeshStandardMaterial||material.side!==T.FrontSide)throw Error('Single-sided borrowed layout material required');
 const group=new T.Group();group.name=ID;const meshes=[],resources=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;for(const r of resources){if(r.mesh){r.mesh.visible=false;r.mesh.removeFromParent();}if(!r.released)r.geometry.dispose();}group.removeFromParent();};
 try{
  for(const o of OBJECTS){const g=geometry(o),r={geometry:g,mesh:null,released:false};resources.push(r);g.addEventListener('dispose',()=>{r.released=true;if(r.mesh)r.mesh.visible=false;});
   const mesh=new T.Mesh(g,material);r.mesh=mesh;mesh.name=ID+'/'+o.id;mesh.userData={noMerge:true,dafotangUpperPendantsRole:o.id};mesh.castShadow=mesh.receiveShadow=true;meshes.push(mesh);group.add(mesh);
  }
  const meta=metadata();group.userData.dafotangUpperPendants=meta;return{group,meshes,metadata:meta,dispose};
 }catch(error){dispose();throw error;}
}

// The retained CPU triangle owner is also the geometry correspondence witness.
// Read only: no old bounds recomputation, template rebuilding or owner mutation.
function contactMatches(mesh,contact){
 const p=mesh.geometry.attributes.position,index=mesh.geometry.index,s=contact.triangleSupport;
 if(!s?.offset?.equals(new T.Vector3(...OFFSET))||index.count%3||s.template?.triangles?.length!==index.count/3)return false;
 const bounds=new T.Box3().setFromBufferAttribute(p),world=new T.Box3(new T.Vector3(bounds.min.x+OFFSET[0],bounds.min.y+OFFSET[1],bounds.min.z+OFFSET[2]),new T.Vector3(bounds.max.x+OFFSET[0],bounds.max.y+OFFSET[1],bounds.max.z+OFFSET[2]));
 if(!bounds.equals(s.template.bounds)||!world.equals(s.box)||!world.equals(contact))return false;
 for(let i=0;i<index.count;i+=3){const q=s.template.triangles[i/3];
  for(let j=0;j<3;j++){const k=index.getX(i+j),v=q.triangle[['a','b','c'][j]];if(v.x!==p.getX(k)||v.y!==p.getY(k)||v.z!==p.getZ(k))return false;}
  if(!q.triangle.getNormal(new T.Vector3()).equals(q.normal))return false;
 }
 return true;
}

function validate(c){
 const{kit,f,g,p}=c??{};
 if(!kit?.root||!f||!g||p?.id!==PLACE||p.key!=='dafotang'||p.zone!=='outer-west'||g.id!==PLACE||g.w!==45.7||g.d!==16.2||g.y!==.9||g.front!==-8.1||g.rear!==8.1||g.inventory?.status!=='UNKNOWN'||g.historicLayout?.id!==LAYOUT||g.mainPlaqueFit?.id!=='dafotang-main-plaque-modern-semantic-fit-v1'||kit.root.name!=='outer-west'||kit.root.parent||!unchanged(kit.root)||f.parent!==kit.root||!f.position.equals(new T.Vector3(...OFFSET))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!f.visible||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!mutable(f.children)||!mutable(kit.colliders)||!mutable(kit.owned)||!writable(g,'upperPendantsFit'))throw Error('Exact writable unchanged Dafotang host required');
 if(g.upperPendantsFit||f.children.some(o=>o.name===ID||o.userData.dafotangUpperPendants))throw Error('Upper pendants already installed; once only');
 const layouts=f.children.filter(o=>o.name===LAYOUT);if(layouts.length!==1)throw Error('Unique retained layout required');const layout=layouts[0];
 if(!unchanged(layout)||layout.userData.dafotangHistoricLayout!==g.historicLayout||layout.children.length!==85||new Set(layout.children).size!==85)throw Error('Retained 85 layout owners required');
 for(const mesh of layout.children){if(!mesh.isMesh||mesh.parent!==layout||!unchanged(mesh)||!mesh.geometry?.attributes?.position||!mesh.geometry.index)throw Error('Retained layout leaf changed');const owners=kit.colliders.filter(q=>q.dafotangLayoutMesh===mesh.uuid);if(owners.length!==1||owners[0].dafotangLayoutRole!==mesh.userData.dafotangLayoutRole||owners[0].triangleSupport?.id!==mesh.name+'/'+mesh.uuid)throw Error('Retained layout contact identity changed');if(!contactMatches(mesh,owners[0]))throw Error('Retained layout contact geometry changed');}
 const beams=layout.children.filter(m=>m.userData.dafotangLayoutRole==='upper-front-entablature');if(beams.length!==1)throw Error('Unique retained upper beam required');const beam=beams[0],bounds=new T.Box3().setFromBufferAttribute(beam.geometry.attributes.position);
 const actual=[...bounds.min.toArray(),...bounds.max.toArray()],expected=[-2.5,6.23,4.41,2.5,6.45,4.69];if(actual.some((v,i)=>!Number.isFinite(v)||Math.abs(v-expected[i])>2e-6))throw Error('Retained upper beam envelope changed');
 const material=beam.material;if(!material?.isMeshStandardMaterial||material.name!=='dafotang_layout_plain_gold_fit'||material.side!==T.FrontSide||!kit.owned.includes(material))throw Error('Retained borrowed gold material required');
 const columns=layout.children.filter(m=>m.userData.dafotangLayoutRole==='upper-column');if(columns.length!==4)throw Error('Four retained upper columns required');
 for(const o of OBJECTS){const found=columns.filter(m=>Math.abs(new T.Box3().setFromBufferAttribute(m.geometry.attributes.position).getCenter(new T.Vector3()).x-o.column)<2e-6);if(found.length!==1)throw Error('Retained upper column axis changed');const b=new T.Box3().setFromBufferAttribute(found[0].geometry.attributes.position);if(Math.abs(b.min.y-4.51)>2e-6||Math.abs(b.max.y-6.45)>2e-6||Math.abs(b.getCenter(new T.Vector3()).z-4.55)>2e-6||found[0].material!==material)throw Error('Retained upper column changed');}
 for(const[side,title]of[['central','Central'],['west','West'],['east','East']]){
  const id='dafotang-upper-'+side+'-band-partial-fit-v1',groups=f.children.filter(o=>o.name===id);if(groups.length!==1)throw Error('Unique retained '+side+' band required');const group=groups[0],mesh=group.children[0],role=side+'-band';
  if(!unchanged(group)||group.userData['dafotangUpper'+title+'Band']!==g['upper'+title+'BandFit']||g['upper'+title+'BandFit']?.id!==id||group.children.length!==1||!mesh?.isMesh||!unchanged(mesh)||mesh.material!==material||mesh.userData['dafotangUpper'+title+'BandRole']!==role||!mesh.userData.noMerge||!mesh.geometry?.attributes?.position||!mesh.geometry.index)throw Error('Retained '+side+' band changed');
  const owners=kit.colliders.filter(q=>q['dafotangUpper'+title+'BandMesh']===mesh.uuid);if(owners.length!==1||owners[0]['dafotangUpper'+title+'BandRole']!==role||owners[0].triangleSupport?.id!==mesh.name+'/'+mesh.uuid)throw Error('Retained '+side+' contact identity changed');if(!contactMatches(mesh,owners[0]))throw Error('Retained '+side+' contact geometry changed');
 }
 return material;
}

/** Atomic additive installation. All old 88 geometry/contact owners remain
 * untouched. Four true triangle owners, no broadphase collision substitute. */
export function buildDafotangUpperPendants(c){
 const material=validate(c),{kit,f,g}=c,children=[...f.children],colliders=[...kit.colliders],descriptor=Object.getOwnPropertyDescriptor(g,'upperPendantsFit');let out,disposed=false;const contacts=[];
 const restoreMetadata=()=>{if(descriptor)Object.defineProperty(g,'upperPendantsFit',descriptor);else delete g.upperPendantsFit;};
 const dispose=()=>{if(disposed)return;disposed=true;for(const contact of contacts){const i=kit.colliders.indexOf(contact);if(i>=0)Array.prototype.splice.call(kit.colliders,i,1);}if(out&&g.upperPendantsFit===out.metadata)restoreMetadata();out?.dispose();};
 try{
  out=createDafotangUpperPendants({material});
  for(const mesh of out.meshes){const support=triangleInstance(createTriangleTemplate(mesh.geometry),OFFSET,mesh.name+'/'+mesh.uuid),contact=support.box.clone();contact.triangleSupport=support;contact.dafotangUpperPendantsMesh=mesh.uuid;contact.dafotangUpperPendantsRole=mesh.userData.dafotangUpperPendantsRole;contacts.push(contact);}
  f.add(out.group);kit.colliders.push(...contacts);g.upperPendantsFit=out.metadata;
  return{group:out.group,meshes:out.meshes,metadata:out.metadata,contacts,dispose};
 }catch(error){
  if(out?.group.parent===f)out.group.parent=null;Array.prototype.splice.call(f.children,0,f.children.length,...children);for(const child of children)child.parent=f;Array.prototype.splice.call(kit.colliders,0,kit.colliders.length,...colliders);
  restoreMetadata();out?.dispose();throw error;
 }
}
