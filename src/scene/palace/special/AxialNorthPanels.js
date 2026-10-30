import * as THREE from 'three';

const CONFIG={zhaode:{id:'axis-courts/obj-010',name:'昭德门',objectId:'FC-F838FEF7AB',group:8,foot:.85,palette:[0x907253,0x346f70,0xc3c0a6,0x925042]},zhendu:{id:'axis-courts/obj-012',name:'贞度门',objectId:'FC-9252CFFDAB',group:11,foot:.72,palette:[0x876347,0x365f5c,0xb9b097,0x884638]}};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
// Fitted base-paint approximations, not sampled photograph shadows or a survey.
// The 4 x 1 palette survives CourtKit's UV-preserving material batching, unlike
// vertex colors. No photographic pixels, ornamental motif, or hidden room.


/**
 * Replace ONLY the two existing north skin triangles per broad closure with a
 * coplanar non-overlapping partition. All other sides, normals, UVs and material
 * references remain exact. Called after box pruning; no collision/route edits.
 * Returns false without GPU-resource allocation or mutation on rejected input.
 */
export function applyAxialNorthPanels(kit,frame) {
  const g=frame?.userData.gateGeometry,c=CONFIG[g?.profile];
  if(!c||g.id!==c.id||g.name!==c.name||frame.name!==g.name||frame.parent!==kit.root||
    !near(g.width,20.128)||!near(g.depth,13.248)||!near(g.platformY,3.216)||!near(g.core.wallThickness,.4))return false;
  const ROLE=`${g.profile}-north-panel-paint`,PALETTE=c.palette;
  const meshes=[];frame.traverse(o=>{if(o.isMesh)meshes.push(o);});
  if(meshes.some(m=>m.userData.role===ROLE))return false;
  const panels=meshes.filter(m=>m.userData.role===`${g.profile}-side-panel`);
  const targets=panels.filter(m=>near(m.position.z,g.core.rearZ));
  if(panels.length!==4||targets.length!==2)return false;
  const width=(g.width-g.portals[0].clearWidth)/2,center=g.portals[0].clearWidth/2+width/2;
  if(!targets.some(m=>near(m.position.x,-center))||!targets.some(m=>near(m.position.x,center)))return false;
  const prepared=[];
  for(const mesh of targets){
    const geometry=mesh.geometry,a=geometry?.attributes,index=geometry?.index,count=index?.count??a?.position?.count;
    if(mesh.parent!==frame||mesh.isInstancedMesh||mesh.isSkinnedMesh||mesh.material!==kit.lib.material('wall_red')||
      !mesh.visible||!mesh.castShadow||!mesh.receiveShadow||mesh.rotation.x||mesh.rotation.y||mesh.rotation.z||!mesh.scale.equals(new THREE.Vector3(1,1,1))||
      !near(mesh.position.y,g.platformY+g.core.panelHeight/2)||count!==36||Object.keys(a??{}).sort().join()!=='normal,position,uv'||
      Object.values(a).some(v=>v.isInterleavedBufferAttribute)||Object.keys(geometry.morphAttributes).length||geometry.drawRange.start!==0||
      (geometry.drawRange.count!==Infinity&&geometry.drawRange.count!==count)||meshes.some(m=>m!==mesh&&m.geometry===geometry))return false;
    const all=Array.from({length:count},(_,i)=>index?index.getX(i):i),front=[],keep=[];
    for(let i=0;i<count;i+=3){
      const ids=all.slice(i,i+3),points=ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j));
      const cross=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
      if(cross.lengthSq()<1e-12||!ids.every(j=>Object.values(a).every(v=>Array.from(v.array.subarray(j*v.itemSize,(j+1)*v.itemSize)).every(Number.isFinite))))return false;
      cross.normalize();if(!ids.every(j=>cross.dot(new THREE.Vector3().fromBufferAttribute(a.normal,j))>.99999))return false;
      const isFront=ids.every(j=>a.normal.getZ(j)>.99999);
      (isFront?front:keep).push(...ids);
    }
    if(front.length!==6||keep.length!==30)return false;
    const xs=front.map(j=>a.position.getX(j)),ys=front.map(j=>a.position.getY(j)),z=a.position.getZ(front[0]);
    const bounds=[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)];
    if(!front.every(j=>near(a.position.getZ(j),.2))||!near(bounds[1]-bounds[0],width)||!near(bounds[3]-bounds[2],g.core.panelHeight))return false;
    // Existing core column edges bound the broad bay, excluding the narrow
    // lateral closed panel. Bottom is the UNCHANGED gray foot top. No relief.
    const x0=(mesh.position.x<0?-7.5:3.3)-mesh.position.x,x1=x0+4.2;
    const y0=g.platformY+c.foot-mesh.position.y,y1=g.platformY+g.building.columnH-.65-mesh.position.y;
    if(x0<=bounds[0]||x1>=bounds[1]||y0<=bounds[2]||y1>=bounds[3])return false;
    prepared.push({mesh,geometry,a,front,keep,bounds,z,rect:[x0,x1,y0,y1]});
  }

  const texture=new THREE.DataTexture(new Uint8Array(PALETTE.flatMap(c=>[(c>>16)&255,(c>>8)&255,c&255,255])),4,1,THREE.RGBAFormat);
  texture.name=`${g.profile}_north_panel_palette`;texture.colorSpace=THREE.SRGBColorSpace;
  texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;
  const material=new THREE.MeshStandardMaterial({name:`${g.profile}_north_panel_paint`,color:0xffffff,map:texture,roughness:1,metalness:0});
  kit.owned.push(material);(kit.ownedTextures??=[]).push(texture);
  for(const {mesh,geometry,a,front,keep,bounds,z,rect} of prepared){
    const body={position:[],normal:[],uv:[]},paint={position:[],normal:[],uv:[]};
    for(const key of Object.keys(body))for(const j of keep)body[key].push(...a[key].array.subarray(j*a[key].itemSize,(j+1)*a[key].itemSize));
    // Interpolate the real source UV plane, rather than imposing a different
    // tile scale on the retained red margins of this north face.
    const uvAt=affineUV(a,front.slice(0,3));
    partition(bounds,rect,r=>rectangle(body,r,z,uvAt));
    let inset=rect;
    // Plain fitted outlines only. Widths are reversible visual fits in metres,
    // not measured joinery, moulding relief or exact historical paint patterns.
    for(const [color,width] of [[1,.13],[2,.025],[3,.035]]){
      const inner=[inset[0]+width,inset[1]-width,inset[2]+width,inset[3]-width];
      partition(inset,inner,r=>rectangle(paint,r,z,paletteUV(color,r)));inset=inner;
    }
    rectangle(paint,inset,z,paletteUV(0,inset));
    mesh.geometry=buffer(body);
    const skin=kit.mesh(frame,buffer(paint),material,...mesh.position.toArray());skin.name=ROLE;
    skin.userData={role:ROLE,objectId:c.objectId,sourceId:`${g.profile}-own-north`,sourceGroup:c.group,status:'VERIFY_PENDING',
      fit:'North broad-bay paint only; width 4.2 m and retained foot/head, zero relief, outline widths .13/.025/.035 m are visual fits, not survey.',
      unknown:'Door plane and full north depth remain unverified; adjoining galleries untouched.'};
    geometry.dispose();
  }
  return true;
}

