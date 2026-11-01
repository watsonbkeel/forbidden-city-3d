import * as THREE from 'three';
import {mergeByMaterial} from '../../../utils/MergeUtils.js';

// The two museum texts specify five walking beasts per corner. The rider is
// separate. These are generic low-detail body/head silhouettes, not the five
// species' sculpture, terminal beasts, chiwen or a surveyed reconstruction.
// The production CourtKit roof is LOW detail: its old animal/rider total is ZERO.
const TARGETS=Object.freeze({
  2:{name:'景仁宫',profile:'jingren-rear-entry',x:-93.4,z:331,w:28,d:13.7,page:236509,ridgePosition:'44552bb5'},
  16:{name:'钟粹宫',profile:'zhongcui-front-veranda',x:-93.4,z:433.2,w:28.6,d:15.2,page:236484,ridgePosition:'ac30f815'},
});
const fail=reason=>{throw Error(`East five roof beasts: ${reason}`);};
function fingerprint(array){let h=2166136261;for(const v of new Uint8Array(array.buffer,array.byteOffset,array.byteLength))h=Math.imul(h^v,16777619);return(h>>>0).toString(16);}
function identity(o,position=[0,0,0]){return o?.position.toArray().every((v,i)=>v===position[i])&&o.quaternion.toArray().every((v,i)=>v===[0,0,0,1][i])&&o.scale.toArray().every(v=>v===1);}

// finalize() no longer retains TubeGeometry.parameters. Read the exact low
// TubeGeometry triangle/UV stream instead: four tubes, each 8 segments × 4
// radial sides × 2 triangles. UV longitudinal rings recover the submitted
// centerline, not a guessed y or a second roof generated at a different detail.
function submittedHip(ridge,corner){
  const source=ridge.geometry,p=source.attributes.position,uv=source.attributes.uv,start=corner*192;
  const rings=Array.from({length:9},()=>new Map());
  for(let i=start;i<start+192;i++){
    const u=uv.getX(i)*8,v=uv.getY(i)*4;
    if(!Number.isInteger(u)||!Number.isInteger(v)||u<0||u>8||v<0||v>4)fail('unexpected low hip UV topology');
    rings[u].set(v%4,new THREE.Vector3().fromBufferAttribute(p,i));
  }
  const centers=rings.map(r=>{if(r.size!==4)fail('incomplete submitted hip ring');return [...r.values()].reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(.25);}).reverse();
  const distance=[0];for(let i=1;i<centers.length;i++)distance.push(distance.at(-1)+centers[i].distanceTo(centers[i-1]));
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p.array.slice(start*3,(start+192)*3),3));
  const mesh=new THREE.Mesh(geo,ridge.material);mesh.updateMatrixWorld(true);geo.computeBoundingBox();
  const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0));
  return{geo,length:distance.at(-1),centers:centers.map(p=>p.toArray()),at(d){
    if(!(d>0&&d<distance.at(-1)))fail('row exceeds actual hip');
    let i=1;while(distance[i]<d)i++;const a=centers[i-1],b=centers[i],t=(d-distance[i-1])/(distance[i]-distance[i-1]);
    return{point:a.clone().lerp(b,t),forward:a.clone().sub(b).setY(0).normalize()};
  },contact(x,z){ray.ray.origin.set(x,geo.boundingBox.max.y+1,z);const hit=ray.intersectObject(mesh,false)[0];if(!hit)fail('foot misses its own submitted hip triangle');return hit.point;}};
}
function seatGeometry(geometry,point,yaw,contact,height){
  const p=geometry.attributes.position,feet=[],c=Math.cos(yaw),s=Math.sin(yaw),top=contact(point.x,point.z).y+height;
  geometry.computeBoundingBox();const bottom=geometry.boundingBox.min.y,max=geometry.boundingBox.max.y;
  for(let i=0;i<p.count;i++){
    const x=point.x+c*p.getX(i)+s*p.getZ(i),z=point.z-s*p.getX(i)+c*p.getZ(i);
    const foot=Math.abs(p.getY(i)-bottom)<1e-7?contact(x,z):null;
    if(foot&&foot.y>=top)fail('inverted base');
    const y=foot?foot.y:top-(max-p.getY(i));p.setXYZ(i,x,y,z);if(foot)feet.push(foot.toArray());
  }
  p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  return{top,footContacts:[...new Map(feet.map(p=>[JSON.stringify(p),p])).values()]};
}
// Remove only exactly zero-area index triples from newly created geometry.
// All surviving position/normal/UV attributes and triangle winding are retained.
function omitZeroAreaTriangles(geometry){
  const p=geometry.attributes.position,index=geometry.index,kept=[];
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]).sub(a);c.fromBufferAttribute(p,ids[2]).sub(a);if(b.cross(c).lengthSq()!==0)kept.push(...ids);}
  geometry.setIndex(kept);geometry.clearGroups();
}
function mesh(group,geometry,material,name){const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=m.receiveShadow=true;group.add(m);return m;}
function bounds(objects){const b=new THREE.Box3();for(const o of objects)b.union(new THREE.Box3().setFromObject(o));return{min:b.min.toArray(),max:b.max.toArray()};}

