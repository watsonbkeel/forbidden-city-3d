import * as T from 'three';
/** Explicit flat underside of one existing solid; no enlarged proxy or global physics change. */
export function tagTaiheOverhead(box,sourceId){
 box.overhead={type:'piecewise-linear-x',sourceId,points:[[box.min.x,box.min.y],[box.max.x,box.min.y]],minZ:box.min.z,maxZ:box.max.z,topY:box.max.y};
}
/** Own Taihe east south/north views, NOT a reflection of Baohe or a west gate.
 * Metric sizes remain reversible fits inside the existing aperture contract. */
export function validateTaiheEastWallDoorProfile(p){
 if(p.id!=='taihe-east-stepped-firewall'||p.objectId!=='FC-1ABC6622CB'||p.side!=='east'||p.thickness!==1.4||p.passage.clearWidth!==2.1||p.passage.clearHeight!==2.25)throw Error('Taihe east door identity changed');
}
export function validateTaiheWestWallDoorProfile(p){
 if(p.id!=='taihe-west-stepped-firewall'||p.objectId!=='FC-1ABC6622CB'||p.side!=='west'||p.thickness!==1.4||p.passage.clearWidth!==2.1||p.passage.clearHeight!==2.25)throw Error('Taihe west door identity changed');
}
export function addTaiheEastWallDoor(builder,group,p){validateTaiheEastWallDoorProfile(p);return addOwnWallDoor(builder,group,p);}
export function addTaiheWestWallDoor(builder,group,p){validateTaiheWestWallDoorProfile(p);return addOwnWallDoor(builder,group,p);}
function addOwnWallDoor(builder,group,p){
 const d=p.passage,a=d.centerX-d.clearWidth/2,b=d.centerX+d.clearWidth/2,top=d.floorY+d.clearHeight;
 const part=(role,id,mat,w,h,depth,x,y,z)=>{const m=builder.libBox(group,mat,w,h,depth,x,y,z);m.name=`${p.id}:${id}`;m.userData.firewallPart=role;return m;};
 for(const sign of[-1,1]){
  const face=p.z+sign*p.thickness/2,z0=sign<0?face-.09:face-.02,z1=sign<0?face+.02:face+.09,side=sign<0?'south':'north';
  for(const[id,x0,x1,y0,y1]of[['left',a-.15,a,d.floorY,top],['right',b,b+.15,d.floorY,top],['head',a-.15,b+.15,top,top+.18]]){
   const foot=id==='head'?0:.14;
   part('taihe-door-frame',`${side}-timber:${id}`,'wood_column',x1-x0,y1-y0-foot,z1-z0,(x0+x1)/2,(y0+foot+y1)/2,(z0+z1)/2);
   if(foot)part('taihe-door-stone-foot',`${side}-foot:${id}`,'stone_slab',x1-x0,foot,z1-z0,(x0+x1)/2,y0+foot/2,(z0+z1)/2);
   builder.col(x0,y0,z0,x1,y1,z1);
   if(id==='head')tagTaiheOverhead(builder.colliders.at(-1),`${p.id}:${side}-timber:head`);
  }
  const w=d.clearWidth+1.4,h=.30,y=top+.33,z=face+sign*.035;
  part('taihe-door-painted-lintel',`${side}-painted-lintel`,'caihua_beam',w,h,.11,d.centerX,y,z);
  builder.col(d.centerX-w/2,y-h/2,z-.055,d.centerX+w/2,y+h/2,z+.055);
  tagTaiheOverhead(builder.colliders.at(-1),`${p.id}:${side}-painted-lintel`);
  if(sign===-1)for(let i=0;i<4;i++){
   const x=d.centerX+(i-1.5)*d.clearWidth/4,cy=top+.09,cz=face-.11,r=.085,inner=.067;
   const geo=new T.CylinderGeometry(r,r,.10,6),keep=[];
   for(let k=0;k<geo.index.count;k+=3){const ids=[0,1,2].map(j=>geo.index.getX(k+j));if(!ids.every(j=>geo.attributes.normal.getY(j)===-1))keep.push(...ids);}geo.setIndex(keep);geo.clearGroups();
   const pin=new T.Mesh(geo,builder.library.material('wood_column'));pin.rotation.x=Math.PI/2;pin.position.set(x,cy,cz);pin.name=`${p.id}:south-pin:${i}`;pin.userData.firewallPart='taihe-south-door-pin';pin.castShadow=pin.receiveShadow=true;group.add(pin);
   // The visible south cap is partitioned into red centre + gold hex border.
   // No complete opaque cap remains beneath these coplanar disjoint faces.
   const red=[],gold=[],point=(radius,k)=>new T.Vector3(radius*Math.sin(k*Math.PI/3),-radius*Math.cos(k*Math.PI/3),-.05);
   const triangle=(out,a,b,c)=>{if(b.clone().sub(a).cross(c.clone().sub(a)).z>0)[b,c]=[c,b];for(const v of[a,b,c])out.push(...v.toArray());};
   for(let k=0;k<6;k++){const a=point(r,k),b=point(r,k+1),c=point(inner,k),e=point(inner,k+1);triangle(red,new T.Vector3(0,0,-.05),c,e);triangle(gold,a,b,e);triangle(gold,a,e,c);}
   for(const[role,vertices,material]of[['taihe-south-pin-red-centre',red,builder.library.material('wood_column')],['taihe-south-pin-gold-ring',gold,builder.ownMat('taihe-east-pin-gold-fit',{color:0xb7a66b,roughness:.86,metalness:0})]]){
    const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geom.setAttribute('normal',new T.Float32BufferAttribute(Array.from({length:vertices.length/3},()=>[0,0,-1]).flat(),3));geom.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap((v,j)=>j%3===0?[.5+vertices[j]/(2*r),.5+vertices[j+1]/(2*r)]:[]),2));const m=new T.Mesh(geom,material);m.position.set(x,cy,cz);m.userData.firewallPart=role;m.name=`${p.id}:${role}:${i}`;m.castShadow=m.receiveShadow=true;group.add(m);
   }
   builder.col(x-r,cy-r,cz-.05,x+r,cy+r,cz+.05);
   tagTaiheOverhead(builder.colliders.at(-1),`${p.id}:south-pin:${i}`);
  }
 }
 const open=d.gameplayOpen!==false,leafWidth=d.clearWidth/2+.075,leafDepth=.12,hingeZ=p.z+p.thickness/2+.18;
 for(const sign of[-1,1]){
  const hinge=new T.Group();hinge.position.set(d.centerX+sign*(d.clearWidth/2+.08),0,hingeZ);hinge.rotation.y=open?sign*Math.PI/2:0;group.add(hinge);
  const leaf=builder.libBox(hinge,'wood_column',leafWidth,d.clearHeight-.02,leafDepth,-sign*leafWidth/2,d.floorY+(d.clearHeight-.02)/2,0);leaf.name=`${p.id}:leaf:${sign}`;leaf.userData.firewallPart='taihe-wall-door-leaf';hinge.updateMatrixWorld(true);const box=new T.Box3().setFromObject(leaf);builder.col(box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z);
 }
 const west=p.side==='west';
 group.userData.structure.doorObservation={south:{vp:west?'1931':'1906',sph:west?'1943192924463087616':'1943187762877087744'},north:{vp:west?'1714':'1701',sph:west?'1943159747552002048':'1943158148205166592'},gameplayState:open?'open':'closed',photographedState:'closed',scope:'OWN_DOUBLE_FACED_FRAMES_PINS_AND_REAL_PAIRED_LEAVES',metricStatus:'INHERITED_APERTURE_AND_NEW_VISUAL_FITS_NOT_SURVEY',wholeObjectAccepted:false,unresolved:['exact fine painted pattern and leaf fittings','hidden lower foot heights and exact metrics','GPU runtime']};
}
