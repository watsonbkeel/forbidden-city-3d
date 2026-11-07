import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {sha256,assertIdentity} from './common.mjs';
import {EXPECTED_E46} from './ui-oracles.mjs';
const specBytes=fs.readFileSync(new URL('./font-spec.json',import.meta.url));
export const FONT_SPEC=JSON.parse(specBytes),FONT_SPEC_SHA256=sha256(specBytes);
export const EXPECTED_INSTALLED={files:FONT_SPEC.members.filter(r=>r.type==='regular'&&(r.path.startsWith('./usr/share/fonts/')||r.path.includes('/fontconfig/'))).map(r=>({path:r.path.slice(1),bytes:r.bytes,sha256:r.sha256})),configLink:{path:'/etc/fonts/conf.d/70-fonts-noto-cjk.conf',target:'/usr/share/fontconfig/conf.avail/70-fonts-noto-cjk.conf'}};
export const MAP_ORACLES=Object.freeze([
 {id:'taihe','zh-CN':'太和殿',en:'Hall of Supreme Harmony'},
 {id:'wumen','zh-CN':'午门',en:'Meridian Gate'},
 {id:'place-layout-5ecc54dc81','zh-CN':'神武门',en:'Gate of Divine Prowess'}
]);
export const MAP_PNGS=Object.freeze([1280,390].flatMap(w=>['chinese','english'].map(lang=>`${w}-${lang}-map.png`)));
export const DOM_ORACLES=Object.freeze([
 {id:'map-title',selector:'#minimap-title',text:'故宫平面图',bold:true},
 {id:'zoom-in',selector:'#minimap-tools > button:nth-of-type(1)',text:'＋',bold:false},
 {id:'zoom-out',selector:'#minimap-tools > button:nth-of-type(2)',text:'－',bold:false},
 {id:'taihe-directory',selector:'#place-directory button[data-place-id="taihe"]',text:'太和殿',bold:false},
 {id:'taihe-title',selector:'#place-title',text:'太和殿',bold:true},
 {id:'taihe-summary',selector:'#place-info .place-summary',text:'登极、册后以及重要节庆的朝贺，都曾在这里举行。',bold:false,supportive:true},
 {id:'e46-directory',selector:'#supplemental-place-directory button[data-place-id="supp-fc-4d8561ae5d"]',text:'祥旭门',bold:false},
 {id:'e46-title',selector:'#place-title',text:'祥旭门',bold:true},
 {id:'e46-summary',selector:'#place-info .place-summary',text:EXPECTED_E46['zh-CN'].summary,bold:false,supportive:true}
]);
const keys=(v,names)=>assert.deepEqual(Object.keys(v).sort(),[...names].sort());
const finite=(v,name)=>assert.ok(typeof v==='number'&&Number.isFinite(v),name);
function rect(r){keys(r,['x','y','width','height']);for(const k of Object.keys(r))finite(r[k],'Nonfinite rectangle');assert.ok(r.width>0&&r.height>0,'Empty rectangle');return r;}
const contains=(outer,inner)=>inner.x>=outer.x-.01&&inner.y>=outer.y-.01&&inner.x+inner.width<=outer.x+outer.width+.01&&inner.y+inner.height<=outer.y+outer.height+.01;
const approximately=(a,b)=>assert.ok(Math.abs(a-b)<.01,'Wrong actual label projection');
export function assertFontSummary(q,identity){
 assert.equal(q.schema,1);assert.equal(q.status,'passed');assertIdentity(q.identity,identity);assert.match(q.receiptSHA256,/^[a-f0-9]{64}$/);assert.equal(q.specSHA256,FONT_SPEC_SHA256);assert.deepEqual(q.installed,EXPECTED_INSTALLED);assert.deepEqual(q.faces,FONT_SPEC.faces.map(f=>Object.fromEntries(['path','sha256','index','family','style','postScriptName'].map(k=>[k,f[k]]))));return q;
}
export function assertDOMFont(q){
 keys(q,['id','selector','text','lang','computedFont','fonts']);const expected=DOM_ORACLES.find(o=>o.id===q.id);assert.ok(expected,'Unknown font target');assert.equal(q.selector,expected.selector);assert.equal(q.text,expected.text);assert.equal(q.lang,'zh-CN');assert.ok(typeof q.computedFont==='string'&&q.computedFont.trim().length>0&&q.computedFont.length<512);assert.ok(Array.isArray(q.fonts)&&q.fonts.length>0&&q.fonts.length<=8);
 const wanted=expected.bold?'NotoSansCJKsc-Bold':'NotoSansCJKsc-Regular';let covered=0;
 for(const f of q.fonts){keys(f,['familyName','postScriptName','isCustomFont','glyphCount']);assert.ok(typeof f.familyName==='string'&&typeof f.postScriptName==='string'&&typeof f.isCustomFont==='boolean'&&Number.isSafeInteger(f.glyphCount)&&f.glyphCount>=0);if(f.postScriptName===wanted){assert.equal(f.familyName,'Noto Sans CJK SC');assert.equal(f.isCustomFont,false);covered+=f.glyphCount;}else if(!expected.supportive)assert.equal(f.glyphCount,0,'Other font rendered required Chinese/symbol text');}
 assert.ok(covered>0,'No actual SC glyph usage');if(!expected.supportive)assert.ok(covered>=Array.from(expected.text).length,'Incomplete actual Chinese glyph usage');
 const required=new Set(FONT_SPEC.requiredCodepoints);for(const ch of q.text){const cp=ch.codePointAt(0);if(cp>=0x3400&&cp<=0x9fff||cp>=0x3000&&cp<=0x303f||cp>=0xff01&&cp<=0xff60)assert.ok(required.has(cp),'Uncovered observed CJK codepoint');}return q;
}
export function assertMapEndpoint(q,width,height,lang){
 keys(q,['lang','width','height','file','visible','detailVisible','compact','deviceScaleFactor','view','mapSize','mapHeight','pxPerUnit','canvas','clip','screenshot','labels']);assert.equal(q.lang,lang);assert.equal(q.width,width);assert.equal(q.height,height);assert.equal(q.file,`${width}-${lang==='en'?'english':'chinese'}-map.png`);assert.equal(q.visible,true);assert.equal(q.detailVisible,false);assert.equal(q.compact,false);assert.equal(q.deviceScaleFactor,1);keys(q.view,['k','cx','cy']);assert.equal(q.view.k,1);for(const n of ['mapSize','mapHeight','pxPerUnit']){finite(q[n],n);assert.ok(q[n]>0);}approximately(q.view.cx,q.mapSize/2);approximately(q.view.cy,q.mapHeight/2);
 keys(q.canvas,['viewW','viewH','drawScale','backingWidth','backingHeight','borderBox','insets','rect']);const c=q.canvas,canvas=rect(c.rect),box=rect(c.borderBox),clip=rect(q.clip),shot=rect(q.screenshot);assert.deepEqual(shot,{x:0,y:0,width,height});for(const k of ['viewW','viewH','drawScale']){finite(c[k],k);assert.ok(c[k]>0);}assert.equal(c.drawScale,q.deviceScaleFactor);keys(c.insets,['left','right','top','bottom']);for(const k of Object.keys(c.insets)){finite(c.insets[k],k);assert.ok(c.insets[k]>=0);}approximately(canvas.x,box.x+c.insets.left);approximately(canvas.y,box.y+c.insets.top);approximately(canvas.width,box.width-c.insets.left-c.insets.right);approximately(canvas.height,box.height-c.insets.top-c.insets.bottom);for(const k of ['backingWidth','backingHeight'])assert.ok(Number.isSafeInteger(c[k])&&c[k]>0);assert.equal(c.backingWidth,Math.round(c.viewW*c.drawScale));assert.equal(c.backingHeight,Math.round(c.viewH*c.drawScale));approximately(q.pxPerUnit,Math.min(c.viewW/q.mapSize,c.viewH/q.mapHeight)*q.view.k);const sx=c.drawScale*canvas.width/c.backingWidth,sy=c.drawScale*canvas.height/c.backingHeight;assert.ok(contains(clip,canvas)&&contains(shot,canvas),'Canvas clipped in screenshot');assert.ok(Array.isArray(q.labels)&&q.labels.length===MAP_ORACLES.length);const ids=new Set();
 for(const label of q.labels){keys(label,['id','text','map','screen']);assert.ok(!ids.has(label.id));ids.add(label.id);const expected=MAP_ORACLES.find(r=>r.id===label.id);assert.ok(expected);assert.equal(label.text.replace(/\n/g,' '),expected[lang]);const map=rect(label.map),screen=rect(label.screen);approximately(screen.width,map.width*q.pxPerUnit*sx);approximately(screen.height,map.height*q.pxPerUnit*sy);approximately(screen.x,canvas.x+(c.viewW/2+(map.x-q.view.cx)*q.pxPerUnit)*sx-screen.width/2);approximately(screen.y,canvas.y+(c.viewH/2+(map.y-q.view.cy)*q.pxPerUnit)*sy-screen.height/2);assert.ok(contains(canvas,screen)&&contains(clip,screen)&&contains(shot,screen),'Required label is clipped');}return q;
}
export function assertFontLayout(q,width,height){
 keys(q,['schema','dom','mapEndpoints']);assert.equal(q.schema,1);assert.deepEqual(q.dom.map(r=>r.id),DOM_ORACLES.map(r=>r.id));q.dom.forEach(assertDOMFont);assert.equal(q.mapEndpoints.length,2);q.mapEndpoints.forEach((r,i)=>assertMapEndpoint(r,width,height,['zh-CN','en'][i]));return q;
}