/** Pure visual augmentation. Call once, AFTER the exact original facade builder. */
export function applyEastFiveRoofBeasts(kit,zoneId,itemIndex,item,built){
  if(zoneId!=='east-six'||!Object.hasOwn(TARGETS,itemIndex))return built;
  const p=TARGETS[itemIndex],f=built?.f;
  for(const[k,v]of Object.entries({kind:'hall',name:p.name,structure:'east-residential-facade',facadeProfile:p.profile,x:p.x,z:p.z,w:p.w,d:p.d,pad:.8,ph:.6,colH:6.72,bays:5,roof:'xieshan',enter:true}))if(item?.[k]!==v)fail(`target identity/envelope changed: ${k}`);
  if(item.rot!==undefined||item.layers!==undefined||item.roofH!==undefined||item.brackets!==undefined||!identity(f,[p.x,0,p.z])||!identity(kit.root)||f.parent!==kit.root)fail('changed orientation, roof options or parent');
  if(f.userData.eastFiveRoofBeasts||kit.root.userData.eastFiveRoofBeasts?.some(r=>r.itemIndex===itemIndex))fail('already applied');
  const roofs=f.children.filter(o=>o.name==='roof_xieshan'&&o.userData.eaveY!==undefined);
  if(roofs.length!==1||!identity(roofs[0]))fail('exact existing low roof required');
  const roof=roofs[0],ridges=roof.children.filter(o=>o.name==='roof_xieshan_roof_ridge_glaze');
  if(ridges.length!==1)fail('one retained ridge batch required');
  const ridge=ridges[0],a=ridge.geometry.attributes;
  if(!identity(ridge)||ridge.material!==kit.ridge||ridge.geometry.index||a.position?.count!==924||a.normal?.count!==924||a.uv?.count!==924||
      fingerprint(a.position.array)!==p.ridgePosition||fingerprint(a.normal.array)!=='e1304763'||fingerprint(a.uv.array)!=='2715e2d8')fail('retained low ridge geometry drift');
  const group=new THREE.Group();group.name='east-five-roof-beasts';const rows=[],temps=[];
  try{
    const radius=(p.d+.5)*.011,scale=radius*2.6,spacing=scale*1.15;
    // Inset beyond the old r*3 upturned-tip extension, then leave the same
    // rider/animal breathing room used by the generic roof ornament vocabulary.
    const first=radius*3+scale*.9;
    for(let corner=0;corner<4;corner++){
      const hip=submittedHip(ridge,corner);temps.push(hip.geo);
      if(first+5*spacing+scale*.34>hip.length-radius*2)fail('five animals do not fit');
      const stations=[];let rider;
      for(let i=0;i<=5;i++){
        const distance=first+i*spacing,{point,forward}=hip.at(distance),yaw=Math.atan2(forward.x,forward.z);
        const shape=i?new THREE.BoxGeometry(scale*.32,scale*.6,scale*.5):new THREE.ConeGeometry(scale*.22,scale*1.1,4);
        if(!i)omitZeroAreaTriangles(shape);
        const body=mesh(group,shape,kit.ridge,i?'walking-beast-body':'separate-rider');
        const seated=seatGeometry(shape,point,yaw,hip.contact,i?scale*.6:scale*1.1),parts=[body];
        if(i){const head=mesh(group,new THREE.BoxGeometry(scale*.26,scale*.26,scale*.3),kit.ridge,'walking-beast-head');head.rotation.y=yaw;head.position.set(point.x+forward.x*scale*.18,seated.top+scale*.08,point.z+forward.z*scale*.18);parts.push(head);}
        const record={index:i,distance,center:point.toArray(),forward:forward.toArray(),yaw,footContacts:seated.footContacts,bounds:bounds(parts)};
        if(i)stations.push(record);else rider=record;
      }
      rows.push({corner,count:5,radius,scale,spacing,arcLength:hip.length,centerline:hip.centers,rider,stations});
    }
    const merged=mergeByMaterial(group,{name:group.name});
    const record={id:`east-six/items/${itemIndex}/five-roof-beasts`,itemIndex,name:p.name,position:[p.x,0,p.z],source:`https://www.dpm.org.cn/explore/building/${p.page}.html`,status:'PARTIAL_VERIFY_PENDING',detail:'low',legacyAnimalTotal:0,legacyRiderTotal:0,animalTotal:20,riderTotal:4,triangles:512,rows,
      support:'BASE_VERTICES_ON_CORRESPONDING_ACTUAL_LOW_HIP_TRIANGLES',form:'GENERIC_SIMPLIFIED_BODY_HEAD_AND_CONE_RIDER_NOT_SPECIES_SCULPTURE',dimensionStatus:'RETAINED_MODEL_FIT_NOT_SURVEYED',limits:'Five-count and contact only; species carving, rider figure, terminal beasts, chiwen and browser verification remain incomplete'};
    f.add(merged);f.userData.eastFiveRoofBeasts=record;
    (kit.root.userData.eastFiveRoofBeasts??=[]).push(record);
    return built;
  }catch(error){group.traverse(o=>o.geometry?.dispose());throw error;}
  finally{temps.forEach(g=>g.dispose());}
}
