import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createOriginalRelief} from './OriginalBuddhaRelief.js';
import {createEightTierLotus} from './EightTierLotus.js';
import {preparePetalUV,PETAL_SOURCES} from './OriginalLotusPetalUV.js';

// Original artwork upper body plus a genuinely eight-tier procedural lotus.
// Only the documented tier count and broad pose are source-grounded. Metrics,
// petal count, profile, surface colours, side and back remain engineering fits.
export function createRefinedCentralRelief(input,options={}){
 if(input?.columns!==129||input?.rows!==193||input?.imageWidth!==1024||input?.imageHeight!==1536
  ||!(input.alpha instanceof Uint8Array)||input.alpha.length!==129*193
  ||(options.height!==undefined&&options.height!==2.25))throw Error('Exact bounded refined central grid and 2.25 height required');
 const lastRow=124,alpha=input.alpha.slice();alpha.fill(0,(lastRow+1)*129);
 let upper,lotus,merged;
 try{
  // Texture ownership transfers only when this entire factory returns.
  upper=createOriginalRelief({...input,alpha},{...options,height:2.25,ownsTexture:false});
  lotus=createEightTierLotus();const yScale=.81/lotus.boundingBox.max.y;
  lotus.scale(1,yScale,1);lotus.computeBoundingBox();
  lotus.attributes.uv.array.set(preparePetalUV(lotus,'shakyamuni'));lotus.attributes.uv.needsUpdate=true;
  const vertexOffset=upper.mesh.geometry.attributes.position.count,indexOffset=upper.mesh.geometry.index.count;
  const tiers=lotus.userData.tiers.map(t=>({id:t.id,baseY:t.baseY*yScale,tipY:t.tipY*yScale,petals:t.petals.map(p=>({vertexStart:vertexOffset+p.vertexStart,vertexCount:p.vertexCount}))}));
  // The count attribute is evidence, not a shader input. Preserve its explicit
  // vertex ranges in metadata; keep the existing standard export attributes.
  lotus.deleteAttribute('lotusTier');
  merged=mergeGeometries([upper.mesh.geometry,lotus],false);
  if(!merged)throw Error('Refined central geometry merge failed');
  for(const g of upper.mesh.geometry.groups)merged.addGroup(g.start,g.count,g.materialIndex);
  for(const g of lotus.groups)merged.addGroup(indexOffset+g.start,g.count,3+g.materialIndex);
  for(const [name,color,roughness,metalness]of[['core',0x986327,.76,.18],['petals',0xb77e38,.7,.23],['base-leaves',0x9f6c35,.78,.18]]){
   upper.mesh.material.push(new T.MeshStandardMaterial({name:'original_refined_lotus_'+name,color:name==='petals'?0xffffff:color,roughness:name==='petals'?.65:roughness,metalness:name==='petals'?.3:metalness,...(name==='petals'?{map:options.texture??null,transparent:false,alphaTest:.5}:{})}));
  }
  // Keep the original geometry identity and its existing single-owner disposer.
  upper.mesh.geometry.copy(merged);upper.mesh.geometry.computeBoundingBox();upper.mesh.geometry.computeBoundingSphere();
  upper.mesh.name='original-refined-central-buddha-eight-tier-research';
  Object.assign(upper.meta,{centralRevision:'refined-eight-tier-v2',sourceUpperLastRow:lastRow,oldPaintedPedestalUsed:false,
   lotusPetalTiers:8,lotusEightTiers:'EIGHT_PROCEDURAL_UPWARD_TIERS_TEXT_GROUNDED__PROFILE_AND_PETAL_COUNT_FIT',
   pedestalProportion:'PROCEDURAL_SEAT_TOP_0_81_MODEL_FIT',lotusTierVertexRanges:tiers,
   lotusYScale:yScale,lotusMaterials:'OWN_ORIGINAL_SINGLE_PETAL_ALBEDO_AND_PROCEDURAL_CORE_NOT_MEASURED_PBR',
   lotusPetalTexture:{...PETAL_SOURCES['shakyamuni'],kind:'OWN_GENERATED_SINGLE_PETAL_INTERIOR_NOT_FULL_PAINTED_SEAT',notMeasuredPBR:true},
   vertices:upper.mesh.geometry.attributes.position.count,triangles:upper.mesh.geometry.index.count/3,
   historicalPose:'RIGHT_HAND_LOWERED_LEFT_HAND_IN_FRONT__BROAD_FIGURE13_POSE_NOT_FINGER_RECONSTRUCTION',
   chestMark:'BUDDHIST_MARK_PRESENT_IN_ORIGINAL_ART__EXACT_HISTORICAL_ORIENTATION_UNVERIFIED'});
  const box=upper.mesh.geometry.boundingBox,center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());
  upper.collisionProxy={type:'bounded-research-proxy-only',boxes:[{center:center.toArray(),size:size.toArray()}],activeInProduct:false};
  const disposeUpper=upper.dispose;let disposed=false;
  upper.dispose=()=>{
   if(disposed)return;disposed=true;
   const errors=[];
   try{disposeUpper();}catch(error){if(error instanceof AggregateError)errors.push(...error.errors);else errors.push(error);}
   if(options.ownsTexture===true){try{options.texture?.dispose();}catch(error){errors.push(error);}}
   if(errors.length)throw new AggregateError(errors,'Refined Buddha relief resource disposal failed');
  };
  return upper;
 }catch(error){try{upper?.dispose();}catch{}throw error;}
 finally{try{merged?.dispose();}catch{}try{lotus?.dispose();}catch{}}
}
