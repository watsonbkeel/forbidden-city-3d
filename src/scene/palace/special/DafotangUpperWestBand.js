import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='dafotang-upper-west-band-partial-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const LAYOUT='dafotang-historic-spatial-fit-v1',CENTRAL='dafotang-upper-central-band-partial-fit-v1',OFFSET=[221.9,0,241.1];
// Independent west source pixels, never translated/mirrored central points.
const SOURCE=[[560,340],[602,335],[640,346],[674,351],[686,344],[710,352],[736,350],[755,344],[785,336],[800,340],[815,337]];
const POINTS=SOURCE.filter((_,i)=>i!==9); // W10's 3–4 px dip is within its ±5 px reading band.
const SCALE=1.62/343,REFERENCE_Y=316,TOP=6.23,FRONT=4.44,BACK=4.52,STEPS=4;
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value'in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
const identity=o=>o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
const unchanged=o=>identity(o)&&o.visible&&o.matrixAutoUpdate&&o.matrixWorldAutoUpdate;
function metadata(){return{id:ID,status:'WEST_UPPER_CURVE_PARTIAL_OUTLINE_FIT',dimensionStatus:'MODEL_FIT_NOT_SURVEY',
 sourceUrls:['https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf'],sourceFigures:['2014:printed079:fig8'],evidenceCount:1,
 sourceImage:{width:2054,height:1235,sha256:'cad1cefcb0767d94ed76415206e8b6ab642a0c0ba52fdabbe7b249a538ad2c48'},
 sourcePoints:SOURCE.map(p=>[...p]),sourcePointTolerancesPx:[5,4,5,5,5,6,5,5,4,5,5],sourceAxisPixels:[516,859],sourceReferenceY:REFERENCE_Y,scaleXY:SCALE,
 omittedCoarsePointIds:['W10'],interpolationStatus:'MODEL_FIT_SHAPE_PRESERVING_COARSE_ENVELOPE',localExtremaStatus:'OPTIONAL_COARSE_INTERPRETATION_NOT_HISTORICAL_EXTREMA',
 mount:{top:TOP,front:FRONT,back:BACK,thickness:BACK-FRONT,status:'MODEL_FIT_NOT_SURVEY'},historicalDepth:null,historicalEndpoints:null,
 mountOffsetFromLowerReference:TOP-(4.35+(638-REFERENCE_Y)*SCALE),wholeHeightRegistered:false,
 sourceCutPixels:[560,815],endTreatment:'PLAIN_VERTICAL_ENGINEERING_CUTS_NOT_HISTORICAL_ENDPOINTS',columnSurfaceGaps:[44*SCALE-.06,44*SCALE-.06],columnGapStatus:'MODEL_FIT_NOT_COLUMN_JOINTS',
 fit:['approximate source y316 straight closure mapped to existing beam underside y6.23 with one XY scale','0.08m thickness and depth 4.44–4.52 inside fitted beam; not inferred from elevation','plain end caps and hidden back; plain borrowed gold material, not historical finish','W05 local rise retained as an optional coarse reading, W10 small dip omitted'],
 unmodeled:['carved flowers and scroll details','side returns and the rest of the west bay','east upper band','lower rectangular fields: perforation or solid backing unknown','historical depth, backs and joinery','whole-height vertical registration'],
 complete:false,visualAcceptance:'PENDING_ACTUAL_WEST_HALL_VIEWS',newWalkables:0,newRooms:0,newReligiousFigures:0,upperVisitorAccess:false,notEmptyClaim:true};}

/** A limited closed strip, not a full carved screen. Straight top, back,
 * thickness and plain engineering cuts are fits. Each bottom sample has a
 * same-X top sample so all welded edges meet without T-junctions. */