/** Additional endpoint observations only, after all retained UI assertions. */
export async function captureFontEndpoints(page,width,height,output,settleLocale){
 const evidence={schema:1,dom:[],mapEndpoints:[]},cdp=await page.context().newCDPSession(page);
 async function usedFont(id){
  const expected=DOM_ORACLES.find(o=>o.id===id);assert.ok(expected);
  await page.locator(expected.selector).scrollIntoViewIfNeeded();
  const observed=await page.locator(expected.selector).evaluate(el=>({text:el.textContent,lang:document.documentElement.lang,computedFont:getComputedStyle(el).font}));
  const {root}=await cdp.send('DOM.getDocument',{depth:0,pierce:false});
  const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:expected.selector});assert.ok(nodeId>0,'Missing real font node');
  const response=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
  const fonts=response.fonts.map(({familyName,postScriptName,isCustomFont,glyphCount})=>({familyName,postScriptName,isCustomFont,glyphCount}));
  const record={id,selector:expected.selector,...observed,fonts};assertDOMFont(record);evidence.dom.push(record);
 }
 async function fullMap(lang){
  await page.locator('#map-language').selectOption(lang);await settleLocale(page,lang);
  const buttons=page.locator('#minimap-tools > button');assert.equal(await buttons.count(),4,'Map controls changed');const reset=buttons.nth(3);assert.equal(await reset.textContent(),lang==='en'?'Full map':'全图');await reset.click();
 }
 async function mapImage(lang){
  const canvas=page.locator('#minimap > canvas');assert.equal(await canvas.count(),1);await canvas.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
  const q=await page.evaluate(({width,height,lang,ids})=>{
   const f=window.fixture,m=f.map,el=m.canvas,r=el.getBoundingClientRect(),css=getComputedStyle(el),insets={left:parseFloat(css.borderLeftWidth)+parseFloat(css.paddingLeft),right:parseFloat(css.borderRightWidth)+parseFloat(css.paddingRight),top:parseFloat(css.borderTopWidth)+parseFloat(css.paddingTop),bottom:parseFloat(css.borderBottomWidth)+parseFloat(css.paddingBottom)},borderBox={x:r.x,y:r.y,width:r.width,height:r.height},content={x:r.x+insets.left,y:r.y+insets.top,width:r.width-insets.left-insets.right,height:r.height-insets.top-insets.bottom},sx=m.dpr*content.width/el.width,sy=m.dpr*content.height/el.height;
   const clip={x:0,y:0,width:innerWidth,height:innerHeight};let visible=m.visible&&!el.hidden;
   for(let node=el;node;node=node.parentElement){const style=getComputedStyle(node);if(node.hidden||node.inert||style.display==='none'||['hidden','collapse'].includes(style.visibility)||Number(style.opacity)===0)visible=false;if(node!==el){const b=node.getBoundingClientRect(),x=b.x+node.clientLeft,y=b.y+node.clientTop;if(/hidden|clip|auto|scroll/.test(style.overflowX)){const end=Math.min(clip.x+clip.width,x+node.clientWidth);clip.x=Math.max(clip.x,x);clip.width=Math.max(0,end-clip.x);}if(/hidden|clip|auto|scroll/.test(style.overflowY)){const end=Math.min(clip.y+clip.height,y+node.clientHeight);clip.y=Math.max(clip.y,y);clip.height=Math.max(0,end-clip.y);}}}
   const labels=ids.map(id=>{const rows=m.labelPaintRecords.filter(label=>label.placeId===id);if(rows.length!==1)throw Error('Missing/duplicate required actual map label: '+id);const label=rows[0],p=m.mapToScreen(label.x,label.y),w=label.width*m.pxPerUnit*sx,h=label.height*m.pxPerUnit*sy;return{id,text:label.text,map:{x:label.x,y:label.y,width:label.width,height:label.height},screen:{x:content.x+p.x*sx-w/2,y:content.y+p.y*sy-h/2,width:w,height:h}};});
   return{lang:document.documentElement.lang,width:innerWidth,height:innerHeight,file:`${width}-${lang==='en'?'english':'chinese'}-map.png`,visible,detailVisible:m.detailVisible,compact:m.compact,deviceScaleFactor:devicePixelRatio,view:{...m.view},mapSize:m.mapSize,mapHeight:m.mapHeight,pxPerUnit:m.pxPerUnit,canvas:{viewW:m.viewW,viewH:m.viewH,drawScale:m.dpr,backingWidth:el.width,backingHeight:el.height,borderBox,insets,rect:content},clip,screenshot:{x:0,y:0,width:innerWidth,height:innerHeight},labels};
  },{width,height,lang,ids:MAP_ORACLES.map(r=>r.id)});
  assertMapEndpoint(q,width,height,lang);await page.screenshot({path:path.join(output,q.file),fullPage:false});evidence.mapEndpoints.push(q);
 }
 try{
  await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  // The retained reload/preference check has already completed. These real
  // control actions do not replace or interleave with any old before/after.
  await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('m');
  await page.waitForFunction(()=>window.fixture.map.visible&&!window.fixture.map.detailVisible&&!window.fixture.map.compact);
  await fullMap('zh-CN');for(const id of ['map-title','zoom-in','zoom-out'])await usedFont(id);await mapImage('zh-CN');
  await page.locator('#place-search').fill('太和殿');await usedFont('taihe-directory');await page.locator(DOM_ORACLES.find(o=>o.id==='taihe-directory').selector).click();await usedFont('taihe-title');await usedFont('taihe-summary');await page.locator('#place-back').click();
  await page.locator('#place-search').fill('祥旭门');await usedFont('e46-directory');await page.locator(DOM_ORACLES.find(o=>o.id==='e46-directory').selector).click();await usedFont('e46-title');await usedFont('e46-summary');await page.locator('#place-back').click();
  await page.locator('#place-search').fill('');await fullMap('en');await mapImage('en');
  assert.equal(await page.evaluate(()=>window.fixture.teleports.length),0,'Font observations moved the user');assertFontLayout(evidence,width,height);return evidence;
 }finally{await cdp.detach();}
}

