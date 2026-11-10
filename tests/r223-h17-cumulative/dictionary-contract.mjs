// Pure source-byte contract: no live reads, product imports, DOM or native dependencies.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=s=>createHash('sha256').update(s).digest('hex');
// Independently reviewed R239 baseline B (H17 absent; both R231 additions retained).
// Blob f18bcb75a466c85d8c7c7ece08e37e1d0fb7f777, fixed from e1aa / R239 ROUNDTRIP.
const BASE_WITH_R231='fa85fe8ad96b3f4695eab363c45616d3f4d41ea337d505d8b090c432e7339be0';
const R231=[
 ['本地核对官方来源页面或图像：${0}；不代表完整原文复核。','Official source pages or images reviewed locally on ${0}; not a full-document review.'],
 ['来源核对日期未记录；不代表完整原文复核。','The source-check date was not recorded; this does not indicate a full-document review.'],
];
export function assertH17Dictionary(source,historicalHash){
 const messages=JSON.parse(source).messages;
 assert.equal(source.split('"慧曜楼":').length,2,'H17 key unique');
 assert.equal(messages['慧曜楼'],'Huiyao Tower','H17 exact translation');
 const h17=',\n    "慧曜楼": "Huiyao Tower"';
 assert.equal(source.split(h17).length,2,'H17 exact byte fragment unique');
 for(const [key,value] of R231){
  assert.equal(source.split(JSON.stringify(key)+':').length,2,'R231 key unique: '+key);
  assert.equal(messages[key],value,'R231 exact translation: '+key);
 }
 const baseline=source.replace(h17,'');
 assert.equal(sha(baseline),BASE_WITH_R231,'reviewed B byte identity: all non-H17 bytes preserved');
 let historical=baseline;
 for(const [key,value] of R231){
  const line='    '+JSON.stringify(key)+': '+JSON.stringify(value)+',\n';
  assert.equal(historical.split(line).length,2,'R231 exact byte fragment unique: '+key);
  historical=historical.replace(line,'');
 }
 assert.equal(sha(historical),historicalHash,'historical 9e byte identity: only R231 date-note additions remain after H17 inverse');
}
