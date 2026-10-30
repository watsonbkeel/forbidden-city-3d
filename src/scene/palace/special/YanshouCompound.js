import {YANSHOU_COMPOUND_REGION,validateYanshouCompoundScope} from '../../../controls/YanshouCompoundSupport.js';
import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236545.html';
/** Source topology, not surveyed dimensions or a reconstruction of unseen rooms. */
export function buildYanshouCompound(c,roof){
 const {kit,f,g,p}=c,A=g.w/2,center=-g.w/3,half=1.25,cut=[center-half,center+half],z0=g.rear,z1=z0+4,z2=z1+4;
 if(p.id!=='place-outer-west-f6d065a79b'||p.key!=='yanshou'||g.w!==9.8||g.d!==10.4||g.y!==.4||g.h!==4.48||f.position.x!==280.3||Math.abs(f.position.z-85.3)>1e-10||f.rotation.y!==0||f.parent!==kit.root||g.yanshouCompound)throw Error('Yanshou compound requires exact retained front house');
 const frontRooms=kit.rooms.filter(r=>r.name==='延寿堂·前房');if(frontRooms.length!==1||frontRooms[0].floorY!==.4||frontRooms[0].doors.length!==1||frontRooms[0].doors[0].x!==280.3||frontRooms[0].doors[0].z!==80.1)throw Error('Yanshou original front room required');
 const oldRoles=['yanshou-rear-wall','yanshou-rear-grey-brick-plinth','yanshou-paper-lined-wainscot'];
 const rear=f.children.filter(m=>m.isMesh&&oldRoles.includes(m.name)&&m.position.x===0&&m.position.z>4.9);
 const expected=[['yanshou-rear-wall',g.w,g.h-.35,.25,g.y+(g.h-.35)/2,z0],['yanshou-rear-grey-brick-plinth',g.w,.75,.28,g.y+.375,z0-.14],['yanshou-paper-lined-wainscot',g.w-.38,1.25,.08,g.y+.625,z0-.19]];
 if(rear.length!==3)throw Error('Yanshou rear source must be unique');
 for(const [role,w,h,d,y,z]of expected){const m=rear.find(m=>m.name===role),q=m?.geometry?.parameters;if(!m||m.children.length||m.rotation.x||m.rotation.y||m.rotation.z||m.scale.toArray().some(v=>v!==1)||q?.width!==w||q.height!==h||q.depth!==d||m.position.y!==y||m.position.z!==z)throw Error('Yanshou rear source changed before split');const expectedMaterial=role==='yanshou-rear-wall'?c.m.wall:role==='yanshou-rear-grey-brick-plinth'?c.m.stone:c.m.paper,expectedGeometry=new T.BoxGeometry(w,h,d);try{const pa=m.geometry.attributes.position.array,ea=expectedGeometry.attributes.position.array,pi=m.geometry.index?.array,ei=expectedGeometry.index.array;if(m.material!==expectedMaterial||pa.length!==ea.length||pa.some((v,i)=>v!==ea[i])||pi?.length!==ei.length||pi.some((v,i)=>v!==ei[i]))throw Error('Yanshou rear source geometry/material changed before split');}finally{expectedGeometry.dispose();}}
 f.updateWorldMatrix(true,true);const wall=rear[0],oldBox=new T.Box3().setFromObject(wall),matches=kit.colliders.filter(b=>b.min.distanceTo(oldBox.min)<1e-6&&b.max.distanceTo(oldBox.max)<1e-6);if(matches.length!==1)throw Error('Yanshou rear collision source must be unique');
 const boxes=[],surfaces=[],tag=(m,role)=>{m.name=role;Object.assign(m.userData,{role,yanshouCompound:true,source:SOURCE,image:'https://img.dpm.org.cn/Uploads/Picture/dc/8365.jpg',precision:'SOURCE_TOPOLOGY_MODEL_FIT_NOT_SURVEYED',acceptedWholeObject:false});return m;};
 const block=(role,mat,w,h,d,x,y,z)=>{const m=tag(c.box(role,mat,w,h,d,x,y,z,false),role);boxes.push(m);return m;};
 // Split all three old visible rear layers together; preserve their materials.
 kit.colliders.splice(kit.colliders.indexOf(matches[0]),1);
 for(const m of rear){const q=m.geometry.parameters;for(const [lo,hi]of [[-q.width/2,cut[0]],[cut[1],q.width/2]])if(hi>lo)block(m.name+'-retained-side',m.material,hi-lo,q.height,q.depth,(lo+hi)/2,m.position.y,m.position.z);if(m===wall)block(m.name+'-connection-head',m.material,cut[1]-cut[0],g.h-.35-3.1,.25,center,g.y+3.1+(g.h-.35-3.1)/2,z0);m.removeFromParent();m.geometry.dispose();}
 const top=g.y,H=3.5;
 // Closed stone/timber solids supply their own visible top, no courtyard plane.
 const floor=(role,x0,x1,a,b)=>{const m=block(role,'stone',x1-x0,.4,b-a,(x0+x1)/2,.2,(a+b)/2);m.userData.yanshouWalkable=true;return m;};
 floor('yanshou-rear-floor',-A,A,z1,z2);floor('yanshou-connector-floor',cut[0],cut[1],z0,z1);
 block('yanshou-rear-north-wall','wall',g.w,H,.25,0,top+H/2,z2-.125);
 block('yanshou-rear-west-wall','wall',.25,H,4,A-.125,top+H/2,(z1+z2)/2);
 // East flower window is a closed source panel; its detailed pattern is unknown.
 const wx=-A+.125,wz=(z1+z2)/2,ww=1.35,wh=1.65,wy=top+1.05+wh/2;
 for(const [a,b]of [[z1,wz-ww/2],[wz+ww/2,z2]])block('yanshou-rear-east-wall','wall',.25,H,b-a,wx,top+H/2,(a+b)/2);
 block('yanshou-flower-window-sill-wall','wall',.25,1.05,ww,wx,top+.525,wz);block('yanshou-flower-window-head-wall','wall',.25,H-2.70,ww,wx,top+2.70+(H-2.70)/2,wz);
 block('yanshou-flower-window-closed-panel','dark',.15,wh,ww,wx,wy,wz);
 for(const side of[-1,1]){block('yanshou-flower-window-brick-jamb','stone',.31,wh+.20,.10,wx,wy,wz+side*(ww/2+.05));block('yanshou-flower-window-brick-crosspiece','stone',.31,.10,ww+.20,wx,wy+side*(wh/2+.05),wz);}
 // Rear south wall is deliberately plain where no facade photograph is known.
 for(const [a,b]of [[-A,cut[0]],[cut[1],A]])block('yanshou-rear-south-wall','wall',b-a,H,.25,(a+b)/2,top+H/2,z1+.125);
 block('yanshou-rear-connector-head','timber',2.5,H-2.85,.25,center,top+2.85+(H-2.85)/2,z1+.125);
 // East-side outer courtyard wall and east secondary-bay roofed passage.
 block('yanshou-east-court-wall','wall',.25,H,4,-A+.125,top+H/2,(z0+z1)/2);
 block('yanshou-connector-east-wall','wall',.16,2.85,4,cut[0]+.08,top+1.425,(z0+z1)/2);
 const doorCenter=(z0+z1)/2,doorHalf=1.1,xDoor=cut[1]-.08;
 for(const [a,b]of [[z0,doorCenter-doorHalf],[doorCenter+doorHalf,z1]])block('yanshou-connector-court-panel','timber',.16,2.85,b-a,xDoor,top+1.425,(a+b)/2);
 block('yanshou-connector-court-head','timber',.16,.25,2.2,xDoor,top+2.975,doorCenter);
 // Four open leaves are a viewing pose, not a claim about current access.
 for(const side of[-1,1])for(let i=0;i<2;i++)block('yanshou-connector-open-leaf','timber',.48,2.85,.08,xDoor-.24,top+1.425,doorCenter+side*(doorHalf-.055-i*.09));
 for(let i=0;i<2;i++){const h=(2-i)*top/3,m=block('yanshou-court-visible-step','stone',.32,h,1.6,cut[1]+(i+.5)*.32,h/2,doorCenter);m.userData.yanshouWalkable=true;}
 // Existing garden west wall already encloses this side: no unsourced second wall.
 // Dedicated roof callbacks reuse the existing real gray roll construction.
 for(const [id,opts]of [['rear',{w:g.w,d:4.2,yy:top+H,rise:1.10,z:(z1+z2)/2}],['connector',{w:2.5,d:4.15,yy:top+3.1,rise:.65,z:(z0+z1)/2}]]){const start=f.children.length;roof(c,{...opts,material:'grey_tile',trim:'grey_tile',hard:true,key:'yanshou-'+id});const nodes=f.children.slice(start);if(id==='connector')for(const m of nodes)m.position.x+=center;for(const [mesh,m]of nodes.entries()){tag(m,m.name);m.userData.yanshouRoof={id,mesh};}surfaces.push({id,nodes});}
 for(const m of boxes)if(m.userData.yanshouWalkable){const h=m.geometry.parameters.height,p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.max(0,Math.min(h,p.getY(i)+h/2)));m.position.y=0;}
 kit.root.updateWorldMatrix(true,true);const inv=kit.root.matrixWorld.clone().invert();const point=(m,p,i)=>{const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld));v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);};
 for(const [index,m]of boxes.entries()){const p=m.geometry.attributes.position,b=new T.Box3();for(let i=0;i<p.count;i++)b.expandByPoint(point(m,p,i));b.yanshouCompound={kind:'visible-box',index,role:m.name};m.userData.yanshouBox=index;kit.colliders.push(b);if(m.userData.yanshouWalkable){const box=b.clone();box.min.y=box.max.y;kit.walkables.push({type:'box',box,rescue:false});}}
 for(const {id,nodes}of surfaces){const faces=[];for(const [mesh,m]of nodes.entries()){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3)faces.push({source:{mesh,triangle:i/3},vertices:[0,1,2].map(k=>point(m,p,ix?ix.getX(i+k):i+k))});}const surface=createXiqingSurface(faces,'yanshou-'+id+'-roof'),box=surface.box.clone();box.xiqingRoofSurface=surface;box.yanshouCompound={kind:'visible-surface',id};kit.colliders.push(box);}
 const anchor=kit.colliders.find(b=>b.yanshouCompound?.role==='yanshou-connector-floor'),scope={kind:'yanshou-compound',id:'yanshou-compound',minOffsetX:YANSHOU_COMPOUND_REGION.minX-anchor.min.x,maxOffsetX:YANSHOU_COMPOUND_REGION.maxX-anchor.min.x,minOffsetZ:YANSHOU_COMPOUND_REGION.minZ-anchor.min.z,maxOffsetZ:YANSHOU_COMPOUND_REGION.maxZ-anchor.min.z};validateYanshouCompoundScope(scope,anchor,YANSHOU_COMPOUND_REGION);anchor.furnitureMotionScope=scope;
 g.yanshouCompound={acceptedWholeObject:false,source:SOURCE,rearHouse:{bays:3,depthBays:1,worldZ:[94.5,98.5]},connector:{side:'east',worldX:280.3+center,width:2.5},courtyard:{covered:false,worldZ:[90.5,94.5],ground:'EXISTING_ENVIRONMENT'},interiorInventory:'UNKNOWN',sourceBoundingPrecision:'MODEL_FIT_NOT_SURVEYED',unverified:['rear facade leaf pattern','interior screens and exact finish','GPU visual and performance']};
 g.navigation={...(g.navigation??{}),compoundRoutes:[{id:'yanshou-front-to-rear',points:[[280.3,88],[280.3+center,88],[280.3+center,96.5]].map(([x,z])=>({x,y:Math.fround(top),z}))},{id:'yanshou-connector-to-courtyard',points:[{x:280.3+center,y:Math.fround(top),z:92.5},{x:281.3,y:0,z:92.5}]}]};
 frontRooms[0].doors.push({x:Math.round((280.3+center)*100)/100,z:90.5});
 c.register('延寿堂·穿廊',cut[0]+.18,cut[1]-.18,z0+.13,z1-.13,Math.fround(top),2.75,[{x:center,z:z0},{x:center,z:z1},{x:xDoor,z:doorCenter}],{x:center,z:doorCenter});
 c.register('延寿堂·后房',-A+.3,A-.3,z1+.3,z2-.3,Math.fround(top),H-.2,[{x:center,z:z1}],{x:center,z:z1+1.2});
}
