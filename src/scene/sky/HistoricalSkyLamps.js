import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
/** Optional Qing New Year interpretation. Not permanent present-day fixtures.
 * DPM: two sky lamps below Qianqing terrace, discontinued in1840, reconstructed
 * in2019. Total13.9m is published; local placement/profiles are photo estimates. */
export const SKY_LAMP_SITES=Object.freeze([{x:-37,z:284.5},{x:37,z:284.5}]);
export const SKY_LAMP_HEIGHT=13.9;
const TAG='historical-sky-lamps';
export class HistoricalSkyLamps {
  constructor({scene,collisionManager,envelope,playerPosition,flightState}){
    Object.assign(this,{scene,cm:collisionManager,envelope,playerPosition,flightState});this.enabled=false;this.disposed=false;
    this.group=new THREE.Group();this.group.name=TAG;this.group.visible=false;scene.add(this.group);this.geometries=[];this.materials=[];this.lights=[];this.boxes=[];
    const mats={gold:new THREE.MeshStandardMaterial({color:0x9c7734,roughness:.58,metalness:.35}),stone:new THREE.MeshStandardMaterial({color:0xb4b0a2,roughness:.9}),red:new THREE.MeshStandardMaterial({color:0x82382d,roughness:.8}),bronze:new THREE.MeshStandardMaterial({color:0x4b4a39,roughness:.75,metalness:.35}),lamp:new THREE.MeshStandardMaterial({color:0xf0c074,roughness:.7,emissive:0xffb84d,emissiveIntensity:0})};
    this.lampMaterial=mats.lamp;this.materials=Object.values(mats);const parts=Object.fromEntries(Object.keys(mats).map(k=>[k,[]]));
    const add=(key,geo,x,y,z)=>{geo.translate(x,y,z);parts[key].push(geo);};
    const rod=(key,a,b,r,sides=6)=>{const delta=b.clone().sub(a),geo=new THREE.CylinderGeometry(r,r,delta.length(),sides,1);geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));geo.translate(...a.clone().add(b).multiplyScalar(.5).toArray());parts[key].push(geo);};
    for(const site of SKY_LAMP_SITES){const{x,z}=site;
      add('stone',new THREE.BoxGeometry(1.05,.5,1.05),x,.25,z);
      add('gold',new THREE.CylinderGeometry(.22,.3,10.8,8),x,5.9,z);
      for(const y of[.6,4.6,8.3,10.8])add('gold',new THREE.CylinderGeometry(.34,.34,.14,8),x,y,z);
      for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,dx=Math.cos(a)*1.9,dz=Math.sin(a)*1.9;rod('red',new THREE.Vector3(x+dx,.15,z+dz),new THREE.Vector3(x,4.6,z),.07);add('stone',new THREE.BoxGeometry(.32,.2,.32),x+dx,.1,z+dz);}
      // Two clearly separated suspended lanterns and curved bracket silhouette.
      for(const sign of[-1,1]){const points=[new THREE.Vector3(x,11,z),new THREE.Vector3(x+sign*.6,11.7,z),new THREE.Vector3(x+sign*1.1,11.65,z)];parts.gold.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),8,.09,5,false));rod('bronze',new THREE.Vector3(x+sign*1.1,11.65,z),new THREE.Vector3(x+sign*1.1,10.9,z),.018,4);add('lamp',new THREE.CylinderGeometry(.22,.22,.6,8),x+sign*1.1,10.6,z);add('gold',new THREE.CylinderGeometry(.25,.25,.09,8),x+sign*1.1,10.95,z);add('gold',new THREE.CylinderGeometry(.25,.25,.09,8),x+sign*1.1,10.25,z);}
      add('gold',new THREE.CylinderGeometry(.19,.25,1.1,8),x,11.85,z);
      add('red',new THREE.BoxGeometry(.78,.72,.78),x,12.5,z);
      const roof=new THREE.ConeGeometry(1.04,.55,4,1);roof.rotateY(Math.PI/4);add('gold',roof,x,13.135,z);
      add('gold',new THREE.CylinderGeometry(.09,.15,.35,6),x,13.575,z);add('gold',new THREE.SphereGeometry(.15,6,4),x,13.75,z);
      const light=new THREE.PointLight(0xffc16d,0,36,2);light.position.set(x,10.6,z);light.castShadow=false;this.group.add(light);this.lights.push(light);
      this.boxes.push(new THREE.Box3(new THREE.Vector3(x-2.1,0,z-2.1),new THREE.Vector3(x+2.1,SKY_LAMP_HEIGHT,z+2.1)));
    }
    for(const[key,geos]of Object.entries(parts)){const g=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());const m=new THREE.Mesh(g,mats[key]);m.name=TAG+'-'+key;m.castShadow=false;m.receiveShadow=true;this.group.add(m);this.geometries.push(g);}
    this.triangles=this.geometries.reduce((n,g)=>n+(g.index?.count??g.attributes.position.count)/3,0);
  }
  setEnabled(value){
    if(this.disposed)return{ok:false,reason:'灯具已卸载'};value=!!value;if(value===this.enabled)return{ok:true};
    if(value){const p=this.playerPosition(),f=this.flightState();for(const b of this.boxes){if(p&&b.clone().expandByScalar(.7).containsPoint(p))return{ok:false,reason:'请先离开灯具演示位置'};if(f&&Math.abs(f.position.x-(b.min.x+b.max.x)/2)<2.1+f.rules.radius&&Math.abs(f.position.z-(b.min.z+b.max.z)/2)<2.1+f.rules.radius&&f.position.y<b.max.y+.6)return{ok:false,reason:'请先飞离灯具演示位置'};}}
    this.enabled=value;this.group.visible=value;this.cm.removeByTag(TAG);this.envelope.removeExtra(TAG);
    if(value){for(const b of this.boxes)this.cm.addCollider(b.clone(),TAG);this.envelope.addExtra(TAG,this.boxes);}
    return{ok:true};
  }
  update(daylight){const darkness=1-THREE.MathUtils.clamp(daylight,0,1);this.lampMaterial.emissiveIntensity=this.enabled?darkness*2:0;for(const l of this.lights)l.intensity=this.enabled?60*darkness:0;}
  dispose(){if(this.disposed)return;this.setEnabled(false);this.disposed=true;this.group.removeFromParent();this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());this.lights.length=0;}
}
