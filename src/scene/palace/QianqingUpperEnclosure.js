import * as THREE from 'three';

const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997b6039710.jpg';
const close=(a,b)=>Math.abs(a-b)<1e-5;
const fail=()=>{throw Error('Unregistered Qianqing upper-body surface');};

function subset(geometry,vertices){
  const out=new THREE.BufferGeometry();
  for(const[name,a]of Object.entries(geometry.attributes)){
    if(a.isInterleavedBufferAttribute)fail();
    const values=new a.array.constructor(vertices.length*a.itemSize);
    vertices.forEach((v,i)=>values.set(a.array.subarray(v*a.itemSize,(v+1)*a.itemSize),i*a.itemSize));
    out.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize,a.normalized));
  }
  return out;
}

/** Reassign only the existing south face, never add an overlay or move a roof.
 * The museum's front photograph supports this face; east/north/west retain
 * their previous material pending equivalent evidence. UV rhythm is a visual
 * approximation using the existing caihua atlas, not a traced historic panel. */
export function paintQianqingUpperEnclosure(roof,library,name){
  if(name!=='乾清宫')return false;
  const band=roof?.userData?.doubleEaveMountingBand;
  if(!band||roof.userData.qianqingUpperEnclosure)fail();
  const wood=roof.children.filter(m=>m.isMesh&&/^wood_column(?:_material)?$/.test(m.material?.name));
  const painted=roof.children.filter(m=>m.isMesh&&/^caihua_beam(?:_material)?$/.test(m.material?.name));
  if(wood.length!==1||painted.length!==1)fail();
  const body=wood[0],geo=body.geometry,pos=geo.attributes.position,norm=geo.attributes.normal;
  if(geo.index||pos?.count!==24||norm?.count!==24||geo.attributes.uv?.count!==24||geo.groups.length)fail();
  geo.computeBoundingBox();painted[0].geometry.computeBoundingBox();
  const box=geo.boundingBox,top=box.max.y,low=band.lowerY;
  if(![band.halfWidth,band.halfDepth,low,top].every(Number.isFinite)
    ||!close(box.min.x,-band.halfWidth)||!close(box.max.x,band.halfWidth)
    ||!close(box.min.z,-band.halfDepth)||!close(box.max.z,band.halfDepth)
    ||!close(top,painted[0].geometry.boundingBox.min.y)||!(low>box.min.y&&top>low))fail();
  const front=[],other=[];
  for(let i=0;i<pos.count;i+=3){
    const ids=[i,i+1,i+2],south=ids.every(j=>close(pos.getZ(j),-band.halfDepth)&&close(norm.getZ(j),-1));
    (south?front:other).push(...ids);
  }
  if(front.length!==6||other.length!==18)fail();
  const repeat=(top-low)*library.aspect('caihua_beam');
  if(!Number.isFinite(repeat)||repeat<=0)fail();
  const frontGeo=subset(geo,front),otherGeo=subset(geo,other),uv=frontGeo.attributes.uv,p=frontGeo.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+band.halfWidth)/repeat,(p.getY(i)-low)/(top-low));
  // Below the lower ridge these same triangles are covered by the unchanged
  // opaque skirt roof. Do not add a second face at the visible intersection.
  const face=new THREE.Mesh(frontGeo,painted[0].material);face.copy(body,false);face.geometry=frontGeo;face.material=painted[0].material;
  face.name='qianqing-upper-south-painted-body';
  face.userData.qianqingUpperEnclosure={source:SOURCE,face:'south',visibleBottom:low,visibleTop:top,
    status:'PHOTO_SUPPORTED_FACE_WITH_APPROXIMATE_EXISTING_ATLAS_RHYTHM'};
  body.geometry=otherGeo;roof.add(face);geo.dispose();
  roof.userData.qianqingUpperEnclosure={...face.userData.qianqingUpperEnclosure,trianglesReassigned:2,trianglesAdded:0};
  return true;
}
