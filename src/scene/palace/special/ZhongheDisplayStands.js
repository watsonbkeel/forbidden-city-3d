import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='zhonghe-slender-display-stands';
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/dc/1569.jpg';

/** Only the two foreground objects previously emitted as giant generic tripods.
 * Own photograph supports slender legs / a shallow top / a small upper object,
 * not survey dimensions, an inventory identification or a reconstructed carving.
 * Three plain legs and the unseen reverse are compatibility fits, not evidence.
 */
export function buildZhongheDisplayStands(builder,shell,{x0,y,ztb0,thW}={}) {
  if(shell?.userData.structure?.id!=='zhonghedian'||
    ![x0,y,ztb0,thW,builder?.ox,builder?.oz].every(Number.isFinite)||thW<=0||y<0||
    !Array.isArray(builder.colliders)||!Array.isArray(builder.walkables)||typeof builder.ownMat!=='function'||
    shell.position.lengthSq()!==0||shell.rotation.x!==0||shell.rotation.y!==0||shell.rotation.z!==0||!shell.scale.equals(new THREE.Vector3(1,1,1)))
    throw Error('Zhonghe stands require the untransformed registered Zhonghe hall and finite retained frame');
  if(shell.getObjectByName(ID)||builder.colliders.some(c=>c.triangleSupport?.id.startsWith(ID)))throw Error('Duplicate Zhonghe stands');
  const group=new THREE.Group(),colliders=[],geometries=[];group.name=ID;
  const leg=builder.ownMat('zhonghe_stand_plain_legs',{name:'zhonghe_stand_plain_legs',color:0x734333,roughness:.8});
  const tray=builder.ownMat('zhonghe_stand_plain_tray',{name:'zhonghe_stand_plain_tray',color:0x596256,roughness:.75,metalness:.1});
  const small=builder.ownMat('zhonghe_stand_small_display',{name:'zhonghe_stand_small_display',color:0x9b8140,roughness:.7,metalness:.15});
  function add(side,role,geometry,material) {
    geometries.push(geometry);
    geometry.translate(x0+side*thW*.35,y,ztb0-2.2);
    const mesh=new THREE.Mesh(geometry,material),id=`${ID}:${side}:${group.children.length}`;
    mesh.name=`${ID}:${role}`;mesh.castShadow=mesh.receiveShadow=true;
    mesh.userData={zhongheStand:true,side,role,collisionId:id};
    const shape=triangleInstance(createTriangleTemplate(geometry),[builder.ox,0,builder.oz],id),box=shape.box.clone();box.triangleSupport=shape;
    colliders.push(box);group.add(mesh);
  }
  function segment(side,a,b) {
    const d=b.clone().sub(a),g=new THREE.CylinderGeometry(.025,.025,d.length(),8);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()));
    g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());add(side,'slender-leg',g,leg);
  }
  try {
    for(const side of[-1,1]) {
      // The lowest ends meet/very slightly enter the unchanged visible floor
      // y+.03, rather than hover above it. No ring across the open leg volume.
      for(let k=0;k<3;k++) {
        const angle=Math.PI/2+k*2*Math.PI/3;
        const points=[[.19,.035],[.26,.31],[.22,.68],[.29,.98]].map(([r,h])=>new THREE.Vector3(r*Math.cos(angle),h,r*Math.sin(angle)));
        for(let j=1;j<points.length;j++)segment(side,points[j-1],points[j]);
      }
      add(side,'shallow-tray',new THREE.CylinderGeometry(.35,.32,.06,20).translate(0,1.01,0),tray);
      add(side,'plain-small-display',new THREE.CylinderGeometry(.16,.16,.035,16).translate(0,1.0575,0),small);
      add(side,'plain-small-display',new THREE.CylinderGeometry(.13,.11,.19,16).translate(0,1.17,0),small);
      add(side,'plain-small-display',new THREE.CylinderGeometry(.145,.145,.025,16).translate(0,1.2775,0),small);
    }
  } catch(error) {geometries.forEach(g=>g.dispose());throw error;}
  const record={id:ID,source:SOURCE,sourcePage:'https://www.dpm.org.cn/explore/building/236464.html',accepted:false,
    scope:'TWO_PREVIOUS_FOREGROUND_TRIPODS_ONLY',dimensions:'REVERSIBLE_PHOTO_RELATIONSHIP_FIT_NOT_MEASURED',
    retainedCenters:[-1,1].map(s=>[x0+s*thW*.35,ztb0-2.2]),legCountStatus:'ENGINEERING_FIT_NOT_IDENTIFIED_FROM_PHOTO',
    unknown:['precise vessel identity','leg count and joinery','dimensions','hidden reverse','carving and inscriptions','photograph date'],
    collision:'VISIBLE_CLOSED_PART_TRIANGLES_ONLY_NO_ENCLOSING_AIR_BOX',newWalkables:0};
  group.userData.structure=record;shell.userData.structure.displayStands=record;
  shell.add(group);builder.colliders.push(...colliders);return group;
}
