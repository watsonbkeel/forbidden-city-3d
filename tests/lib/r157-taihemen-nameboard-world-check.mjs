// Pure consumer of the existing world; no building, repairing, teleporting,
// texture generation or support registration is performed here.
import assert from 'node:assert/strict';import * as T from 'three';
function visible(h){for(let o=h.object;o;o=o.parent)if(!o.visible)return false;const m=h.object.material;return !Array.isArray(m)&&m.visible!==false&&(!m.transparent||m.opacity>0);}
export function assertTaihemenNameboardFrameInWorld(W){
 assert.ok(W?.scene,'Pass an existing world.scene');const root=W.scene.getObjectByName('太和门');assert.ok(root,'Taihemen frame host missing');root.updateWorldMatrix(true,true);
 const plaque=root.children.find(m=>m.isMesh&&m.userData.taihemenFrame),p=plaque?.userData.taihemenFrame;assert.ok(p,'Taihemen frame profile missing');
 assert.equal(p.entityId,'FC-B3B12CF397');assert.equal(p.accepted,false);assert.equal(p.sourceText,'太和門');assert.equal(p.modelText,'太和门');assert.match(p.textMatchStatus,/UNMATCHED/);
 assert.equal(root.userData.architecture.filter(r=>r.id==='axis/taihemen-nameboard-frame').length,1);
 const meshes=name=>root.children.filter(m=>m.isMesh&&m.material?.name===name);
 assert.equal(meshes('taihemen-nameboard-red').length,1);assert.equal(meshes('taihemen-nameboard-gold').length,1);
 const direction=new T.Vector3(0,0,-1).transformDirection(plaque.matrixWorld),h=p.oldDimensions.height,d=p.oldDimensions.depth;
 const samples=[[-.43,.445,'red'],[.43,.445,'red'],[-.30,0,'red'],[.30,0,'red'],[0,-.47,'red'],[-.218,.025,'gold'],[.218,.025,'gold']];
 for(const[x,y,kind]of samples){const origin=plaque.localToWorld(new T.Vector3(x*h,y*h,d/2+.02));const hit=new T.Raycaster(origin,direction,0,.05).intersectObject(root,true).filter(visible)[0];assert.equal(hit?.object.material.name,'taihemen-nameboard-'+kind,'visible '+kind+' frame surface absent');}
 const image=plaque.material.map?.image;assert.ok(image&&image.width===256&&image.height===p.textureSize.height,'original visible text field missing');
 const uv=plaque.geometry.attributes.uv;for(let i=0;i<uv.count;i++)assert.ok(Number.isFinite(uv.getX(i))&&uv.getX(i)>=28/image.width-1e-7&&uv.getX(i)<=1-28/image.width+1e-7&&uv.getY(i)>=28/image.height-1e-7&&uv.getY(i)<=1-28/image.height+1e-7,'blue field UV crops outside original characters');
 // In-range alone permits collapsed, mirrored or vertically flipped text.
 // Bind all four actual visible front corners to the original blue-field UV
 // affine map; do not trust metadata saying that characters were retained.
 const positions=plaque.geometry.attributes.position,normals=plaque.geometry.attributes.normal;
 assert.ok(positions&&normals&&uv.count===positions.count,'visible text UV/vertex layout missing');let textUVCorners=0;
 const u0=28/image.width,v0=28/image.height,us=1-2*u0,vs=1-2*v0;
 for(let i=0;i<positions.count;i++)if(normals.getZ(i)>.999){
  const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
  assert.ok(Math.abs(Math.abs(x)-p.panel.width/2)<1e-5&&Math.abs(Math.abs(y-p.panel.centreY)-p.panel.height/2)<1e-5&&Math.abs(z-d/2)<1e-5,'visible text UV front corner absent');
  const u=u0+(x/p.panel.width+.5)*us,v=v0+((y-p.panel.centreY)/p.panel.height+.5)*vs;
  assert.ok(Math.abs(uv.getX(i)-u)<1e-6&&Math.abs(uv.getY(i)-v)<1e-6,'visible text UV direction/span or vertex mapping changed');textUVCorners++;
 }
 assert.equal(textUVCorners,4,'four visible text UV corners required');
 let textSightlines=0;for(const fraction of[-.25,0,.25]){
  const target=plaque.localToWorld(new T.Vector3(0,p.panel.centreY+fraction*p.panel.height,d/2)),eye=new T.Vector3(root.position.x,1.7,-270),delta=target.clone().sub(eye);
  const hit=new T.Raycaster(eye,delta.clone().normalize(),0,delta.length()+.05).intersectObject(root,true).filter(visible)[0];assert.ok(hit?.object===plaque,'visible front text sightline blocked by frame or roof');textSightlines++;
 }
 // Recheck actual current merged roof surfaces, not the profile's old values.
 const center=plaque.getWorldPosition(new T.Vector3()),height=h*p.scale,halfWidth=p.outerWidth*p.scale/2;
 const roofNames={down:['roof_tile','roof_tile_material'],up:['rafters','rafters_material','roof_soffit','roof_soffit_material']};let gap=Infinity,roofSurfaceProbes=0;
 for(const x of[-halfWidth,0,halfWidth])for(const dz of[-d/2,d/2])for(const[dir,names]of[[-1,roofNames.down],[1,roofNames.up]]){
  const hit=new T.Raycaster(new T.Vector3(center.x+x,center.y,center.z+dz),new T.Vector3(0,dir,0),0,20).intersectObject(root,true).filter(h=>visible(h)&&names.includes(h.object.material.name))[0];
  assert.ok(hit,'visible frame/roof clearance surface missing');const g=dir<0?center.y-height/2-hit.point.y:hit.point.y-center.y-height/2;assert.ok(g>=.03-1e-5,'frame intersects current roof surface');gap=Math.min(gap,g);roofSurfaceProbes++;
 }
 // Separate geometric existence from player-ground visibility: the retained
 // recessed mount/upper rafters currently occlude both top wings. Do not turn
 // near-plane surface probes into a false whole-silhouette visibility claim.
 const groundEye=new T.Vector3(root.position.x,1.7,-270),groundFrameSightlines=samples.map(([x,y,kind])=>{
  const target=plaque.localToWorld(new T.Vector3(x*h,y*h,d/2)),delta=target.clone().sub(groundEye);
  const hit=new T.Raycaster(groundEye,delta.clone().normalize(),0,delta.length()+.05).intersectObject(root,true).filter(visible)[0];
  return{x,y,expectedMaterial:'taihemen-nameboard-'+kind,firstMaterial:hit?.object.material.name??null,visible:hit?.object.material.name==='taihemen-nameboard-'+kind};
 });
 return{frameSurfaceProbes:samples.length,textSightlines,textUVCorners,roofSurfaceProbes,minimumRoofGap:gap,groundFrameSightlines,
  wholeFrameGroundVisible:groundFrameSightlines.every(r=>r.visible),status:'PARTIAL_FRAME_GEOMETRY_TOP_WINGS_OCCLUDED_AT_RETAINED_MOUNT_BROWSER_PENDING'};
}
