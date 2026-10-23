import * as THREE from 'three';

/** Selected museum-contributed photograph, undated. Topology only: a broad
 * central stair, two narrower front stairs and balustraded divisions/sides.
 * All new dimensions, six treads and plain stepped rails are PHOTO_FIT, not a
 * survey or carving reproduction. Existing chair/screen anchors stay fixed. */
export const BAOHE_DAIS = Object.freeze({
  id:'baohe-three-flight-dais',objectId:'FC-58A3300503',rise:1.25,treads:6,run:3.06,
  widthRatio:1.2,centerWidth:4,sideWidth:1.6,sideCenter:4.3,railWidth:.16,
  source:'https://artsandculture.google.com/asset/hall-of-preserving-harmony-baohe-dian-interior-the-palace-museum/pgFXua5sp2QCug?hl=zh-cn',
  imageSHA256:'04e2bd5c1794f7fc6c65c6bbf70932d3c7313e239816deb8ad867373cd1338ae',
  appearance:'SELECTED_UNDATED_MUSEUM_PHOTO',dimensions:'PHOTO_FIT_NOT_MEASURED',
  status:'PARTIAL',visualStatus:'VERIFY_PENDING',accepted:false,
  access:'VIRTUAL_THREE_FLIGHT_ASCENT_NOT_MUSEUM_VISITOR_PERMISSION',
  unknowns:['exact dimensions and tread count','carving and continuous inclined rail profile','rear railing/return','capture date and current display date'],
});

export function baoheDaisProfile({x0,y,ztb0,ztb1,thW}){
  if(![x0,y,ztb0,ztb1,thW].every(Number.isFinite)||thW<8.7||thW>9||ztb1-ztb0<6.9||ztb1-ztb0>7.1)
    throw Error('Baohe dais requires retained R21 chair/screen registration');
  const p=BAOHE_DAIS,width=thW*p.widthRatio,toe=ztb0-1.9,front=toe+p.run,topY=y+p.rise;
  const flights=[[-1,-p.sideCenter,p.sideWidth],[0,0,p.centerWidth],[1,p.sideCenter,p.sideWidth]].map(([side,x,width])=>({id:`${p.id}:flight:${side}`,side,centerX:x0+x,width,minX:x0+x-width/2,maxX:x0+x+width/2,toe,front}));
  const supports=flights.flatMap(f=>Array.from({length:p.treads},(_,i)=>({id:`${f.id}:tread:${i+1}`,minX:f.minX,maxX:f.maxX,minZ:toe+i*p.run/p.treads,maxZ:toe+(i+1)*p.run/p.treads,topY:y+(i+1)*p.rise/p.treads})));
  supports.push({id:`${p.id}:landing`,minX:x0-width/2,maxX:x0+width/2,minZ:front,maxZ:ztb1,topY});
  return {...p,x0,y,ztb0,ztb1,thW,width,toe,front,topY,flights,supports,colliderBounds:[],retainedFurniture:{ty:topY,tz:(ztb0+ztb1)/2+(ztb1-ztb0)*.1},rearEdge:{z:ztb1,policy:'VISIBLE_VERTICAL_STAGE_FACE_AND_FINITE_SUPPORT; NO_UNSOURCED_REAR_RAIL'}};
}

