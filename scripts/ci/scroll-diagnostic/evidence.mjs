import fs from 'node:fs';import path from 'node:path';
import {assertAncestors,readRegular,copyRegularFile,sha256,requireThat as ok,readIdentity,assertIdentity,isMain,failCLI,LOCK_SHA256,CHROME,safeRelative} from '../bilingual-ui/common.mjs';
import {assertMemoryPhases,assertMemoryAdmission,assertMemoryRun,MEMORY_POLICY,assertProcessRoles,assertBrowserArguments} from '../bilingual-ui/ui-oracles.mjs';
import {validatePNG} from '../bilingual-ui/verify-evidence.mjs';
import {PNGS,LIMITS,classify,controlAllowed,fields,finiteFields,text,assertComparisonFields} from './contract.mjs';
export const ALLOWLIST=Object.freeze(['toolchain.json','ui-summary.json','ui-components/source-before.json','ui-components/monitor.json','ui-components/full.log','ui-components/exit.txt','ui-components/evidence/RESULT.json','ui-components/evidence/primary/RESULT.json','ui-components/evidence/control/RESULT.json',...PNGS.map(p=>'ui-components/evidence/'+p)]);
export const expectedPNGs=control=>PNGS.slice(0,control?4:2);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function rectangle(value,label){fields(value,['x','y','width','height','top','right','bottom','left'],label);finiteFields(value,['x','y','width','height','top','right','bottom','left'],label);ok(value.width>=0&&value.height>=0,'Negative rectangle dimensions');}
function detailFields(d){
 fields(d,['time','locale','storeLocale','fontStatus','readyState','active','documentScrollXY','query','directory','map','selectedPlaceId','buttons','scrollEvents','scrollEventsOmitted'],'detail');
 finiteFields(d,['time'],'detail');ok(d.time>=0,'Invalid detail time');text(d.query,4096,'detail.query');ok(['zh-CN','en'].includes(d.locale)&&['zh-CN','en'].includes(d.storeLocale)&&['loaded','loading','unsupported'].includes(d.fontStatus)&&['loading','interactive','complete'].includes(d.readyState),'Invalid detail state');
 fields(d.active,['id','tag','path'],'active');text(d.active.id,256,'active.id');text(d.active.tag,64,'active.tag',false);ok(Array.isArray(d.active.path)&&d.active.path.length>0&&d.active.path.length<=6,'Missing active path');for(const p of d.active.path)text(p,256,'active.path',false);
 fields(d.documentScrollXY,['x','y'],'document scroll');finiteFields(d.documentScrollXY,['x','y'],'document scroll');
 const dir=d.directory;fields(dir,['scroll','scrollLeft','max','client','height','clientWidth','scrollWidth','rect','computed'],'directory');finiteFields(dir,['scroll','scrollLeft','max','client','height','clientWidth','scrollWidth'],'directory');for(const k of ['client','height','clientWidth','scrollWidth'])ok(dir[k]>=0,'Negative directory dimensions');ok(dir.max===Math.max(0,dir.height-dir.client),'Directory scroll maximum mismatch');rectangle(dir.rect,'directory rect');
 fields(dir.computed,['overflowY','overflowAnchor','display','flexWrap','rowGap','columnGap','font','lineHeight'],'computed style');for(const [k,v]of Object.entries(dir.computed))text(v,2048,'computed.'+k,false);
 const map=d.map;fields(map,['scroll','scrollHeight','clientHeight','rect','view'],'map');finiteFields(map,['scroll','scrollHeight','clientHeight'],'map');ok(map.scrollHeight>=0&&map.clientHeight>=0,'Negative map dimensions');rectangle(map.rect,'map rect');fields(map.view,['k','cx','cy'],'map view');finiteFields(map.view,['k','cx','cy'],'map view');ok(map.view.k>0,'Invalid map scale');
 ok(d.selectedPlaceId===null||typeof d.selectedPlaceId==='string','Invalid selected place');if(d.selectedPlaceId!==null)text(d.selectedPlaceId,256,'selected place',false);
 ok(Array.isArray(d.buttons)&&d.buttons.length===164&&new Set(d.buttons.map(b=>b.id)).size===164,'Missing complete 164-button geometry');for(const b of d.buttons){fields(b,['id','text','hidden','rect','offsetTop','offsetHeight'],'button');text(b.id,256,'button.id',false);text(b.text,256,'button.text');ok(typeof b.hidden==='boolean','Invalid hidden flag');rectangle(b.rect,'button rect');finiteFields(b,['offsetTop','offsetHeight'],'button');ok(b.offsetHeight>=0,'Negative button height');}
 ok(Array.isArray(d.scrollEvents)&&d.scrollEvents.length<=64&&Number.isSafeInteger(d.scrollEventsOmitted)&&d.scrollEventsOmitted>=0,'Invalid scroll events');let last=0;for(const [i,e]of d.scrollEvents.entries()){fields(e,['sequence','target','scrollTop','time'],'scroll event');ok(e.sequence===i+1&&e.target==='place-directory','Invalid scroll event identity');finiteFields(e,['scrollTop','time'],'scroll event');ok(e.time>=last&&e.time<=d.time,'Invalid scroll event order');last=e.time;}ok(d.scrollEvents.length===64||d.scrollEventsOmitted===0,'Invalid omitted event count');
}
function provenance(tool,before){
 ok(tool.schema===1&&tool.lockSHA256===LOCK_SHA256&&/^[a-f0-9]{64}$/.test(tool.inputsSHA256),'Missing toolchain schema/lock/input identity');
 const t=tool.toolchain;for(const k of ['imageOS','imageVersion','node','npm','playwright','playwrightCore','vite','python'])ok(typeof t?.[k]==='string'&&t[k].length>0&&!/unknown|unavailable/i.test(t[k]),'Missing toolchain '+k);
 ok(/^ubuntu24(?:04)?$/i.test(t.imageOS)&&/^\d{8}\.\d+\.\d+$/.test(t.imageVersion),'Invalid image receipt');
 ok(t.chrome?.path===CHROME&&t.chrome.realpath===CHROME&&/^\d+\.\d+\.\d+\.\d+$/.test(t.chrome.version)&&typeof t.chrome.packageVersion==='string'&&new RegExp('^'+t.chrome.version.replaceAll('.','\\.')+'-[0-9]+$').test(t.chrome.packageVersion)&&/^[a-f0-9]{64}$/.test(t.chrome.sha256),'Invalid Chrome receipt');
 ok(Array.isArray(before.files)&&before.files.length>0,'Missing source inventory');const names=new Set();for(const f of before.files){fields(f,['path','sha256'],'source row');safeRelative(f.path);ok(!names.has(f.path)&&/^[a-f0-9]{64}$/.test(f.sha256),'Invalid/duplicate source row');names.add(f.path);}
}
export function verifyCase(r,identity){
 assertIdentity(r.identity,identity);ok(r.schema===1&&r.diagnosticOnly===true&&r.releaseAcceptance===false&&r.completed===true&&r.closed===true&&r.assertionEvaluated===true&&!r.unexpectedError&&!r.closeError,'Incomplete diagnostic case');
 ok(['primary','control'].includes(r.caseId)&&Array.isArray(r.errors)&&!r.errors.length&&!r.errorsTruncated,'Unexpected case/errors');
 ok(Array.isArray(r.transitions)&&r.transitions.length>=1&&r.transitions.length<=2,'Missing raw transition records');
 let failed=false;
 for(let i=0;i<r.transitions.length;i++){
  const t=r.transitions[i];assertComparisonFields(t);detailFields(t.detail);ok(finite(t.elapsedSeconds)&&t.elapsedSeconds>=0,'Invalid elapsed time');if(i>0)ok(t.elapsedSeconds>=r.transitions[i-1].elapsedSeconds&&t.detail.time>=r.transitions[i-1].detail.time,'Observation time reversed');ok(t.target===['zh-CN','en'][i]&&equal(t.baseline,r.baseline),'Case transition order/baseline mismatch');
  ok(t.detail&&Array.isArray(t.detail.buttons)&&t.detail.buttons.length===164&&new Set(t.detail.buttons.map(b=>b.id)).size===164,'Missing complete 164-button geometry');
  for(const b of t.detail.buttons){ok(typeof b.id==='string'&&b.id.length>0&&typeof b.text==='string'&&b.text.length<=256&&typeof b.hidden==='boolean'&&b.rect&&Object.values(b.rect).every(finite)&&finite(b.offsetTop)&&finite(b.offsetHeight),'Invalid button geometry');}
  ok(finite(t.detail.time)&&finite(t.elapsedSeconds)&&t.detail.directory&&t.detail.directory.computed&&t.detail.map&&t.detail.active&&Array.isArray(t.detail.scrollEvents)&&t.detail.scrollEvents.length<=64,'Missing detailed evidence');
  ok(equal(t.range,{scroll:t.detail.directory.scroll,max:t.detail.directory.max,client:t.detail.directory.client,height:t.detail.directory.height}),'Detailed range mismatch');
  ok(equal(Object.fromEntries(['locale','storeLocale','fontStatus','readyState'].map(k=>[k,t.after[k]])),Object.fromEntries(['locale','storeLocale','fontStatus','readyState'].map(k=>[k,t.detail[k]]))),'Scalar/detail state mismatch');
  ok(t.after.locale===t.target&&t.after.storeLocale===t.target&&Array.isArray(t.errors)&&!t.errors.length,'Locale/errors mismatch');
  for(const scalar of [t.pre,t.afterSet,t.after])ok(['loaded','loading','unsupported'].includes(scalar.fontStatus)&&['loading','interactive','complete'].includes(scalar.readyState),'Invalid font/document enum');
  const mismatches=['scroll','query','focus'].filter(k=>!equal(t.baseline[k],t.after[k]));
  if(mismatches.length){ok(i===r.transitions.length-1&&r.primaryContract==='failed'&&r.failure===`State changed on locale toggle: ${mismatches[0]}`,'Original failure not retained');failed=true;}
  else ok(!failed,'Continued after failure');
 }
 if(!failed)ok(r.transitions.length===2&&r.primaryContract==='passed'&&!r.failure,'Incomplete original roundtrip');
 ok(r.controlEligible===(r.caseId==='primary'&&controlAllowed(r.transitions)),'Control eligibility mismatch');
 ok(r.anchor&&typeof r.anchor.actual!=='undefined','Missing anchoring observation');if(r.caseId==='control')ok(typeof r.anchor.original==='string'&&r.anchor.override==='none'&&r.anchor.actual==='none','Missing single-variable control');
 ok(equal(r.screenshots,[`${r.caseId}-endpoint.png`,`${r.caseId}-directory-endpoint.png`]),'Missing endpoint screenshot record');return r;
}
function json(root,p){return JSON.parse(readRegular(path.join(root,p),LIMITS.recordBytes));}
export function verify(root,identity=readIdentity()){
 const tool=json(root,'toolchain.json'),summary=json(root,'ui-summary.json'),monitor=json(root,'ui-components/monitor.json'),before=json(root,'ui-components/source-before.json'),result=json(root,'ui-components/evidence/RESULT.json');
 for(const v of [tool,summary,monitor,before,result])assertIdentity(v.identity,identity);provenance(tool,before);
 ok(tool.status==='passed'&&summary.passed===true&&summary.diagnosticOnly===true&&summary.releaseAcceptance===false,'Diagnostic monitor summary failed');
 ok(monitor.passed===true&&monitor.returncode===0&&monitor.rootReaped&&monitor.sourceUnchanged&&monitor.logComplete&&!monitor.stopReason&&monitor.memory?.complete&&!monitor.remainingOwnedProcesses.length&&!monitor.unattributedSessionProcesses.length&&!monitor.identityConflicts.length,'Monitor cleanup/resource/source failure');
 ok(monitor.rssPollingThresholdBytes===2*1024**3&&monitor.timeoutSeconds===240&&monitor.evidencePollingThresholdBytes===128*1024**2,'Resource policy changed');
 ok(equal(before,monitor.sourceAfter)&&before.head===identity.eventSha,'Source/index/postcheck mismatch');
 ok(result.diagnosticOnly===true&&result.releaseAcceptance===false&&result.diagnosticComplete===true&&result.browserVerified&&result.browserClosed&&result.viteClosed&&result.toolchainRechecked&&!result.failure&&!result.errors.length,'Diagnostic incomplete');
 assertMemoryPhases(result.memoryPhases,true);assertMemoryAdmission(result.memoryAdmission,identity);assertBrowserArguments(result.browserArguments);
 assertMemoryRun(monitor.memory,result.memoryAdmission,identity);ok(monitor.rootLaunched===true&&Number.isSafeInteger(monitor.peakTreeRSSBytes)&&monitor.peakTreeRSSBytes>=0&&monitor.peakTreeRSSBytes<MEMORY_POLICY.rssThresholdBytes&&Array.isArray(monitor.signals)&&monitor.signals.length===0,'Aggregate RSS or termination failure');assertProcessRoles(monitor.processRoles,monitor);const observed=monitor.memory.samples.at(-1).seconds+monitor.memory.admissionReadSeconds;ok(finite(monitor.durationSeconds)&&monitor.durationSeconds>=observed-.001&&monitor.durationSeconds-observed<=MEMORY_POLICY.maximumGapSeconds,'Incomplete terminal memory observation');
 for(const [key,value] of Object.entries({node:'24.22.1',npm:'11.9.0',playwright:'1.64.0',playwrightCore:'1.64.0',vite:'5.4.21'}))ok(tool.toolchain[key]===value,'Locked toolchain mismatch');
 ok(result.browserProcesses.length===result.browserArguments.length&&new Set(result.browserProcesses.map(p=>p.pid)).size===result.browserProcesses.length&&result.browserProcesses.every((p,i)=>Number.isInteger(p.pid)&&p.pid>0&&equal(p.args,result.browserArguments[i])),'Browser process/arguments mismatch');
 ok(before.status===''&&/^[a-f0-9]{40}$/.test(before.tree)&&/^[a-f0-9]{64}$/.test(before.indexSHA256)&&before.inputsSHA256===tool.inputsSHA256&&before.toolchainSHA256===result.toolchainSHA256,'Incomplete source receipt');ok(readRegular(path.join(root,'ui-components/exit.txt')).toString().trim()==='0','Nonzero root exit');
 ok(result.browserVersion===tool.toolchain.chrome.version&&result.browserProcesses.length>0&&result.browserProcesses.every(p=>p.executable===tool.toolchain.chrome.realpath)&&result.toolchainSHA256===sha256(readRegular(path.join(root,'toolchain.json'))),'Browser/toolchain identity mismatch');
 ok(finite(result.browserDurationSeconds)&&result.browserDurationSeconds>0&&result.browserDurationSeconds<=90,'Diagnostic browser deadline exceeded');
 const primary=verifyCase(json(root,'ui-components/evidence/primary/RESULT.json'),identity);ok(primary.caseId==='primary','Primary identity missing');
 const cases=[primary];if(primary.controlEligible){const control=verifyCase(json(root,'ui-components/evidence/control/RESULT.json'),identity);ok(control.caseId==='control','Control case missing');cases.push(control);}else ok(!fs.existsSync(path.join(root,'ui-components/evidence/control')),'Unadmitted control directory');
 ok(equal(result.cases,cases.map(c=>({caseId:c.caseId,completed:c.completed,closed:c.closed,primaryContract:c.primaryContract,controlEligible:c.controlEligible}))),'Case summary mismatch');
 for(const name of expectedPNGs(primary.controlEligible)){const png=readRegular(path.join(root,'ui-components/evidence',name),LIMITS.evidenceBytes);ok(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&png.toString('ascii',12,16)==='IHDR','Invalid PNG');const width=png.readUInt32BE(16),height=png.readUInt32BE(20);ok(width>0&&width<=1280&&height>0&&height<=900,'Endpoint dimensions out of bounds');validatePNG(png,width,height);if(!name.includes('directory'))ok(width===1280&&height===900,'Viewport PNG dimensions');}
 return {schema:1,identity,diagnosticOnly:true,releaseAcceptance:false,diagnosticComplete:true,primaryContract:primary.primaryContract,controlContract:cases[1]?.primaryContract??'not_run'};
}
export function collect({from,to,identity=readIdentity()}){
 assertAncestors(from);assertAncestors(to,false);ok(path.isAbsolute(from)&&path.isAbsolute(to)&&from!==to&&!from.startsWith(to+'/')&&!to.startsWith(from+'/'),'Separate absolute evidence roots required');fs.mkdirSync(to,{mode:0o700});
 const receipt={schema:1,identity,diagnosticOnly:true,releaseAcceptance:false,copied:[],missing:[],rejected:[],rejectedOmitted:0,complete:false};let total=0;
 const reject=row=>{if(receipt.rejected.length<32)receipt.rejected.push(row);else receipt.rejectedOmitted++;};
 const dirs=['','ui-components','ui-components/evidence','ui-components/evidence/primary','ui-components/evidence/control'];
 for(const dir of dirs){const full=path.join(from,dir);try{assertAncestors(full);ok(fs.lstatSync(full).isDirectory(),'Not a regular directory');for(const name of fs.readdirSync(full)){const rel=dir?dir+'/'+name:name;if(!dirs.includes(rel)&&!ALLOWLIST.includes(rel))reject({path:rel.slice(0,256),reason:'Unknown entry'});}}catch(e){if(e.code!=='ENOENT')reject({path:dir,reason:String(e.message).slice(0,256)});}}
 for(const rel of ALLOWLIST){try{const source=path.join(from,rel),dest=path.join(to,rel);const limit=rel.endsWith('.png')?LIMITS.evidenceBytes:rel.endsWith('.log')?LIMITS.logBytes:LIMITS.recordBytes;assertAncestors(source);ok(fs.lstatSync(source).isFile(),'Not a regular evidence file');fs.mkdirSync(path.dirname(dest),{recursive:true,mode:0o700});const row=copyRegularFile(source,dest,Math.min(limit,LIMITS.evidenceBytes-65536-total));total+=row.bytes;receipt.copied.push({path:rel,...row});}catch(e){if(e.code==='ENOENT')receipt.missing.push(rel);else reject({path:rel,reason:String(e.message).slice(0,256)});}}
 try{receipt.verification=verify(to,identity);const optional=receipt.verification.controlContract==='not_run'?['ui-components/evidence/control/RESULT.json',...PNGS.slice(2).map(p=>'ui-components/evidence/'+p)]:[];ok(receipt.missing.every(p=>optional.includes(p)),'Missing required evidence');receipt.complete=!receipt.rejected.length&&!receipt.rejectedOmitted;}catch(e){receipt.verificationError=String(e.message).slice(0,4096);}
 const bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');ok(bytes.length<65536&&total+bytes.length<=LIMITS.evidenceBytes,'Collection budget exceeded');fs.writeFileSync(path.join(to,'collection.json'),bytes,{flag:'wx',mode:0o600});
 const rows=[...receipt.copied,{path:'collection.json',bytes:bytes.length,sha256:sha256(bytes)}];fs.writeFileSync(path.join(to,'CHECKSUMS.sha256'),rows.map(r=>r.sha256+'  '+r.path).join('\n')+'\n',{flag:'wx',mode:0o600});return receipt;
}
if(isMain(import.meta.url)){try{ok(process.argv.length===4&&process.argv[2]==='--collect','Expected --collect WORK_ROOT');const root=process.argv[3],evidence=process.env.EVIDENCE_DIR;ok(root===process.env.UI_WORK_ROOT&&typeof evidence==='string','Exact roots required');if(!collect({from:path.join(root,'receipts'),to:path.join(evidence,'diagnostic')}).complete)process.exitCode=1;}catch(e){failCLI(e);}}
