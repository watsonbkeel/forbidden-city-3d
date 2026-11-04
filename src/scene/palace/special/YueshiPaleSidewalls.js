import * as T from 'three';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1565.jpg';
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
/** The building's own south view shows pale end masonry rather than the shared
 * dark brick tone. Only four retained side-wall meshes get a private material.
 * Color and its continuation on unseen faces are fits, not measured colorimetry.
 * No surface, dimension, collision, opening or navigation is changed. */
export function fitYueshiPaleSidewalls(c){
 const{p,f,kit,mats}=c;
 if(p?.key!=='yueshi'||p.id!=='place-ningshou-78e6a34c2d'||p.x!==-334.5||p.z!==390.1||p.localW!==18.4||p.localD!==10.2||p.ph!==.5||p.colH!==8||p.upperFloorY!==4.3||p.gallery!==1.25||p.rot!==0||f?.parent!==kit?.root||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!Object.isExtensible(f.userData)||f.userData.yueshiPaleSidewalls||!mutable(kit.owned)||mats.brick?.name!=='r48_ningshou_brick_fit'||mats.brick.color.getHex()!==0x72746d)throw Error('Exact original Yueshi side-wall host required, once only');
 const targets=f.children.filter(m=>m.userData.role==='gable-enclosure'),h0=p.upperFloorY-p.ph-.35,h1=p.ph+p.colH-p.upperFloorY-.35;
 const expected=[...[-1,1].map(s=>({x:s*p.localW/2,y:p.ph+h0/2,h:h0})),...[-1,1].map(s=>({x:s*p.localW/2,y:p.upperFloorY+h1/2,h:h1}))];
 if(targets.length!==4)throw Error('Four original Yueshi side walls required');
 for(const e of expected){const found=targets.filter(m=>m.position.x===e.x&&m.position.y===e.y&&m.position.z===0);if(found.length!==1)throw Error('Original Yueshi wall position mismatch');const m=found[0];
  if(!m.isMesh||m.parent!==f||m.userData.identity!==p.id||m.material!==mats.brick||!Object.getOwnPropertyDescriptor(m,'material')?.writable||!m.quaternion.equals(new T.Quaternion())||!m.scale.equals(new T.Vector3(1,1,1)))throw Error('Original Yueshi wall identity or material mismatch');
  const g=new T.BoxGeometry(.22,e.h,p.localD-2*p.gallery);try{for(const key of['position','normal','uv','index']){const a=key==='index'?m.geometry.index:m.geometry.attributes[key],b=key==='index'?g.index:g.attributes[key];if(!a||a.itemSize!==b.itemSize||a.count!==b.count||a.array.some((v,i)=>!Object.is(v,b.array[i])))throw Error('Original Yueshi wall buffer mismatch');}if(JSON.stringify(m.geometry.groups)!==JSON.stringify(g.groups))throw Error('Original Yueshi wall groups mismatch');}finally{g.dispose();}
 }
 const material=mats.brick.clone();try{material.name='r164_yueshi_pale_sidewall_fit';material.color.setHex(0xb8b5a8);}catch(e){material.dispose();throw e;}
 const meta={originalObjectId:'FC-78E6A34C2D',source:PHOTO,scope:'FOUR_EXISTING_TWO_LEVEL_GABLE_ENCLOSURES_PALE_MATERIAL_ONLY',measuredColor:false,hiddenFacesIndependentlyVerified:false,wholeObjectAccepted:false,surfaceGeometryChanged:false,collisionChanged:false,newMapItems:0,newWalkables:0,targetMeshes:4,colorFit:'#b8b5a8',unknown:['Exact color under neutral lighting and current conservation condition','Unpictured faces receive uniform continuation of the same fit','Detailed painted beams, side-gallery joints and whole-building acceptance']};
 kit.owned.push(material);for(const m of targets)m.material=material;f.userData.yueshiPaleSidewalls=meta;return meta;
}
