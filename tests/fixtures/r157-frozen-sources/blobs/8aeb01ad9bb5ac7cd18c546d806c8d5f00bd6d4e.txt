import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const PHOTO='https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/S6oSWZZ89hNt74xWsVFstXvxyUK9Xkmn1uXf8KHy.jpg';
const PLAN='https://img.dpm.org.cn/Uploads/pdf/2201/T00008_00.pdf';
const FIT='PHOTO_AND_RETAINED_PLATFORM_FIT_NOT_SURVEYED';
// Closed corrugated lean-to slab, with explicit top/bottom/end faces. Tile
// module and depth are schematic; the pictured shallow roof is not a new floor.
function roofGeometry(x0,x1,z0,z1){
  const rows=Math.max(1,Math.round((z1-z0)/.22)),steps=rows*4,positions=[],indices=[],uv=[];
  for(let layer=0;layer<2;layer++)for(let x=0;x<2;x++)for(let j=0;j<=steps;j++){
    const xx=x?x1:x0,zz=z0+(z1-z0)*j/steps,base=x?1.62:2.18;
    const bump=layer===0?.028*Math.max(0,Math.cos(j*Math.PI/2)):0;
    positions.push(xx,base+(layer===0?bump:-.12),zz);uv.push(x,j/steps);
  }
  const n=steps+1,at=(l,x,j)=>l*2*n+x*n+j;
  const quad=(a,b,c,d)=>indices.push(a,b,c,a,c,d);
  for(let j=0;j<steps;j++){
    quad(at(0,0,j),at(0,0,j+1),at(0,1,j+1),at(0,1,j));
    quad(at(1,0,j),at(1,1,j),at(1,1,j+1),at(1,0,j+1));
    quad(at(0,0,j),at(1,0,j),at(1,0,j+1),at(0,0,j+1));
    quad(at(0,1,j),at(0,1,j+1),at(1,1,j+1),at(1,1,j));
  }
  quad(at(0,0,0),at(0,1,0),at(1,1,0),at(1,0,0));
  quad(at(0,0,steps),at(1,0,steps),at(1,1,steps),at(0,1,steps));
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();return g;
}
export function buildJiaotaiLowRooms(b,parent,rects,profile){
  const stair=profile?.flights?.find(f=>f.dir===1),rect=rects?.[stair?.rectIndex];
  if(parent.name!=='后三宫'||parent.position.lengthSq()!==0||parent.rotation.x!==0||parent.rotation.y!==0||parent.rotation.z!==0||parent.scale.x!==1||parent.scale.y!==1||parent.scale.z!==1||b.ox!==0||b.oz!==0||profile?.nominalDeckY!==2||!stair||Math.abs(stair.xEdge-13.5)>1e-6||Math.abs(stair.centerZ-354.1)>1e-6||Math.abs(stair.width-5.6)>1e-6||!rect||parent.userData.jiaotaiLowRooms)throw Error('R138 Jiaotai retained terrace binding mismatch');
  const palette={brick:b.ownMat('r138-jiaotai-brick',{name:'r138-jiaotai-brick',color:0x837e72,roughness:.95}),red:b.ownMat('r138-jiaotai-red',{name:'r138-jiaotai-red',color:0x6c2c23,roughness:.8}),pane:b.ownMat('r138-jiaotai-closed-pane',{name:'r138-jiaotai-closed-pane',color:0x454741,roughness:.9}),roof:b.ownMat('r138-jiaotai-yellow-roof',{name:'r138-jiaotai-yellow-roof',color:0xb78832,roughness:.55})};
  // The visible north and south rows are near-equal lengths (north slightly
  // longer). Do not fill the asymmetrical old waist platform with a longer house.
  const northStart=stair.openingZ[1]+.7,northEnd=rect.z1-1.2,northLength=northEnd-northStart;
  const southEnd=stair.openingZ[0]-.7;
  const rows=[{id:'west-south',z0:southEnd-northLength*.94,z1:southEnd},{id:'west-north',z0:northStart,z1:northEnd}];
  const firstCollider=b.colliders.length,records=[];
  for(const row of rows){
    if(row.z1-row.z0<5)throw Error('R138 low row span invalid');
    const g=new THREE.Group();g.name=`r138-jiaotai-${row.id}`;g.userData={r138JiaotaiRow:true,interior:'UNKNOWN_NOT_BUILT_NOT_ENTERABLE',source:PHOTO,orientation:'WEST_SIDE_INFERRED_BY_PHOTO_PLAN_REGISTRATION',dimensionStatus:FIT};parent.add(g);
    const piece=(role,mat,x0,x1,y0,y1,z0,z1,contact=true)=>{const m=b.box(g,mat,x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.name=role;if(contact){b.col(x0,y0,z0,x1,y1,z1);b.colliders.at(-1).r138JiaotaiRow=row.id;}return m;};
    const {z0,z1}=row,mid=(z0+z1)/2;
    // Closed exterior volume only, without invented rooms or access portals.
    piece('r138-low-room-brick-base',palette.brick,13.7,16.10,0,.62,z0,z1);
    // Dispatch only, attached to the real ordinary base. The existing exact
    // feet-scalar solver handles the same roof triangles and neighboring solids;
    // this is not an added invisible floor or a global collision change.
    const owner=b.colliders.at(-1);
    owner.furnitureMotionScope={kind:'jiaotai-low-roofs',id:`jiaotai-low-${row.id}`,groundY:0,minOffsetX:12.7-owner.min.x,maxOffsetX:17.4-owner.min.x,minOffsetZ:z0-.4-owner.min.z,maxOffsetZ:z1+.4-owner.min.z};
    piece('r138-low-room-upper-closed-core',palette.pane,13.7,16.10,.62,1.51,z0,z1);
    const modules=Math.max(3,Math.round((z1-z0)/1.35)),step=(z1-z0)/modules;
    for(const y of [.63,1.42])piece('r138-low-room-window-rail',palette.red,16.10,16.17,y,y+.07,z0,z1);
    for(let j=0;j<=modules;j++){const zz=z0+j*step;piece('r138-low-room-window-post',palette.red,16.10,16.18,.02,1.50,Math.max(z0,zz-.04),Math.min(z1,zz+.04));}
    for(let j=0;j<modules;j++)for(let k=1;k<7;k++){const zz=z0+(j+k/7)*step;if(Math.abs(zz-mid)<.40)continue;piece('r138-low-room-visible-straight-lattice',palette.red,16.10,16.15,.70,1.41,zz-.013,zz+.013);}
    piece('r138-low-room-closed-door',palette.red,16.10,16.19,.02,1.45,mid-.37,mid+.37);
    // The low roof owns its actual triangles: no flat walk box or broad air wall.
    const geo=roofGeometry(13.55,16.35,z0-.15,z1+.15),roof=new THREE.Mesh(geo,palette.roof);roof.name='r138-low-room-corrugated-lean-to-roof';roof.castShadow=roof.receiveShadow=true;g.add(roof);
    const p=geo.attributes.position,ix=geo.index,faces=[];
    for(let j=0;j<ix.count;j+=3)faces.push({source:{mesh:0,triangle:j/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix.getX(j+k)))});
    const shape=createXiqingSurface(faces,`jiaotai-low-${row.id}-roof`),col=shape.box.clone();col.xiqingRoofSurface=shape;col.r138JiaotaiRow=row.id;b.colliders.push(col);
    g.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(g);records.push({...row,modelBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},interior:g.userData.interior,facadeModuleCount:modules,moduleCountStatus:'MODEL_FIT_NOT_HISTORIC_BAY_COUNT',roofTriangles:geo.index.count/3});
  }
  return parent.userData.jiaotaiLowRooms={originalObjectId:'FC-DD2C183004',scope:'TWO_SOURCE_VISIBLE_LOW_EXTERIOR_ROWS_ONLY',photo:PHOTO,plan:PLAN,planPage:8,dimensionStatus:FIT,orientation:'WEST_SIDE_INFERRED_NOT_OFFICIAL_CAPTION',rows:records,oppositeSide:'NOT_IMPLEMENTED_INDEPENDENT_PHOTO_DETAILS_UNVERIFIED',interior:'UNKNOWN_NOT_BUILT_NOT_ENTERABLE',stairOpeningPreserved:[...stair.openingZ],firstCollider,addedColliders:b.colliders.length-firstCollider,roofContact:'EXACT_RENDERED_TRIANGLES_SQUARE_FOOTPRINT_AND_FEET_SCALAR_LOCAL_SCOPE',wholeObjectAccepted:false};
}
