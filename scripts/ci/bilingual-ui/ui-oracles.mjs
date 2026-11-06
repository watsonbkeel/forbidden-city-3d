import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
// Independent literals from the reviewed Taihe content; never a runtime translator oracle.
export const EXPECTED_TAIHE = {
  "links": [
    {
      "id": "place-source-taihe",
      "href": "https://www.dpm.org.cn/explore/building/236465.html",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-rebuild",
      "href": "https://www.dpm.org.cn/subject_600/buildingdetails/253792.html",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-visit",
      "href": "https://www.dpm.org.cn/Visit.html",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-announcements",
      "href": "https://www.dpm.org.cn/announce.html",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-throne-dossier",
      "href": "https://www.dpm.org.cn/Uploads/pdf/5063/T00012_00.pdf",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-throne-photo",
      "href": "https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-plaque-restoration",
      "href": "https://www.dpm.org.cn/show/226011.html",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-caisson-study",
      "href": "https://img.dpm.org.cn/Uploads/pdf/1944/T00008_00.pdf",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-caisson-photo",
      "href": "https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-crane-study-p40",
      "href": "https://www.dpm.org.cn/Uploads/pdf/1527/T00040_00.pdf",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-enamel-ensemble",
      "href": "https://www.dpm.org.cn/Uploads/wenhua/E32/E32b.htm",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-taihe-incense-study",
      "href": "https://www.dpm.org.cn/Uploads/File/2019/02/22/u5c6fe8635c254.pdf",
      "target": "_blank",
      "rel": "noopener noreferrer"
    },
    {
      "id": "place-source-qianqing",
      "href": "https://www.dpm.org.cn/explore/building/236472.html",
      "target": "_blank",
      "rel": "noopener noreferrer"
    }
  ],
  "zh-CN": {
    "headings": [
      "资料来源",
      "现场参观提示",
      "本版模型说明"
    ],
    "notes": [
      "六根贴金柱及四对陈设类别有官方文字依据；本版将横匾移挂现有前排梁，保留匾联尺寸、柱网与天花。具体挂位为照片层次拟合，非测绘；近看须抬头，整体透视比例仍有差异。",
      "前往模型中的现有安全观览点；能否入内以模型当前路线为准。",
      "模型漫游不代表现场开放许可；实际参观范围和入内安排请查阅故宫博物院当日公告。"
    ]
  },
  "en": {
    "headings": [
      "Sources",
      "On-site visit guidance",
      "About this version's model"
    ],
    "notes": [
      "Official text supports the six gilded columns and four pairs of furnishing types. This version moves the horizontal plaque to an existing front beam while retaining plaque and couplet dimensions, the column grid, and the ceiling. Its precise hanging position is a photo-based depth fit, not surveyed. Look upward at close range; overall perspective proportions still differ.",
      "Go to an existing safe viewing point in the model. Interior access depends on the routes currently provided in the model.",
      "Exploration in the model does not imply permission to enter on site. Check the Palace Museum's notices for the day of your visit for actual visitor areas and interior access.",
      "English descriptions: project translation of the cited Chinese sources. The sources have not all been newly reviewed."
    ]
  }
};
// Fixed Taihe naming literals cross-checked against tests/bilingual/official-name-expectations.json
// and the reviewed verified-name-mapping.json, not read from the runtime name registry.
const EXPECTED_TAIHE_NAME = {
 id:'place-name-provenance',status:'official-display',
 quotes:['Hall of Supreme Harmony (Taihe dian)','Hall of Supreme Harmony (Taihe dian)'],
 links:[
  {id:'place-name-source-taihe-directory-74',href:'https://intl.dpm.org.cn/explore/build_maps.html',target:'_blank',rel:'noopener noreferrer'},
  {id:'place-name-source-taihe-taihe-title',href:'https://intl.dpm.org.cn/hallsinfo/374.html',target:'_blank',rel:'noopener noreferrer'}
 ],
 'zh-CN':{
  title:'太和殿',heading:'英文名称出处',linkText:'故宫博物院 · 英文名称来源 · 核对于 2026-11-06',
  notes:[
   '已核官方英文展示名：Hall of Supreme Harmony',
   '名称证据与介绍正文分开；英文介绍仍为项目译文，名称不扩大模型范围或现场开放许可。',
   '原项目译名仍可检索：Taihe Hall'
  ]
 },
 en:{
  title:'Hall of Supreme Harmony',heading:'English name sources',linkText:'The Palace Museum · English naming source · checked 2026-11-06',
  notes:[
   'Verified official English name: Hall of Supreme Harmony',
   'Name evidence is separate from the descriptions. English descriptions remain project translations; naming does not expand model scope or visitor access.',
   'Project name also searchable: Taihe Hall'
  ]
 }
};
export function assertSourceLimits(view,lang){
 assert.ok(Object.hasOwn(EXPECTED_TAIHE,lang)&&lang!=='links','Supported locale');
 assert.equal(view.selected,'taihe','Exact card identity');
 for(const heading of EXPECTED_TAIHE[lang].headings)assert.ok(view.headings.includes(heading),'Missing source/access heading: '+heading);
 for(const note of EXPECTED_TAIHE[lang].notes)assert.ok(view.notes.includes(note),'Missing model/access/provenance limitation: '+note);
 assert.deepEqual(view.links.map(({id,href,target,rel})=>({id,href,target,rel})),EXPECTED_TAIHE.links,'Exact source links and safe attributes');
 assert.ok(view.links.every(link=>typeof link.text==='string'&&link.text.trim()),'Nonempty source labels');
 if(lang==='en')assert.ok(view.links.every(link=>!/[\u3400-\u9fff]/u.test(link.text)),'English source labels');
 const expected=EXPECTED_TAIHE_NAME[lang],name=view.nameProvenance;
 assert.equal(view.title,expected.title,'Exact card display name');
 assert.equal(view.directoryTitle,expected.title,'Exact directory display name');
 assert.ok(name&&name.count===1,'One separate name provenance section');
 assert.equal(name.id,EXPECTED_TAIHE_NAME.id,'Exact name provenance section');
 assert.equal(name.status,EXPECTED_TAIHE_NAME.status,'Official name status');
 assert.deepEqual(name.headings,[expected.heading],'Exact name provenance heading');
 assert.ok(Array.isArray(name.notes)&&name.notes.every(note=>typeof note==='string'&&note.trim()),'Nonempty name provenance notes');
 for(const note of expected.notes)assert.ok(name.notes.includes(note),'Missing name provenance limitation: '+note);
 assert.deepEqual(name.quotes,EXPECTED_TAIHE_NAME.quotes,'Exact official naming quotes');
 assert.deepEqual(name.links,EXPECTED_TAIHE_NAME.links.map(link=>({...link,text:expected.linkText})),'Exact separate naming links, labels and safe attributes');
 return {lang,passed:true,...view};
}
export function assertBrowserArguments(rows){
 assert.ok(Array.isArray(rows)&&rows.length>0,'Browser argv required');
 for(const args of rows){
  assert.ok(Array.isArray(args)&&args.length>0&&args.every(v=>typeof v==='string'),'Browser argv array');
  assert.equal(args[0],'/opt/google/chrome/chrome','Official stable channel binary');
  for(const arg of args)assert.ok(!['--no-sandbox','--disable-setuid-sandbox','--disable-namespace-sandbox','--disable-gpu-sandbox','--disable-seccomp-filter-sandbox','--single-process','--no-zygote'].includes(arg.split('=',1)[0]),'Sandbox-disabling browser argument: '+arg);
 }
 return true;
}

