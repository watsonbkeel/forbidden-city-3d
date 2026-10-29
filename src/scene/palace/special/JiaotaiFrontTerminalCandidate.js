import * as THREE from 'three';
import {hipArcSampler} from './HallWalkingBeasts.js';

// South-facing own-object views 94-3 / 94-1: a larger end mass inward of the
// seven small figures. This is a bounded silhouette FIT, not a species carving,
// measured statue, or evidence for the two unseen rear corners.
export function addJiaotaiFrontTerminal(ctx, group, ridge, pts, radius, row, add) {
  const arc=hipArcSampler(ridge.geometry.parameters.path,pts.length+1);
  const distance=row.riderDistance+8.5*row.spacing;
  if(distance+row.scale>arc.length-radius*2)throw Error('Jiaotai terminal cannot fit on retained ridge');
  const {point:p,tangent}=arc.at(distance),out=tangent.clone().normalize();
  // The Tube path runs from crown to eave; positive local X faces the eave.
  const yaw=Math.atan2(out.x,out.z),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const height=row.scale*1.75,width=radius*.95;
  const shape=new THREE.Shape();
  const outline=[[-.48,0],[.45,0],[.50,.25],[.36,.40],[.62,.56],[.66,.72],[.39,.69],[.42,.97],[.22,.83],[.10,1],[-.02,.78],[-.21,.72],[-.35,.54],[-.52,.41],[-.62,.53],[-.57,.70],[-.72,.62],[-.75,.41],[-.61,.24]];
  outline.forEach(([x,y],i)=>i?shape.lineTo(x*height,y*height):shape.moveTo(x*height,y*height));shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,curveSegments:1}),a=geometry.attributes.position;
  ridge.updateMatrixWorld(true);ridge.geometry.computeBoundingBox();
  const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0)),feet=[];
  const contact=(x,z)=>{ray.ray.origin.set(x,ridge.geometry.boundingBox.max.y+1,z);const hit=ray.intersectObject(ridge,false)[0];if(!hit)throw Error('Jiaotai terminal foot misses actual ridge');return hit.point.y;};
  const centerHeight=contact(p.x,p.z);
  for(let i=0;i<a.count;i++){
    const lx=a.getX(i),ly=a.getY(i),cross=a.getZ(i)-width/2;
    const x=p.x+out.x*lx+right.x*cross,z=p.z+out.z*lx+right.z*cross;
    const y=ly===0?contact(x,z):centerHeight+ly;
    if(ly===0)feet.push([x,y,z]);a.setXYZ(i,x,y,z);
  }
  a.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const mesh=add(group,geometry,ctx.mat.ridge);mesh.name='jiaotai-front-terminal-silhouette-fit';
  return{distance,center:p.toArray(),height,width,footContacts:[...new Map(feet.map(v=>[JSON.stringify(v),v])).values()],form:'OWN_VIEW_BOUNDED_SILHOUETTE_FIT_NOT_SPECIES_CARVING',source:'94-3 / 94-1 south-front corners only'};
}