function partition([x0,x1,y0,y1],[a,b,c,d],emit){
  // Four disjoint rectangles, never four overlapping full-height strips.
  emit([x0,a,y0,y1]);emit([b,x1,y0,y1]);emit([a,b,y0,c]);emit([a,b,d,y1]);
}
function rectangle(out,[x0,x1,y0,y1],z,uvAt){
  for(const [x,y] of [[x0,y0],[x1,y1],[x0,y1],[x0,y0],[x1,y0],[x1,y1]]){
    out.position.push(x,y,z);out.normal.push(0,0,1);out.uv.push(...uvAt(x,y));
  }
}
function paletteUV(color,[x0,x1,y0,y1]){
  // Noncollapsed UVs stay strictly inside one nearest-sampled palette texel.
  return (x,y)=>[(color+.25+.5*(x-x0)/(x1-x0))/4,.25+.5*(y-y0)/(y1-y0)];
}
function affineUV(a,[i,j,k]){
  const x=a.position.getX(i),y=a.position.getY(i),dx=a.position.getX(j)-x,dy=a.position.getY(j)-y,ex=a.position.getX(k)-x,ey=a.position.getY(k)-y,det=dx*ey-ex*dy;
  const u=a.uv.getX(i),v=a.uv.getY(i),du=a.uv.getX(j)-u,dv=a.uv.getY(j)-v,eu=a.uv.getX(k)-u,ev=a.uv.getY(k)-v;
  return (px,py)=>{const s=((px-x)*ey-ex*(py-y))/det,t=(dx*(py-y)-(px-x)*dy)/det;return [u+s*du+t*eu,v+s*dv+t*ev];};
}
function buffer(data){
  const geometry=new THREE.BufferGeometry();for(const [key,values] of Object.entries(data))geometry.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='uv'?2:3));
  geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

/** Closed north view is plain red, not six studded faces. Open leaves turn south
 * around the corresponding outer jamb; retained boxes are rotation-symmetric. */
export function applyAxialPlainDoorBacks(kit,frame){
 const g=frame.userData.gateGeometry,c=CONFIG[g?.profile];if(!c)return false;
 const leaves=frame.children.filter(m=>m.userData.role===`${g.profile}-door-leaf`);
 if(leaves.length!==2||leaves.some(m=>m.geometry.index?.count!==36||m.material!==kit.lib.material('door_studded')))throw Error('Axial source leaves changed '+JSON.stringify(leaves.map(m=>({index:m.geometry.index?.count,count:m.geometry.attributes.position.count,mat:m.material.name})) ));
 for(const leaf of leaves){const geo=leaf.geometry,front=[],keep=[];for(let i=0;i<geo.index.count;i+=3){const ids=[0,1,2].map(k=>geo.index.getX(i+k));(ids.every(j=>geo.attributes.normal.getZ(j)===-1)?front:keep).push(...ids);}if(front.length!==6)throw Error('Axial front face absent');
  const skin=geo.clone();skin.setIndex(front);skin.clearGroups();geo.setIndex(keep);geo.clearGroups();leaf.material=kit.lacquer;
  const mesh=kit.mesh(leaf,skin,kit.lib.material('door_studded'),0,0,0);mesh.name=mesh.userData.role=`${g.profile}-door-front`;
  if(leaf.userData.open)leaf.rotation.y=-Math.sign(leaf.position.x)*Math.PI/2;
 }
 frame.userData.structure.northObservation={sourceGroup:c.group,objectId:c.objectId,status:'OWN_PHOTO_COLOR_AND_PLAIN_BACK_ONLY',wholeObjectAccepted:false,doorPlane:'Retained frontZ, relation to rearZ panels UNVERIFIED',openState:'Gameplay only; source photograph closed',backFraming:'Visible in source but not yet reconstructed'};
 return true;
}
