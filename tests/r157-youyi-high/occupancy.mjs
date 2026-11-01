import fs from'node:fs';import{buildR52World}from'../lib/r52-world.mjs';
const w=await buildR52World();try{
const out=[];for(const s of[-1,1]){const minX=s<0?94.7:114.7,maxX=s<0?106.7:126.7; const hits=w.cm.colliders.filter(c=>c.box.min.x<maxX&&c.box.max.x>minX&&c.box.min.z<-47.16&&c.box.max.z>-58.44&&c.box.max.y>0&&c.box.min.y<3.5).map(c=>({tag:c.tag,min:c.box.min.toArray(),max:c.box.max.toArray()}));out.push({s,hits});}fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2));console.log(out.map(x=>({s:x.s,hits:x.hits.length})));}finally{w.dispose();}