export function repositoryRoot(url){return path.resolve(fileURLToPath(new URL('../../../',url)));}

// Bounded diagnostic numbers only; no environment, arguments or content fields.
export function assertMemoryPhases(rows,complete=false){
 const phases=['before-preflight','after-preflight','before-vite','vite-ready','before-chrome-launch','after-chrome-launch'];
 const bytes=['rss','heapTotal','heapUsed','external','arrayBuffers'];
 const fields=['phase','elapsedMs',...bytes].sort();
 assert.ok(Array.isArray(rows)&&rows.length<=6&&(!complete||rows.length===6),'Memory phase count');
 let previous=0;
 for(const [i,row] of rows.entries()){
  assert.ok(row&&typeof row==='object'&&!Array.isArray(row),'Memory phase object');
  assert.deepEqual(Object.keys(row).sort(),fields,'Memory phase fields');
  assert.equal(row.phase,phases[i],'Memory phase order');
  assert.ok(typeof row.elapsedMs==='number'&&Number.isFinite(row.elapsedMs)&&row.elapsedMs>=previous,'Memory phase monotonic time');
  for(const key of bytes)assert.ok(Number.isSafeInteger(row[key])&&row[key]>=0,'Memory phase numeric '+key);
  previous=row.elapsedMs;
 }
 return true;
}

