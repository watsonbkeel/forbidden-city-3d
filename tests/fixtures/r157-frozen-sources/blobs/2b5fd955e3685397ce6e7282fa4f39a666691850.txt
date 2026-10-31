import * as THREE from 'three';
const ROLE='r67-ningshou-south-three-transom-straight-window';
// Only six closed south bays are localized by the official front photograph.
// East secondary doorway/sidelights, rear and interior remain untouched.
export function fitNingshouSouthPhotoWindows(c){
 const{p,f,kit,mats}=c;if(p.key!=='ningshou'||p.id!=='place-ningshou-e66dfe768f'||p.localW!==48.8||p.localD!==19.7||f.position.x!==-294.5||f.position.z!==319.1||f.rotation.y!==0||f.userData.r67SouthWindows)throw Error('NingShou south window exact identity/duplicate mismatch');
 const z=-p.localD/2+p.gallery,bay=p.localW/7,windows=f.children.filter(m=>m.isMesh&&m.userData.role==='window-backing'&&Math.abs(m.position.z-z)<1e-8&&m.geometry.parameters?.width>bay*.8);if(windows.length!==6)throw Error('NingShou six south closed bays drift');
 const rows=windows.map(back=>{const w=back.geometry.parameters.width+.13,h=back.geometry.parameters.height,x=back.position.x,y=back.position.y;const old=f.children.filter(m=>m.isMesh&&['straight-mullion','window-crossbar','window-frame'].includes(m.userData.role)&&Math.abs(m.position.z-z)<.13&&Math.abs(m.position.x-x)<w/2+.02&&m.position.y>=y-h/2-.1&&m.position.y<=y+h/2+.1);if(old.filter(m=>m.userData.role==='window-frame').length!==4||old.filter(m=>m.userData.role==='window-crossbar').length!==2)throw Error('NingShou window bars drift');return{back,w,h,x,y,old}});
 // Validate all hosts before mutating anything. Existing backing/collider stays.
 for(const{w,h,x,y,old}of rows){
  const positions=[],normals=[],uvs=[];let bars=0;
  const bar=(ww,hh,xx,yy,depth=.12)=>{const indexed=new THREE.BoxGeometry(ww,hh,depth),g=indexed.toNonIndexed();indexed.dispose();g.translate(xx,yy,0);positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uvs.push(...g.attributes.uv.array);g.dispose();bars++};
  const left=-w/2+.045,right=w/2-.045,bottom=-h/2,top=h/2,split=top-h*.2,leaf=(right-left)/3;
  for(const yy of[bottom,split,top])bar(w,.075,0,yy);
  for(let k=0;k<=3;k++)bar(.075,h,left+k*leaf,0);
  // Lower straight bars, with short horizontal fields at top and foot. Cell
  // pitch and all dimensions are reversible visual fits, not carved replicas.
  for(let k=0;k<3;k++){const cx=left+(k+.5)*leaf;for(let j=1;j<10;j++)bar(.027,split-bottom,cx-leaf/2+j*leaf/10,(split+bottom)/2,.1);for(const t of[.12,.22,.78,.88])bar(leaf,.028,cx,bottom+(split-bottom)*t,.1);
   const ty=(split+top)/2,th=top-split;for(let j=1;j<8;j++)bar(.021,th,cx-leaf/2+j*leaf/8,ty,.1);for(const t of[.25,.5,.75])bar(leaf,.021,cx,split+th*t,.1);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  for(const m of old){m.removeFromParent();m.geometry.dispose()}
  const mesh=kit.mesh(f,geo,mats.red,x,y,z-.075);mesh.name=ROLE;mesh.userData={role:ROLE,r67NingshouFrontWindow:true,transomCount:3,lowerLeafCount:3,barCount:bars,status:'PHOTO_FIT_NOT_SURVEY',measured:false,exactCarving:false,photographyDate:null,source:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efef763d2b82.jpg',sourcePage:'https://www.dpm.org.cn/explore/building/236471.html',retainedEnvelope:true,scope:'SIX_SOUTH_CLOSED_BAYS_ONLY__NOT_EAST_DOOR_SIDELIGHTS_OR_REAR',physics:'UNCHANGED_BACKING_AND_COLLIDERS'};
 }
 f.userData.r67SouthWindows={count:6,accepted:false,dimensionsStatus:'PHOTO_FIT_NOT_SURVEY',residual:'Door bay, gold carved frieze, full original joinery, exact color and scale unverified'};
}
