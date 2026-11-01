import * as THREE from 'three';

/**
 * Xihe's own courtyard/east (local +Z) six under-beam 雀替 only.
 * Official 13153.jpg supports the scalloped edge; s5e9d4bf591346.jpg
 * locates one pair in each central opening. Capture dates are unstated.
 * Shape/width/drop/depth are PHOTO_FIT, not measured carving or paintwork.
 * No materials, colliders, walkables, roof or other gate profiles are changed.
 * Each call owns fresh geometry; CourtKit owns merging/disposal as usual.
 */
export function buildXiheCourtyardCorbels(kit, frame, g) {
  if(g.profile!=='xihe')return [];
  const members=[];
  for(const bay of [1,2,3])for(const direction of [1,-1]) {
    const shape=new THREE.Shape();
    shape.moveTo(0,0);shape.lineTo(1.48,0);shape.lineTo(1.40,-.13);
    shape.quadraticCurveTo(1.30,-.10,1.23,-.20);
    shape.quadraticCurveTo(1.16,-.28,1.06,-.23);
    shape.quadraticCurveTo(.97,-.35,.85,-.31);
    shape.quadraticCurveTo(.75,-.42,.63,-.36);
    shape.quadraticCurveTo(.51,-.45,.35,-.44);
    shape.lineTo(.32,-.57);shape.quadraticCurveTo(.19,-.65,.05,-.60);
    shape.lineTo(0,-.58);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.20,bevelEnabled:false,steps:1,curveSegments:3});
    geometry.translate(0,0,-.10);
    const x=g.columnXs[direction===1?bay:bay+1]+direction*.18;
    const member=kit.mesh(frame,geometry,kit.lib.material('caihua_beam'),x,g.platformY+g.columnH-.655,g.depth/2+.14);
    if(direction===-1)member.rotation.y=Math.PI;
    member.name='xihe-courtyard-corbel';
    Object.assign(member.userData,{role:member.name,objectId:'FC-06B1BADE77',bay,direction,side:'rear',status:'PHOTO_FIT',captureDate:null,
      fit:{width:1.48,drop:.62,depth:.20},sourceImages:['13153.jpg','s5e9d4bf591346.jpg'],visualAcceptance:'VERIFY_PENDING'});
    members.push(member);
  }
  return members;
}
