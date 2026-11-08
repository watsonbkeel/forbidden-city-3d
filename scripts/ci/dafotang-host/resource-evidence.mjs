import assert from 'node:assert/strict';import path from 'node:path';
export const MEMORY_POLICY=Object.freeze({schema:1,rssThresholdBytes:768*1024**2,minimumTotalBytes:8192*1024**2,admissionAvailableBytes:6144*1024**2,pressureFloorBytes:2048*1024**2,pollIntervalSeconds:.25,maximumGapSeconds:1,maximumReadSeconds:1,maximumSamples:1024,maximumAncestors:32,maximumOwnedProcesses:64});
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
export function assertMemoryRun(report,launchReceipt,identity){
 assertMemoryAdmission(launchReceipt,identity);memoryKeys(report,['schema','policy','admission','admissionReadSeconds','samples','failure','complete']);assert.equal(report.schema,1);assert.deepEqual(report.policy,MEMORY_POLICY);assert.equal(report.failure,null);assert.equal(report.complete,true);memoryTime(report.admissionReadSeconds);memoryAdmissionSnapshot(report.admission);
 const a=report.admission,b=launchReceipt.admission;assert.deepEqual(a.topology,b.topology,'Prelaunch memory topology drift');assert.equal(a.memTotalBytes,b.memTotalBytes);assert.equal(a.globalOOMKills,b.globalOOMKills);assert.deepEqual(a.ancestorOOM,b.ancestorOOM);
 assert.ok(Array.isArray(report.samples)&&report.samples.length>=2&&report.samples.length<=MEMORY_POLICY.maximumSamples,'Missing/bounded memory observations');let last=0;
 for(const [i,s] of report.samples.entries()){memoryKeys(s,['seconds','readSeconds','memAvailableBytes','effectiveAvailableBytes','globalOOMKills','cgroupCurrentBytes','ancestorOOM']);assert.ok(Number.isFinite(s.seconds)&&s.seconds>=last&&s.seconds-last<=MEMORY_POLICY.maximumGapSeconds,'Memory observation gap/order');if(i===0){assert.equal(s.seconds,0);for(const k of ['memAvailableBytes','effectiveAvailableBytes','globalOOMKills','cgroupCurrentBytes','ancestorOOM'])assert.deepEqual(s[k],a[k],'Admission sample mismatch');}memoryTime(s.readSeconds);assert.ok(memoryEffective(s,a.memTotalBytes,a.topology)>=MEMORY_POLICY.pressureFloorBytes,'Runtime memory pressure');assert.equal(s.globalOOMKills,a.globalOOMKills,'Host OOM changed');assert.deepEqual(s.ancestorOOM,a.ancestorOOM,'Cgroup OOM changed');last=s.seconds;}
 return report;
}


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
 const allowed={node:['host-controller','node-auxiliary'],esbuild:['esbuild'],chrome:['browser','zygote','renderer','gpu','utility','unknown'],unknown:['unknown']},pids=new Set();let skipped=value.truncatedCount,total=0;
 for(const row of value.rows){
  memoryKeys(row,['pid','starttime','rssBytes','executableKind','role','status']);
  for(const key of ['pid','starttime','rssBytes'])memoryNumber(row[key]);assert.ok(row.pid>0&&!pids.has(row.pid),'Role PID identity');pids.add(row.pid);total+=row.rssBytes;
  assert.ok(Object.hasOwn(allowed,row.executableKind)&&allowed[row.executableKind].includes(row.role),'Role enum');
  assert.ok(['observed','budget-exhausted','exited-or-unreadable','identity-changed','read-unavailable'].includes(row.status),'Role row status');
  if(row.status!=='observed'){skipped++;assert.equal(row.executableKind,'unknown');assert.equal(row.role,'unknown');}
 }
 assert.ok(total<=value.triggerRSSBytes,'Role RSS subset');assert.equal(value.skippedCount,skipped);assert.equal(value.complete,skipped===0);assert.equal(value.status,skipped===0?'captured':'partial');return value;
}

