import fs from 'node:fs';
import path from 'node:path';
import {assertAncestors,readRegular,copyRegularFile,sha256,requireThat,readIdentity,assertIdentity,parseArgs,isMain,failCLI} from './common.mjs';
export const ALLOWLIST=Object.freeze([
  'toolchain.json','monitor-contract.json','verified.json','ui-summary.json',
  'ui-components/source-before.json','ui-components/monitor.json','ui-components/full.log','ui-components/exit.txt',
  'ui-components/evidence/RESULT.json',
  ...['1280','390'].flatMap(w=>['english-card','english-settings','chinese-card'].map(k=>`ui-components/evidence/${w}-${k}.png`))
]);
export function collectEvidence({from,to,expectedHead,env=process.env,budgetBytes=128*1024*1024,metadataReserveBytes=64*1024,ordinaryLimitBytes=32*1024*1024}) {
  requireThat(/^[a-f0-9]{40}$/.test(expectedHead),'Invalid expected head');
  requireThat(Number.isSafeInteger(budgetBytes)&&budgetBytes<=128*1024*1024&&Number.isSafeInteger(metadataReserveBytes)&&metadataReserveBytes>=4096&&metadataReserveBytes<budgetBytes,'Invalid collection budget');
  requireThat(Number.isSafeInteger(ordinaryLimitBytes)&&ordinaryLimitBytes>0&&ordinaryLimitBytes<=32*1024*1024,'Invalid ordinary file limit');
  requireThat(path.isAbsolute(to)&&path.normalize(to)===to,'Absolute destination required');
  assertAncestors(to,false);
  fs.mkdirSync(to,{mode:0o700});
  const result={schema:1,expectedHead,copied:[],missing:[],rejected:[],rejectedOmitted:0,artifactBytes:0,budgetBytes,metadataReserveBytes,complete:false};
  const reject=(rel,reason)=>{
    if(result.rejected.length<32)result.rejected.push({path:String(rel).slice(0,256),reason:String(reason).slice(0,1024)});
    else result.rejectedOmitted++;
  };
  let identity;
  try {identity=readIdentity(env);requireThat(identity.eventSha===expectedHead,'Identity expected head mismatch');result.identity=identity;}
  catch(error){reject('.',error.message);}
  try {
    requireThat(typeof from==='string'&&path.isAbsolute(from)&&path.normalize(from)===from,'Missing absolute receipt root');
    assertAncestors(from);
    requireThat(fs.lstatSync(from).isDirectory(),'Receipt root not directory');
    requireThat(!to.startsWith(from+'/')&&!from.startsWith(to+'/')&&to!==from,'Overlapping evidence roots');
    const dirs=['','ui-components','ui-components/evidence'];
    for(const dir of dirs){
      const abs=path.join(from,dir);
      try {
        assertAncestors(abs);
        requireThat(fs.lstatSync(abs).isDirectory(),'Not directory');
        for(const item of fs.readdirSync(abs)){
          const rel=dir?dir+'/'+item:item;
          if(!ALLOWLIST.includes(rel)&&!dirs.includes(rel))reject(rel,'Unknown entry');
        }
      } catch(error){if(error.code!=='ENOENT')reject(dir||'.',error.message);}
    }
    for(const rel of ALLOWLIST){
      try {
        const remaining=budgetBytes-metadataReserveBytes-result.artifactBytes;
        const source=path.join(from,rel),destination=path.join(to,rel);
        let copied;
        if(rel==='ui-components/full.log'){
          // Logs may occupy most of the 128 MiB budget; do not load them into RAM.
          fs.mkdirSync(path.dirname(destination),{recursive:true,mode:0o700});
          copied=copyRegularFile(source,destination,remaining);
        } else {
          const bytes=readRegular(source,Math.min(ordinaryLimitBytes,remaining));
          if(rel.endsWith('.json')){
            try {const value=JSON.parse(bytes);if(identity)assertIdentity(value.identity,identity);}
            catch(error){reject(rel,'Invalid JSON receipt: '+error.message);}
          }
          fs.mkdirSync(path.dirname(destination),{recursive:true,mode:0o700});
          assertAncestors(destination,false);
          fs.writeFileSync(destination,bytes,{flag:'wx',mode:0o600});
          copied={bytes:bytes.length,sha256:sha256(bytes)};
        }
        result.artifactBytes+=copied.bytes;
        result.copied.push({path:rel,...copied});
      } catch(error){if(error.code==='ENOENT')result.missing.push(rel);else reject(rel,error.message);}
    }
  } catch(error){
    reject('.',error.message);
    result.missing=ALLOWLIST.filter(p=>!result.copied.some(x=>x.path===p));
  }
  result.complete=result.missing.length===0&&result.rejected.length===0&&result.rejectedOmitted===0;
  // Retain a bounded rejection summary without allowing hostile directory entries
  // or long errors to consume the bytes reserved for the collection receipt.
  let metadata=Buffer.from(JSON.stringify(result,null,2)+'\n');
  while(metadata.length>metadataReserveBytes&&result.rejected.length>1){
    result.rejected.pop();result.rejectedOmitted++;
    metadata=Buffer.from(JSON.stringify(result,null,2)+'\n');
  }
  requireThat(metadata.length<=metadataReserveBytes&&result.artifactBytes+metadata.length<=budgetBytes,'Collection metadata exceeds reserved budget');
  const receiptPath=path.join(to,'collection.json');
  assertAncestors(receiptPath,false);
  fs.writeFileSync(receiptPath,metadata,{flag:'wx',mode:0o600});
  return result;
}
if(isMain(import.meta.url)){
  try {
    const a=parseArgs(process.argv.slice(2),['--from','--to','--expected-head']);
    if(!collectEvidence({from:a['--from'],to:a['--to'],expectedHead:a['--expected-head']}).complete)process.exitCode=1;
  } catch(error){failCLI(error);}
}
