import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createEightTierLotus} from './EightTierLotus.js';
import {preparePetalUV} from './OriginalLotusPetalUV.js';

// Private engineering sample, not an historical sculpture reconstruction.
// Existing generated artwork supplies front colour only, never recovered depth.
export function createCentralBuddhaVolumeStudy(input,options={}){
 if(input?.columns!==129||input?.rows!==193||input?.imageWidth!==1024||input?.imageHeight!==1536||!(input.alpha instanceof Uint8Array)||input.alpha.length!==129*193)throw Error('Exact central artwork grid required');
 // Regions fitted independently from the existing front artwork. They are
 // deliberately not derived from each primitive's box: that would permit
 // a misplaced hand to sample an unrelated robe region without detection.
 const regions={head:[-.215,.204,1.794,2.226],neck:[-.133,.133,1.715,1.809],torso:[-.35,.35,1.154,1.756],abdomen:[-.35,.35,1.02,1.48],lap:[-.59,.579,.81,1.107],
  'right-hand':[-.450,-.315,.913,1.207],'left-hand':[-.126,.198,1.104,1.206],
  'right-sleeve':[-.51,-.13,1.10,1.78],'left-sleeve':[.11,.51,1.10,1.78],nose:[-.06,.06,1.91,2.06]};
 const regionFor=name=>regions[name]??regions[name.includes('finger')?'right-hand':name.includes('ear')?'head':name.includes('knee')?'lap':name.startsWith('right-')?'right-sleeve':'left-sleeve'];
 const geometries=[],materials=[],parts=[];let merged,disposed=false,unmappedFrontTriangles=0;
 const release=()=>{const errors=[];for(const g of geometries)try{g.dispose();}catch(e){errors.push(e);}for(const m of materials)try{m.dispose();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'Volume study disposal errors');};
 const ellipsoid=(name,center,radii,orientation=null)=>{
  const g=new T.SphereGeometry(1,32,24);geometries.push(g);g.scale(...radii);if(orientation)g.applyQuaternion(orientation);g.translate(...center);g.computeBoundingBox();
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;const box=g.boundingBox,sourceRegionXY=regionFor(name),[xmin,xmax,ymin,ymax]=sourceRegionXY;const roi={u:[xmin/1.5+.5,xmax/1.5+.5],v:[ymin/2.25,ymax/2.25]};
  for(let i=0;i<p.count;i++)uv.setXY(i,T.MathUtils.clamp(p.getX(i)/1.5+.5,0,1),T.MathUtils.clamp(p.getY(i)/2.25,0,1));
  g.clearGroups();const idx=g.index;let start=0,previous=-1;
  // Conservative whole-triangle footprint. Vertex-only alpha checks miss
  // transparent cells between valid vertices, producing background patches.
  const opaqueTriangle=(...ids)=>{if(ids.some(i=>uv.getX(i)<roi.u[0]||uv.getX(i)>roi.u[1]||uv.getY(i)<roi.v[0]||uv.getY(i)>roi.v[1]))return false;const xs=ids.map(i=>uv.getX(i)*128),ys=ids.map(i=>(1-uv.getY(i))*192);
   for(let y=Math.max(0,Math.floor(Math.min(...ys)-.5));y<=Math.min(192,Math.ceil(Math.max(...ys)+.5));y++)for(let x=Math.max(0,Math.floor(Math.min(...xs)-.5));x<=Math.min(128,Math.ceil(Math.max(...xs)+.5));x++)if(input.alpha[y*129+x]<128)return false;
   return true;
  };
  for(let j=0;j<idx.count;j+=3){const a=idx.getX(j),b=idx.getX(j+1),c=idx.getX(j+2);const front=(n.getZ(a)+n.getZ(b)+n.getZ(c))/3>.25;const valid=opaqueTriangle(a,b,c);if(front&&!valid)unmappedFrontTriangles++;
   const mat=front&&valid?0:1;if(previous!==mat){if(previous!==-1)g.addGroup(start,j-start,previous);start=j;previous=mat;}
  }g.addGroup(start,idx.count-start,previous);
  parts.push({name,kind:'closed-ellipsoid-engineering-fit',center,radii,depth:box.max.z-box.min.z,roi,sourceRegionXY,regionBasis:'INDEPENDENT_FRONT_ART_FIT_NOT_HISTORICAL_MEASURE',vertices:p.count,triangles:idx.count/3});return g;
 };
 const limb=(name,a,b,radius)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);ellipsoid(name,av.clone().add(bv).multiplyScalar(.5).toArray(),[radius,delta.length()/2+radius,radius],new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));};
 try{
  materials.push(new T.MeshStandardMaterial({name:'generated-art-front-partition',map:options.texture??null,color:0xffffff,roughness:.72,metalness:.12}));
  materials.push(new T.MeshStandardMaterial({name:'unverified-side-back-and-unmapped-gold',color:0xad8146,roughness:.76,metalness:.16}));
  materials.push(new T.MeshStandardMaterial({name:'lotus-core',color:0x986327,roughness:.76,metalness:.18}));
  materials.push(new T.MeshStandardMaterial({name:'lotus-petals',map:options.texture??null,color:0xffffff,roughness:.65,metalness:.3,alphaTest:.5}));
  materials.push(new T.MeshStandardMaterial({name:'lotus-base',color:0x9f6c35,roughness:.78,metalness:.18}));
  ellipsoid('torso',[0,1.455,-.015],[.33,.30,.19]);
  ellipsoid('abdomen',[0,1.17,.015],[.34,.22,.23]);
  ellipsoid('lap',[0,.975,.08],[.54,.165,.32]);
  ellipsoid('right-knee',[-.30,.985,.10],[.28,.16,.24]);ellipsoid('left-knee',[.30,.985,.10],[.28,.16,.24]);
  ellipsoid('neck',[0,1.765,-.005],[.11,.10,.10]);
  ellipsoid('head',[0,2.005,0],[.18,.22,.16]);
  ellipsoid('right-ear',[-.18,1.965,0],[.035,.095,.06]);ellipsoid('left-ear',[.18,1.965,0],[.035,.095,.06]);
  ellipsoid('nose',[0,1.984,.145],[.025,.055,.047]);
  limb('right-upper-sleeve',[-.25,1.64,0],[-.38,1.37,.04],.12);limb('right-lower-sleeve',[-.38,1.37,.04],[-.39,1.205,.22],.09);
  limb('left-upper-sleeve',[.25,1.64,0],[.39,1.34,.04],.12);limb('left-lower-sleeve',[.39,1.34,.04],[.20,1.18,.24],.09);
  ellipsoid('right-hand',[-.383,1.105,.27],[.061,.10,.045]);
  for(let i=0;i<4;i++)limb(`right-finger-${i}`,[-.423+i*.027,1.06,.28],[-.425+i*.027,.935+Math.abs(i-1.5)*.008,.28],.011);
  ellipsoid('left-hand',[.035,1.155,.285],[.16,.045,.065]);
  const lotus=createEightTierLotus();geometries.push(lotus);lotus.scale(1,.81/lotus.boundingBox.max.y,1);lotus.attributes.uv.array.set(preparePetalUV(lotus,'shakyamuni'));lotus.deleteAttribute('lotusTier');for(const group of lotus.groups)group.materialIndex+=2;
  merged=mergeGeometries(geometries,false);if(!merged)throw Error('Volume study merge failed');let offset=0;for(const g of geometries){for(const group of g.groups)merged.addGroup(offset+group.start,group.count,group.materialIndex);offset+=g.index.count;}
  // Batch all parts by shared material; partitioning must not create one draw
  // call per row of every sphere.
  const byMaterial=materials.map(()=>[]),sourceIndex=merged.index.array;
  for(const group of merged.groups)for(let i=group.start;i<group.start+group.count;i++)byMaterial[group.materialIndex].push(sourceIndex[i]);
  merged.setIndex(byMaterial.flat());merged.clearGroups();let materialStart=0;byMaterial.forEach((indices,materialIndex)=>{if(indices.length)merged.addGroup(materialStart,indices.length,materialIndex);materialStart+=indices.length;});
  merged.computeBoundingBox();merged.computeBoundingSphere();const mesh=new T.Mesh(merged,materials);mesh.name='central-buddha-volume-study-not-product';
  const meta={assetClass:'GENERATED_ART_AND_CODE_VOLUME_ENGINEERING_STUDY',defaultProductReplacement:false,historicalShapeVerified:false,sourceDepthRecovered:false,parts,unmappedFrontTriangles,unmappedFrontPolicy:'EXPLICIT_UNVERIFIED_GOLD_NOT_SOURCE_COLOUR',sideBack:'UNVERIFIED_PLAIN_MATERIAL',lotusReused:true};mesh.userData.originalArtResearch=meta;
  const box=merged.boundingBox;const collisionProxy={type:'volume-study-inactive-only',boxes:[{center:box.getCenter(new T.Vector3()).toArray(),size:box.getSize(new T.Vector3()).toArray()}],activeInProduct:false};
  return{mesh,meta,collisionProxy,dispose(){if(disposed)return;disposed=true;const errors=[];try{merged.dispose();}catch(e){errors.push(e);}try{release();}catch(e){errors.push(e);}if(options.ownsTexture===true)try{options.texture?.dispose();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'Volume study disposal failed');}};
 }catch(error){const errors=[error];try{merged?.dispose();}catch(e){errors.push(e);}try{release();}catch(e){if(e instanceof AggregateError)errors.push(...e.errors);else errors.push(e);}if(errors.length>1)throw new AggregateError(errors,'Volume study construction and cleanup failed');throw error;}
}
