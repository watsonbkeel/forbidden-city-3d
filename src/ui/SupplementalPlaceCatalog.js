const QIANXING_SOURCE='https://wwj.beijing.gov.cn/bjww/resource/cms/article/bjww_362762/744041239/2026061517055186218.pdf';
const qianxingSource=s=>s.publisher==='北京市文物局'&&(s.url===QIANXING_SOURCE||s.url===QIANXING_SOURCE+'#page=55');
const fail=message=>{throw Error(`Supplemental place catalog: ${message}`);};
const text=(value,english=false)=>{if(typeof value!=='string'||!value.trim()||/[<>]/.test(value)||(english&&/[\u3400-\u9fff]/u.test(value)))fail('invalid bilingual text');};
const bilingual=value=>{if(!value||typeof value!=='object')fail('missing bilingual text');text(value.zh);text(value.en,true);};
const allowedBinding=new Set(['kind','name','x','z','w','d','rot','structure','objectId','sourceObjectId','parentObjectId','entryProfile','pavilionProfile','qinanProfile','profile','source','wholeObjectAccepted','sourceStatus']);
const matches=(item,binding)=>Object.entries(binding).every(([key,value])=>item[key]===value);
/** Additional text identities only. No geometry, targets or scene construction. */
export class SupplementalPlaceCatalog {
  constructor(data) {
    if(data?.schemaVersion!==1||!Array.isArray(data.records))fail('invalid data');
    this.records=new Map();this.byId=new Map();this.sourcesByPlace=new Map();this.bindings=[];const allSources=new Map();
    for(const row of data.records){
      if(!/^[a-z][a-z0-9-]*$/.test(row.id)||this.byId.has(row.id))fail('duplicate or invalid ID');
      for(const value of [row.name,row.displayName,row.zoneId,row.structureId])text(value);text(row.nameEn,true);
      if(!row.sourceObjectId&&!row.parentObjectId)fail('missing source identity');
      if(!Array.isArray(row.pinyin)||!row.pinyin.length||row.pinyin.some(p=>typeof p!=='string'||!/^[a-z0-9 '\-]+$/.test(p)))fail('invalid pinyin');
      for(const key of ['summary','functionTag','evidenceNote','modelNote','siteAccess'])bilingual(row[key]);
      if(row.siteAccess.status!=='not-verified')fail('unverified access must remain explicit');
      if(!Array.isArray(row.sources)||!row.sources.length)fail('missing official sources');
      const sources=new Map();
      for(const source of row.sources){
        text(source.id);text(source.title);text(source.titleEn,true);
        if((source.publisher!=='故宫博物院'&&!qianxingSource(source))||sources.has(source.id))fail('invalid source identity');
        let url;try{url=new URL(source.url);}catch{fail('invalid source URL');}
        if(!qianxingSource(source)&&(url.protocol!=='https:'||!/^(?:[a-z0-9-]+\.)?dpm\.org\.cn$/.test(url.hostname)||url.username||url.password||url.port||url.search||(url.hash&&!(/^#page=[1-9][0-9]*$/.test(url.hash)&&/\.pdf$/i.test(url.pathname)))))fail('unofficial source URL');
        const signature=JSON.stringify([source.url,source.title,source.titleEn,source.publisher]);
        if(allSources.has(source.id)&&allSources.get(source.id)!==signature)fail('conflicting source identity');
        allSources.set(source.id,signature);sources.set(source.id,source);
      }
      if(!Array.isArray(row.summary.sourceIds)||!row.summary.sourceIds.length||row.summary.sourceIds.some(id=>!sources.has(id)))fail('summary lacks source reference');
      const b=row.mapBinding;
      if(b!==null){
        if(row.classification!=='supplemental-map-attraction'||row.travel!=='existing-target-only'||!b||b.name!==row.name||!['hall','gate','cityGate','pavilion'].includes(b.kind)||Object.keys(b).some(k=>!allowedBinding.has(k)))fail('invalid map projection');
        if(!['x','z','w','d'].every(k=>Number.isFinite(b[k]))||b.w<=0||b.d<=0||(b.rot!==undefined&&!Number.isFinite(b.rot)))fail('invalid map footprint');
        const identity=['structure','objectId','sourceObjectId','parentObjectId','entryProfile','pavilionProfile','qinanProfile','profile'].some(k=>typeof b[k]==='string'&&b[k]);
        if(!identity&&(row.bindingMode!=='exact-source-projection-no-runtime-id'||!Array.isArray(row.sourcePaths)||!row.sourcePaths.length||!row.sourcePaths.some(p=>/^src\/[A-Za-z0-9_/-]+\.js$/.test(p))||row.sourcePaths.some(p=>!/^(?:src|data)\/[A-Za-z0-9_/-]+\.(?:js|json)(?:#\/items\/\d+)?$/.test(p))))fail('map projection lacks source identity');
        this.bindings.push({binding:b,id:row.id});
      }else if(row.classification!=='supplemental-directory-only'||row.travel!=='none')fail('directory entry cannot invent travel');
      const place={id:row.id,name:row.name,catalogKind:'supplemental',supplementalText:row,
        sceneBinding:{kind:'supplemental',zoneId:row.zoneId,name:row.name},sourceObjectId:row.sourceObjectId,parentObjectId:row.parentObjectId,
        functionTag:row.functionTag.zh,summary:{text:row.summary.zh,sourceIds:[...row.summary.sourceIds]},functions:[],people:[],timeline:[],
        evidenceNote:{text:row.evidenceNote.zh,sourceIds:[]},
        modelExperience:{teleportTargetName:b?row.name:null,navigationMode:b?'existing-teleport':'information-only',actionLabel:'前往此处',disclaimer:row.modelNote.zh},
        siteAccess:{status:'not-verified',disclaimer:row.siteAccess.zh,sourceIds:[],checkedAt:null},reviewedAt:null};
      this.records.set(row.id,row);this.byId.set(row.id,place);this.sourcesByPlace.set(row.id,[...sources.values()]);
    }
    this.places=[...this.byId.values()];
  }
  get(id){return this.byId.get(id)??null;}
  forMapItem(item,items){const candidates=this.bindings.filter(r=>matches(item,r.binding)&&items.filter(other=>matches(other,r.binding)).length===1);return candidates.length===1?this.get(candidates[0].id):null;}
  sourcesFor(place){return this.sourcesByPlace.get(place.id)??[];}
}
