import {qianqingVisibleSignatures} from './QianqingAuxiliarySignature.js';
import {QIANQING_AUXILIARY_MESHES,QIANQING_AUXILIARY_ASSET_SHA256} from './QianqingAuxiliaryManifest.js';
import * as THREE from 'three';
import {QIANQING_CENTRAL} from '../palace/QianqingCentralSetting.js';
const close=(a,b)=>Math.abs(a-b)<1e-5;
/** The S overlay may provide the retained floor/ceiling/ornaments, but cannot
 * reintroduce its obsolete central platform/screen over the permanent core. */
export function validateQianqingAuxiliary(root,cfg,scene){
 const markers=[];root.traverse(o=>{if(o.name==='QIANQING_AUXILIARY_CONTRACT')markers.push(o);});if(markers.length!==1)throw Error('Qianqing requires one auxiliary ownership contract');
 const c=markers[0].userData,expected={version:'r29-permanent-five-panel-core',centralCoreOwner:'PalaceBuilder',daisHeight:.7,stairFlights:3,stepCount:5,plainRedColumns:6,ceiling:'fully-panelled-no-caisson',sourceSHA256:cfg.asset?.sourceSHA256,materialProfile:'r31-photo-relative-enamel-and-fine-joints',profileSHA256:cfg.asset?.profileSHA256,surfaceSourceSHA256:cfg.asset?.surfaceSourceSHA256};for(const[k,v]of Object.entries(expected))if(v===undefined||c[k]!==v)throw Error('Qianqing auxiliary contract mismatch: '+k);
 const core=scene.getObjectByName('qianqing-central-setting-detail'),owner=scene.getObjectByName('后三宫')?.userData.qianqingCentral;
 if(!core?.isLOD||core.levels.length!==2||owner?.id!==QIANQING_CENTRAL.id)throw Error('Qianqing permanent core unavailable');
 if(!close(cfg.frame.x,0)||!close(cfg.frame.z,316.8)||cfg.frame.rot!==0||!close(owner.tz,322)||!close(owner.y,2.16))throw Error('Qianqing frame mismatch');
 if(cfg.asset?.sha256!==QIANQING_AUXILIARY_ASSET_SHA256||JSON.stringify(qianqingVisibleSignatures(root))!==JSON.stringify(QIANQING_AUXILIARY_MESHES))throw Error('Qianqing exact visible geometry identity mismatch');
 root.updateMatrixWorld(true);let tris=0,meshes=0;const proxies=new Map();
 root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry?.attributes?.position,n=o.geometry?.index?.count??p?.count;if(!p||!p.count||!Number.isInteger(n)||n<=0||n%3||!p.array.every(Number.isFinite))throw Error('Invalid Qianqing geometry');
  if(/^(COL_|WALK_)/.test(o.name)){if(proxies.has(o.name))throw Error('Duplicate Qianqing proxy');proxies.set(o.name,new THREE.Box3().setFromObject(o));return;}
  if(Array.isArray(o.material))throw Error('Qianqing expects material batches');meshes++;tris+=n/3;
 });
 if(tris!==cfg.asset?.renderableTriangles||meshes!==cfg.asset?.visibleMeshes||tris>9500||meshes>8)throw Error('Qianqing auxiliary budget mismatch');
 const expectedProxies=new Map(),w=owner.thW,front=1,run=1.3/5,rise=.7/5;
 for(let flight=0;flight<3;flight++){const x=[-w/3,0,w/3][flight];for(let k=0;k<5;k++){const z=front-1.3+(k+.5)*run;expectedProxies.set(`WALK_qianqing_step_${flight}_${k}`,[[x-w*.245/2,0,z-run/2],[x+w*.245/2,rise*(k+1),z+run/2]]);}}
 const outerGap=w/2-(w/3+w*.245/2),outerX=w/2-outerGap/2;
 for(const[i,x]of[-outerX,-w/6,w/6,outerX].entries())for(const[j,z]of[front-.98,front-.28,front+.7].entries()){const k=Math.min(5,Math.max(1,Math.floor((z-front+1.3)/.26)+1)),base=k*rise;expectedProxies.set(`COL_qianqing_rail_post_${i}_${j}`,[[x-.0375,base,z-.0375],[x+.0375,base+.7,z+.0375]]);}
 if(proxies.size!==expectedProxies.size)throw Error('Qianqing proxy count mismatch');
 for(const[name,[min,max]]of expectedProxies){const box=proxies.get(name);if(!box||!box.min.toArray().every((v,i)=>close(v,min[i]))||!box.max.toArray().every((v,i)=>close(v,max[i])))throw Error('Qianqing proxy geometry mismatch: '+name);}
 return {tris,meshes,colliders:12,walkables:15};
}
