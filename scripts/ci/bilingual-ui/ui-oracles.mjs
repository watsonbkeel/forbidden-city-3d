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
