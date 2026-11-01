import * as T from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236533.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/8035.jpg';
/** Low-resolution photo relationships only. Real inset timber geometry stays
 * inside each ORIGINAL CLOSED leaf envelope. No new floor/collision/door state. */
export function buildDafotangFrontFit(c){
 const {p,g,f,kit,m:mats}=c;
 if(p.key!=='dafotang'||p.id!=='place-outer-west-6cae88b6a2'||g.w!==45.7||g.d!==16.2||g.bays!==7||g.y!==.9||g.h!==7.84||g.front!==-8.1||f.parent!==kit.root||f.userData.dafotangFrontFit)throw Error('Dafotang retained seven-bay closed-leaf binding required');
 const leaves=f.children.filter(m=>m.isMesh&&m.userData.role==='dafotang-front-door-leaf'),closed=leaves.filter(m=>m.userData.openingPose==='CLOSED'),open=leaves.filter(m=>m.userData.openingPose==='MODEL_OPEN');
 const oldRoles=new Set(['dafotang-front-paper-pane','dafotang-front-lattice-stile','dafotang-front-lattice-rail']),old=f.children.filter(m=>m.isMesh&&oldRoles.has(m.userData.role));
 if(closed.length!==24||open.length!==4||old.length!==192)throw Error('Dafotang original door inventory changed');
 const W=(g.w/7-.32)/4-.025,H=g.h-.5-.42;
 for(const leaf of closed){const q=leaf.geometry.parameters;if(Math.abs(q.width-W)>1e-12||Math.abs(q.height-H)>1e-12||q.depth!==.14||leaf.position.z!==g.front||leaf.rotation.x||leaf.rotation.y||leaf.rotation.z||!leaf.scale.equals(new T.Vector3(1,1,1)))throw Error('Dafotang closed leaf source shape changed');}
 const collisionCount=kit.colliders.length,walkableCount=kit.walkables.length;
 for(const node of old){node.removeFromParent();node.geometry.dispose();}
 let parts=0;const assemblies=[];
 for(const [id,body] of closed.entries()){
  const {width:W,height:H}=body.geometry.parameters;body.geometry.computeBoundingBox();const originalBounds=body.geometry.boundingBox.clone(),hx=originalBounds.max.x,hy=originalBounds.max.y,hz=originalBounds.max.z;
  const origin=body.position.clone(),group=new T.Group();group.name='dafotang-inset-leaf-'+id;group.position.copy(origin);group.userData={role:'dafotang-inset-leaf-assembly',dafotangLeafId:id,source:SOURCE,image:PHOTO,precision:'PHOTO_RELATIONSHIP_MODEL_FIT_NOT_EXACT_CARVING'};f.add(group);
  // The original rear and outer X/Y extents remain. Only the face is recessed;
  // continuous timber back + inset full frame still form a closed door leaf.
  const previous=body.geometry;body.geometry=previous.clone();const bp=body.geometry.attributes.position;for(let i=0;i<bp.count;i++)if(bp.getZ(i)<0)bp.setZ(i,0);bp.needsUpdate=true;body.geometry.computeBoundingBox();body.geometry.computeBoundingSphere();previous.dispose();body.material=mats.red;body.userData.dafotangFrontBody=true;body.userData.dafotangLeafId=id;
  function bar(role,material,w,h,d,x,y,z=0,angle=0){const mesh=kit.mesh(group,new T.BoxGeometry(w,h,d),mats[material],x,y,z);mesh.rotation.z=angle;mesh.name='dafotang-inset-'+role;mesh.userData={role:mesh.name,dafotangLeafId:id,source:SOURCE,image:PHOTO,dimensionStatus:'MODEL_FIT_NOT_SURVEY',pattern:'SIMPLIFIED_DENSE_DIAGONAL_FIELD_NOT_VERIFIED_TRADITIONAL_PATTERN'};parts++;return mesh;}
  const t=.075;
  // Copy exact original local outer coordinates into frame buffers, rather
  // than adding shifted box centers and accidentally extending a Float32 edge.
  function boundary(role,x0,x1,y0,y1){const mesh=bar(role,'red',1,1,1,0,0),a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){a.setXYZ(i,a.getX(i)<0?x0:x1,a.getY(i)<0?y0:y1,a.getZ(i)<0?-hz:hz);}a.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();return mesh;}
  boundary('outer-stile',-hx,-hx+t,-hy,hy);boundary('outer-stile',hx-t,hx,-hy,hy);boundary('outer-rail',-hx+t,hx-t,-hy,-hy+t);boundary('outer-rail',-hx+t,hx-t,hy-t,hy);
  const bottom=-H/2,waist=bottom+H*.31,lo=waist+.11,hi=H/2-.14,half=W/2-.13;
  bar('waist-rail','red',W-.05,.085,.14,0,waist);
  // Retain the model's opaque CLOSED-leaf backing topology. The dark color is
  // a photograph fit, not an assertion that the real substrate is paper/glass.
  bar('dark-backed-upper-field','dark',2*half,hi-lo,.014,0,(lo+hi)/2,-.005);
  for(const slope of[-1,1]){
   const first=lo-half,last=hi+half,step=.26;
   for(let b=Math.ceil(first/step)*step;b<last;b+=step){const pts=[];for(const x of[-half,half]){const y=slope*x+b;if(y>=lo&&y<=hi)pts.push([x,y]);}for(const y of[lo,hi]){const x=(y-b)/slope;if(x>=-half&&x<=half&&!pts.some(q=>Math.abs(q[0]-x)<1e-9&&Math.abs(q[1]-y)<1e-9))pts.push([x,y]);}if(pts.length!==2)continue;const [[x0,y0],[x1,y1]]=pts,length=Math.hypot(x1-x0,y1-y0)-.03;if(length>.04)bar('fine-diagonal-fit','timber',length,.023,.13,(x0+x1)/2,(y0+y1)/2,0,Math.atan2(y1-y0,x1-x0));}
  }
  // Two plain rectangular panel fields; no invented religious/flower carving.
  const bands=[[bottom+.12,bottom+H*.14],[bottom+H*.17,waist-.10]];
  for(const [y0,y1] of bands){const x0=-W/2+.14,x1=W/2-.14;for(const sign of[-1,1]){bar('lower-panel-outline','timber',.03,y1-y0,.12,sign*(x1-.015),(y0+y1)/2);bar('lower-panel-outline','timber',x1-x0,.03,.12,0,sign<0?y0+.015:y1-.015);}}
  assemblies.push({id,origin:origin.toArray(),width:W,height:H,depth:.14});
 }
 if(kit.colliders.length!==collisionCount||kit.walkables.length!==walkableCount)throw Error('Dafotang inset fit must not alter physics registration');
 return f.userData.dafotangFrontFit={source:SOURCE,image:PHOTO,photographyDate:null,acceptedWholeObject:false,closedLeaves:24,retainedOpenLeaves:4,removedCoarseDecorations:192,parts,assemblies,physicalPolicy:'RETAINED_CONSERVATIVE_CLOSED_LEAF_AABB_NOT_EXACT_RECESSED_SURFACE_NO_NEW_COLLIDERS',backingStatus:'RETAINED_MODEL_OPAQUE_CLOSED_LEAF_TOPOLOGY_SUBSTRATE_UNKNOWN',patternStatus:'SIMPLIFIED_DENSE_DIAGONAL_AND_TWO_RECTANGULAR_FIELDS_NOT_MEASURED_MOTIFS',retained:['central clear opening and open-leaf pose','original roof platform steps columns headers','warm-room partitions and passages','all colliders walkables and navigation','modern interior inventory limitations'],unknown:['exact lattice family/count/sections','fine carving and colorimetry','current substrate and door pose','modern room display inventory']};
}
