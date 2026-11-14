import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createSideRobeBody} from './SideRobeBody.js';
import {createRobeProfileField} from './SideRobeField.js';
import {createSideHemWarp} from './SideHemWarp.js';
import {createEightTierLotus} from './EightTierLotus.js';
import {preparePetalUV} from './OriginalLotusPetalUV.js';

// Generated-art bowl outline, visually fitted +/- 3..5 px. Not historic proof.
export const SIDE_BOWL_OUTLINE=[[506,579],[542,576],[577,580],[588,593],[596,612],[589,632],[566,645],[526,647],[497,637],[487,615],[494,594]];
export function sideBowlIntersects(triangle){
 if(!Array.isArray(triangle)||triangle.length!==3||triangle.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))throw Error('Finite source triangle required');
 let poly=triangle.map(p=>p.slice());
 for(let j=0;j<SIDE_BOWL_OUTLINE.length;j++){const a=SIDE_BOWL_OUTLINE[j],b=SIDE_BOWL_OUTLINE[(j+1)%SIDE_BOWL_OUTLINE.length],cross=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]),next=[];
  for(let k=0;k<poly.length;k++){const p=poly[k],q=poly[(k+1)%poly.length],dp=cross(p),dq=cross(q);if(dp>=0)next.push(p);if((dp>=0)!==(dq>=0)){const t=dp/(dp-dq);next.push(p.map((v,i)=>v+t*(q[i]-v)));}}poly=next;if(!poly.length)return false;
 }
 return poly.length>=3&&Math.abs(poly.reduce((sum,p,k)=>{const q=poly[(k+1)%poly.length];return sum+p[0]*q[1]-p[1]*q[0];},0))>1e-8;
}
// Independent front-art fitting. Neither depth nor historical gesture is recovered.
export function sideRegistration(subject,input){
 if(!['amitabha','bhaisajyaguru'].includes(subject)||input?.columns!==129||input?.rows!==193||input?.imageWidth!==1024||input?.imageHeight!==1536||!(input.alpha instanceof Uint8Array)||input.alpha.length!==129*193)throw Error('Exact allowlisted side source required');
 const lastRow=subject==='amitabha'?116:108;let min=Infinity,max=-Infinity;
 // Exactly the same admitted source-cell vertices as the existing side relief.
 for(let y=0;y<lastRow;y++)for(let x=0;x<128;x++)if([y*129+x,y*129+x+1,(y+1)*129+x,(y+1)*129+x+1].every(i=>input.alpha[i]>=128)){min=Math.min(min,2.25*(1-(y+1)/192));max=Math.max(max,2.25*(1-y/192));}
 if(!Number.isFinite(min)||max<=min)throw Error('Side source has no admitted upper cells');
 return{oldMinY:min,oldMaxY:max,fitY:1.45/(max-min),lastRow};
}
export function createSideBuddhaVolumeStudy(subject,input,options={}){
 const registration=sideRegistration(subject,input);if(options.height!==undefined&&options.height!==2.25)throw Error('Fixed side height required');
 const {oldMinY,fitY}=registration;
 const xy=(x,y)=>[(x/1024-.5)*1.5,.80+((1-y/1536)*2.25-oldMinY)*fitY];
 const sourceUV=(x,y)=>[x/1.5+.5,(oldMinY+(y-.80)/fitY)/2.25];
 const parts=[],geometries=[],materials=[];let merged,disposed=false,bodyGeometry;
 const part=(name,px,py,z,rx,ry,rz,roi)=>{const[x,y]=xy(px,py);parts.push({name,center:[x,y,z],radii:[rx*1.5/1024,ry*2.25/1536*fitY,rz],orientation:[0,0,0,1],sourceRegion:roi});};
 const limb=(name,a,b,radius,roi)=>{const av=new T.Vector3(...xy(a[0],a[1]),a[2]),bv=new T.Vector3(...xy(b[0],b[1]),b[2]),d=bv.clone().sub(av);parts.push({name,center:av.clone().add(bv).multiplyScalar(.5).toArray(),radii:[radius,d.length()/2+radius,radius],orientation:new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()).toArray(),sourceRegion:roi});};
 const isA=subject==='amitabha';
 const head=isA?[512,166,132,143]:[511,152,129,139],neck=isA?[512,322]:[511,303];
 part('head',head[0],head[1],0,head[2],head[3],.18,isA?[378,649,23,312]:[378,642,12,294]);
 part('neck',...neck,-.015,72,45,.12,isA?[421,601,279,366]:[421,601,265,344]);
 part('torso',512,isA?479:450,-.025,170,isA?164:149,.215,isA?[345,678,319,661]:[345,678,297,607]);
 part('abdomen',512,isA?638:592,.005,185,119,.245,isA?[326,700,518,749]:[326,700,478,708]);
 part('lap',512,isA?825:787,.075,386,isA?102:92,.34,isA?[111,914,719,928]:[115,901,683,864]);
 for(const sign of [-1,1])part(sign<0?'image-left-knee':'image-right-knee',isA?(sign<0?264:759):(sign<0?280:744),isA?822:780,.13,174,87,.28,isA?[111,914,719,928]:[115,901,683,864]);
 const leftRoi=isA?[185,414,332,731]:[182,407,303,697],rightRoi=isA?[615,837,332,731]:[601,827,300,700];
 limb('image-left-upper-sleeve',[344,isA?359:332,0],[257,isA?574:538,.04],.115,leftRoi);
 limb('image-right-upper-sleeve',[680,isA?359:332,0],[766,isA?574:544,.04],.115,rightRoi);
 limb('image-left-lower-sleeve',[257,isA?574:538,.04],[isA?382:273,isA?704:619,.27],.09,leftRoi);
 limb('image-right-lower-sleeve',[766,isA?574:544,.04],[isA?642:631,isA?704:661,.28],.09,rightRoi);
 if(isA){
  part('lower-overlapped-palm',515,727,.305,135,21,.065,[367,659,672,749]);
  part('upper-overlapped-palm',511,696,.32,136,22,.065,[367,659,672,749]);
 }else{
  part('image-left-downturned-palm',260,671,.30,42,66,.055,[204,312,601,768]);
  part('image-right-bowl-support-palm',554,665,.33,90,30,.065,[466,655,625,695]);
 }
 for(const sign of[-1,1])part(sign<0?'image-left-ear':'image-right-ear',sign<0?386:638,isA?221:208,-.005,18,71,.033,isA?[366,662,130,298]:[366,662,121,284]);
 part('nose',512,isA?190:174,.165,20,29,.045,isA?[480,545,153,224]:[480,545,138,210]);
 if(isA)for(const p of parts)if(p.name==='lap'||p.name.includes('knee'))p.center[1]-=.03;
 for(const p of parts)if(p.name==='abdomen'){p.center[1]-=.015;p.radii[1]+=.025;p.sourceRegion[3]=isA?790:746;}
 for(const sign of[-1,1])part(sign<0?'image-left-neck-robe-bridge':'image-right-neck-robe-bridge',sign<0?406:618,isA?314:299,-.015,27,34,.075,sign<0?[375,450,isA?265:253,isA?365:348]:[574,650,isA?265:253,isA?365:348]);
 const robeProfile=[[.835,.35,.24,-.16],[.96,.40,.28,-.23],[1.10,.31,.27,-.23],[1.28,.27,.23,-.20],[1.50,.25,.20,-.21],[1.68,.21,.15,-.19],[1.80,.10,.10,-.12]];
 for(let i=parts.length-1;i>=0;i--)if(['torso','abdomen','lap'].includes(parts[i].name))parts.splice(i,1);
 const hem=createSideHemWarp(),robeField=createRobeProfileField(robeProfile),robeSource={name:'continuous-robe',sourceRegion:isA?[111,914,319,928]:[115,901,297,864]};
 const release=()=>{const errors=[];for(const x of[...geometries,...materials])try{x.dispose();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'Side study release');};
 try{
  materials.push(new T.MeshStandardMaterial({name:'own-generated-side-art',map:options.texture??null,color:0xffffff,roughness:.76,metalness:.16}));
  materials.push(new T.MeshStandardMaterial({name:'unverified-side-back-gold',color:0xad8146,roughness:.76,metalness:.16}));
  for(const[name,color,roughness,metalness]of[['core',0x986327,.76,.18],['petals',0xffffff,.65,.3],['base',0x9f6c35,.78,.18]])materials.push(new T.MeshStandardMaterial({name:'retained-eight-tier-'+name,color,map:name==='petals'?(options.texture??null):null,roughness,metalness,...(name==='petals'?{alphaTest:.5}:{})}));
  bodyGeometry=createSideRobeBody({profile:robeProfile,retainedParts:parts,hemWarp:{}});geometries.push(bodyGeometry);
  // Side-only discrete-surface shading. This does not repair or certify the
  // sampled implicit surface; large corrections are recorded and flat controls
  // are mandatory in the diagnostic. Original shared body generator is unchanged.
  bodyGeometry.computeVertexNormals();
  const pos=bodyGeometry.attributes.position,norm=bodyGeometry.attributes.normal,ix=bodyGeometry.index,incident=Array.from({length:pos.count},()=>[]);
  for(let j=0;j<ix.count;j+=3){const ids=[0,1,2].map(k=>ix.getX(j+k)),v=ids.map(i=>new T.Vector3().fromBufferAttribute(pos,i)),fn=v[1].sub(v[0]).cross(v[2].sub(v[0])).normalize();for(const i of ids)incident[i].push(fn);}
  let projectedVertices=0,maxCorrectionRadians=0;
  for(let i=0;i<pos.count;i++){const initial=new T.Vector3().fromBufferAttribute(norm,i),q=initial.clone(),cs=incident[i];if(cs.every(n=>q.dot(n)>=0))continue;projectedVertices++;
   for(let k=0;k<128;k++){for(const n of cs){const d=q.dot(n);if(d<1e-5)q.addScaledVector(n,1e-5-d);}if(q.length()<1e-10)throw Error('Side normal constraint degeneracy');q.normalize();if(cs.every(n=>q.dot(n)>=0))break;}
   if(cs.some(n=>q.dot(n)<0))throw Error('Side normal constraints unresolved');maxCorrectionRadians=Math.max(maxCorrectionRadians,Math.acos(T.MathUtils.clamp(initial.dot(q),-1,1)));norm.setXYZ(i,q.x,q.y,q.z);
  }
  const shading={method:'AREA_WEIGHTED_WITH_INCIDENT_FACE_HALFSPACE_PROJECTION',projectedVertices,maxCorrectionRadians,discreteGeometryStillUnverified:true,flatShadingComparisonRequired:true};

  const fixed=parts.map(p=>({...p,q:new T.Quaternion(...p.orientation).invert()})),local=new T.Vector3();
  const nearest=(x,y,z)=>{let best=robeField.distance(x,y,hem.mapZ(x,y,z)),chosen=robeSource;for(const p of fixed){local.set(x-p.center[0],y-p.center[1],z-p.center[2]).applyQuaternion(p.q);const d=(Math.hypot(local.x/p.radii[0],local.y/p.radii[1],local.z/p.radii[2])-1)*Math.min(...p.radii);if(d<best){best=d;chosen=p;}}return chosen;};
  const applyArt=(g,choose)=>{const pos=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,idx=g.index;for(let i=0;i<pos.count;i++)uv.setXY(i,...sourceUV(pos.getX(i),pos.getY(i)));g.clearGroups();let start=0,previous=-1,art=0;
   for(let j=0;j<idx.count;j+=3){const ids=[idx.getX(j),idx.getX(j+1),idx.getX(j+2)],p=choose(...[0,1,2].map(k=>ids.reduce((s,i)=>s+pos.array[i*3+k],0)/3)),roi=p.sourceRegion;
    const pixels=ids.map(i=>[uv.getX(i)*1024,(1-uv.getY(i))*1536]);let valid=ids.reduce((s,i)=>s+n.getZ(i),0)/3>.25&&pixels.every(([x,y])=>x>=roi[0]&&x<=roi[1]&&y>=roi[2]&&y<=roi[3]);
    if(!isA&&p.name!=='bowl'&&sideBowlIntersects(pixels))valid=false;
    if(valid){const xs=pixels.map(p=>p[0]/8),ys=pixels.map(p=>p[1]/8);for(let y=Math.max(0,Math.floor(Math.min(...ys)-.5));y<=Math.min(192,Math.ceil(Math.max(...ys)+.5));y++)for(let x=Math.max(0,Math.floor(Math.min(...xs)-.5));x<=Math.min(128,Math.ceil(Math.max(...xs)+.5));x++)if(input.alpha[y*129+x]<128)valid=false;}
    const mat=valid?0:1;if(valid)art++;if(mat!==previous){if(previous>=0)g.addGroup(start,j-start,previous);start=j;previous=mat;}
   }g.addGroup(start,idx.count-start,previous);return art;};
  const texturedBodyFaces=applyArt(bodyGeometry,nearest),render=[bodyGeometry];let bowlGeometry=null;
  if(!isA){const sourceProfile=[[0,648],[.035,648],[.065,637],[.078,615],[.068,594],[.054,582],[.054,576],[.046,576],[.046,584],[.058,598],[.067,615],[.050,632],[.025,638],[0,638]];const profile=sourceProfile.map(([radius,py])=>new T.Vector2(radius,(648-py)/1536*2.25*fitY));const raw=new T.LatheGeometry(profile,48);try{raw.deleteAttribute('normal');raw.deleteAttribute('uv');bowlGeometry=mergeVertices(raw,1e-7);}finally{raw.dispose();}geometries.push(bowlGeometry);const clean=[];for(let j=0;j<bowlGeometry.index.count;j+=3){const ids=[0,1,2].map(k=>bowlGeometry.index.getX(j+k));if(new Set(ids).size===3)clean.push(...ids);}bowlGeometry.setIndex(clean);bowlGeometry.computeVertexNormals();bowlGeometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(bowlGeometry.attributes.position.count*2),2));const[bx,by]=xy(543,648);bowlGeometry.translate(bx,by,.35);applyArt(bowlGeometry,()=>({name:'bowl',sourceRegion:[485,599,573,651]}));render.push(bowlGeometry);}
  const lotus=createEightTierLotus();geometries.push(lotus);lotus.scale(1,.81/lotus.boundingBox.max.y,1);lotus.attributes.uv.array.set(preparePetalUV(lotus,subject));lotus.deleteAttribute('lotusTier');for(const group of lotus.groups)group.materialIndex+=2;render.push(lotus);
  merged=mergeGeometries(render,false);if(!merged)throw Error('Side volume merge failed');geometries.push(merged);let offset=0;for(const g of render){for(const group of g.groups)merged.addGroup(offset+group.start,group.count,group.materialIndex);offset+=g.index.count;}
  const buckets=materials.map(()=>[]);for(const group of merged.groups)for(let j=group.start;j<group.start+group.count;j++)buckets[group.materialIndex].push(merged.index.getX(j));merged.setIndex(buckets.flat());merged.clearGroups();let at=0;buckets.forEach((a,i)=>{if(a.length)merged.addGroup(at,a.length,i);at+=a.length;});merged.computeBoundingBox();merged.computeBoundingSphere();
  const mesh=new T.Mesh(merged,materials);mesh.name=subject+'-volume-study-not-product';const meta={subjectId:subject,defaultProductReplacement:false,historicalShapeVerified:false,sourceDepthRecovered:false,continuousBodySurface:true,hasBowl:!isA,lotusPetalTiers:8,registration,continuityFit:{robeProfile,hemWarp:hem.controls,removedCoreFields:['torso','abdomen','lap'],robeCapLoweredMetres:.005,neckRobeBridges:true,bowlSourceOutline:SIDE_BOWL_OUTLINE,bowlHeightSourcePixels:[576,648],notHistorical:true},parts,shading,texturedBodyFaces,bodyField:bodyGeometry.userData.bodyField,poseBasis:'OWN_GENERATED_FRONT_ART_NOT_HISTORICAL_PROOF',sideBack:'ENGINEERING_FIT',lotusReused:true};mesh.userData.originalArtResearch=meta;
  return{mesh,meta,bodyGeometry,bowlGeometry,dispose(){if(disposed)return;disposed=true;const errors=[];try{release();}catch(e){errors.push(e);}if(options.ownsTexture===true)try{options.texture?.dispose();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'Side volume disposal');}};
 }catch(error){try{release();}catch(e){throw new AggregateError([error,e],'Side volume construction and release');}throw error;}
}
