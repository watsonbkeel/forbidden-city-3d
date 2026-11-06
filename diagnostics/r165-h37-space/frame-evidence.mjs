import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
export function encode(value,seen=new Set()){
 if(value===null)return'null';if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Non-finite frame number');return Object.is(value,-0)?'-0':JSON.stringify(value);}
 if(typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
 if(typeof value!=='object'||seen.has(value))throw Error('Unsupported/cyclic frame value');
 seen.add(value);let result;
 if(Array.isArray(value)){if(Object.keys(value).length!==value.length)throw Error('Sparse/extended frame array');result='['+value.map(x=>encode(x,seen)).join(',')+']';}
 else {if(![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Non-plain frame object');const keys=Reflect.ownKeys(value);if(keys.some(k=>typeof k!=='string'||!Object.getOwnPropertyDescriptor(value,k).enumerable||!('value'in Object.getOwnPropertyDescriptor(value,k))))throw Error('Non-data frame property');result='{'+keys.map(k=>JSON.stringify(k)+':'+encode(value[k],seen)).join(',')+'}';}
 seen.delete(value);return result;
}
function size(root){let total=0;for(const name of fs.readdirSync(root)){const p=path.join(root,name),s=fs.lstatSync(p);if(s.isSymbolicLink())throw Error('Evidence symlink forbidden');if(s.isDirectory())total+=size(p);else if(s.isFile())total+=s.size;else throw Error('Evidence special file forbidden');}return total;}
export class FrameEvidence{
 constructor({dir,phase,quotaBytes=512*1024*1024,reserveBytes=1024*1024*1024}){assert.ok(['P1','P2C'].includes(phase));this.dir=dir;this.phase=phase;this.quota=quotaBytes;this.reserve=reserveBytes;this.rows=[];}
 guard(extra=0){const st=fs.statfsSync(this.dir);if(st.bavail*st.bsize-extra<this.reserve||size(this.dir)+extra>this.quota)throw Error('Frame evidence disk contract');}
 save(){const text=JSON.stringify({phase:this.phase,rows:this.rows},null,2)+'\n';this.guard(Buffer.byteLength(text));const file=path.join(this.dir,'FRAME-INDEX-'+this.phase+'.json'),tmp=file+'.tmp';fs.writeFileSync(tmp,text,{flag:'wx'});fs.renameSync(tmp,file);this.guard();}
 writeReport(file,text){this.guard(Buffer.byteLength(text));fs.writeFileSync(file,text);this.guard();}
 capture(q,identity,legacyHash){
  assert.ok(q&&Array.isArray(q.frames));const frames=q.frames,before=legacyHash(frames),index=this.rows.length;this.legacyHash=legacyHash;
  const file=this.phase+'-'+String(index).padStart(3,'0')+'.frames.json',row={index,identity,status:'writing',file,frameCount:frames.length,frameSHA256:before};this.rows.push(row);let fd;
  try{this.guard();const baselineBytes=size(this.dir);let nextDiskCheck=0;fd=fs.openSync(path.join(this.dir,file),'wx');const digest=crypto.createHash('sha256');let bytes=0;
   const append=text=>{const buffer=Buffer.from(text);if(baselineBytes+bytes+buffer.length>this.quota)throw Error('Frame evidence quota');if(bytes>=nextDiskCheck){const st=fs.statfsSync(this.dir);if(st.bavail*st.bsize-buffer.length-1024*1024<this.reserve)throw Error('Frame disk reserve');nextDiskCheck=bytes+1024*1024;}let offset=0;while(offset<buffer.length){const n=fs.writeSync(fd,buffer,offset,buffer.length-offset);if(n<=0)throw Error('Frame write made no progress');offset+=n;}digest.update(buffer);bytes+=buffer.length;};
   append('[');for(let i=0;i<frames.length;i++){if(i)append(',');append(encode(frames[i]));}append(']\n');fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
   assert.equal(q.frames,frames,'Capture must keep original frame array');assert.equal(legacyHash(frames),before,'Capture must not mutate original frames');
   this.guard();Object.assign(row,{status:'captured',bytes,fileSHA256:digest.digest('hex')});this.save();return row;
  }catch(error){if(fd!==undefined)fs.closeSync(fd);row.status='capture-failed';row.error=String(error);try{this.save();}catch{}throw error;}
 }
 passed(indices){for(const i of indices){const row=this.rows[i];assert.ok(row&&row.index===i&&row.status==='captured','Only actual captured, not previously passed identity');row.status='passed';}this.save();}
 thrown(error,identity){this.rows.push({index:this.rows.length,identity,status:'not-returned',file:null,error:String(error)});this.save();}
 assertComplete(count){assert.equal(this.rows.length,count);for(const row of this.rows){assert.equal(row.status,'passed');assert.ok(row.bytes>0&&/^[0-9a-f]{64}$/.test(row.fileSHA256));const bytes=fs.readFileSync(path.join(this.dir,row.file));assert.equal(bytes.length,row.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.fileSHA256);const actual=JSON.parse(bytes);assert.equal(actual.length,row.frameCount);assert.equal(this.legacyHash(actual),row.frameSHA256);}this.save();}
}