// Resource policy is separate from every product/UI assertion above.
export const MEMORY_POLICY=Object.freeze({schema:1,rssThresholdBytes:2048*1024**2,minimumTotalBytes:8192*1024**2,admissionAvailableBytes:6144*1024**2,pressureFloorBytes:2048*1024**2,pollIntervalSeconds:.25,maximumGapSeconds:1,maximumReadSeconds:1,maximumSamples:1024,maximumAncestors:32,maximumOwnedProcesses:64});
const memoryKeys=(value,keys)=>{assert.ok(value&&typeof value==='object'&&!Array.isArray(value),'Memory object required');assert.deepEqual(Object.keys(value).sort(),[...keys].sort(),'Memory fields mismatch');};
const memoryNumber=value=>{assert.ok(Number.isSafeInteger(value)&&value>=0,'Invalid memory number');return value;};
const memoryTime=value=>{assert.ok(Number.isFinite(value)&&value>=0&&value<=1,'Invalid memory observation time');};
const memoryPath=value=>{assert.ok(typeof value==='string'&&path.posix.isAbsolute(value)&&path.posix.normalize(value)===value&&!/[\0\r\n]/.test(value)&&(value==='/'||!value.endsWith('/')),'Invalid memory path');};
const memoryLimit=value=>{if(value==='max')return null;assert.ok(typeof value==='string'&&/^(0|[1-9][0-9]*)$/.test(value),'Invalid cgroup memory limit');const n=BigInt(value);assert.ok(n<=9223372036854775807n,'Unsupported cgroup limit');return n;};
function memoryTopology(topology){
 memoryKeys(topology,['namespace','mount','group','ancestors']);assert.equal(topology.namespace,'cgroup:[4026531835]','Initial cgroup namespace required');
 const m=topology.mount;memoryKeys(m,['id','parent','device','root','point','options','superOptions']);assert.equal(m.root,'/','Hidden cgroup ancestors');memoryPath(m.point);memoryPath(topology.group);
 for(const key of ['id','parent'])assert.ok(/^[1-9][0-9]*$/.test(m[key]),'Invalid mount identity');assert.ok(/^[0-9]+:[0-9]+$/.test(m.device),'Invalid mount device');for(const key of ['options','superOptions'])assert.ok(typeof m[key]==='string'&&m[key].length>0&&m[key].length<=4096,'Invalid mount metadata');
 const parts=topology.group==='/'?[]:topology.group.slice(1).split('/'),expected=['/',...parts.map((_,i)=>'/'+parts.slice(0,i+1).join('/'))];
 assert.ok(Array.isArray(topology.ancestors)&&topology.ancestors.length===expected.length&&expected.length<=MEMORY_POLICY.maximumAncestors,'Incomplete bounded cgroup ancestry');
 const inodes=new Set();topology.ancestors.forEach((row,i)=>{memoryKeys(row,['path','device','inode','hierarchyRoot','max','high']);assert.equal(row.path,expected[i],'Cgroup ancestry gap');assert.equal(row.device,m.device,'Cgroup device drift');assert.ok(typeof row.inode==='string'&&/^[1-9][0-9]*$/.test(row.inode)&&!inodes.has(row.inode),'Invalid/repeated cgroup inode');inodes.add(row.inode);assert.equal(row.hierarchyRoot,i===0);if(i===0){assert.equal(row.max,'root-not-applicable');assert.equal(row.high,'root-not-applicable');}else{memoryLimit(row.max);memoryLimit(row.high);}});
}
function memoryEffective(sample,total,topology){
 const available=memoryNumber(sample.memAvailableBytes);assert.ok(available<=total,'Host available exceeds RAM');memoryNumber(sample.effectiveAvailableBytes);memoryNumber(sample.globalOOMKills);
 assert.ok(Array.isArray(sample.cgroupCurrentBytes)&&sample.cgroupCurrentBytes.length===topology.ancestors.length&&Array.isArray(sample.ancestorOOM)&&sample.ancestorOOM.length===topology.ancestors.length,'Incomplete cgroup samples');let effective=BigInt(available);
 topology.ancestors.forEach((row,i)=>{const current=sample.cgroupCurrentBytes[i],event=sample.ancestorOOM[i];if(i===0){assert.equal(current,null);assert.equal(event,null);return;}memoryNumber(current);memoryKeys(event,['oom','oomKill']);memoryNumber(event.oom);memoryNumber(event.oomKill);for(const key of ['max','high']){const limit=memoryLimit(row[key]);if(limit!==null){const remaining=limit-BigInt(current);assert.ok(remaining>=0,'Cgroup memory pressure boundary exceeded');if(remaining<effective)effective=remaining;}}});
 assert.equal(BigInt(sample.effectiveAvailableBytes),effective,'Effective memory headroom mismatch');return Number(effective);
}
function memoryAdmissionSnapshot(sample){
 memoryKeys(sample,['memTotalBytes','memAvailableBytes','effectiveAvailableBytes','globalOOMKills','cgroupCurrentBytes','ancestorOOM','topology']);memoryTopology(sample.topology);memoryNumber(sample.memTotalBytes);assert.ok(sample.memTotalBytes>=MEMORY_POLICY.minimumTotalBytes,'Insufficient host RAM');assert.ok(memoryEffective(sample,sample.memTotalBytes,sample.topology)>=MEMORY_POLICY.admissionAvailableBytes,'Insufficient admission memory');
}
export function assertMemoryAdmission(receipt,identity){
 memoryKeys(receipt,['schema','identity','policy','admission','readSeconds']);assert.equal(receipt.schema,1);assert.deepEqual(receipt.identity,identity,'Memory event identity mismatch');assert.deepEqual(receipt.policy,MEMORY_POLICY,'Memory policy mismatch');memoryTime(receipt.readSeconds);memoryAdmissionSnapshot(receipt.admission);return receipt;
}
export function assertMemoryRun(report,browserReceipt,identity){
 assertMemoryAdmission(browserReceipt,identity);memoryKeys(report,['schema','policy','admission','admissionReadSeconds','samples','failure','complete']);assert.equal(report.schema,1);assert.deepEqual(report.policy,MEMORY_POLICY);assert.equal(report.failure,null);assert.equal(report.complete,true);memoryTime(report.admissionReadSeconds);memoryAdmissionSnapshot(report.admission);
 const a=report.admission,b=browserReceipt.admission;assert.deepEqual(a.topology,b.topology,'Prelaunch memory topology drift');assert.equal(a.memTotalBytes,b.memTotalBytes);assert.equal(a.globalOOMKills,b.globalOOMKills);assert.deepEqual(a.ancestorOOM,b.ancestorOOM);
 assert.ok(Array.isArray(report.samples)&&report.samples.length>=2&&report.samples.length<=MEMORY_POLICY.maximumSamples,'Missing/bounded memory observations');let last=0;
 for(const [i,s] of report.samples.entries()){memoryKeys(s,['seconds','readSeconds','memAvailableBytes','effectiveAvailableBytes','globalOOMKills','cgroupCurrentBytes','ancestorOOM']);assert.ok(Number.isFinite(s.seconds)&&s.seconds>=last&&s.seconds-last<=MEMORY_POLICY.maximumGapSeconds,'Memory observation gap/order');if(i===0){assert.equal(s.seconds,0);for(const k of ['memAvailableBytes','effectiveAvailableBytes','globalOOMKills','cgroupCurrentBytes','ancestorOOM'])assert.deepEqual(s[k],a[k],'Admission sample mismatch');}memoryTime(s.readSeconds);assert.ok(memoryEffective(s,a.memTotalBytes,a.topology)>=MEMORY_POLICY.pressureFloorBytes,'Runtime memory pressure');assert.equal(s.globalOOMKills,a.globalOOMKills,'Host OOM changed');assert.deepEqual(s.ancestorOOM,a.ancestorOOM,'Cgroup OOM changed');last=s.seconds;}
 return report;
}


