import * as THREE from 'three';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1442[1024].jpg';
/** Original surface approximation only: the photographed bowl is raised and
 * glazed; this artwork does not reconstruct relief or the separate petal crown. */
export function fitBiluoBowlSurface(c,m){
 const{p,f,kit}=c;if(p.key!=='biluo'||p.id!=='place-ningshou-47ec73915d'||p.localW!==5||p.localD!==4.9||p.ph!==.5||p.rot!==0||f.parent!==kit.root||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||f.rotation.x||f.rotation.y||f.rotation.z||!f.scale.equals(new THREE.Vector3(1,1,1))||f.userData.biluoBowlSurface)throw Error('Biluo bowl registered frame mismatch');
 if(m.parent!==f||m.userData.role!=='r68-biluo-finial-bowl'||m.position.x||m.position.z||m.position.y!==p.ph+3.2+2.8+.35||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new THREE.Vector3(1,1,1))||m.material!==c.mats.blue)throw Error('Biluo bowl identity/transform mismatch');
 const expected=new THREE.CylinderGeometry(.29,.17,.18,24);try{for(const key of['position','normal','uv','index']){const a=key==='index'?m.geometry.index:m.geometry.attributes[key],b=key==='index'?expected.index:expected.attributes[key];if(!a||a.itemSize!==b.itemSize||a.count!==b.count||a.array.some((v,i)=>!Object.is(v,b.array[i])))throw Error('Biluo bowl original ordered buffer mismatch');}if(JSON.stringify(m.geometry.groups)!==JSON.stringify(expected.groups))throw Error('Biluo bowl original material groups mismatch');}finally{expected.dispose();}
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#18345c';ctx.fillRect(0,0,1024,256);const count=18,w=1024/count;
 for(let i=-1;i<=count;i++){
  ctx.save();ctx.translate((i+.5)*w,0);ctx.scale(w,256);
  // Blue panel has a pale rounded upper shoulder and a pointed lower return.
  ctx.beginPath();ctx.moveTo(-.36,.10);ctx.bezierCurveTo(-.43,.18,-.36,.57,-.26,.74);ctx.quadraticCurveTo(-.12,.88,0,.91);ctx.quadraticCurveTo(.12,.88,.26,.74);ctx.bezierCurveTo(.36,.57,.43,.18,.36,.10);ctx.quadraticCurveTo(0,.025,-.36,.10);ctx.closePath();ctx.strokeStyle='#9aa9a2';ctx.lineWidth=.035;ctx.stroke();
  // Yellow pendant petal, fitted motif family rather than a traced relief.
  ctx.beginPath();ctx.moveTo(-.18,.18);ctx.quadraticCurveTo(-.04,.10,0,.23);ctx.quadraticCurveTo(.04,.10,.18,.18);ctx.bezierCurveTo(.24,.28,.17,.57,.13,.67);ctx.quadraticCurveTo(.08,.78,0,.82);ctx.quadraticCurveTo(-.08,.78,-.13,.67);ctx.bezierCurveTo(-.17,.57,-.24,.28,-.18,.18);ctx.closePath();ctx.fillStyle='#d9ad35';ctx.fill();ctx.strokeStyle='#d1c4a1';ctx.lineWidth=.025;ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,.24);ctx.quadraticCurveTo(.05,.43,0,.72);ctx.strokeStyle='#806e3c';ctx.lineWidth=.015;ctx.stroke();ctx.restore();
 }
 ctx.drawImage(canvas,0,0,1,256,1023,0,1,256);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=THREE.RepeatWrapping;map.wrapT=THREE.ClampToEdgeWrapping;map.anisotropy=4;
 const original=m.material,side=new THREE.MeshStandardMaterial({name:'biluo-bowl-blue-yellow-pendant-surface-fit',map,color:0xffffff,roughness:.65,metalness:0});kit.owned.push(side);(kit.ownedTextures??=[]).push(map);
 // MergeUtils deliberately skips multi-material meshes. Partition the exact
 // original indexed faces, adding no surface or depth. Caps keep the original
 // shared blue; the separate side enters its ordinary single-material batch.
 const group=m.geometry.groups.find(g=>g.materialIndex===0),indices=Array.from(m.geometry.index.array),sideGeometry=m.geometry.clone();
 sideGeometry.setIndex(indices.slice(group.start,group.start+group.count));sideGeometry.clearGroups();
 m.geometry.setIndex([...indices.slice(0,group.start),...indices.slice(group.start+group.count)]);m.geometry.clearGroups();
 const sideMesh=new THREE.Mesh(sideGeometry,side);sideMesh.name=m.name+'-surface';sideMesh.position.copy(m.position);sideMesh.quaternion.copy(m.quaternion);sideMesh.scale.copy(m.scale);sideMesh.castShadow=m.castShadow;sideMesh.receiveShadow=m.receiveShadow;
 sideMesh.userData={role:'r68-biluo-finial-bowl-side-surface',biluoBowlSurface:true,patternStatus:'BLUE_YELLOW_PENDANT_SURFACE_FIT_NOT_RELIEF'};f.add(sideMesh);
 m.userData.biluoBowlCaps=true;m.userData.patternStatus='ORIGINAL_BLUE_CAPS_SIDE_FACES_PARTITIONED_FOR_BATCHING';

 return f.userData.biluoBowlSurface={originalObjectId:'FC-47EC73915D',source:PHOTO,scope:'EXISTING_BOWL_SIDE_ONLY_CAPS_MATERIAL_UNCHANGED',sourceFacesPartitionedForBatching:true,surfaceGeometryChanged:false,patternStatus:'ORIGINAL_BLUE_FIELD_YELLOW_PENDANT_PETALS_PALE_BORDER_SURFACE_APPROXIMATION',reliefStatus:'PHOTOGRAPHED_RAISED_BOWL_ORNAMENT_NOT_RECONSTRUCTED',count,countStatus:'MODEL_PATTERN_NOT_PHOTO_COUNT',backStatus:'ORIGINAL_WRAP_CONTINUATION_NOT_INDEPENDENTLY_VERIFIED',dimensionStatus:'RETAINED_MODEL_FIT_NOT_SURVEY',wholeObjectAccepted:false,remaining:['Actual bowl relief and exact pattern proportions/count','Separate raised floral petal crown above bowl','Neck/foot detailed ornament and back evidence','Complete pavilion and mountain/bridge acceptance']};
}