/** Replay the fixed preparation receipt. This is not a system-wide write audit. */
export function assertFontReceipt(q,summary,identity){
 assertFontSummary(summary,identity);assert.equal(q.schema,1);assert.equal(q.status,'passed');assertIdentity(q.identity,identity);assert.equal(q.specSHA256,FONT_SPEC_SHA256);
 assert.deepEqual(q.package,{name:FONT_SPEC.package,...Object.fromEntries(['version','url','bytes','sha256'].map(k=>[k,FONT_SPEC[k]]))});
 assert.equal(q.transactionState,'complete');assert.equal(q.beforeAudit,'');assert.equal(q.afterAudit,'');assert.ok(JSON.stringify(q.changes)==='[]'||JSON.stringify(q.changes)===JSON.stringify([FONT_SPEC.package]));assert.deepEqual(q.simulationChanges,q.changes);assert.deepEqual(q.installed,EXPECTED_INSTALLED);assert.equal(q.scratchClean,true);
 assert.equal(q.faces.length,FONT_SPEC.faces.length);for(const [i,f] of q.faces.entries()){const expected=FONT_SPEC.faces[i];for(const k of Object.keys(expected))assert.deepEqual(f[k],expected[k]);assert.equal(f.missingCodepoint,0x10ffff);assert.equal(f.missingGlyphIndex,0);assert.equal(f.glyphs.length,FONT_SPEC.requiredCodepoints.length);for(const [n,g] of f.glyphs.entries()){keys(g,['codepoint','glyphIndex']);assert.equal(g.codepoint,FONT_SPEC.requiredCodepoints[n]);assert.ok(Number.isSafeInteger(g.glyphIndex)&&g.glyphIndex>0&&g.glyphIndex<=0xffffffff);}}
 assert.match(q.freetype.version,/^\d+\.\d+\.\d+$/);assert.match(q.freetype.sha256,/^[a-f0-9]{64}$/);assert.match(q.freetype.path,/^\/usr\/lib\/x86_64-linux-gnu\/libfreetype\.so\.6\.[0-9.]+$/);assert.ok(Number.isSafeInteger(q.freetype.bytes)&&q.freetype.bytes>0&&q.freetype.bytes<=32*1024**2);
 assert.match(q.fontconfig.version,/^fontconfig version \d+\.\d+\.\d+$/);assert.equal(q.fontconfig.matches.length,2);assert.equal(q.fontconfig.queries.length,2);for(const [i,f] of FONT_SPEC.faces.entries()){assert.deepEqual(q.fontconfig.matches[i],{path:f.path,index:String(f.index),family:f.family,postScriptName:f.postScriptName});const query=q.fontconfig.queries[i];keys(query,['face','fontVersion']);assert.equal(query.face,f.postScriptName);assert.match(query.fontVersion,/^[0-9]{1,10}$/);}
 assertAptSource(q.aptSource,q.commands.slice(3,5));assert.equal(q.aptOrigin,q.aptSource.policy.raw);const fp=q.footprint;assert.equal(fp.normalMaintscriptsAndTriggers,true);assert.equal(fp.maintscriptSHA256,'f85775a5ec255da85d32cd6604dc1daea5d57cf30908b2520dd3e0463159754c');assert.equal(fp.legacyConffileMigration,'/etc/fonts/conf.avail/70-fonts-noto-cjk.conf');assert.deepEqual(fp.normalSystemWrites,['/var/lib/dpkg','/var/log/apt','/var/log/dpkg.log','/var/cache/fontconfig']);
 for(const name of ['cacheBefore','cacheAfter']){const rows=fp[name];assert.ok(Array.isArray(rows)&&rows.length<=256);const names=new Set();let bytes=0;for(const row of rows){keys(row,['name','bytes','mtimeNs']);assert.match(row.name,/^[A-Za-z0-9._-]{1,128}$/);assert.ok(!names.has(row.name));names.add(row.name);assert.ok(Number.isSafeInteger(row.bytes)&&row.bytes>=0&&Number.isInteger(row.mtimeNs)&&row.mtimeNs>=0);bytes+=row.bytes;}assert.ok(bytes<=64*1024**2);}
 keys(q.contracts,['tests','passed','outputSHA256']);assert.equal(q.contracts.tests,31);assert.equal(q.contracts.passed,true);assert.match(q.contracts.outputSHA256,/^[a-f0-9]{64}$/);
 const programs=['python3','dpkg','dpkg-query','apt-cache','apt-cache','curl','apt-get',...(q.changes.length?['sudo']:[]),'dpkg','dpkg-query','fc-match','fc-match','fc-query','fc-match','fc-query'];assert.deepEqual(q.commands.map(c=>c.program),programs);for(const c of q.commands){keys(c,['program','exit','stdoutBytes','stderrBytes','logTruncated']);assert.equal(c.exit,0);assert.equal(typeof c.logTruncated,'boolean');for(const k of ['stdoutBytes','stderrBytes'])assert.ok(Number.isSafeInteger(c[k])&&c[k]>=0&&c[k]<=1024**2);}
 return q;
}

