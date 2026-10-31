import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {XISHANG_REGION,XISHANG_FLOORS} from '../../../controls/XishangSupport.js';
import * as THREE from 'three';
const SOURCES=['https://img.dpm.org.cn/Uploads/Picture/dc/2671[1024].jpg','https://img.dpm.org.cn/Uploads/Picture/2017/04/26/s58ffed5fbf403.jpg'];
/** Source-visible open timber family, fitted to the retained three front bays.
 * No glass, photographic plane, rear/side extrapolation or hidden full panel. */
export function buildXishangFrontTransom(c,{mainW,mainD}){
 const{p,f,kit}=c;
 if(p.key!=='xishang'||p.id!=='place-ningshou-fadd286b97'||p.localW!==12.4||p.localD!==6.7||p.ph!==.5||p.colH!==4.5||p.rot!==Math.PI/2||mainW!==p.localW*.66||mainD!==p.localD*.7||f.parent!==kit.root||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||f.rotation.x||f.rotation.y!==p.rot||f.rotation.z||!f.scale.equals(new THREE.Vector3(1,1,1))||f.userData.xishangFrontTransom)throw Error('Xishang transom requires retained original front frame');
 const z=-mainD/2,beam=f.children.filter(m=>m.userData.role==='eave-beam'&&Math.abs(m.position.x)<1e-10&&Math.abs(m.position.z-z)<1e-10&&Math.abs(m.position.y-4.82)<1e-10);
 const columns=f.children.filter(m=>m.userData.role==='column'&&Math.abs(m.position.z-z)<1e-10).sort((a,b)=>a.position.x-b.position.x);
 if(beam.length!==1||columns.length!==4||columns.some((m,i)=>Math.abs(m.position.x-(-mainW/2+i*mainW/3))>1e-10||m.position.y!==2.75)||beam[0].geometry.parameters.width!==mainW+.2||beam[0].geometry.parameters.height!==.36||beam[0].geometry.parameters.depth!==.28)throw Error('Xishang transom original beam/column binding mismatch');
 const boxSource=new THREE.BoxGeometry(mainW+.2,.36,.28),columnSource=new THREE.CylinderGeometry(.16,.16*1.03,4.5,12);
 try{for(const [m,expected] of [[beam[0],boxSource],...columns.map(m=>[m,columnSource])]){if(m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new THREE.Vector3(1,1,1)))throw Error('Xishang original frame binding transform mismatch');for(const key of ['position','normal','uv','index']){const a=key==='index'?m.geometry.index:m.geometry.attributes[key],b=key==='index'?expected.index:expected.attributes[key];if(!a||a.count!==b.count||a.itemSize!==b.itemSize||a.array.some((v,i)=>!Object.is(v,b.array[i])))throw Error('Xishang original frame ordered buffer mismatch');}}}finally{boxSource.dispose();columnSource.dispose();}
 // Header sits below the retained ceiling grid; end hangers alone rise
 // through the existing column-edge space to the original beam.
 const first=kit.colliders.length,parts=[];
 const bar=(role,w,h,x,y,bay)=>{const m=c.box('front-transom-'+role,'wood',w,h,.06,x,y,z,false);m.userData.xishangFrontTransom=true;m.userData.transomBay=bay;m.userData.contact='SAME_RENDERED_OPEN_SURFACE_TRIANGLES';parts.push(m);return m;};
 for(let bay=0;bay<3;bay++){
  const left=-mainW/2+bay*mainW/3+.12,right=-mainW/2+(bay+1)*mainW/3-.12,w=right-left;
  bar('top',w,.06,(left+right)/2,4.42,bay);bar('bottom',w,.06,(left+right)/2,3.95,bay);
  for(const x of[left,right])bar('side',.06,.76,x,4.30,bay);
  const cell=w/3;for(let j=1;j<3;j++)bar('divider',.035,.47,left+j*cell,4.185,bay);
  for(let j=0;j<3;j++){
   const x=left+j*cell;
   bar('upper-return',cell*.65,.025,x+cell*.325,4.27,bay);
   bar('upper-drop',.025,.085,x+cell*.65,4.2275,bay);
   bar('middle-return',cell*.30,.025,x+cell*.50,4.185,bay);
   bar('lower-drop',.025,.085,x+cell*.35,4.1425,bay);
   bar('lower-return',cell*.65,.025,x+cell*.675,4.10,bay);
  }
 }
 return f.userData.xishangFrontTransom={originalObjectId:'FC-FADD286B97',sources:SOURCES,scope:'THREE_MAIN_LOCAL_FRONT_BAYS_ONLY',worldFacing:'EAST_NEGATIVE_WORLD_X_FROM_RETAINED_ROTATION',bays:3,geometryCount:parts.length,colliderCount:1,lowerEdge:3.92,retainedFloor:.5,dimensionStatus:'PHOTO_RELATIONSHIP_RETAINED_MODEL_FIT_NOT_SURVEY',patternStatus:'SIMPLIFIED_RECTANGULAR_RETURN_BARS_NOT_EXACT_JOINERY',openingPolicy:'REAL_OPEN_HOLES_EACH_SOLID_BAR_HAS_EXACT_OPEN_SURFACE_CONTACT',wholeObjectAccepted:false,remaining:['Exact source lattice counts/joinery and fine shapes','Side and rear ornament independently unimplemented','Complete pavilion/roof/site relationship and watercourse acceptance']};
}


