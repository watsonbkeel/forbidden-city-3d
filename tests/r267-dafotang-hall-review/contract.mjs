export const LABEL='R268大佛堂西侧曲缘核验 · 隔离真实单堂 · 非导航/碰撞验收';
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
 need(/^[a-f0-9]{40}$/.test(r.identity?.head??'')&&/^[a-f0-9]{40}$/.test(r.identity?.tree??'')&&r.identity.parent==='ace60ddae07be572b7b3d9e612875254e1a025fa'&&r.identity.parentTree==='b145b9525b10c93a287ce4099a3068bd3526ac7b'&&r.identity.productTree==='6257174107a7b156c42c70f1ee9bc9655dbbf9de'&&r.identity.tree!==r.identity.productTree&&r.identity.tree!==r.identity.parentTree,'frozen source identity missing');
 need(r.physicsConsumer==='NONE','not a navigation review');
 need(r.source?.layoutOwners===85&&r.source?.upperBandOwners===1&&r.source?.westBandOwners===1&&r.source?.principalSupports===3&&JSON.stringify(r.source?.subjects)===JSON.stringify(['amitabha','shakyamuni','bhaisajyaguru']),'original source owners missing');
 const rows=r.source.owner87,isUUID=v=>typeof v==='string'&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v);
 need(Array.isArray(rows)&&rows.length===87&&new Set(rows.map(o=>o.uuid)).size===87,'87 distinct actual source owners required');
 for(const row of rows){
  need(['layout','central','west'].includes(row.kind)&&isUUID(row.uuid)&&isUUID(row.geometryUuid)&&isUUID(row.materialUuid)&&Number.isInteger(row.geometryTriangles)&&row.geometryTriangles>0,'invalid source owner');
  const prefix=row.kind==='layout'?'dafotang-historic-spatial-fit-v1':'dafotang-upper-'+row.kind+'-band-partial-fit-v1';
  need(typeof row.role==='string'&&row.role.length>0&&row.name===prefix+'/'+row.role&&row.contact?.count===1&&row.contact.meshUuid===row.uuid&&row.contact.role===row.role&&row.contact.id===row.name+'/'+row.uuid,'source/contact owner identity changed');
 }
 const layout=rows.filter(o=>o.kind==='layout'),central=rows.filter(o=>o.kind==='central'),west=rows.filter(o=>o.kind==='west'),beams=layout.filter(o=>o.role==='upper-front-entablature');
 need(layout.length===85&&central.length===1&&west.length===1&&beams.length===1,'owner roles missing or duplicated');
 for(const row of[central[0],west[0]])need(row.role===row.kind+'-band'&&row.noMerge===true&&row.material==='dafotang_layout_plain_gold_fit'&&row.materialUuid===beams[0].materialUuid,'retained shared band material/role changed');
 const proof=r.source.westContact;
 need(west[0].geometryTriangles===292&&proof?.meshUuid===west[0].uuid&&proof.geometryUuid===west[0].geometryUuid&&proof.triangleCount===292&&proof.trianglesMatch===true&&proof.boxMatches===true&&JSON.stringify(proof.offset)==='[221.9,0,241.1]','actual west triangle contact evidence missing');
 need(r.finish?.method==='REAL_COURTKIT_FINISH'&&r.finish.upperBandLeaves===1&&r.finish.westBandLeaves===1&&Array.isArray(r.finish.bandLeaves)&&r.finish.bandLeaves.length===2,'real finish band evidence missing');
 for(const before of[central[0],west[0]]){const found=r.finish.bandLeaves.filter(o=>o.kind===before.kind);need(found.length===1,'duplicate or missing finished band');const after=found[0];need(after.uuid===before.uuid&&after.geometryUuid===before.geometryUuid&&after.materialUuid===before.materialUuid&&['sameMesh','sameGeometry','sameMaterial','sameContact','noMerge','visible','materialVisible'].every(k=>after[k]===true),'real finish lost or replaced a source band');}
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
