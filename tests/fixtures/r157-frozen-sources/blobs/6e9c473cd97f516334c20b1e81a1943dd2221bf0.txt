import * as T from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236504.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d1486f2b10.jpg';
/** Closed leaf region only; preserving central model-access leaves and the
 * dated modern display. Simple linework is not a reproduction of fine carving. */
export function buildCiningFrontFit(c){
 const {kit,f,g,p}=c,mats={...c.m};
 if(p.id!=='place-outer-west-b9b85b682e'||p.key!=='cining'||g.w!==42.1||g.d!==26.8||g.bays!==7||g.front!==-11.4||f.parent!==kit.root||f.userData.ciningFrontFit)throw Error('Cining exact seven-bay binding required');
 const leafRoles=new Set(['cining-front-door-leaf','cining-front-window-leaf']),oldRoles=new Set(['cining-front-paper-pane','cining-front-lattice-stile','cining-front-lattice-rail']),leaves=f.children.filter(m=>leafRoles.has(m.userData.role)&&m.userData.openingPose==='CLOSED'),old=f.children.filter(m=>oldRoles.has(m.userData.role));
 if(leaves.length!==24||leaves.filter(m=>m.userData.role.endsWith('door-leaf')).length!==16||old.length!==192)throw Error('Cining original closed door/window inventory changed');
 for(const m of leaves){const q=m.geometry.parameters;if(m.position.z!==g.front||q.depth!==.14||Math.abs(q.width-((g.w/7-.32)/4-.025))>1e-12||Math.abs(q.height-(g.h-.5-.42-(m.userData.role.endsWith('window-leaf')?1.05:0)))>1e-12)throw Error('Cining original closed leaf shape changed');}
 mats.backing=new T.MeshStandardMaterial({name:'cining_front_neutral_backing_photo_fit',color:0xa6aaac,roughness:.92});kit.owned.push(mats.backing);
 for(const m of old){m.removeFromParent();m.geometry.dispose();}
 let parts=0;
 for(const [id,body]of leaves.entries()){
  body.geometry.computeBoundingBox();const {max}=body.geometry.boundingBox,hx=max.x,hy=max.y,hz=max.z,group=new T.Group();group.position.copy(body.position);group.name='cining-facade-inset-'+id;f.add(group);
  const previous=body.geometry;body.geometry=previous.clone();const bp=body.geometry.attributes.position;for(let i=0;i<bp.count;i++)if(bp.getZ(i)<0)bp.setZ(i,0);bp.needsUpdate=true;body.geometry.computeBoundingBox();body.geometry.computeBoundingSphere();previous.dispose();body.material=mats.red;body.userData.ciningFrontBody=true;body.userData.ciningLeafId=id;
  function bar(role,mat,w,h,d,x=0,y=0,z=0,angle=0){const m=kit.mesh(group,new T.BoxGeometry(w,h,d),mats[mat],x,y,z);m.rotation.z=angle;m.name='cining-facade-'+role;m.userData={role:m.name,ciningLeafId:id,source:SOURCE,image:PHOTO,precision:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEYED_PATTERN_OR_GILDING'};parts++;return m;}
  function frame(role,x0,x1,y0,y1){const m=bar(role,'red',1,1,1),p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)<0?x0:x1,p.getY(i)<0?y0:y1,p.getZ(i)<0?-hz+.006:hz);p.needsUpdate=true;m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();}
  const t=.065;frame('outer-stile',-hx,-hx+t,-hy,hy);frame('outer-stile',hx-t,hx,-hy,hy);frame('outer-rail',-hx+t,hx-t,-hy,-hy+t);frame('outer-rail',-hx+t,hx-t,hy-t,hy);
  const isDoor=body.userData.role==='cining-front-door-leaf',lo=-hy+(isDoor?2*hy*.36:.30),hi=hy-.14,half=hx-.11;
  for(const yy of[lo-.045])bar('field-divider','red',2*hx-.05,.09,.11,0,yy);
  // Gold-colored lines are a visible-color fit, not a gilding/material claim.
  function outline(x0,x1,y0,y1){const t=.014;for(const x of[x0+t/2,x1-t/2])bar('gold-outline','gold',t,y1-y0,2*hz,x,(y0+y1)/2);for(const y of[y0+t/2,y1-t/2])bar('gold-outline','gold',x1-x0,t,2*hz,(x0+x1)/2,y);}
  outline(-hx+.035,hx-.035,-hy+.035,hy-.035);outline(-half,half,lo,hi);outline(-half,half,-hy+.10,lo-.10);
  bar('upper-backed-field','backing',2*half,hi-lo,.014,0,(lo+hi)/2,-.005);
  for(const slope of[-1,1])for(let b=Math.ceil((lo-half)/.19)*.19;b<hi+half;b+=.19){const pts=[];for(const x of[-half,half]){const y=slope*x+b;if(y>=lo&&y<=hi)pts.push([x,y]);}for(const y of[lo,hi]){const x=(y-b)/slope;if(x>=-half&&x<=half&&!pts.some(p=>Math.abs(p[0]-x)<1e-9&&Math.abs(p[1]-y)<1e-9))pts.push([x,y]);}if(pts.length===2){const [[x0,y0],[x1,y1]]=pts,L=Math.hypot(x1-x0,y1-y0)-.035;if(L>.04)bar('dense-diagonal-fit','gold',L,.014,.10,(x0+x1)/2,(y0+y1)/2,0,Math.atan2(y1-y0,x1-x0));}}
  if(isDoor){
   const py0=-hy+.16,py1=lo-.22,cy=(py0+py1)/2,ph=py1-py0,pw=2*half;
   let strokeRun=0;
   function stroke(points,kind){const run=strokeRun++;for(let i=1;i<points.length;i++){const [a,b]=[points[i-1],points[i]],dx=(b[0]-a[0])*pw,dy=(b[1]-a[1])*ph,L=Math.hypot(dx,dy);if(L>.0001){const m=bar(kind,'gold',L+.012,.018,.10,(a[0]+b[0])*pw/2,cy+(a[1]+b[1])*ph/2,0,Math.atan2(dy,dx));m.userData.strokeRun=run;m.userData.strokeSegment=i;}}}
   stroke([[-.42,-.46],[-.42,.40],[-.32,.46],[-.18,.38],[-.04,.45],[.04,.45],[.18,.38],[.32,.46],[.42,.40],[.42,-.46],[-.42,-.46]],'fitted-panel-undulating-outline');
   const curve=new T.CurvePath();
   const segment=(a,b,c,d)=>curve.add(new T.CubicBezierCurve(new T.Vector2(...a),new T.Vector2(...b),new T.Vector2(...c),new T.Vector2(...d)));
   segment([0,.22],[-.22,.18],[-.40,-.04],[-.32,-.24]);
   segment([-.32,-.24],[-.25,-.40],[-.05,-.30],[-.10,-.14]);
   segment([-.10,-.14],[-.14,-.02],[-.29,-.11],[-.21,-.20]);
   const points=curve.getPoints(12).map(v=>[v.x,v.y]);for(const sign of[-1,1])stroke(points.map(([x,y])=>[sign*x,y]),'fitted-paired-scroll-outline');
  }
 }
 return f.userData.ciningFrontFit={source:SOURCE,image:PHOTO,photographyDate:null,closedLeaves:24,closedDoors:16,closedWindows:8,retainedOpenLeaves:4,removedCoarseDecorations:192,parts,acceptedWholeObject:false,visualStatus:'VERIFY_PENDING_BROWSER_BEFORE_AFTER',sourcePatternName:'双交四椀菱花',implementedPattern:'SIMPLIFIED_DIAGONAL_SKELETON_NOT_EXACT_FOUR_BOWL_PETALS',panelMotif:'SIMPLIFIED_PAIRED_INWARD_SCROLL_AND_UNDULATING_BORDER_NOT_EXACT_CARVING',physicalPolicy:'RETAINED_CONSERVATIVE_CLOSED_LEAF_AABB_NOT_EXACT_RECESSED_SURFACE_NO_NEW_COLLIDERS',backing:'RETAINED_MODEL_OPAQUE_TOPOLOGY_SUBSTRATE_UNKNOWN_COLOR_FITTED',doorPose:'RETAINED_CENTRAL_FOUR_OPEN_LEAVES_FOR_MODEL_ACCESS_NOT_PHOTO_POSE',excluded:['door paintings visible in reference not reconstructed','fine lattice petals and carved ornament','roof and terrace detailing','complete modern exhibition inventory']};
}