export function buildBaoheDaisApproach(b,parent,args){
  if(parent.children.some(o=>o.userData.structure?.id===BAOHE_DAIS.id))throw Error('Duplicate Baohe dais');
  const p=baoheDaisProfile(args),g=new THREE.Group();g.name=p.id;g.userData.structure=p;parent.add(g);
  const timber=b.ownMat('baohe_dais_timber',{name:'baohe_dais_timber',color:0x684332,roughness:.84,metalness:.02});
  const rail=b.ownMat('baohe_dais_rail',{name:'baohe_dais_rail',color:0x743b2c,roughness:.73,metalness:.05});
  const trim=b.ownMat('baohe_dais_rail_trim',{name:'baohe_dais_rail_trim',color:0x9d8450,roughness:.69,metalness:.17});
  function solid(id,mat,w,h,d,x,cy,z){
    const m=b.box(g,mat,w,h,d,x,cy,z);m.name=id;m.userData.baoheDaisSolid=true;
    const min=[x-w/2,cy-h/2,z-d/2],max=[x+w/2,cy+h/2,z+d/2];
    b.col(...min,...max);p.colliderBounds.push({id,min,max});return m;
  }
  // Each stair cell is closed down to the real hall floor; its horizontal top
  // is the actual support. No hidden slope, rescue, enlarged collider or gap.
  for(const s of p.supports){
    solid(s.id,timber,s.maxX-s.minX,s.topY-p.y,s.maxZ-s.minZ,(s.minX+s.maxX)/2,(p.y+s.topY)/2,(s.minZ+s.maxZ)/2);
    const index=b.walkables.length;b.walkBox(s.minX,s.minZ,s.maxX,s.maxZ,s.topY);
    Object.assign(b.walkables[index],{rescue:false,structureId:s.id});
  }
  // Stepped plain balustrade rails deliberately use rectangular solids and
  // identical collision boxes. This is a conservative topology fit, not an
  // invented carved or continuously sloping handrail reconstruction.
  const edges=[-5.2,-3.4,-2.1,2.1,3.4,5.2].map(x=>x+p.x0),run=p.run/p.treads,rise=p.rise/p.treads;
  edges.forEach((x,j)=>{
    for(let i=0;i<p.treads;i++){
      const z=p.toe+(i+.5)*run,base=p.y+(i+1)*rise,id=`${p.id}:stair-rail:${j}:${i}`;
      solid(id+':foot',rail,p.railWidth,base-p.y,run,x,(p.y+base)/2,z);
      solid(id+':post',rail,.12,.72,.12,x,base+.36,z);
      solid(id+':lower',rail,.10,.09,run,x,base+.28,z);
      solid(id+':cap',trim,.14,.10,run,x,base+.72,z);
      if(i+1<p.treads)solid(id+':joint',trim,.14,rise,.10,x,base+.77+rise/2,z+run/2-.05);
    }
  });
  for(const side of[-1,1]){
    const x=p.x0+side*5.2,len=p.ztb1-p.front,n=Math.ceil(len/.8),segment=len/n;
    for(let i=0;i<n;i++){
      const z=p.front+(i+.5)*segment,id=`${p.id}:side-rail:${side}:${i}`;
      solid(id+':post',rail,.12,.72,.12,x,p.topY+.36,z);
      solid(id+':lower',rail,.10,.09,segment,x,p.topY+.28,z);
      solid(id+':cap',trim,.14,.10,segment,x,p.topY+.72,z);
    }
  }
  return p;
}

/** Remove the old enclosing air box without making the retained furniture
 * intangible. BoxGeometry parts map exactly. Three plain lower screen cores
 * and the chair back's rectangular lower body lie inside their real extrusions;
 * their unmeasured curved crowns are not enlarged to bounding-box walls. */
export function registerBaoheDaisFurnishingSolids(b,parent){
  const p=parent.children.find(o=>o.userData.structure?.id===BAOHE_DAIS.id)?.userData.structure;
  if(!p||p.furnitureColliders)throw Error('One Baohe dais furnishing registration required');
  const stem='baohe-three-panel-screen-photo-registration:',rows=[];
  const add=(m,min,max)=>{b.col(...min,...max);rows.push({id:m.name,min,max});};
  for(const m of parent.children){
    if(!m.isMesh||!m.name.startsWith(stem))continue;
    const g=m.geometry;g.computeBoundingBox();const box=g.boundingBox.clone().translate(m.position);
    if(g.type==='BoxGeometry')add(m,box.min.toArray(),box.max.toArray());
    else if(/:frame-[012]$/.test(m.name)){
      const top=p.topY+3.65*(m.name.endsWith('frame-1')?.8:.66);
      add(m,box.min.toArray(),[box.max.x,top,box.max.z]);
    }else if(m.name.endsWith(':chair-shaped-back'))add(m,[box.min.x,p.topY+.55,box.min.z],[box.max.x,p.topY+1.5,box.max.z]);
  }
  if(rows.length!==10)throw Error('Retained Baohe furniture geometry contract changed');
  p.furnitureColliders=rows;return rows;
}
