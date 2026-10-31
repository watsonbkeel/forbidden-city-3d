import * as T from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236483.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg';
/** Cining Garden Jiyun only. Forty-eight leaves retain the model inventory;
 * obscured repetitions are fits, not forty-eight separately verified photos. */
export function buildJiyunFrontFit(c){
 const {kit,f,g,p,m:mats}=c;
 if(p.id!=='place-outer-west-e1a6e9852b'||p.key!=='jiyun'||g.w!==29.7||g.d!==12||g.bays!==7||g.storeys!==2||f.parent!==kit.root||f.userData.jiyunFrontFit)throw Error('Cining Garden Jiyun exact two-storey binding required');
 const prefixes=['jiyun-front','jiyun-upper-front'],leafRoles=new Set(prefixes.map(s=>s+'-window-leaf')),oldRoles=new Set(prefixes.flatMap(s=>['-paper-pane','-lattice-stile','-lattice-rail'].map(t=>s+t))),leaves=f.children.filter(m=>leafRoles.has(m.userData.role)),old=f.children.filter(m=>oldRoles.has(m.userData.role));
 if(leaves.length!==48||old.length!==384)throw Error('Jiyun original two-storey closed-window inventory changed');
 for(const m of leaves){const q=m.geometry.parameters;if(m.position.z!==g.front||q.depth!==.14||m.userData.openingPose!=='CLOSED'||Math.abs(q.width-((g.w/7-.32)/4-.025))>1e-12||![4.05-.42-.8,3.5-.42-.8].includes(q.height))throw Error('Jiyun original closed-window shape changed');}
 for(const m of old){m.removeFromParent();m.geometry.dispose();}
 let parts=0;
 for(const [id,body]of leaves.entries()){
  body.geometry.computeBoundingBox();const {max}=body.geometry.boundingBox,hx=max.x,hy=max.y,hz=max.z,group=new T.Group();group.position.copy(body.position);group.name='jiyun-facade-inset-'+id;f.add(group);
  const previous=body.geometry;body.geometry=previous.clone();const bp=body.geometry.attributes.position;for(let i=0;i<bp.count;i++)if(bp.getZ(i)<0)bp.setZ(i,0);bp.needsUpdate=true;body.geometry.computeBoundingBox();body.geometry.computeBoundingSphere();previous.dispose();body.material=mats.timber;body.userData.jiyunFrontBody=true;body.userData.jiyunLeafId=id;
  function bar(role,mat,w,h,d,x=0,y=0,z=0,angle=0){const m=kit.mesh(group,new T.BoxGeometry(w,h,d),mats[mat],x,y,z);m.rotation.z=angle;m.name='jiyun-facade-'+role;m.userData={role:m.name,jiyunLeafId:id,source:SOURCE,image:PHOTO,precision:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEYED_PATTERN_OR_GILDING'};parts++;return m;}
  function frame(role,x0,x1,y0,y1){const m=bar(role,'red',1,1,1),p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?x0:x1,p.getY(i)<0?y0:y1,p.getZ(i)<0?-hz+.006:hz);p.needsUpdate=true;m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();}
  const t=.065;frame('outer-stile',-hx,-hx+t,-hy,hy);frame('outer-stile',hx-t,hx,-hy,hy);frame('outer-rail',-hx+t,hx-t,-hy,-hy+t);frame('outer-rail',-hx+t,hx-t,hy-t,hy);
  const lo=-hy+.35,hi=hy-.12,half=hx-.10;
  for(const yy of[lo-.045])bar('field-divider','red',2*hx-.05,.09,.11,0,yy);
  // Gold-colored lines are a visible-color fit, not a gilding/material claim.
  function outline(x0,x1,y0,y1){const t=.014;for(const x of[x0+t/2,x1-t/2])bar('gold-outline','gold',t,y1-y0,2*hz,x,(y0+y1)/2);for(const y of[y0+t/2,y1-t/2])bar('gold-outline','gold',x1-x0,t,2*hz,(x0+x1)/2,y);}
  outline(-hx+.035,hx-.035,-hy+.035,hy-.035);outline(-half,half,lo,hi);outline(-half,half,-hy+.10,lo-.10);
  // Three line families are a parameterized visual approximation, not
  // measured angles or an attribution of a named historical cell pattern.
  const cy=(lo+hi)/2,halfH=(hi-lo)/2,pitch=.21;
  for(const degree of[0,60,-60]){const angle=degree*Math.PI/180,d=[Math.cos(angle),Math.sin(angle)],n=[-d[1],d[0]],reach=Math.abs(n[0])*half+Math.abs(n[1])*halfH;
   for(let k=Math.ceil(-reach/pitch);k<=Math.floor(reach/pitch);k++){const q=[n[0]*k*pitch,n[1]*k*pitch];let t0=-Infinity,t1=Infinity;for(let axis=0;axis<2;axis++){const h=axis?halfH:half;if(Math.abs(d[axis])<1e-8){if(Math.abs(q[axis])>h){t0=1;t1=0;break;}}else{const u=(-h-q[axis])/d[axis],v=(h-q[axis])/d[axis];t0=Math.max(t0,Math.min(u,v));t1=Math.min(t1,Math.max(u,v));}}const L=t1-t0-.035;if(L>.04)bar('three-direction-fit','gold',L,.014,.10,q[0]+d[0]*(t0+t1)/2,cy+q[1]+d[1]*(t0+t1)/2,0,angle);}
  }
 }
 return f.userData.jiyunFrontFit={source:SOURCE,image:PHOTO,photographyDate:null,closedWindows:48,removedCoarseDecorations:384,parts,acceptedWholeObject:false,visualStatus:'VERIFY_PENDING_BROWSER_BEFORE_AFTER',precision:'PHOTO_RELATIONSHIP_FIT_WITH_OBSCURED_REPETITIONS_NOT_48_INDIVIDUALLY_VERIFIED_LEAVES',lineFamilies:[0,60,-60],patternStatus:'PARAMETRIC_MULTIDIRECTIONAL_APPROXIMATION_NOT_MEASURED_ANGLES_OR_NAMED_PATTERN',physicalPolicy:'RETAINED_CONSERVATIVE_WINDOW_AABB_NOT_EXACT_RECESSED_SURFACE_NO_NEW_COLLIDERS',backing:'RETAINED_MODEL_OPAQUE_WINDOW_TOPOLOGY_SUBSTRATE_UNKNOWN',doorPose:'RETAINED_EIGHT_OPEN_LEAVES_FOR_MODEL_ACCESS_NOT_PHOTO_POSE',excluded:['separate upper transoms','rail paintings and carvings','roof paintings','stair location and new upper access','complete current interior inventory']};
}
