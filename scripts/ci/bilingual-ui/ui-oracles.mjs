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

// E46 independent reviewed literals. This code never imports a product record,
// translator, or name registry. Both browser observations and final artifacts
// are checked against this fixed contract, separately from the Taihe oracle.
export const EXPECTED_E46 = {
 id:'supp-fc-4d8561ae5d',selector:'#supplemental-place-directory button[data-place-id="supp-fc-4d8561ae5d"]',
 links:[
  {id:'place-source-e46-xiangxu-front-photo',href:'https://www.dpm.org.cn/Uploads/pdf/5067/T00112_00.pdf',target:'_blank',rel:'noopener noreferrer'},
  {id:'place-source-e46-yuqing-named-plan',href:'https://img.dpm.org.cn/Uploads/File/2021/09/15/u6141698d36e1d.pdf',target:'_blank',rel:'noopener noreferrer'}
 ],
 sources:[
  {id:'e46-xiangxu-front-photo',url:'https://www.dpm.org.cn/Uploads/pdf/5067/T00112_00.pdf',reviewType:'reused-official-source-attribution',reviewedAt:null},
  {id:'e46-yuqing-named-plan',url:'https://img.dpm.org.cn/Uploads/File/2021/09/15/u6141698d36e1d.pdf',reviewType:'reused-official-source-attribution',reviewedAt:null}
 ],
 'zh-CN':{
  title:'祥旭门',tag:'宫门',
  summary:'祥旭门是毓庆宫建筑序列中的一座门。故宫出版物的具名平面将其标在前星门之后、惇本殿院前；独立题名的正面照片可见黄琉璃门顶、绿色框饰、两侧装饰面板、红色双扇门和浅色石基。这里的介绍与前星门、惇本殿分别对应，不把它们合为一个景点。',
  evidenceNote:'依据已保存的故宫出版物页图核对名称、建筑顺序与正面可见构件；本轮没有重新访问完整官网页面。照片日期、精确尺度、背面和细部花纹未核实。英文名称与介绍均为项目译文，尚未核到本门的官方英文名。',
  modelNote:'模型仅作独立门面、关闭双扇与自有短墙翼的有限拟合，不接通旧院墙，不代表完整第二进院落。游戏坐标、尺寸、背面与简化装饰不是实测复原；本目录卡仅供介绍，没有新增地图点或传送目标。',
  siteAccess:'现实开放范围及门扇当前状态未核实；游戏中的关闭门面不表示当前参观安排。',
  translationNotice:null,accessHeading:'现场参观提示',sourcesHeading:'资料来源',
  generalNotice:'来源核对方式逐条标注；继承引用不代表本轮重新访问。来源链接在新标签页打开。',
  sourceNotice:'继承官方来源记录；本轮未重新访问。',
  labels:['故宫博物院 · 王子林《清太子宫》：印刷112页图1祥旭门正面','故宫博物院 · 张燕芬《毓庆宫原状陈设复原研究》：2021年第9期，印刷110页图一'],
  nameHeading:'英文名称出处',
  nameNotes:['项目英文展示名：Xiangxu Gate','名称证据与介绍正文分开；英文介绍仍为项目译文，名称不扩大模型范围或现场开放许可。','本轮未核实此卡的官方英文名；这不表示不存在官方英文名。']
 },
 en:{
  title:'Xiangxu Gate',tag:'Palace gate',
  summary:'Xiangxu Gate is part of the architectural sequence of Yuqing Palace. A named plan in a Palace Museum publication places it after Qianxing Gate and before the Dunben Hall courtyard. A separately captioned front photograph shows a yellow glazed top, green framing, ornamental panels on both sides, red double doors and pale stone feet. This entry is distinct from Qianxing Gate and Dunben Hall.',
  evidenceNote:'The identity, sequence and visible front features were checked against saved page images from Palace Museum publications, without a new visit to the complete web pages. The photograph date, exact dimensions, rear elevation and fine ornament remain unverified. The English name and description are project translations; an official English name for this gate has not been verified.',
  modelNote:'The model is a limited fit of an independent gate front, closed double doors and its own short walls. It does not connect existing courtyard walls or reconstruct the complete second courtyard. Game coordinates, dimensions, rear surfaces and simplified ornament are not a measured reconstruction. This information-only card adds no map marker or travel target.',
  siteAccess:'Current public access and the present door position are not verified. The closed doors in the model do not state current visiting arrangements.',
  translationNotice:'English descriptions: project translation of the cited Chinese sources. The sources have not all been newly reviewed.',accessHeading:'On-site visit guidance',sourcesHeading:'Sources',
  generalNotice:'Source checks are labelled individually. Inherited citations were not revisited for this update. Links open in a new tab.',
  sourceNotice:'Inherited official-source record; not revisited for this update.',
  labels:['The Palace Museum · Wang Zilin, The Qing Crown Prince Palace: Xiangxu Gate front, printed page 112, figure 1','The Palace Museum · Zhang Yanfen, Study of the Restoration of Yuqing Palace Furnishings: 2021 issue 9, printed page 110, figure 1'],
  nameHeading:'English name sources',
  nameNotes:['Project English name: Xiangxu Gate','Name evidence is separate from the descriptions. English descriptions remain project translations; naming does not expand model scope or visitor access.','No official English name was verified for this card in this review. This does not mean no official name exists.']
 }
};
for(const lang of ['zh-CN','en']){
 const c=EXPECTED_E46[lang];
 c.notes=[...(c.translationNotice?[c.translationNotice]:[]),c.evidenceNote,c.modelNote,c.siteAccess,c.generalNotice,c.sourceNotice,c.sourceNotice,...c.nameNotes];
 c.blocks=[{tag:'h2',text:c.title},...(c.translationNotice?[{tag:'p',text:c.translationNotice}]:[]),{tag:'p',text:c.tag},{tag:'p',text:c.evidenceNote},{tag:'p',text:c.summary},{tag:'p',text:c.modelNote},{tag:'h3',text:c.accessHeading},{tag:'p',text:c.siteAccess},{tag:'h3',text:c.sourcesHeading},{tag:'p',text:c.generalNotice},...c.labels.flatMap(text=>[{tag:'a',text},{tag:'p',text:c.sourceNotice}]),{tag:'h3',text:c.nameHeading},...c.nameNotes.map(text=>({tag:'p',text}))];
}
const freezeE46=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freezeE46);Object.freeze(value);}return value;};
freezeE46(EXPECTED_E46);
const e46Object=(value,label)=>assert.ok(value&&typeof value==='object'&&!Array.isArray(value),'E46 missing '+label);
const e46Array=(value,length,label)=>assert.ok(Array.isArray(value)&&value.length===length,'E46 missing/duplicate '+label);
const e46Number=value=>typeof value==='number'&&Number.isFinite(value);
const e46Rect=(r,label)=>{e46Object(r,label);assert.ok(['x','y','width','height'].every(k=>e46Number(r[k]))&&r.width>0&&r.height>0,'E46 invalid rectangle '+label);};
const e46Inside=(r,b)=>r.x>=b.x-1&&r.y>=b.y-1&&r.x+r.width<=b.x+b.width+1&&r.y+r.height<=b.y+b.height+1;
export function assertE46Observation(o,width,height,{key,interactive=false,scope='panel'}={}){
 e46Object(o,'visibility observation');assert.equal(o.key,key,'E46 observation order');assert.equal(o.scope,scope);assert.equal(o.interactive,interactive);
 assert.equal(o.connected,true,'E46 detached copy');assert.equal(o.effectiveVisible,true,'E46 hidden copy/ancestor');assert.equal(o.inert,false,'E46 inert copy');
 assert.deepEqual(o.viewport,{width,height});for(const name of ['rect','panelRect','clipRect'])e46Rect(o[name],name);
 const viewport={x:0,y:0,width,height};assert.ok(e46Inside(o.rect,viewport)&&e46Inside(o.rect,o.clipRect),'E46 clipped copy');
 if(scope==='panel')assert.ok(e46Inside(o.rect,o.panelRect)&&e46Inside(o.panelRect,viewport),'E46 outside panel');
 for(const key of ['documentOverflow','panelOverflow','scrollTop','scrollMax'])assert.ok(e46Number(o[key]),'E46 finite layout '+key);
 assert.ok(o.documentOverflow<=1&&o.panelOverflow<=1&&o.scrollMax>=0&&o.scrollTop>=0&&o.scrollTop<=o.scrollMax,'E46 overflow/scroll bounds');
 assert.equal(o.hit,interactive?true:null,'E46 obscured interactive control');return o;
}
export function assertE46Content(c,lang,width,height){
 assert.ok(['zh-CN','en'].includes(lang),'E46 locale');e46Object(c,'content');const e=EXPECTED_E46[lang];
 for(const key of ['lang','documentLang','panelLang'])assert.equal(c[key],lang,'E46 content locale '+key);
 assert.equal(c.selected,EXPECTED_E46.id);assert.equal(c.selection?.placeId,EXPECTED_E46.id);assert.equal(c.role,'region');assert.equal(c.travelCount,0);
 for(const key of ['title','tag','summary'])assert.equal(c[key],e[key],'E46 exact '+key);assert.equal(c.directoryTitle,e.title);assert.deepEqual(c.notes,e.notes,'E46 complete exact notes');
 assert.equal(c.panelText,e.blocks.map(b=>b.text).join(''),'E46 complete panel text');assert.deepEqual(c.missing,[],'E46 missing translations');
 assert.ok(Array.isArray(c.visibleAttributes),'E46 visible attributes required');for(const a of c.visibleAttributes){e46Object(a,'visible attribute');assert.ok(typeof a.name==='string'&&typeof a.value==='string');if(lang==='en')assert.ok(!/[\u3400-\u9fff]|unavailable|translation[ -]?missing|\[missing/iu.test(a.value),'E46 untranslated visible attribute');}
 if(lang==='en')assert.ok(!/[\u3400-\u9fff]|unavailable|translation[ -]?missing|\[missing/iu.test(c.panelText),'E46 untranslated visible panel');
 assert.deepEqual(c.catalog,{id:EXPECTED_E46.id,sourceObjectId:'FC-4D8561AE5D',navigationMode:'information-only',teleportTargetName:null,mapBinding:null,sources:EXPECTED_E46.sources},'E46 actual catalog navigation/source metadata');
 assert.deepEqual(c.links,EXPECTED_E46.links.map((l,i)=>({...l,text:e.labels[i],notice:e.sourceNotice})),'E46 exact ordered source labels/links/notices');
 assert.deepEqual(c.nameProvenance,{count:1,id:'place-name-provenance',status:'project-unverified',headings:[e.nameHeading],notes:e.nameNotes,links:[]},'E46 one unqualified provenance section/three notes/no naming links');
 e46Array(c.observations,e.blocks.length+2,'staged content observations');
 e.blocks.forEach((block,i)=>{const o=c.observations[i];assertE46Observation(o,width,height,{key:'block:'+i,interactive:block.tag==='a'});assert.equal(o.text,block.text,'E46 observed copy itself');});
 ['#place-back','#map-language'].forEach((key,i)=>assertE46Observation(c.observations[e.blocks.length+i],width,height,{key,interactive:true,scope:'viewport'}));
 assert.deepEqual(c.screenshot,{file:`${width}-e46-${lang==='en'?'english':'chinese'}-card.png`,panelScroll:0,selected:EXPECTED_E46.id,lang,width,height},'E46 declared top-card screenshot');return c;
}
const e46Retained=['view','quality','sound','teleports','references','mapVisible'];
function e46Baseline(s){
 e46Object(s,'baseline');assert.ok(['en','zh-CN'].includes(s.lang));assert.equal(typeof s.query,'string');assert.equal(s.mapVisible,true);assert.equal(typeof s.sound,'boolean');assert.ok(typeof s.quality==='string'&&s.quality.length>0);assert.deepEqual(s.teleports,[],'E46 no teleports');
 e46Object(s.view,'map view');assert.ok(Object.keys(s.view).length>0&&Object.values(s.view).every(e46Number),'E46 finite map view');
 e46Object(s.references,'six actual references');assert.deepEqual(Object.keys(s.references).sort(),['map','panel','catalog','settings','time','environment'].sort());const ids=Object.values(s.references);assert.ok(ids.every(n=>Number.isSafeInteger(n)&&n>0)&&new Set(ids).size===6,'E46 actual object identities');
}
function e46Retain(before,after,keys=e46Retained){for(const k of keys)assert.deepEqual(after[k],before[k],'E46 retained '+k);}
function e46State(s,before,lang,width,height,focus=true){
 e46Baseline(s);e46Retain(before,s);for(const k of ['lang','documentLang','panelLang'])assert.equal(s[k],lang,'E46 transition '+k);
 assert.equal(s.title,EXPECTED_E46[lang].title,'E46 transition/reopen title');assert.equal(s.selected,EXPECTED_E46.id);assert.deepEqual(s.selection,{name:'祥旭门',placeId:EXPECTED_E46.id});assert.equal(s.query,'xiangxumen');assert.equal(s.travelCount,0);assert.deepEqual(s.missing,[]);
 assert.equal(s.detailVisible,true);assert.equal(s.panelHidden,false);assert.equal(s.panelInert,false);
 if(focus){e46Object(s.focus,'source focus');assert.equal(s.focus.id,EXPECTED_E46.links[0].id);assert.equal(s.focus.href,EXPECTED_E46.links[0].href);assertE46Observation(s.focus,width,height,{key:'source-focus',interactive:true});}
}
function e46Search(s,query){
 e46Object(s,'search row');const negative=query==='__e46_no_match__';assert.deepEqual(s,{query,lang:'en',selector:EXPECTED_E46.selector,count:1,id:EXPECTED_E46.id,title:EXPECTED_E46.en.title,visible:!negative,hidden:negative,inert:negative,disabled:false},'E46 exact filtered search observation');
}
export function assertE46(e,width,height){
 e46Object(e,'layout.e46');assert.equal(e.schema,1);assert.ok((width===1280&&height===900)||(width===390&&height===844),'E46 exact viewport');
 e46Baseline(e.before);assert.equal(e.before.lang,'en');assert.equal(e.before.query,'Sanzuo');
 const queries=['祥旭门','Xiangxu Gate','xiang xu men','xiangxumen','__e46_no_match__'];e46Array(e.searches,queries.length,'search records');queries.forEach((q,i)=>e46Search(e.searches[i],q));e46Search(e.opened,'xiangxumen');
 e46State(e.sourceBefore,e.before,'en',width,height);e46Array(e.transitions,4,'locale transitions');
 ['zh-CN','en','zh-CN','en'].forEach((lang,i)=>{const s=e.transitions[i];e46State(s,e.before,lang,width,height);e46State(s.beforeEvent,e.before,i%2?'zh-CN':'en',width,height);e46Retain(e.sourceBefore,s,['selected','selection','query']);e46Retain(e.sourceBefore,s.beforeEvent,['selected','selection','query']);});
 e46Array(e.content,2,'locale content');['zh-CN','en'].forEach((lang,i)=>assertE46Content(e.content[i],lang,width,height));
 e46Object(e.backReopen,'back/reopen');const closed=e.backReopen.closed;e46Object(closed,'back closed');e46Baseline(closed);e46Retain(e.before,closed);assert.equal(closed.lang,'en');assert.equal(closed.query,'xiangxumen');assert.equal(closed.selected,EXPECTED_E46.id);assert.deepEqual(closed.selection,{name:'祥旭门',placeId:EXPECTED_E46.id});assert.equal(closed.travelCount,0);assert.equal(closed.detailVisible,false);assert.equal(closed.panelHidden,true);assert.equal(closed.panelInert,true);assert.deepEqual(closed.missing,[]);
 e46Search(e.backReopen.button,'xiangxumen');e46State(e.backReopen.reopened,e.before,'en',width,height,false);
 e46Baseline(e.restored);e46Retain(e.before,e.restored,[...e46Retained,'lang','query']);assert.equal(e.restored.detailVisible,false);assert.equal(e.restored.panelHidden,true);assert.equal(e.restored.panelInert,true);assert.equal(e.restored.travelCount,0);return e;
}
