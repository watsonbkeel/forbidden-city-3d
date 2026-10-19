import * as THREE from 'three';
import { innerJinshuiProfile } from '../palace/special/InnerJinshui.js';

export const FLIGHT_BOUNDS = Object.freeze({ minX:-530,maxX:530,minZ:-590,maxZ:660 });
/** Conservative overhead envelope of the ACTUAL exterior meshes, including
 * unloaded zones. Every triangle's XZ rectangle is filled to its highest Y.
 * This deliberately forbids flying through doors/under roofs, rather than
 * mistaking the pedestrian-only collision proxies for rotor clearance.
 * The two-metre grid may stop a little before a wall; it never opens a gap.
 * No renderer, draw calls, mutable product geometry, or network dependency. */
export class FlightEnvelope {
  constructor({ bounds=FLIGHT_BOUNDS, cellSize=2, clearance=.6 }={}) {
    if(!Number.isFinite(cellSize)||cellSize<=0||!Number.isFinite(clearance)||clearance<0)throw Error('Invalid flight grid');
    this.bounds={...bounds};this.cellSize=cellSize;this.clearance=clearance;
    const {minX,maxX,minZ,maxZ}=bounds;
    if(![minX,maxX,minZ,maxZ].every(Number.isFinite)||maxX<=minX||maxZ<=minZ)throw Error('Invalid flight bounds');
    this.cols=Math.ceil((maxX-minX)/cellSize);this.rows=Math.ceil((maxZ-minZ)/cellSize);
    this.heights=new Float32Array(this.cols*this.rows);this.water=new Uint8Array(this.cols*this.rows);
    this.extraObstacles=new Map();
    this.triangles=0;this.meshes=0;this.maxHeight=0;
  }
  cellRange(minX,maxX,minZ,maxZ) {
    const b=this.bounds,s=this.cellSize;
    if(maxX<b.minX||minX>b.maxX||maxZ<b.minZ||minZ>b.maxZ)return null;
    return [Math.max(0,Math.floor((minX-b.minX)/s)),Math.min(this.cols-1,Math.floor((maxX-b.minX)/s)),
      Math.max(0,Math.floor((minZ-b.minZ)/s)),Math.min(this.rows-1,Math.floor((maxZ-b.minZ)/s))];
  }
  addRect(minX,maxX,minZ,maxZ,height,{water=false}={}) {
    if(![minX,maxX,minZ,maxZ,height].every(Number.isFinite))throw Error('Nonfinite flight geometry');
    const r=this.cellRange(minX,maxX,minZ,maxZ);if(!r)return;
    // Float32 must round UP, not a few ulps below the actual geometry.
    const top=height>0.08?height+.001:0;
    this.maxHeight=Math.max(this.maxHeight,top);
    for(let z=r[2];z<=r[3];z++)for(let x=r[0];x<=r[1];x++) {
      const i=z*this.cols+x;if(top>this.heights[i])this.heights[i]=top;if(water)this.water[i]=1;
    }
  }
  addRoot(root) {
    root.updateWorldMatrix(true,true);
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();
    root.traverse(mesh=>{
      if(!mesh.isMesh||!mesh.geometry?.attributes.position)return;
      const geo=mesh.geometry, p=geo.attributes.position,index=geo.index;
      if(p.itemSize!==3)throw Error('Unexpected flight geometry layout');
      const count=index?.count??p.count;if(count%3)throw Error('Incomplete flight triangle');
      const water=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).some(m=>/water/i.test(m?.name??''));
      const instances=mesh.isInstancedMesh?mesh.count:1;this.meshes++;
      for(let n=0;n<instances;n++) {
        if(mesh.isInstancedMesh){mesh.getMatrixAt(n,instance);matrix.multiplyMatrices(mesh.matrixWorld,instance);}else matrix.copy(mesh.matrixWorld);
        for(let i=0;i<count;i+=3){
          a.fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(matrix);
          b.fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(matrix);
          c.fromBufferAttribute(p,index?index.getX(i+2):i+2).applyMatrix4(matrix);
          this.addRect(Math.min(a.x,b.x,c.x),Math.max(a.x,b.x,c.x),Math.min(a.z,b.z,c.z),Math.max(a.z,b.z,c.z),Math.max(a.y,b.y,c.y),{water});
          this.triangles++;
        }
      }
    });
    return this;
  }
  addExtra(id,boxes){this.extraObstacles.set(id,boxes.map(b=>b.clone()));}
  removeExtra(id){this.extraObstacles.delete(id);}
  isInside(x,z,radius=0) {
    const b=this.bounds;return [x,z,radius].every(Number.isFinite)&&radius>=0&&x-radius>=b.minX&&x+radius<=b.maxX&&z-radius>=b.minZ&&z+radius<=b.maxZ;
  }
  sample(x,z,radius=0) {
    if(!this.isInside(x,z,radius))return {height:Infinity,water:true};
    const r=this.cellRange(x-radius,x+radius,z-radius,z+radius);let height=0,water=false;
    // The square encloses the entire swept rotor disk, tail, and body.
    for(let j=r[2];j<=r[3];j++)for(let i=r[0];i<=r[1];i++){
      const k=j*this.cols+i;height=Math.max(height,this.heights[k]);water||=!!this.water[k];
    }
    for(const boxes of this.extraObstacles.values())for(const b of boxes){if(x+radius>=b.min.x&&x-radius<=b.max.x&&z+radius>=b.min.z&&z-radius<=b.max.z)height=Math.max(height,b.max.y+.001);}
    return {height,water};
  }
  minimumY(x,z,radius) {
    const {height,water}=this.sample(x,z,radius);
    return height>0?height+this.clearance:water?this.clearance:0;
  }
  safeGround(x,z,radius) {
    const s=this.sample(x,z,radius);return s.height===0&&!s.water;
  }
  isSafe(position,radius,maxY=180) {
    return Number.isFinite(position.y)&&position.y>=this.minimumY(position.x,position.z,radius)-1e-7&&position.y<=maxY;
  }
  /** Submetre swept checks; stop before a blocked interval, never teleport over it. */
  move(from,to,radius,maxY=180) {
    if(!this.isSafe(from,radius,maxY))return {position:{...from},blocked:true,reason:'invalid-start'};
    if(![to.x,to.y,to.z].every(Number.isFinite))return {position:{...from},blocked:true,reason:'invalid-target'};
    const distance=Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z),steps=Math.max(1,Math.ceil(distance/.5));
    if(steps>2000)return {position:{...from},blocked:true,reason:'unbounded-step'};
    let position={...from};
    for(let i=1;i<=steps;i++){
      const t=i/steps,p={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,z:from.z+(to.z-from.z)*t};
      if(!this.isSafe(p,radius,maxY))return {position,blocked:true,reason:'clearance'};position=p;
    }
    return {position,blocked:false,reason:null};
  }
  summary(){return {cellSize:this.cellSize,cells:this.heights.length,bytes:this.heights.byteLength+this.water.byteLength,triangles:this.triangles,meshes:this.meshes,maxHeight:this.maxHeight};}
}