// Replay only the fixed package's direct or hosted-runner mirror origin.
const APT_MIRROR_PATH='/etc/apt/apt-mirrors.txt';
const APT_MIRRORS=[{url:'http://azure.archive.ubuntu.com/ubuntu/',priority:1},{url:'https://archive.ubuntu.com/ubuntu/',priority:2},{url:'https://security.ubuntu.com/ubuntu/',priority:3}];
function sourceRaw(q,limit){
 keys(q,['raw','bytes','sha256']);assert.equal(typeof q.raw,'string');assert.ok(!q.raw.includes('\0'));const b=Buffer.from(q.raw,'utf8');assert.equal(b.toString('utf8'),q.raw,'Invalid source Unicode');assert.ok(b.length<=limit);assert.ok(Number.isSafeInteger(q.bytes));assert.equal(q.bytes,b.length);assert.equal(q.sha256,sha256(b));return q.raw;
}
function sourceLines(raw){
 // Keep only the existing CRLF/LF/CR syntax and ASCII space/tab delimiters.
 assert.doesNotMatch(raw,/[\x0b\x0c\x1c-\x1f\x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/,'Non-ASCII source whitespace');return raw.split(/\r\n|\n|\r/);
}
function sourceMirrors(raw){
 const entries=sourceLines(raw).filter(s=>s.replace(/^[ \t]+|[ \t]+$/g,'')).map(line=>{const m=/^[ \t]*(\S+)[ \t]+priority:([1-3])[ \t]*$/.exec(line);assert.ok(m,'Unknown mirror syntax');return{url:m[1],priority:Number(m[2])};});assert.deepEqual(entries,APT_MIRRORS);return entries;
}
function sourceShow(raw){
 const fields=Object.create(null);let previous=null,ended=false;
 for(const line of sourceLines(raw)){if(!line.replace(/^[ \t]+|[ \t]+$/g,'')){if(Object.keys(fields).length)ended=true;continue;}assert.equal(ended,false,'Multiple package stanzas');if(/^[ \t]/.test(line)){assert.ok(previous);fields[previous]+='\n'+line;continue;}const m=/^([A-Za-z0-9-]+):[ \t]*(.*)$/.exec(line);assert.ok(m&&!Object.hasOwn(fields,m[1]));previous=m[1];fields[previous]=m[2].replace(/^[ \t]+|[ \t]+$/g,'');}
 const wanted={Package:FONT_SPEC.package,Architecture:FONT_SPEC.architecture,Version:FONT_SPEC.version,Origin:'Ubuntu',Filename:'pool/main/f/fonts-noto-cjk/'+FONT_SPEC.archiveName,Size:String(FONT_SPEC.bytes),SHA256:FONT_SPEC.sha256};for(const [k,v]of Object.entries(wanted))assert.equal(fields[k],v);return wanted;
}
function sourcePolicy(raw){
 const lines=sourceLines(raw).map(s=>s.replace(/^[ \t]+|[ \t]+$/g,'')).filter(Boolean);assert.ok(lines.length>=6);assert.equal(lines[0],FONT_SPEC.package+':');assert.ok(lines[1].startsWith('Installed: '));assert.equal(lines[2],'Candidate: '+FONT_SPEC.version);assert.equal(lines[3],'Version table:');const installed=lines[1].slice('Installed: '.length);assert.ok(['(none)',FONT_SPEC.version].includes(installed));let current=null,selectedHeaders=0,statusLines=0;const repositories=[];
 for(const line of lines.slice(4)){const header=/^(\*\*\* )?(\S+) ([0-9]+)$/.exec(line);if(header){current=header[2];if(current===FONT_SPEC.version){selectedHeaders++;assert.equal(Boolean(header[1]),installed===FONT_SPEC.version);}else assert.equal(header[1],undefined);continue;}assert.ok(current);const row=/^([0-9]+) (\S+)(?: (\S+) (\S+) (\S+))?$/.exec(line);assert.ok(row,'Unrecognized policy row');if(current!==FONT_SPEC.version)continue;if(row[2]==='/var/lib/dpkg/status'){assert.equal(row[1],'100');assert.equal(row[3],undefined);assert.equal(installed,FONT_SPEC.version);assert.equal(++statusLines,1);continue;}assert.deepEqual(row.slice(3),['noble/main','amd64','Packages']);const uri=row[2];assert.ok(uri==='mirror+file:'+APT_MIRROR_PATH||/^https?:\/\/(?:[a-z]+\.)?archive\.ubuntu\.com\/ubuntu\/?$/.test(uri));assert.ok(!repositories.includes(uri)&&repositories.length<4);repositories.push(uri);}
 assert.equal(selectedHeaders,1);assert.ok(repositories.length>0);assert.equal(statusLines,installed===FONT_SPEC.version?1:0);return{installed,candidate:FONT_SPEC.version,version:FONT_SPEC.version,repositories,installedStatus:Boolean(statusLines)};
}
export function assertAptSource(q,commands){
 keys(q,['schema','status','show','policy','mirror','selected']);assert.equal(q.schema,1);assert.equal(q.status,'qualified');const show=sourceRaw(q.show,16384),policy=sourceRaw(q.policy,16384);sourceShow(show);const selected=sourcePolicy(policy);assert.deepEqual(q.selected,selected);assert.ok(Array.isArray(commands)&&commands.length===2);
 for(const [i,c]of commands.entries()){assert.equal(c.program,'apt-cache');assert.equal(c.exit,0);assert.ok(Number.isSafeInteger(c.stdoutBytes));assert.equal(c.stdoutBytes,[q.show,q.policy][i].bytes);}
 if(selected.repositories.includes('mirror+file:'+APT_MIRROR_PATH)){const m=q.mirror;keys(m,['path','raw','bytes','sha256','metadata','entries']);assert.equal(m.path,APT_MIRROR_PATH);const raw=sourceRaw(Object.fromEntries(['raw','bytes','sha256'].map(k=>[k,m[k]])),4096),mta=m.metadata;keys(mta,['dev','ino','uid','gid','mode','size','mtimeNs','ctimeNs']);for(const k of ['dev','ino','mtimeNs','ctimeNs']){assert.equal(typeof mta[k],'string');assert.match(mta[k],/^[0-9]+$/);}assert.equal(mta.uid,0);assert.ok(Number.isSafeInteger(mta.gid)&&mta.gid>=0);assert.equal(mta.size,m.bytes);assert.equal(typeof mta.mode,'string');assert.match(mta.mode,/^[0-7]{6}$/);const mode=parseInt(mta.mode,8);assert.equal(mode&0o170000,0o100000);assert.equal(mode&0o22,0);assert.deepEqual(m.entries,sourceMirrors(raw));}else assert.equal(q.mirror,null);return q;
}