// Ordered observations are independent of the unchanged product assertions.
export const UI_STEP_NAMES=Object.freeze(['browser-verified',...[1280,390].flatMap(width=>['context-created','page-created','navigation-start','navigation-idle','fixture-ready','first-locale-ready','card-ready','layout-complete','context-closed'].map(name=>`${width}-${name}`))]);
export function assertUISteps(rows,complete=false,earliestMs=0){
 assert.ok(Array.isArray(rows)&&rows.length<=19&&(!complete||rows.length===19),'UI step count');
 assert.ok(Number.isFinite(earliestMs)&&earliestMs>=0,'Invalid UI step start');let last=earliestMs;
 for(const [i,row] of rows.entries()){
  memoryKeys(row,['step','elapsedMs','rss','heapTotal','heapUsed','external','arrayBuffers','contexts','pages']);
  assert.equal(row.step,UI_STEP_NAMES[i],'UI step sequence');assert.ok(Number.isFinite(row.elapsedMs)&&row.elapsedMs>=last,'UI step time');last=row.elapsedMs;
  for(const key of ['rss','heapTotal','heapUsed','external','arrayBuffers'])memoryNumber(row[key]);
  const closed=i===0||row.step.endsWith('-context-closed');assert.equal(row.contexts,closed?0:1,'Unexpected concurrent UI contexts');assert.equal(row.pages,closed||row.step.endsWith('-context-created')?0:1,'Unexpected concurrent UI pages');
 }
 return rows;
}

