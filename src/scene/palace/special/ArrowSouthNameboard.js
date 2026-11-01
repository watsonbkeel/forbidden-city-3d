// Removing a demonstrably unsupported generic centre label is safer than
// inventing coordinates for the photographed column-mounted museum sign.
// Evidence describes the selected published-photo state, not a live 2026 visit.
export const ARROW_CENTRAL_NAMEBOARD_REMOVAL=Object.freeze({
  entityId:'FC-AF36D75128',role:'arrow-unsupported-central-nameboard-removal',
  source:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg',
  sourceSha256:'e7f98442e7236e082d9713e9572d3576c3148314c07cdbd1135304c5309c6225',
  corroboration:'https://www.dpm.org.cn/buildvideo/detail/259665.html',
  corroborationSeconds:144,corroborationPublication:'2023-05-09 14:27',
  captureDate:null,photographedStateOnly:true,
  visualAcceptance:'VERIFY_PENDING',wholeObjectAccepted:false,
  removedText:'箭亭',replacementSign:'NONE_UNLOCATED_WUBEI_GALLERY_SIGN_NOT_FABRICATED',
});
const MARKER='arrowCentralNameboardRemoval';
const fail=reason=>{throw Error('Arrow central nameboard '+reason);};
const near=(a,b)=>Math.abs(a-b)<1e-7;
const at=(o,x,y,z)=>near(o.position.x,x)&&near(o.position.y,y)&&near(o.position.z,z)&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.x===1&&o.scale.y===1&&o.scale.z===1;

/** Must run before buildPlaqueAtlas/finish. Zero new resources. The exact old
 * label and border leave the atlas queue and scene together; a mutation-phase
 * exception restores original parents/order/registration before any disposal.
 * Retirement notifications run AFTER commit. Their aggregated errors carry
 * committed=true, cleanupPhase and result; they never imply mutation rollback.
 * Independent source commit provides the persistent rollback checkpoint.
 */
export function removeArrowUnsupportedCentralNameboard(kit,frame,item){
  const expected={name:'箭亭',kind:'hall',structure:'enclosed-pavilion',enclosureProfile:'arrow-enclosed-gallery-fit-v1',x:-154.7,z:78.8,w:31.5,d:17.6,colH:8,ph:.9,pad:1,bays:5,roof:'xieshan',enter:true,open:false};
  if(!item||Object.entries(expected).some(([k,v])=>item[k]!==v)||(item.rot!==undefined&&item.rot!==0))fail('requires exact retained identity and envelope');
  if(!frame?.isGroup||!Array.isArray(kit?.plaques)||!Array.isArray(kit?.owned)||frame.parent!==kit.root||!at(frame,item.x,0,item.z))fail('requires exact retained kit and host');
  if(frame.userData[MARKER])fail('already removed');
  const records=kit.plaques.filter(p=>p.text==='箭亭'&&p.mesh?.parent===frame&&p.frame?.parent===frame);
  if(records.length!==1)fail('requires one exact source plaque record');
  const record=records[0],face=record.mesh,border=record.frame,fg=face.geometry,bg=border.geometry;
  if(!face.isMesh||!border.isMesh||face.material!==null||border.material!==kit.gold||face.children.length||border.children.length||
    !at(face,0,6.95,-9.1)||!at(border,0,6.95,-9.04)||face.castShadow!==false||border.castShadow!==false||
    fg?.type!=='PlaneGeometry'||!near(fg.parameters.width,1.32)||!near(fg.parameters.height,2.2)||
    bg?.type!=='BoxGeometry'||!near(bg.parameters.width,1.44)||!near(bg.parameters.height,2.32)||!near(bg.parameters.depth,.1))fail('requires unaltered pre-atlas face and border host');
  const children=[...frame.children],plaques=[...kit.plaques],index=kit.plaques.indexOf(record),priorMarker=frame.userData[MARKER],hadMarker=Object.hasOwn(frame.userData,MARKER);
  const result={...ARROW_CENTRAL_NAMEBOARD_REMOVAL,removedMeshes:2,removedTriangles:14,removedAtlasRecords:1};
  try{
    frame.remove(face,border);kit.plaques.splice(index,1);frame.userData[MARKER]=result;
  }catch(error){
    // Parent restoration also covers Object3D removal listeners throwing AFTER
    // a genuine detach. Restore original array objects and ordering exactly.
    for(const child of children)if(child.parent!==frame){child.parent=frame;}
    frame.children.splice(0,frame.children.length,...children);kit.plaques.splice(0,kit.plaques.length,...plaques);
    if(hadMarker)frame.userData[MARKER]=priorMarker;else delete frame.userData[MARKER];
    throw error;
  }
  // Both objects and their atlas entry are already removed. Always attempt
  // both retired resources; a throwing callback cannot strand its sibling.
  const cleanupErrors=[];
  for(const geometry of[fg,bg])try{geometry.dispose();}catch(error){cleanupErrors.push(error);}
  if(cleanupErrors.length){
    const error=new AggregateError(cleanupErrors,'Arrow central nameboard removal committed; retired geometry cleanup failed',{cause:cleanupErrors[0]});
    Object.assign(error,{code:'ARROW_NAMEBOARD_COMMITTED_CLEANUP_ERROR',committed:true,cleanupPhase:'RETIRED_GEOMETRY_AFTER_COMMIT',result});
    throw error;
  }
  return result;
}
