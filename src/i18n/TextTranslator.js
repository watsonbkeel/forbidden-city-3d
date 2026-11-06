const han = /[\u3400-\u9fff]/u;
const normalize = value => value.replace(/\s+/g,' ').trim();
const parameters = value => [...value.matchAll(/\$\{(\d+)\}/g)].map(m=>m[1]).sort().join(',');
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** Exact, bundled text patterns only. No HTML interpolation or remote service. */
export function createTextTranslator({messages,name=()=>null,onMissing=()=>{}}) {
  const exact=new Map(),patterns=[];
  for(const [source,target] of Object.entries(messages)){
    if(typeof target!=='string'||!target.trim()||parameters(source)!==parameters(target))throw Error(`Invalid translation parameters: ${source}`);
    const key=normalize(source),slots=[...key.matchAll(/\$\{(\d+)\}/g)];
    if(!slots.length){exact.set(key,target);continue;}
    let previous=0,expression='^';
    for(const slot of slots){expression+=escape(key.slice(previous,slot.index))+'([\\s\\S]*?)';previous=slot.index+slot[0].length;}
    expression+=escape(key.slice(previous))+'$';
    patterns.push({regex:new RegExp(expression,'u'),target,slots:slots.map(s=>s[1]),weight:key.replace(/\$\{\d+\}/g,'').length});
  }
  patterns.sort((a,b)=>b.weight-a.weight);
  const exactPrefixes=[...exact.keys()].filter(key=>key.length>=6).sort((a,b)=>b.length-a.length);
  const resolve=(value,depth=0)=>{
    const key=normalize(value);if(!key||!han.test(key))return value;
    let result=exact.get(key)??name(key)??undefined;
    if(result===undefined||result===null){
      if(depth<8)for(const pattern of patterns){const found=pattern.regex.exec(key);if(!found)continue;const args=Object.fromEntries(pattern.slots.map((slot,i)=>[slot,resolve(found[i+1],depth+1)]));result=pattern.target.replace(/\$\{(\d+)\}/g,(_m,id)=>args[id]);break;}
      if(result===undefined&&depth<8){const pieces=key.split(/( › | · |\n)/);if(pieces.length>1)result=pieces.map(p=>/^( › | · |\n)$/.test(p)?p:resolve(p,depth+1)).join('');}
      if(result===undefined&&depth<8){const prefix=exactPrefixes.find(text=>key.startsWith(text+' '));if(prefix)result=exact.get(prefix)+' '+resolve(key.slice(prefix.length+1),depth+1);}
    }
    if(result===undefined||result===null){onMissing(key);result='English text unavailable.';}
    return value.match(/^\s*/)[0]+result+value.match(/\s*$/)[0];
  };
  return (value,locale) => locale==='en'?resolve(String(value)):String(value);
}
