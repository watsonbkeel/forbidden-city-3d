// CPU geometry diagnostic only. No browser, original textures or WebGL claims.
import{writeFileSync,readFileSync}from'node:fs';
import*as THREE from'three';
import{CourtKit}from'../src/scene/palace/kit.js';
import{library}from'./lib/inner-palace-fixture.mjs';
import{resolveRemainingProfile,buildRemainingHall,augmentRemainingHall}from'../src/scene/palace/special/RemainingResidentialHalls.js';
const name=process.argv[2]??'养心殿',out=process.argv[3]??'/tmp/r48-residential-preview.json',scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url))),row=scope.find(r=>r.name===name),item=row.baselineItem,kit=new CourtKit(library(),row.zone),p=resolveRemainingProfile(row.zone,item),b=p.mode==='augment'?augmentRemainingHall(kit,item,kit.hall(item),p):buildRemainingHall(kit,item,p);kit.root.updateMatrixWorld(true);
const palette={roof_tile:'#ba913e',kit_ridge:'#bc9c53',wood_column:'#8b3b28',wall_red:'#a34b37',wall_brick:'#71695b',stone_slab:'#c1b8a5',marble:'#d1c9b8',rafters:'#514631',caihua_beam:'#3e665a',dougong_band:'#4f6651',lattice_doors:'#634b37'},triangles=[];
b.f.traverse(m=>{if(!m.isMesh||!m.material)return;const g=m.geometry,a=g.attributes.position,index=g.index,n=index?.count??a.count;const color=palette[m.material.name]??`#${m.material.color?.getHexString()??'8b683f'}`;for(let i=0;i<n;i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,index?index.getX(i+j):i+j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(item.x,0,item.z)).toArray());triangles.push({v,color,side:m.material.side,role:m.userData.role??m.material.name});}});
writeFileSync(out,JSON.stringify({name,triangles}));console.log(out);
