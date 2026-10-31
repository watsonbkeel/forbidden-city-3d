import * as T from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236534.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefe67be3ac.jpg';
/** Visible annex windows only; source-obscured main windows are not copied. */
export function buildXianruoFrontFit(kit,f,g,mats){
 if(g.key!=='xianruo'||g.id!=='outer-west/xianruo-ritual-hall'||g.annexEnclosure?.front!==-8.8||f.parent!==kit.root||f.userData.xianruoFrontFit)throw Error('Xianruo exact annex binding required');
 const leaves=f.children.filter(m=>m.userData.role==='xianruo-window-leaf'&&m.position.z===-8.8),old=f.children.filter(m=>m.userData.role==='xianruo-plain-window-grid'&&m.position.z===-8.8),sills=f.children.filter(m=>m.userData.role==='xianruo-sill-wall'&&m.position.z===-8.8);
 if(leaves.length!==8||old.length!==56||sills.length!==2)throw Error('Xianruo annex source inventory changed');
 for(const m of leaves)if(Math.abs(m.geometry.parameters.width-.96)>1e-12||m.geometry.parameters.height!==3.6999999999999997||m.geometry.parameters.depth!==.12)throw Error('Xianruo original closed window shape changed');
 const stone=new T.MeshStandardMaterial({name:'xianruo_annex_gray_brick_photo_fit',color:0x777779,roughness:.95});kit.owned.push(stone);for(const m of sills)m.material=stone;
 for(const m of old){m.removeFromParent();m.geometry.dispose();}
 let parts=0;
 for(const [id,body]of leaves.entries()){
  body.geometry.computeBoundingBox();const {max}=body.geometry.boundingBox,hx=max.x,hy=max.y,hz=max.z,group=new T.Group();group.position.copy(body.position);group.name='xianruo-annex-inset-'+id;f.add(group);
  const previous=body.geometry;body.geometry=previous.clone();const bp=body.geometry.attributes.position;for(let i=0;i<bp.count;i++)if(bp.getZ(i)<0)bp.setZ(i,0);bp.needsUpdate=true;body.geometry.computeBoundingBox();body.geometry.computeBoundingSphere();previous.dispose();body.material=mats.wood;body.userData.xianruoFrontBody=true;body.userData.xianruoLeafId=id;
  function bar(role,mat,w,h,d,x=0,y=0,z=0,angle=0){const m=kit.mesh(group,new T.BoxGeometry(w,h,d),mats[mat],x,y,z);m.rotation.z=angle;m.name='xianruo-annex-'+role;m.userData={role:m.name,xianruoLeafId:id,source:SOURCE,image:PHOTO,precision:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEYED_PATTERN_OR_GILDING'};parts++;return m;}
  function frame(role,x0,x1,y0,y1){const m=bar(role,'red',1,1,1),p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?x0:x1,p.getY(i)<0?y0:y1,p.getZ(i)<0?-hz+.006:hz);p.needsUpdate=true;m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();}
  const t=.065;frame('outer-stile',-hx,-hx+t,-hy,hy);frame('outer-stile',hx-t,hx,-hy,hy);frame('outer-rail',-hx+t,hx-t,-hy,-hy+t);frame('outer-rail',-hx+t,hx-t,hy-t,hy);
  const lo=-hy+.34,hi=hy-.34,half=hx-.11;
  for(const yy of[lo-.045,hi+.045])bar('field-divider','red',2*hx-.05,.09,.11,0,yy);
  // Gold-colored lines are a visible-color fit, not a gilding/material claim.
  function outline(x0,x1,y0,y1){const t=.014;for(const x of[x0+t/2,x1-t/2])bar('gold-outline','gold',t,y1-y0,2*hz,x,(y0+y1)/2);for(const y of[y0+t/2,y1-t/2])bar('gold-outline','gold',x1-x0,t,2*hz,(x0+x1)/2,y);}
  outline(-hx+.035,hx-.035,-hy+.035,hy-.035);outline(-half,half,lo,hi);outline(-half,half,-hy+.10,lo-.10);outline(-half,half,hi+.10,hy-.10);
  for(const slope of[-1,1])for(let b=Math.ceil((lo-half)/.19)*.19;b<hi+half;b+=.19){const pts=[];for(const x of[-half,half]){const y=slope*x+b;if(y>=lo&&y<=hi)pts.push([x,y]);}for(const y of[lo,hi]){const x=(y-b)/slope;if(x>=-half&&x<=half&&!pts.some(p=>Math.abs(p[0]-x)<1e-9&&Math.abs(p[1]-y)<1e-9))pts.push([x,y]);}if(pts.length===2){const [[x0,y0],[x1,y1]]=pts,L=Math.hypot(x1-x0,y1-y0)-.035;if(L>.04)bar('dense-diagonal-fit','gold',L,.014,.10,(x0+x1)/2,(y0+y1)/2,0,Math.atan2(y1-y0,x1-x0));}}
 }
 return f.userData.xianruoFrontFit={source:SOURCE,image:PHOTO,photographyDate:null,closedWindows:8,removedCoarseBars:56,graySills:2,parts,acceptedWholeObject:false,visualStatus:'VERIFY_PENDING_BROWSER_BEFORE_AFTER',precision:'PHOTO_RELATIONSHIP_FIT_NOT_EXACT_LATTICE_OR_BRICK_SURVEY',physicalPolicy:'RETAINED_CONSERVATIVE_WINDOW_AABB_NOT_EXACT_RECESSED_SURFACE_NO_NEW_COLLIDERS',backing:'RETAINED_MODEL_OPAQUE_WINDOW_TOPOLOGY_SUBSTRATE_UNKNOWN',doorPose:'RETAINED_FOUR_OPEN_LEAVES_FOR_MODEL_ACCESS_NOT_PHOTO_POSE',excluded:['obscured main-building windows','central door motifs','roof joint','interior complete inventory']};
}
