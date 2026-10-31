import * as THREE from 'three';

// One visible near pair, not a claimed complete historical structural grid.
export const ZHONGHE_NEAR_COLUMNS=Object.freeze({
 id:'zhonghe-near-columns-r86',status:'PHOTO_FIT_NOT_SURVEYED',accepted:false,
 source:'https://www.dpm.org.cn/explore/building/236464.html',
 image:'https://img.dpm.org.cn/Uploads/Picture/dc/1569.jpg',
 imageSha256:'22ef4565e4c0623818aed244cda77aa3fd704d110de5b4496eef4067595d67fe',
 halfSpan:2.85,localZ:4.1,radius:.30,height:6.6,baseHalfWidth:.345,baseHeight:.18,
 beamHeight:.22,beamDepth:.38,
 unknown:['measured-position-and-diameter','hidden-rear-rows','full-framing','painted-carving','photography-date'],
});
export function buildZhongheInteriorColumns(builder,shell,{x0,z0,y}){
 if(shell.userData.structure?.id!=='zhonghedian'||shell.userData.structure.nearColumns)throw Error('Near columns require one fresh Zhonghe shell');
 const p=ZHONGHE_NEAR_COLUMNS,record={...structuredClone(p),columns:[],colliders:[]};
 shell.userData.structure.nearColumns=record;
 function add(name,geometry,material,x,cy,z){
  const m=new THREE.Mesh(geometry,material);m.name=`r86-zhonghe-${name}`;m.userData.zhongheNearColumnId=p.id;m.position.set(x,cy,z);m.castShadow=true;m.receiveShadow=true;shell.add(m);m.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(m);builder.col(...b.min.toArray(),...b.max.toArray());record.colliders.push({owner:m.name,min:[b.min.x+builder.ox,b.min.y,b.min.z+builder.oz],max:[b.max.x+builder.ox,b.max.y,b.max.z+builder.oz]});return m;
 }
 for(const side of [-1,1]){
  const x=x0+side*p.halfSpan,z=z0+p.localZ;record.columns.push({center:[x,z],floorY:y,radius:p.radius,height:p.height,baseHalfWidth:p.baseHalfWidth});
  add(`near-column-${side}`,new THREE.CylinderGeometry(p.radius,p.radius,p.height,24),builder.library.material('wood_column'),x,y+p.height/2,z);
  add(`near-base-${side}`,new THREE.BoxGeometry(2*p.baseHalfWidth,p.baseHeight,2*p.baseHalfWidth),builder.library.material('marble'),x,y+p.baseHeight/2,z);
 }
 add('near-top-beam',new THREE.BoxGeometry(2*(p.halfSpan+p.radius),p.beamHeight,p.beamDepth),builder.library.material('caihua_beam'),x0,y+p.height-p.beamHeight/2,z0+p.localZ);
 return record;
}
