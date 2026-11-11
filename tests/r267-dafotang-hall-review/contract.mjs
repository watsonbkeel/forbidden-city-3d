export const LABEL='R266大佛堂外观核验 · 隔离真实单堂 · 非导航/碰撞验收';
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
 need(/^[a-f0-9]{40}$/.test(r.identity?.head??'')&&/^[a-f0-9]{40}$/.test(r.identity?.tree??'')&&r.identity.parent==='aa11a2b92fcd858581397bac58c4ac637e04ed57'&&r.identity.productTree==='8ac63f05ae9c968ab00d1b52711cff30144c4290','frozen source identity missing');
 need(r.physicsConsumer==='NONE','not a navigation review');
 need(r.source?.layoutOwners===85&&r.source?.upperBandOwners===1&&r.source?.principalSupports===3&&JSON.stringify(r.source?.subjects)===JSON.stringify(['amitabha','shakyamuni','bhaisajyaguru']),'original source owners missing');
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
