import {CHENGRUI_SEAT_FLOORS} from '../../controls/ChengruiSeatSupport.js';
import {applyBoxUV} from '../../utils/GeometryUV.js';
import * as THREE from 'three';
import {createXiqingSurface} from '../../controls/XiqingRoofSurface.js';
const SOURCES=['https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98108dce16c.jpg','https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98108dd6faa.jpg'];
/** Two photographed south main-hall seats only. Counts, depth and carved outline
 * are bounded original photo fits, not measured carving or an interior survey. */
export function addChengruiSouthSeats(builder,a,p){
 const{g,wood,stone,box}=a;
 if(p.x!==53.5||p.z!==498.5||p.name!=='澄瑞亭'||p.mainFloor!==.9||p.mainColumnWidth!==7.6||g.name!=='bridge_pavilion_澄瑞亭'||g.position.x!==p.x||g.position.y!==0||g.position.z!==p.z||g.rotation.x||g.rotation.y||g.rotation.z||g.scale.x!==1||g.scale.y!==1||g.scale.z!==1||g.userData.r142ChengruiSeats)throw Error('R142 Chengrui south seat identity/transform mismatch');
 const floorBindings=[['bridge-main-plinth','chengrui-main-plinth-top',[8.4,.9,8.4],[0,.45,0]],['bridge-annex-plinth','chengrui-annex-plinth-top',[8.4,.5,2.4],[0,.25,-5.4]]].map(([name,id,size,position])=>{const m=g.children.find(v=>v.name===name),a=m?.geometry?.attributes?.position;if(!m||!a||a.count!==36||m.rotation.x||m.rotation.y||m.rotation.z||m.scale.x!==1||m.scale.y!==1||m.scale.z!==1||m.position.toArray().some((v,i)=>v!==position[i]))throw Error('R142 original plinth geometry/transform binding mismatch');const expected=applyBoxUV(new THREE.BoxGeometry(...size),1);try{for(const key of ['position','normal','uv']){const v=m.geometry.attributes[key]?.array,w=expected.attributes[key].array;if(!v||v.length!==w.length||v.some((n,i)=>n!==w[i]))throw Error('R142 original plinth ordered geometry bytes drift');}if(m.geometry.index!==null)throw Error('R142 original plinth index drift');}finally{expected.dispose();}return [m,id];});
 let surfaceIndex=0;
 const register=(m,id,topOnly=false)=>{const p=m.geometry.attributes.position,ix=m.geometry.index,faces=[];for(let i=0;i<(ix?.count??p.count);i+=3){const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).add(m.position).add(g.position));if(topOnly&&new THREE.Triangle(...vertices).getNormal(new THREE.Vector3()).y<.999999)continue;faces.push({source:{mesh:g.children.indexOf(m),triangle:i/3},vertices});}const contact=createXiqingSurface(faces,id),col=contact.box.clone();col.xiqingRoofSurface=contact;col.r142ChengruiSeat=true;builder.addCollider(col);m.userData.r142Contact=id;return col;};
 const marker=m=>{m.userData.r142ChengruiSeat=true;return m;};
 const solidBox=(name,w,h,d,x,y,z,mat)=>{const m=marker(box(name,w,h,d,x,y,z,mat));builder.colliders.at(-1).r142ChengruiSeat=true;return m;};
 // A closed Y/Z profile extruded across X. The mapping has positive determinant,
 // preserving outward winding, and collision uses these same actual triangles.
 const profile=(shape,width)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:width,steps:1,curveSegments:8,bevelEnabled:false}),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const z=pos.getX(i),y=pos.getY(i),depth=pos.getZ(i);pos.setXYZ(i,width/2-depth,y,z);}geo.computeVertexNormals();return geo;};
 const add=(name,geo,mat,x)=>{const m=marker(new THREE.Mesh(geo,mat));m.name=m.userData.role=name;m.position.x=x;m.castShadow=m.receiveShadow=true;g.add(m);register(m,'chengrui-south-seat-'+surfaceIndex++);m.userData.contact='SAME_CLOSED_RENDER_TRIANGLES_EXACT_SQUARE_FOOTPRINT';return m;};
 const back=new THREE.Shape();back.moveTo(-3.79,1.48);back.bezierCurveTo(-4.02,1.61,-4.04,1.81,-3.88,2.01);back.lineTo(-3.82,2.01);back.bezierCurveTo(-3.98,1.81,-3.96,1.63,-3.73,1.48);back.closePath();
 const end=new THREE.Shape();end.moveTo(-4.63,.50);end.lineTo(-3.63,.50);end.lineTo(-3.63,2.08);end.quadraticCurveTo(-3.60,2.18,-3.76,2.19);end.lineTo(-3.91,2.19);end.quadraticCurveTo(-4.08,2.16,-4.03,2.00);end.quadraticCurveTo(-4.18,1.96,-4.10,1.82);end.quadraticCurveTo(-3.99,1.72,-4.20,1.68);end.quadraticCurveTo(-4.46,1.69,-4.43,1.49);end.quadraticCurveTo(-4.39,1.34,-4.29,1.37);end.quadraticCurveTo(-4.22,1.24,-4.40,1.18);end.quadraticCurveTo(-4.64,1.18,-4.62,.97);end.quadraticCurveTo(-4.60,.83,-4.49,.86);end.quadraticCurveTo(-4.44,.75,-4.60,.72);end.quadraticCurveTo(-4.75,.65,-4.63,.50);end.closePath();
 for(const sign of [-1,1]){
  // The original seat boards stay in place; only the former solid stone infill
  // is replaced with source-visible supports and curved open back members.
  for(const [i,x]of [sign*1.80,sign*3.43].entries()){solidBox('r142-chengrui-seat-stone-support',.28,.47,.36,x,1.135,-3.8,stone);if(i===0){const owner=builder.colliders.at(-1);owner.furnitureMotionScope={kind:'chengrui-south-seats',floor:CHENGRUI_SEAT_FLOORS.map(f=>({...f})),id:sign<0?'chengrui-south-seat-east':'chengrui-south-seat-west',minOffsetX:p.x+sign*2.6-1.4-owner.min.x,maxOffsetX:p.x+sign*2.6+1.4-owner.min.x,minOffsetZ:p.z-5.6-owner.min.z,maxOffsetZ:p.z-2.7-owner.min.z};}}
  solidBox('r142-chengrui-back-lower-rail',2.19,.075,.10,sign*2.6,1.52,-3.77,wood);
  solidBox('r142-chengrui-back-upper-rail',2.19,.10,.14,sign*2.6,2.01,-3.85,wood);
  for(let i=0;i<9;i++)add('r142-chengrui-curved-back-slat',profile(back,.065),wood,sign*2.6+(i-4)*.235);
  add('r142-chengrui-cloud-stone-end',profile(end,.22),stone,sign*1.58);
 }
 // Original plinths were validated above; only their existing live walkables
 // are referenced by the finite seat owners. No whole-platform collider added.

 return p.southSeatFit=g.userData.r142ChengruiSeats={originalObjectId:'FC-4610835E3D',sources:SOURCES,scope:'SOUTH_MAIN_TWO_SEATS_ONLY',wholeObjectAccepted:false,status:'SOURCE_VISIBLE_CURVED_RED_BACK_AND_STONE_END_OUTLINE_PARTIAL_FIT',dimensions:'PHOTO_FIT_NOT_SURVEYED',slatAndSupportCounts:'MODEL_SPACING_FIT_NOT_VERIFIED_HISTORICAL_COUNTS',fineCarving:'UNRECONSTRUCTED',annex:'ORIGINAL_BACKLESS_SEATS_RETAINED',northAndFubi:'UNCHANGED_UNVERIFIED',navigation:'NO_NEW_WALKABLE; EXACT_LOCAL_SQUARE_FOOT_CONTACT_ON_NEW_CLOSED_CURVES; LIVE_ORIGINAL_PLINTH_FLOOR_BINDING',photographyDate:null};
}
