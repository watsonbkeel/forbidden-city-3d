import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {buildWallCap} from '../../RoofBuilder.js';
import {WUMEN_PRACTICAL_FIT as FIT} from './WumenPracticalFit.js';
import {WUMEN_ASCENT_PROFILE as OLD} from './WumenAscentProfile.js';

/** Wumen's two south-city-wall junctions only. Recess footprints are occupied
 * by the gate's closed, ground-to-slope masonry; they are not empty tunnels.
 * Remaining wall geometry and body proxies use the very same cells.
 * Near the new ascents those proxies cover the full visible wall height;
 * otherwise a player could leave a slope into the old three-metre-only wall.
 * Distant walls retain their predecessor low-body policy.
 * Apply together with installWumenPracticalAssembly, never independently. */
export function installWumenPracticalWallJunction(enclosure,parent,s){
 const {x1,x2,z,h,t,brickH,wumenCapFit}=s??{},sign=wumenCapFit?.side;
 if(![-1,1].includes(sign)||!enclosure?.library||!Array.isArray(enclosure.colliders)||!parent?.isObject3D)return false;
 const minX=Math.min(x1,x2),maxX=Math.max(x1,x2),minZ=z-t/2,maxZ=z+t/2;
 if(Math.abs(z-(-419.6-1.1))>1e-6||h!==10||Math.abs(t-8.6)>1e-6||brickH!==1.5||(sign===1?minX!==60:maxX!==-60))return false;
 const group=new THREE.Group();group.name=`wumen-practical-wall-junction-${sign===1?'west':'east'}`;
 const recesses=FIT.platform.recesses.filter(r=>r.id.startsWith(sign===1?'west/':'east/')).map(r=>({...r,minZ:r.minZ-419.6,maxZ:r.maxZ-419.6}));
 const envelope=FIT.platform.envelope;
 const xs=[...new Set([minX,maxX,sign*envelope.halfWidth,sign*OLD.wallInterface.absoluteX[1],...recesses.flatMap(r=>[r.minX,r.maxX]).filter(x=>x>minX&&x<maxX)])].sort((a,b)=>a-b),zs=[...new Set([minZ,maxZ,...recesses.flatMap(r=>[r.minZ,r.maxZ]).filter(v=>v>minZ&&v<maxZ)])].sort((a,b)=>a-b);
 const library=enclosure.library,material=library.material('wall_brick'),colliders=[],owned=[];
 const box=(name,x0,x1,y0,y1,z0,z1)=>{const geometry=applyBoxUV(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),library.tileSize('wall_brick'));owned.push(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 try{
  let cells=0,removedCells=0;
  for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
   const x0=xs[i-1],x1=xs[i],z0=zs[j-1],z1=zs[j],x=(x0+x1)/2,zz=(z0+z1)/2;
   // The already closed red platform owns this volume. Keeping the grey
   // city-wall cells here also duplicates its visible recess side face.
   const insidePlatform=Math.abs(x)<envelope.halfWidth&&zz>envelope.mainSouth-419.6&&zz<envelope.north-419.6;
   if(insidePlatform||recesses.some(r=>x>r.minX&&x<r.maxX&&zz>r.minZ&&zz<r.maxZ)){removedCells++;continue;}
   box('wall-base',x0,x1,0,brickH,z0,z1);box('wall-body',x0,x1,brickH,h,z0,z1);
   colliders.push(new THREE.Box3(new THREE.Vector3(x0,0,z0),new THREE.Vector3(x1,Math.abs(x)<OLD.wallInterface.absoluteX[1]?h:3,z1)));cells++;
  }
  // Keep the predecessor's cap exclusion and crenel slots; no new invisible
  // gap, cap or collision restriction is extended along the unrelated wall.
  const capStart=OLD.wallInterface.absoluteX[1],capX0=sign===1?Math.max(minX,capStart):minX,capX1=sign===1?maxX:Math.min(maxX,-capStart);
  if(capX1>capX0){const cap=buildWallCap(library,{length:capX1-capX0,thickness:t});cap.position.set((capX0+capX1)/2,h,z);group.add(cap);cap.traverse(o=>{if(o.geometry)owned.push(o.geometry);});}
  const len=maxX-minX,count=Math.floor(len/3.5),crenelW=1.5;
  for(let i=0;i<count;i++){const x=x1+(i+.5)*len/count;if(Math.abs(x)+crenelW/2>OLD.wallInterface.absoluteX[0]&&Math.abs(x)-crenelW/2<OLD.wallInterface.absoluteX[1])continue;box('wall-crenel',x-crenelW/2,x+crenelW/2,h,h+1.2,z-t*.5,z-t*.1);}
  group.userData.r157WumenWallJunction={status:'MATCHED_VISIBLE_RECESS_AND_FINITE_NEAR_WALL_BODY',side:sign,cells,removedCells,footprints:recesses.map(({id,minX,maxX,minZ,maxZ})=>({id,minX,maxX,minZ,maxZ})),underSlopeMasonryOwner:'wumen-joint-visible-platform',wholeObjectAccepted:false};
  parent.add(group);enclosure.colliders.push(...colliders);return true;
 }catch(error){for(const geometry of new Set(owned))geometry.dispose();throw error;}
}