/** Only existing rendered source triangles: no proxy roof or hidden plane. */
export function registerXishangRoofTransom(c){
 const {p,f,kit}=c;if(p.key!=='xishang'||!f.userData.xishangFrontTransom||f.userData.xishangExistingRoof)throw Error('Xishang exact source binding required');
 const roles=new Set(['roof-surface','roof-hip-skirt','roof-curved-gable','glazed-eave-edge','fitted-bearing-eave-purlin','fitted-bearing-crossbeam','fitted-bearing-tie-beam','roof-tile-rib','roof_pavilion_rafters','roof_pavilion_roof_ridge_glaze','roof_pavilion_roof_finial_gold']);
 const roofs=[],bars=[];f.traverse(m=>{if(!m.isMesh)return;if(m.userData.xishangFrontTransom)bars.push(m);else if(roles.has(m.userData.role)||['roof_pavilion_rafters','roof_pavilion_rafters_material','roof_pavilion_roof_ridge_glaze','roof_pavilion_roof_finial_gold'].includes(m.name))roofs.push(m);});
 if(roofs.length!==78||bars.length!==63)throw Error('Xishang source inventory changed');
 kit.root.updateWorldMatrix(true,true);const inverseRoot=new THREE.Matrix4().copy(kit.root.matrixWorld).invert();const faces=[];for(const [mesh,m] of [...roofs,...bars].entries()){m.userData.xishangSafetySourceIndex=mesh;const relative=new THREE.Matrix4().multiplyMatrices(inverseRoot,m.matrixWorld);const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3)faces.push({source:{mesh,triangle:i/3},vertices:[0,1,2].map(k=>{const v=new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(relative);v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);})});}
 const surface=createXiqingSurface(faces,'xishang-roof-transom'),box=surface.box.clone();box.xiqingRoofSurface=surface;
 const lo=[-243.20980000317095,.5,375.327199996829],hi=[-242.88019999682902,5,375.65680000317093],anchors=kit.colliders.filter(b=>b.min.toArray().every((v,i)=>v===lo[i])&&b.max.toArray().every((v,i)=>v===hi[i]));
 if(anchors.length!==1||anchors[0].furnitureMotionScope)throw Error('Xishang exact original column anchor missing or ambiguous');
 for(const q of XISHANG_FLOORS)if(kit.walkables.filter(w=>w.type==='box'&&w.box.min.x===q.minX&&w.box.max.x===q.maxX&&w.box.min.z===q.minZ&&w.box.max.z===q.maxZ&&w.box.min.y===q.height&&w.box.max.y===q.height).length!==1)throw Error('Xishang original floor source missing or ambiguous');
 const owner=anchors[0];owner.furnitureMotionScope={kind:'xishang-roof-transom',id:'xishang-roof-transom',minOffsetX:XISHANG_REGION.minX-owner.min.x,maxOffsetX:XISHANG_REGION.maxX-owner.min.x,minOffsetZ:XISHANG_REGION.minZ-owner.min.z,maxOffsetZ:XISHANG_REGION.maxZ-owner.min.z,floor:XISHANG_FLOORS};kit.colliders.push(box);
 return f.userData.xishangExistingRoof={source:'EXISTING_RENDERED_ROOF_AND_VISIBLE_BARS',roofMeshes:78,barMeshes:63,sourceFaces:faces.length,positiveFaces:surface.template.triangles.length,omittedZeroArea:surface.template.omitted.length,newFloor:false,algorithmChanges:false};
}
