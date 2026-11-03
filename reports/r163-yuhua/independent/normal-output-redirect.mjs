import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const out=next(url,context);
 if(url.endsWith('/tests/r163-yuhua-normal.test.mjs')){
 let source=String(out.source);
 const old="const output=new URL('../reports/r163-yuhua/normal-world.json',import.meta.url);";
 if(!source.includes(old))throw Error('Expected original output declaration missing');
 source=source.replace(old,"const output=new URL('file:///tmp/r163-independent-yuhua-normal-world.json');").replace("fs.mkdirSync(new URL('../reports/r163-yuhua/',import.meta.url),{recursive:true});",'');
 return {...out,source};
 }
 return out;
}});
