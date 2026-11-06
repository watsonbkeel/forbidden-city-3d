import registry from '../../data/places/official-names.json' with {type:'json'};
import english from '../../data/places/en.json' with {type:'json'};
import supplemental from '../../data/places/supplemental.json' with {type:'json'};
const projectNames=new Map([...Object.entries(english.places).map(([id,p])=>[id,p.name]),...supplemental.records.map(p=>[p.id,p.nameEn])]);
const fail=()=>{throw Error('Invalid official English name evidence');};
const text=value=>typeof value==='string'&&value.trim()===value&&value.length>0&&!/[<>]/u.test(value);
const fields=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join('|')===[...keys].sort().join('|');
/** Naming evidence cannot carry history, scene keys, coordinates or navigation. */
export function validateOfficialNames(data){
 if(!fields(data,['schemaVersion','reviewedAt','entries'])||data.schemaVersion!==1||!/^\d{4}-\d{2}-\d{2}$/.test(data.reviewedAt)||!Array.isArray(data.entries))fail();
 const ids=new Set();
 for(const row of data.entries){
  if(!fields(row,['id','projectName','status','officialDisplayName','displayEvidenceId','searchTerms','evidence'])||!projectNames.has(row.id)||ids.has(row.id)||projectNames.get(row.id)!==row.projectName)fail();ids.add(row.id);
  if(!['official-display','grammatical-search-only','related-search-only'].includes(row.status)||!Array.isArray(row.searchTerms)||!row.searchTerms.length||!row.searchTerms.every(text)||!Array.isArray(row.evidence)||!row.evidence.length)fail();
  const evidenceIds=new Set();for(const e of row.evidence){
   if(!fields(e,['id','quote','englishName','url','checkedAt','relation','scope'])||!text(e.id)||evidenceIds.has(e.id)||!text(e.quote)||!text(e.englishName)||e.checkedAt!==data.reviewedAt||!fields(e.scope,['zh','en'])||!text(e.scope.zh)||!text(e.scope.en))fail();evidenceIds.add(e.id);
   if(!['same-object','related-scope','related-wording','grammatical-expansion'].includes(e.relation))fail();
   const url=new URL(e.url);if(url.protocol!=='https:'||url.hostname!=='intl.dpm.org.cn'||url.username||url.password||url.search||url.hash)fail();
  }
  const selected=row.evidence.find(e=>e.id===row.displayEvidenceId);
  if(row.status==='official-display'){if(!selected||selected.relation!=='same-object'||row.officialDisplayName!==selected.englishName)fail();}
  else if(row.officialDisplayName!==null||row.displayEvidenceId!==null||row.evidence.some(e=>e.relation==='same-object'))fail();
 }
 return data;
}
const rows=new Map(validateOfficialNames(registry).entries.map(row=>[row.id,row]));
export function englishNameInfo(id){
 const row=rows.get(id);if(!row)return {status:'project-unverified',officialDisplayName:null,projectName:projectNames.get(id)??null,evidence:[],sameObjectAliases:[],searchTerms:[]};
 return {...row,sameObjectAliases:row.evidence.filter(e=>e.relation==='same-object').flatMap(e=>[e.quote,e.englishName]),searchTerms:[...new Set([row.projectName,...row.searchTerms,...row.evidence.flatMap(e=>[e.quote,e.englishName])])]};
}