// A single optional observation; it never supplies signal authority or RSS credit.
export const ROLE_LIMITS=Object.freeze({maxProcesses:64,maxReadBytes:32768,maxPathBytes:4096,maxCmdlineBytes:4096,maxStatBytes:4096,maxSeconds:.05});
export function assertProcessRoles(value,monitor){
 const threshold=MEMORY_POLICY.rssThresholdBytes*3/4;
 if(value===null){assert.ok(monitor.peakTreeRSSBytes<threshold,'Missing eligible role observation');return value;}
 memoryKeys(value,['schema','triggerSeconds','triggerRSSBytes','thresholdBytes','limits','status','complete','observedProcessCount','truncatedCount','skippedCount','readBytes','elapsedSeconds','rows']);
 assert.equal(value.schema,1);assert.equal(value.thresholdBytes,threshold);assert.deepEqual(value.limits,ROLE_LIMITS);
 for(const key of ['triggerRSSBytes','observedProcessCount','truncatedCount','skippedCount','readBytes'])memoryNumber(value[key]);
 assert.ok(value.triggerRSSBytes>=threshold&&value.triggerRSSBytes<=monitor.peakTreeRSSBytes,'Role trigger RSS');
 for(const key of ['triggerSeconds','elapsedSeconds'])assert.ok(Number.isFinite(value[key])&&value[key]>=0&&value[key]<=monitor.durationSeconds,'Role time bound');
 assert.ok(value.readBytes<=ROLE_LIMITS.maxReadBytes&&Array.isArray(value.rows)&&value.rows.length<=64,'Role read/row budget');
 assert.ok(['captured','partial','skipped-stop'].includes(value.status),'Role capture status');
 if(value.status==='skipped-stop'){
  assert.ok(typeof monitor.stopReason==='string'&&monitor.stopReason.length>0,'Role skip requires stop');
  assert.equal(value.rows.length,0);assert.equal(value.readBytes,0);assert.equal(value.elapsedSeconds,0);assert.equal(value.truncatedCount,0);assert.equal(value.skippedCount,value.observedProcessCount);assert.equal(value.complete,false);return value;
 }
 assert.ok(value.triggerRSSBytes<MEMORY_POLICY.rssThresholdBytes,'Role capture must precede RSS stop');
 assert.equal(value.rows.length,Math.min(value.observedProcessCount,64));assert.equal(value.truncatedCount,value.observedProcessCount-value.rows.length);
 const allowed={node:['ui-controller','node-auxiliary'],esbuild:['esbuild'],chrome:['browser','zygote','renderer','gpu','utility','unknown'],unknown:['unknown']},pids=new Set();let skipped=value.truncatedCount,total=0;
 for(const row of value.rows){
  memoryKeys(row,['pid','starttime','rssBytes','executableKind','role','status']);
  for(const key of ['pid','starttime','rssBytes'])memoryNumber(row[key]);assert.ok(row.pid>0&&!pids.has(row.pid),'Role PID identity');pids.add(row.pid);total+=row.rssBytes;
  assert.ok(Object.hasOwn(allowed,row.executableKind)&&allowed[row.executableKind].includes(row.role),'Role enum');
  assert.ok(['observed','budget-exhausted','exited-or-unreadable','identity-changed','read-unavailable'].includes(row.status),'Role row status');
  if(row.status!=='observed'){skipped++;assert.equal(row.executableKind,'unknown');assert.equal(row.role,'unknown');}
 }
 assert.ok(total<=value.triggerRSSBytes,'Role RSS subset');assert.equal(value.skippedCount,skipped);assert.equal(value.complete,skipped===0);assert.equal(value.status,skipped===0?'captured':'partial');return value;
}