export function createPalaceFlightEnvelope({palaceBuilder,enclosure,garden,zoneManager,layout}) {
  const grid=new FlightEnvelope();
  for(const root of palaceBuilder.ownedObjects)grid.addRoot(root);
  grid.addRoot(enclosure.group);grid.addRoot(garden.group);
  // Build once while ZoneManager still retains every prebuilt zone. The compact
  // scalar grid stays resident when the corresponding visible zone unloads.
  for(const [id] of zoneManager.zones){
    const entry=zoneManager.loaded.get(id)??zoneManager.prebuilt.get(id);
    if(!entry?.data?.group)throw Error(`Flight envelope missing zone ${id}`);
    grid.addRoot(entry.data.group);
  }
  for(const item of layout.filter(i=>i.type==='river')){
    const {north,south}=innerJinshuiProfile(item).banks;
    for(let i=1;i<north.length;i++)grid.addRect(south[i-1].x,south[i].x,
      Math.min(south[i-1].z,south[i].z),Math.max(north[i-1].z,north[i].z),0,{water:true});
  }
  // Conservatively mark the exterior moat belt; no ground landing on water.
  const moat=layout.find(i=>i.type==='moat');
  if(moat){const p=moat.position,d=moat.dimensions,w=d.riverWidth,x0=p.x-d.width/2,x1=p.x+d.width/2,z0=p.z-d.depth/2,z1=p.z+d.depth/2;
    grid.addRect(x0,x0+w,z0,z1,0,{water:true});grid.addRect(x1-w,x1,z0,z1,0,{water:true});
    grid.addRect(x0,x1,z0,z0+w,0,{water:true});grid.addRect(x0,x1,z1-w,z1,0,{water:true});}
  return grid;
}