function geometry(){
 const h=POINTS.slice(1).map((p,i)=>p[0]-POINTS[i][0]),d=h.map((v,i)=>(POINTS[i+1][1]-POINTS[i][1])/v),n=POINTS.length,m=Array(n).fill(0);
 const end=(h0,h1,d0,d1)=>{let v=((2*h0+h1)*d0-h0*d1)/(h0+h1);if(Math.sign(v)!==Math.sign(d0))v=0;else if(Math.sign(d0)!==Math.sign(d1)&&Math.abs(v)>3*Math.abs(d0))v=3*d0;return v;};
 m[0]=end(h[0],h[1],d[0],d[1]);m[n-1]=end(h[n-2],h[n-3],d[n-2],d[n-3]);
 for(let i=1;i<n-1;i++)if(d[i-1]*d[i]>0){const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}
 const map=(x,y)=>[2.43-SCALE*(x-516),TOP-SCALE*(y-REFERENCE_Y)],edge=[];
 for(let i=0;i<n-1;i++)for(let k=0;k<STEPS;k++){const t=k/STEPS,t2=t*t,t3=t2*t,y=(2*t3-3*t2+1)*POINTS[i][1]+(t3-2*t2+t)*h[i]*m[i]+(-2*t3+3*t2)*POINTS[i+1][1]+(t3-t2)*h[i]*m[i+1];edge.push(map(POINTS[i][0]+h[i]*t,y));}
 edge.push(map(...POINTS[n-1]));
 const positions=[],uvs=[],indices=[],right=edge[0][0],left=edge.at(-1)[0];
 const quad=(a,b,c,d,side=false)=>{const start=positions.length/3;for(const v of[a,b,c,d]){positions.push(...v);uvs.push((v[0]-left)/(right-left),side?(v[2]-FRONT)/(BACK-FRONT):(TOP-v[1])/(36*SCALE));}indices.push(start,start+1,start+2,start,start+2,start+3);};
 for(let i=0;i<edge.length-1;i++){
  const[r,y]=edge[i],[l,v]=edge[i+1];
  quad([r,y,FRONT],[l,v,FRONT],[l,TOP,FRONT],[r,TOP,FRONT]);
  quad([l,v,BACK],[r,y,BACK],[r,TOP,BACK],[l,TOP,BACK]);
  quad([r,TOP,FRONT],[l,TOP,FRONT],[l,TOP,BACK],[r,TOP,BACK],true);
  quad([r,y,BACK],[l,v,BACK],[l,v,FRONT],[r,y,FRONT],true);
 }
 quad([right,edge[0][1],FRONT],[right,TOP,FRONT],[right,TOP,BACK],[right,edge[0][1],BACK],true);
 quad([left,edge.at(-1)[1],BACK],[left,TOP,BACK],[left,TOP,FRONT],[left,edge.at(-1)[1],FRONT],true);
 const g=new T.BufferGeometry();
 try{g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();return g;}catch(error){g.dispose();throw error;}
}

