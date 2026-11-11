export const LABEL='R270大佛堂四处短垂头核验 · 隔离真实单堂 · 非导航/碰撞验收';
export const SETTINGS=Object.freeze({width:1280,height:800,dpr:1,quality:'high',textureQuality:'hd',date:'2026-11-11T04:00:00.000Z',toneMapping:'ACESFilmicToneMapping',exposure:.7,postProcessing:'DISABLED_DECLARED'});
// Hall-local coordinates. +X is west. These are review cameras, never player routes.
export const VIEWS=Object.freeze([
 {id:'front-whole-hall',label:'正面全景',position:[0,4.4,-6.8],target:[0,4.4,4.5],fov:72},
 {id:'central-band-plaque',label:'中部上带与主匾',position:[0,6.7,.7],target:[0,6.7,4.44],fov:55},
 {id:'translated-west',label:'西侧平移斜视',position:[2.5,6.3,.7],target:[0,6.5,4.44],fov:58},
 {id:'translated-east',label:'东侧平移斜视',position:[-2.5,6.3,.7],target:[0,6.5,4.44],fov:58},
].map(v=>Object.freeze({...v,position:Object.freeze(v.position),target:Object.freeze(v.target)})));
const need=(value,message)=>{if(!value)throw Error(message);};
export function requireReady(r){
 need(/^[a-f0-9]{40}$/.test(r.identity?.head??'')&&/^[a-f0-9]{40}$/.test(r.identity?.tree??'')&&r.identity.parent==='27229692bd1edb816fa3460cb94ee7a51579d8af'&&r.identity.parentTree==='056398ec0b85683a98eeea2587b8b7743d6ba435'&&r.identity.productTree==='465f31eac10df9731bb89936a0f93c0daed529e0'&&r.identity.tree!==r.identity.productTree&&r.identity.tree!==r.identity.parentTree,'frozen source identity missing');
 need(r.physicsConsumer==='NONE','not a navigation review');
 need(r.source?.layoutOwners===85&&r.source?.upperBandOwners===1&&r.source?.westBandOwners===1&&r.source?.eastBandOwners===1&&r.source?.upperPendantOwners===4&&r.source?.principalSupports===3&&JSON.stringify(r.source?.subjects)===JSON.stringify(['amitabha','shakyamuni','bhaisajyaguru']),'original source owners missing');
 const rows=r.source.owner92,isUUID=v=>typeof v==='string'&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v);
 need(Array.isArray(rows)&&rows.length===92&&new Set(rows.map(o=>o.uuid)).size===92,'92 distinct actual source owners required');
 for(const row of rows){
  need(['layout','central','west','east','pendant'].includes(row.kind)&&isUUID(row.uuid)&&isUUID(row.geometryUuid)&&isUUID(row.materialUuid)&&Number.isInteger(row.geometryTriangles)&&row.geometryTriangles>0,'invalid source owner');
  const prefix=row.kind==='layout'?'dafotang-historic-spatial-fit-v1':row.kind==='pendant'?'dafotang-upper-pendants-partial-fit-v1':'dafotang-upper-'+row.kind+'-band-partial-fit-v1';
  need(typeof row.role==='string'&&row.role.length>0&&row.name===prefix+'/'+row.role&&row.contact?.count===1&&row.contact.meshUuid===row.uuid&&row.contact.role===row.role&&row.contact.id===row.name+'/'+row.uuid,'source/contact owner identity changed');
 }
 const layout=rows.filter(o=>o.kind==='layout'),central=rows.filter(o=>o.kind==='central'),west=rows.filter(o=>o.kind==='west'),east=rows.filter(o=>o.kind==='east'),pendants=rows.filter(o=>o.kind==='pendant'),beams=layout.filter(o=>o.role==='upper-front-entablature');
 need(layout.length===85&&central.length===1&&west.length===1&&east.length===1&&pendants.length===4&&beams.length===1,'owner roles missing or duplicated');
 for(const row of[central[0],west[0],east[0]])need(row.role===row.kind+'-band'&&row.noMerge===true&&row.material==='dafotang_layout_plain_gold_fit'&&row.materialUuid===beams[0].materialUuid,'retained shared band material/role changed');
 need(central[0].geometryTriangles===580,'retained central geometry changed');
 const proof=r.source.westContact;
 need(west[0].geometryTriangles===292&&proof?.meshUuid===west[0].uuid&&proof.geometryUuid===west[0].geometryUuid&&proof.triangleCount===292&&proof.trianglesMatch===true&&proof.boxMatches===true&&JSON.stringify(proof.offset)==='[221.9,0,241.1]','actual west triangle contact evidence missing');
 const ep=r.source.eastContact;
 need(east[0].geometryTriangles===196&&ep?.meshUuid===east[0].uuid&&ep.geometryUuid===east[0].geometryUuid&&ep.triangleCount===196&&ep.indexCount===588&&ep.positionCount===392&&ep.trianglesMatch===true&&ep.boxMatches===true&&JSON.stringify(ep.offset)==='[221.9,0,241.1]','actual east triangle contact evidence missing');
 need(r.finish?.method==='REAL_COURTKIT_FINISH'&&r.finish.upperBandLeaves===1&&r.finish.westBandLeaves===1&&r.finish.eastBandLeaves===1&&Array.isArray(r.finish.bandLeaves)&&r.finish.bandLeaves.length===3,'real finish band evidence missing');
 for(const before of[central[0],west[0],east[0]]){const found=r.finish.bandLeaves.filter(o=>o.kind===before.kind);need(found.length===1,'duplicate or missing finished band');const after=found[0];need(after.uuid===before.uuid&&after.geometryUuid===before.geometryUuid&&after.materialUuid===before.materialUuid&&['sameMesh','sameGeometry','sameMaterial','sameContact','noMerge','visible','materialVisible'].every(k=>after[k]===true),'real finish lost or replaced a source band');}
 const specs=[['west-outer',52,156],['west-inner',48,144],['east-inner',48,144],['east-outer',52,156]];
 need(Array.isArray(r.source.pendantContacts)&&r.source.pendantContacts.length===4&&r.finish.upperPendantLeaves===4&&Array.isArray(r.finish.pendantLeaves)&&r.finish.pendantLeaves.length===4,'four actual pendant contact/finish proofs required');
 for(const[role,triangles,vertices]of specs){
  const found=pendants.filter(row=>row.role===role),proofs=r.source.pendantContacts.filter(row=>row.role===role),finished=r.finish.pendantLeaves.filter(row=>row.role===role);need(found.length===1&&proofs.length===1&&finished.length===1,'four distinct pendant roles required');const before=found[0],proof=proofs[0],after=finished[0];
  need(before.noMerge===true&&before.material==='dafotang_layout_plain_gold_fit'&&before.materialUuid===beams[0].materialUuid&&before.geometryTriangles===triangles,'pendant shared material/geometry changed');
  need(proof.meshUuid===before.uuid&&proof.geometryUuid===before.geometryUuid&&proof.triangleCount===triangles&&proof.indexCount===vertices&&proof.positionCount===vertices&&proof.trianglesMatch===true&&proof.boxMatches===true&&JSON.stringify(proof.offset)==='[221.9,0,241.1]','actual pendant triangle/world contact evidence missing');
  need(after.kind==='pendant'&&after.uuid===before.uuid&&after.geometryUuid===before.geometryUuid&&after.materialUuid===before.materialUuid&&['sameMesh','sameGeometry','sameMaterial','sameContact','noMerge','visible','materialVisible','geometryValuesUnchanged','trianglesMatch','boxMatches'].every(k=>after[k]===true),'real finish lost/replaced/modified a pendant');
 }
 const source88=r.finish.retainedSource88;need(Array.isArray(source88)&&source88.length===88,'retained source88 evidence required');
 for(const before of rows.filter(row=>row.kind!=='pendant')){const found=source88.filter(row=>row.uuid===before.uuid);need(found.length===1,'source88 identity missing or duplicated');const after=found[0];need(after.kind===before.kind&&after.role===before.role&&after.geometryUuid===before.geometryUuid&&after.materialUuid===before.materialUuid&&after.meaning==='SOURCE_REFERENCE_UNCHANGED_NOT_FINAL_MESH_RETENTION'&&['sameMesh','sameGeometry','sameMaterial','sameContact','geometryValuesUnchanged'].every(k=>after[k]===true),'original source88 reference/value changed');}
 need(r.textures?.manifest===true&&r.textures.fallbacks.length===0&&r.textures.missingNormals.length===0&&r.textures.errors.length===0,'actual texture load incomplete');
 need(r.plaque?.status==='ready'&&r.plaque.leaves===2&&r.plaque.visible===true,'actual retained plaque not ready');
 need(r.fonts?.status==='loaded'&&r.fonts.cjk===true,'CJK fonts not ready');
 need(r.gl?.lost===false&&r.draw?.calls>0&&r.draw?.triangles>1000,'real WebGL drawing not ready');
 return true;
}
export function requireCaptureSet(rows){
 need(rows.length===VIEWS.length,'four unique captures required');
 for(const v of VIEWS){const matches=rows.filter(r=>r.id===v.id);need(matches.length===1,'missing/duplicate capture '+v.id);const r=matches[0];need(r.file===v.id+'.png'&&r.bytes>0&&r.width===1280&&r.height===800&&/^[a-f0-9]{64}$/.test(r.sha256),'invalid PNG receipt '+v.id);}
 return true;
}
