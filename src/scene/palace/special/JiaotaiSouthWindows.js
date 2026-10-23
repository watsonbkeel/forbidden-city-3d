import * as THREE from 'three';
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99791384387.jpg';
/** Visible middle straight-grid fields of the two south end windows only.
 * Side ornament remains inherited/approximate. Counts and fractions are FIT,
 * not measurements; no claim about inside/rear windows or full photo match.
 */
export function applyJiaotaiSouthWindows(builder,shell) {
  const record=shell?.userData.structure;
  if(record?.id!=='jiaotaidian'||record.southWindowReview)return false;
  const targets=shell.children.filter(m=>m.isMesh&&m.name==='south·lattice_doors');
  if(targets.length!==2||targets.some(m=>(m.geometry.index?.count??m.geometry.attributes.position?.count)!==36||m.rotation.x||m.rotation.y||m.rotation.z))return false;
  const red=new THREE.MeshStandardMaterial({name:'r61-jiaotai-window-red',color:0x843326,roughness:.87});
  const dark=new THREE.MeshStandardMaterial({name:'r61-jiaotai-window-recess',color:0x28211c,roughness:1});builder.ownedMaterials.push(red,dark);
  const info={source:SOURCE,photographyDate:null,accepted:false,status:'PARTIAL',gridCountStatus:'PHOTO_FIT_NOT_SURVEYED',centralWidthFraction:.56,columns:6,rows:9,backAndInsideChanged:false,
    unknown:'Fine side ornament/paint/gold details, exact repeat count, surveyed dimensions and other facade views.',windows:[]};
  for(const old of targets){
    const g=old.geometry,a=g.attributes;g.computeBoundingBox();const size=g.boundingBox.getSize(new THREE.Vector3()),w=size.x,h=size.y,d=size.z,cw=w*info.centralWidthFraction,body={position:[],normal:[],uv:[]};
    const add=(j)=>{for(const[k,out]of Object.entries(body))out.push(...a[k].array.subarray(j*a[k].itemSize,(j+1)*a[k].itemSize));};
    const front=[];for(let i=0;i<(g.index?.count??a.position.count);i+=3){const ids=[0,1,2].map(j=>g.index?g.index.getX(i+j):i+j);if(ids.every(j=>a.normal.getZ(j)<-.999))front.push(...ids);else ids.forEach(add);}
    // Interpolate the old planar UV rather than inventing a new mapping for the
    // retained narrow side fields. The middle skin alone becomes a real recess.
    const uvAt=(x,y)=>{const ps=[...new Set(front)];const p0=ps[0],px=ps.find(j=>Math.abs(a.position.getX(j)-a.position.getX(p0))>1e-6&&a.position.getY(j)===a.position.getY(p0)),py=ps.find(j=>Math.abs(a.position.getY(j)-a.position.getY(p0))>1e-6&&a.position.getX(j)===a.position.getX(p0));return[0,1].map(k=>{const v=j=>k?a.uv.getY(j):a.uv.getX(j);return v(p0)+(x-a.position.getX(p0))/(a.position.getX(px)-a.position.getX(p0))*(v(px)-v(p0))+(y-a.position.getY(p0))/(a.position.getY(py)-a.position.getY(p0))*(v(py)-v(p0));});};
    for(const[x0,x1]of[[-w/2,-cw/2],[cw/2,w/2]])for(const[x,y]of[[x0,-h/2],[x0,h/2],[x1,h/2],[x0,-h/2],[x1,h/2],[x1,-h/2]]){body.position.push(x,y,-d/2);body.normal.push(0,0,-1);body.uv.push(...uvAt(x,y));}
    const replacement=new THREE.BufferGeometry();for(const[k,v]of Object.entries(body))replacement.setAttribute(k,new THREE.Float32BufferAttribute(v,k==='uv'?2:3));replacement.computeBoundingBox();replacement.computeBoundingSphere();old.geometry=replacement;g.dispose();
    const box=(role,mat,ww,hh,dd,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,dd),mat);m.name='r61-jiaotai-south-'+role;m.position.copy(old.position).add(new THREE.Vector3(x,y,z));m.castShadow=m.receiveShadow=true;m.userData.jiaotaiSouthWindow={role,centerX:old.position.x};shell.add(m);return m;};
    const t=.075,depth=.05,z=-d/2+depth/2;
    box('opaque-recess',dark,cw,h,.01,0,0,-d/2+depth+.005);
    for(const x of[-cw/2+t/2,cw/2-t/2])box('major-frame',red,t,h,depth,x,0,z);
    for(const y of[-h/2+t/2,h/2-t/2])box('major-frame',red,cw-2*t,t,depth,0,y,z);
    const innerW=cw-2*t,innerH=h-2*t;
    for(let k=1;k<info.columns;k++)box('straight-grid',red,.038,innerH,.032,-innerW/2+innerW*k/info.columns,0,-d/2+.016);
    for(let k=1;k<info.rows;k++)box('straight-grid',red,innerW,.038,.032,0,-innerH/2+innerH*k/info.rows,-d/2+.016);
    info.windows.push({center:old.position.toArray(),width:w,height:h,depth:d,centralWidth:cw,frontZ:old.position.z-d/2});
  }
  record.southWindowReview=info;return true;
}
