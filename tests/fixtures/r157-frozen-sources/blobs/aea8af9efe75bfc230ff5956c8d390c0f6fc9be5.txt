import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const SHOUKANG_SOUTH_ENCLOSURE_CANDIDATE=Object.freeze({id:'shoukang-south-twenty-leaves-v1',entityId:'FC-83D425C911'});
const fail=s=>{throw Error('Shoukang south enclosure: '+s)};
const sameBox=(a,b)=>a.min.equals(b.min)&&a.max.equals(b.max);
/** Own south view supports leaf division and dense three-direction lattice type,
 * not measured bar angles/counts or carved nodes. Existing open pose is a game
 * access fit. No rear hall/window, warm-room or throne inventory is added. */
export function applyShoukangSouthEnclosureCandidate(kit,item,f,g){
 if(kit.shoukangSouthEnclosureCandidate===false)return null;
 if(kit.shoukangSouthEnclosureCandidate!==undefined&&kit.shoukangSouthEnclosureCandidate!==SHOUKANG_SOUTH_ENCLOSURE_CANDIDATE||item.name!=='寿康宫'||item.structure!=='shoukang-front-hall'||item.x!==289.2||item.z!==231||item.w!==26.9||item.d!==17.4||item.ph!==.75||f.parent!==kit.root||f.position.x!==item.x||f.position.z!==item.z||f.position.y!==0||f.rotation.toArray().slice(0,3).some(v=>v!==0)||f.scale.toArray().some(v=>v!==1)||f.getObjectByName('shoukang-south-enclosure-candidate'))fail('canonical identity or duplicate');
 f.updateWorldMatrix(true,true);
 const widths=[13.5,13.5,15.5,13.5,13.5].map(v=>26.9*v/69.5),axes=[-26.9/2];for(const w of widths)axes.push(axes.at(-1)+w);
 if(g.fit.frontInset!==2||g.bayAxes.length!==6||g.bayAxes.some((v,i)=>v!==axes[i]))fail('canonical bay axes changed');
 const expected=[];for(const bay of[1,2,3]){const w=widths[bay],cx=(axes[bay]+axes[bay+1])/2;for(const sign of[-1,1])for(let leaf=0;leaf<2;leaf++)expected.push([.09,3.85,w/4,cx+sign*(w/2-.37-leaf*.14),item.ph+1.925,-item.d/2+2+w/8+.02]);}
 for(const bay of[0,4]){const lw=(widths[bay]-.32)/4;for(let leaf=0;leaf<4;leaf++)expected.push([lw-.035,3.1,.14,axes[bay]+.16+(leaf+.5)*lw,item.ph+2.5,-item.d/2+2]);}

 const door=f.children.filter(m=>m.isMesh&&m.userData.role==='shoukang-front-door-leaf'),windows=f.children.filter(m=>m.isMesh&&m.userData.role==='shoukang-front-window-leaf');
 if(door.length!==12||windows.length!==8)fail('twenty existing leaves required');
 const targets=[...door,...windows],oldColliders=[],front=-item.d/2+g.fit.frontInset;
 for(const [i,m]of targets.entries()){
  const p=m.geometry.parameters,isDoor=i<12;
  if(!p||[p.width,p.height,p.depth,...m.position.toArray()].some((v,k)=>Math.abs(v-expected[i][k])>1e-12))fail('retained leaf dimensions or position changed');
  const proof=new THREE.BoxGeometry(p.width,p.height,p.depth);try{for(const key of ['position','normal','uv']){const a=m.geometry.attributes[key]?.array,b=proof.attributes[key].array;if(!a||a.length!==b.length||a.some((v,k)=>v!==b[k]))fail('retained leaf vertex source changed');}const a=m.geometry.index?.array,b=proof.index.array;if(!a||a.length!==b.length||a.some((v,k)=>v!==b[k]))fail('retained leaf topology changed');}finally{proof.dispose();}

  if(m.geometry.type!=='BoxGeometry'||m.rotation.toArray().slice(0,3).some(v=>v!==0)||m.scale.toArray().some(v=>v!==1)||m.material?.name!=='shoukang_wood_fit'||p.height!==(isDoor?3.85:3.1)||Math.abs(m.position.y-(item.ph+(isDoor?1.925:2.5)))>1e-12||isDoor&&p.width!==.09||!isDoor&&(p.depth!==.14||m.position.z!==front))fail('retained leaf source changed');
  const box=new THREE.Box3(new THREE.Vector3(m.position.x-p.width/2,m.position.y-p.height/2,m.position.z-p.depth/2),new THREE.Vector3(m.position.x+p.width/2,m.position.y+p.height/2,m.position.z+p.depth/2)).applyMatrix4(f.matrixWorld),hits=kit.colliders.filter(b=>sameBox(b,box));
  if(hits.length!==1)fail('exclusive leaf collider missing/duplicate');oldColliders.push(hits[0]);
 }
 const oldGrid=f.children.filter(m=>m.isMesh&&m.userData.role==='shoukang-fitted-diamond-grid'&&Math.abs(m.position.z-(front-.09))<1e-12);
 if(oldGrid.length===0)fail('existing south-only grid required');
 const removed=[...targets,...oldGrid],exclusive=new Set(removed.map(m=>m.geometry));if(exclusive.size!==removed.length)fail('shared target geometry');
 kit.root.traverse(m=>{if(m.isMesh&&!removed.includes(m)&&exclusive.has(m.geometry))fail('borrowed target geometry');});
 const group=new THREE.Group();group.name='shoukang-south-enclosure-candidate';
 const trim=new THREE.MeshStandardMaterial({name:'shoukang_south_pale_trim_fit',color:0x9a7c3b,roughness:.68});
 const staged=[],allGeometry=new Set(),source='https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98284ed0aff.jpg';
 try{
  for(const [index,old]of targets.entries()){
   const isDoor=index<12,p=old.geometry.parameters,w=isDoor?p.depth:p.width,h=p.height,d=isDoor?p.width:p.depth,leaf=new THREE.Group();leaf.position.copy(old.position);if(isDoor)leaf.rotation.y=-Math.PI/2;leaf.name=`shoukang-south-${isDoor?'door':'window'}-${index}`;leaf.userData={bayIndex:isDoor?1+Math.floor(index/4):index<16?0:4,leafIndex:index%4,leafKind:isDoor?'door':'window',sourceLeaf:old.name,source,dimensions:'RETAINED_OUTER_ENVELOPE_MODEL_FIT',lattice:'TEXT_TYPE_AND_PHOTO_DENSITY_FIT_NOT_EXACT_JOINERY'};group.add(leaf);
   const parts=[[],[]];
   const box=(bucket,x0,x1,y0,y1,z0,z1)=>{if(!(x1>x0&&y1>y0&&z1>z0))fail('nonpositive candidate part');const a=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);a.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);parts[bucket].push(a);allGeometry.add(a);return a;};
   const rail=.07,lo=-h/2,hi=h/2,l=-w/2,r=w/2;
   for(const[a,b]of[[l,l+rail],[r-rail,r]])box(0,a,b,lo,hi,-d/2,d/2);
   for(const[a,b]of[[lo,lo+.08],[hi-.08,hi]])box(0,l+rail,r-rail,a,b,-d/2,d/2);
   let gridBottom=lo+.08;
   if(isDoor){
    // Skirt panel and narrow waist below the upper long lattice. Plain inset
    // fields deliberately omit unresolved relief/inscriptions from the photo.
    const waist=lo+1.10;box(0,l+rail,r-rail,lo+.08,waist-.08,-d*.35,d*.35);box(0,l+rail,r-rail,waist-.08,waist+.06,-d/2,d/2);gridBottom=waist+.06;
    for(const side of[-1,1]){
     const z0=side<0?-d/2:d/2-.012,z1=z0+.012,inset=.11;
     for(const[a,b]of[[l+inset,l+inset+.018],[r-inset-.018,r-inset]])box(1,a,b,lo+.18,waist-.18,z0,z1);
     for(const[a,b]of[[lo+.18,lo+.198],[waist-.198,waist-.18]])box(1,l+inset+.018,r-inset-.018,a,b,z0,z1);
    }
   }
   const x0=l+rail,x1=r-rail,y0=gridBottom,y1=hi-.08,thickness=.018,spacing=.19;
   // Three clipped straight families are a conservative type-level fit. They
   // are actual narrow solids with real holes, not diamond lines on a panel.
   for(const angle of[0,Math.PI/3,-Math.PI/3]){
    const ux=Math.cos(angle),uy=Math.sin(angle),nx=-uy,ny=ux,corners=[[x0,y0],[x1,y0],[x0,y1],[x1,y1]],values=corners.map(([x,y])=>nx*x+ny*y),min=Math.min(...values),max=Math.max(...values);
    for(let c=Math.ceil(min/spacing)*spacing;c<max;c+=spacing){
     let start=-Infinity,end=Infinity;for(const[origin,dir,a,b]of[[nx*c,ux,x0+thickness/2,x1-thickness/2],[ny*c,uy,y0+thickness/2,y1-thickness/2]]){if(Math.abs(dir)<1e-12){if(origin<a||origin>b){start=1;end=0;break}}else{const aa=(a-origin)/dir,bb=(b-origin)/dir;start=Math.max(start,Math.min(aa,bb));end=Math.min(end,Math.max(aa,bb));}}
     if(!(end-start>thickness))continue;const length=end-start,a=new THREE.BoxGeometry(length,thickness,d*.65);a.rotateZ(angle);a.translate(nx*c+ux*(start+end)/2,ny*c+uy*(start+end)/2,0);parts[0].push(a);allGeometry.add(a);
    }
   }
   // Thin perimeter trim on both faces stays INSIDE the retained envelope.
   for(const side of[-1,1]){const z0=side<0?-d/2:d/2-.012,z1=z0+.012;for(const[a,b]of[[l+.025,l+.043],[r-.043,r-.025]])box(1,a,b,lo+.03,hi-.03,z0,z1);for(const[a,b]of[[lo+.025,lo+.043],[hi-.043,hi-.025]])box(1,l+.043,r-.043,a,b,z0,z1);}
   for(const [bucket,pieces]of parts.entries())if(pieces.length){const geo=mergeGeometries(pieces,false);if(!geo)fail('merge failure');allGeometry.add(geo);for(const a of pieces){a.dispose();allGeometry.delete(a)}const mesh=new THREE.Mesh(geo,bucket?trim:old.material);mesh.name='shoukang-south-visible-leaf-solid';mesh.userData={role:mesh.name,leaf:index,materialPart:bucket};mesh.castShadow=mesh.receiveShadow=true;leaf.add(mesh);}
  }
  group.updateMatrixWorld(true);let ordinal=0;group.traverse(m=>{if(!m.isMesh)return;const matrix=f.matrixWorld.clone().multiply(m.matrixWorld),world=m.geometry.clone().applyMatrix4(matrix);try{const owner=triangleInstance(createTriangleTemplate(world),[0,0,0],`shoukang-south-leaf:${ordinal++}`),box=owner.box.clone();box.triangleSupport=owner;staged.push(box);}finally{world.dispose();}});
  // Commit only after every old owner and every replacement solid is valid.
  for(const m of removed){m.removeFromParent();m.geometry.dispose();}for(const c of oldColliders)kit.colliders.splice(kit.colliders.indexOf(c),1);
  f.add(group);kit.colliders.push(...staged);kit.owned.push(trim);
  group.userData={source,completeScope:'TWENTY_SOUTH_LEAVES_NOT_FULL_FACADE_OR_COURTYARD',scope:'SOURCE_GUIDED_SOUTH_FACADE_ONLY_NOT_WHOLE_COURTYARD',doorLeaves:12,windowLeaves:8,removedGridMeshes:oldGrid.length,physicalOwners:staged.length,fit:'Original leaf envelope and folded access pose retained; lattice angles/spacing, plain panel subdivision and trim are reversible fits, not measured carving',sourceDate:'UPLOAD_PATH_2020_NOT_PHOTO_DATE',currentInventoryVerified:false};g.southEnclosure={id:SHOUKANG_SOUTH_ENCLOSURE_CANDIDATE.id,...group.userData};g.limitations=g.limitations.map(v=>v.includes('simplified diamond grids')?'Four-leaf door counts are attested; south leaves use source-guided open lattice, with fitted bar spacing/angles, plain panels and retained folded game-access pose—not exact Sanjiao-liuwan joinery. Rear diamond grids remain unchanged.':v);return group;
 }catch(error){for(const geo of allGeometry)geo.dispose();trim.dispose();throw error;}
}
