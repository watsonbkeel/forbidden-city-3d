import assert from 'node:assert/strict';
import expectedNames from './official-name-expectations.json' with {type:'json'};
/** Test oracle: reviewed literal names/URLs, independent of the runtime registry. */
export function assertCompleteSourceLinks(links,placeId,historicalSources){
 const expected=new Map(historicalSources.map(s=>['place-source-'+s.id,{url:s.url,kind:'history'}]));
 for(const source of expectedNames.find(row=>row.id===placeId)?.sources??[])expected.set(`place-name-source-${placeId}-${source.id}`,{url:source.url,kind:'name'});
 assert.equal(links.length,expected.size,'Exact complete history and name link count');const seen=new Set(),naming=new Set();
 for(const link of links){assert.ok(link.id&&!seen.has(link.id),'Each source ID must exist and be unique');seen.add(link.id);const source=expected.get(link.id);assert.ok(source,'Exact card and evidence ID is in the independent oracle');assert.equal(link.getAttribute('href'),source.url,'Exact source URL for this card/evidence');if(source.kind==='name')naming.add(link);}
 return naming;
}
