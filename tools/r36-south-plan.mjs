// Source-coordinate schematic only. Not a render, measured map or walk test.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { southWaterProfile } from '../src/scene/palace/special/SouthWaterSystem.js';
import { innerJinshuiProfile } from '../src/scene/palace/special/InnerJinshui.js';
const out=process.argv[2]??'docs/current-state/r36-south/plan';fs.mkdirSync(out,{recursive:true});
const files=['src/scene/Layout.js','src/scene/palace/special/SouthWaterSystem.js','src/scene/palace/special/SouthCourtProfiles.js','data/zones/outer-east.json','data/zones/outer-west.json','data/zones/axis-courts.json'];
const identities=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const river=PALACE_LAYOUT.find(i=>i.type==='river'),water=southWaterProfile(river),base=innerJinshuiProfile(river);
const zones=['outer-east','outer-west','axis-courts'].map(z=>JSON.parse(fs.readFileSync(`data/zones/${z}.json`)));
const items=zones.flatMap(z=>z.items.map(i=>({...i,zone:z.id}))).filter(i=>(i.z??i.z0??i.from?.[1]??999)<20&&(i.z??i.z1??i.to?.[1]??-999)>-485);
const bounds={x0:-380,x1:380,z0:-490,z1:50},scale=1.45,X=x=>45+(bounds.x1-x)*scale,Y=z=>95+(bounds.z1-z)*scale;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const rect=(x,z,w,d,fill,stroke,extra='')=>`<rect x="${X(x+w/2)}" y="${Y(z+d/2)}" width="${w*scale}" height="${d*scale}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const label=(x,z,s)=>`<text x="${X(x)}" y="${Y(z)}" text-anchor="middle" font-size="10">${escape(s)}</text>`;
let shapes=[];for(let x=-300;x<=300;x+=100)shapes.push(`<path d="M${X(x)} ${Y(bounds.z1)}V${Y(bounds.z0)}" stroke="#e2e8e5"/>`);
for(let z=-400;z<=0;z+=100)shapes.push(`<path d="M${X(bounds.x0)} ${Y(z)}H${X(bounds.x1)}" stroke="#e2e8e5"/>`);
for(const p of water.waterPolygons)shapes.push(`<polygon points="${p.map(v=>`${X(v.x).toFixed(2)},${Y(v.z).toFixed(2)}`).join(' ')}" fill="#90cad5" stroke="#2b7c8b"/>`);
for(const i of items){if(['wall','corridor'].includes(i.kind)&&i.from&&i.to){shapes.push(`<path d="M${X(i.from[0])} ${Y(i.from[1])}L${X(i.to[0])} ${Y(i.to[1])}" fill="none" stroke="${i.kind==='wall'?'#8a7470':'#bfae81'}" stroke-width="${i.kind==='wall'?2:5}" stroke-dasharray="4 2"/>`);continue;}if(i.kind==='courtWalls'){shapes.push(rect((i.x0+i.x1)/2,(i.z0+i.z1)/2,i.x1-i.x0,i.z1-i.z0,'none','#8a7470','stroke-width="2" stroke-dasharray="5 3"'));continue;}if(!['hall','gate','cityGate'].includes(i.kind)||!Number.isFinite(i.x)||!Number.isFinite(i.z))continue;if(!Number.isFinite(i.w)||!Number.isFinite(i.d)){shapes.push(`<circle cx="${X(i.x)}" cy="${Y(i.z)}" r="3" fill="#765b38"/>`);if(i.name)shapes.push(label(i.x,i.z+4,i.name));continue;}let w=i.w,d=i.d;if(i.rot==='east'||i.rot==='west'||Math.abs(i.rot??0)===Math.PI/2)[w,d]=[d,w];shapes.push(rect(i.x,i.z,w,d,i.southCourtProfile?'#d8ad65':'#ebd9b2','#7e5a3a'));if(i.name)shapes.push(label(i.x,i.z+2,i.name));}
for(const i of PALACE_LAYOUT.filter(i=>['午门','太和门','太和殿'].includes(i.name))){shapes.push(rect(i.position.x,i.position.z,i.dimensions.width,i.dimensions.depth,'#c99354','#684c33'));shapes.push(label(i.position.x,i.position.z,i.name));}
const bridges=[...base.bridges.map((b,i)=>({...b,id:`central-${i+1}`,axis:'z'})),...water.bridges];for(const b of bridges){const w=b.axis==='z'?b.width:b.length,d=b.axis==='z'?b.length:b.width;shapes.push(rect(b.x,b.z,w,d,'#f6f5ed','#607778'));}
for(const c of water.culverts)shapes.push(`<circle cx="${X(c.x)}" cy="${Y(c.z)}" r="6" fill="#304e63"/><title>${escape(c.id)}</title>`);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="950" viewBox="0 0 1200 950"><defs><clipPath id="planclip"><rect x="40" y="80" width="1120" height="805"/></clipPath></defs><rect width="1200" height="950" fill="#fbfaf5"/><g font-family="sans-serif" fill="#253c39"><text x="40" y="35" font-size="23">R36 南区模型坐标示意 / Source-coordinate plan</text><text x="40" y="60" font-size="13">北↑ 东→；1单位=1米仅为模型单位。不是实机截图、测绘图或已验证1:1叠图。</text><g clip-path="url(#planclip)">${shapes.join('')}</g><text x="40" y="915" font-size="12">金色=源数据建筑占地；蓝色=当前河网参数；白色=桥；虚线=墙廊轴线/院墙范围；点=位置，未虚设长宽。</text><text x="40" y="935" font-size="12">建筑屋顶/台阶外挑未全绘；涵洞上下层与真实通路另由三维几何测试验证。参数精度见来源表。</text></g></svg>`;
fs.writeFileSync(path.join(out,'MODEL-PLAN.svg'),svg);
fs.writeFileSync(path.join(out,'MODEL-PLAN.json'),JSON.stringify({kind:'SOURCE_COORDINATE_SCHEMATIC_NOT_RENDERED_NOT_SURVEYED',generatedAt:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceSHA256:identities,bounds,units:'metres; +X west, +Z north',limitations:['Only source footprints, not all constructed mesh envelopes.','Courtyard outlines do not depict all door gaps.','Diagram does not prove alignment with actual surveyed coordinates.'],bridges,culverts:water.culverts,waterReaches:water.reaches.map(r=>({id:r.id,controls:r.controls})),waterPolygonSummary:water.waterPolygons.map(p=>({vertices:p.length,sha256:crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex')}))},null,2)+'\n');
console.log(JSON.stringify({out,bridges:bridges.length,sources:Object.keys(identities).length}));