/** Only this geometry is owned; the retained beam material stays borrowed. */
export function createDafotangUpperWestBand({material}={}){
 if(!material?.isMeshStandardMaterial||material.side!==T.FrontSide)throw Error('Single-sided borrowed layout material required');
 const group=new T.Group();group.name=ID;const g=geometry();let mesh,released=false,disposed=false;
 g.addEventListener('dispose',()=>{released=true;if(mesh)mesh.visible=false;});
 const dispose=()=>{if(disposed)return;disposed=true;mesh?.removeFromParent();group.removeFromParent();if(!released)g.dispose();};
 try{mesh=new T.Mesh(g,material);mesh.name=ID+'/west-band';mesh.userData={noMerge:true,dafotangUpperWestBandRole:'west-band'};mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);const meta=metadata();group.userData.dafotangUpperWestBand=meta;return{group,mesh,metadata:meta,dispose};}catch(error){dispose();throw error;}
}
function validate(c){
 const{kit,f,g,p}=c??{};
 if(!kit?.root||!f||!g||p?.id!==PLACE||p.key!=='dafotang'||p.zone!=='outer-west'||g.id!==PLACE||g.w!==45.7||g.d!==16.2||g.y!==.9||g.front!==-8.1||g.rear!==8.1||g.inventory?.status!=='UNKNOWN'||g.historicLayout?.id!==LAYOUT||g.mainPlaqueFit?.id!=='dafotang-main-plaque-modern-semantic-fit-v1'||kit.root.name!=='outer-west'||kit.root.parent||!unchanged(kit.root)||f.parent!==kit.root||!f.position.equals(new T.Vector3(...OFFSET))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!f.visible||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!mutable(f.children)||!mutable(kit.colliders)||!mutable(kit.owned)||!writable(g,'upperWestBandFit'))throw Error('Exact writable unchanged Dafotang host required');
 if(g.upperWestBandFit||f.children.some(o=>o.name===ID||o.userData.dafotangUpperWestBand))throw Error('Upper west band already installed; once only');
 const layouts=f.children.filter(o=>o.name===LAYOUT);if(layouts.length!==1)throw Error('Unique retained layout required');const layout=layouts[0];
 if(!unchanged(layout)||layout.userData.dafotangHistoricLayout!==g.historicLayout||layout.children.length!==85||new Set(layout.children).size!==85)throw Error('Retained 85 layout owners required');
 for(const mesh of layout.children){if(!mesh.isMesh||mesh.parent!==layout||!unchanged(mesh)||!mesh.geometry?.attributes?.position||!mesh.geometry.index)throw Error('Retained layout leaf changed');const owners=kit.colliders.filter(q=>q.dafotangLayoutMesh===mesh.uuid);if(owners.length!==1||owners[0].dafotangLayoutRole!==mesh.userData.dafotangLayoutRole||owners[0].triangleSupport?.id!==mesh.name+'/'+mesh.uuid)throw Error('Retained layout contact identity changed');}
 const beams=layout.children.filter(m=>m.userData.dafotangLayoutRole==='upper-front-entablature');if(beams.length!==1)throw Error('Unique retained upper beam required');const beam=beams[0],bounds=new T.Box3().setFromBufferAttribute(beam.geometry.attributes.position);
 const actual=[...bounds.min.toArray(),...bounds.max.toArray()],expected=[-2.5,6.23,4.41,2.5,6.45,4.69];if(actual.some((v,i)=>!Number.isFinite(v)||Math.abs(v-expected[i])>2e-6))throw Error('Retained upper beam envelope changed');
 const material=beam.material;if(!material?.isMeshStandardMaterial||material.name!=='dafotang_layout_plain_gold_fit'||material.side!==T.FrontSide||!kit.owned.includes(material))throw Error('Retained borrowed gold material required');
 const centrals=f.children.filter(o=>o.name===CENTRAL);if(centrals.length!==1)throw Error('Unique retained central band required');const central=centrals[0],mesh=central.children[0];
 if(!unchanged(central)||central.userData.dafotangUpperCentralBand!==g.upperCentralBandFit||g.upperCentralBandFit?.id!==CENTRAL||central.children.length!==1||!mesh?.isMesh||!unchanged(mesh)||mesh.material!==material||mesh.userData.dafotangUpperCentralBandRole!=='central-band'||!mesh.userData.noMerge)throw Error('Retained central band changed');
 const owners=kit.colliders.filter(q=>q.dafotangUpperCentralBandMesh===mesh.uuid);if(owners.length!==1||owners[0].dafotangUpperCentralBandRole!=='central-band'||owners[0].triangleSupport?.id!==mesh.name+'/'+mesh.uuid)throw Error('Retained central contact identity changed');
 return material;
}

/** Atomic additive installation; old 85 owners, central owner and materials
 * are untouched. Exactly one bounded triangle contact, no broadphase filler. */
export function buildDafotangUpperWestBand(c){
 const material=validate(c),{kit,f,g}=c,children=[...f.children],colliders=[...kit.colliders],descriptor=Object.getOwnPropertyDescriptor(g,'upperWestBandFit');let out,contact,disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;if(contact){const i=kit.colliders.indexOf(contact);if(i>=0)Array.prototype.splice.call(kit.colliders,i,1);}if(out&&g.upperWestBandFit===out.metadata){if(descriptor)Object.defineProperty(g,'upperWestBandFit',descriptor);else delete g.upperWestBandFit;}out?.dispose();};
 try{
  out=createDafotangUpperWestBand({material});const support=triangleInstance(createTriangleTemplate(out.mesh.geometry),OFFSET,out.mesh.name+'/'+out.mesh.uuid);contact=support.box.clone();contact.triangleSupport=support;contact.dafotangUpperWestBandMesh=out.mesh.uuid;contact.dafotangUpperWestBandRole='west-band';
  f.add(out.group);kit.colliders.push(contact);g.upperWestBandFit=out.metadata;
  return{group:out.group,mesh:out.mesh,metadata:out.metadata,contact,dispose};
 }catch(error){
  if(out?.group.parent===f)out.group.parent=null;Array.prototype.splice.call(f.children,0,f.children.length,...children);for(const child of children)child.parent=f;Array.prototype.splice.call(kit.colliders,0,kit.colliders.length,...colliders);
  if(descriptor)Object.defineProperty(g,'upperWestBandFit',descriptor);else delete g.upperWestBandFit;out?.dispose();throw error;
 }
}
