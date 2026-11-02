import test from 'node:test';
import assert from 'node:assert/strict';
import {publicPlaceName,publicMapItem} from '../../src/ui/PublicPlaceNames.js';
const examples=[
 ['銮驾库东库（官文五间；暂定大形；未经官照验证）；空置两层游戏适配（非室内复原）','銮驾库东库'],
 ['銮驾库南库（官文十间；暂定大形；未经官照验证）；空置两层游戏适配（非室内复原）','銮驾库南库'],
 ['治牲所（暂定硬山；词条歇山冲突未验；游戏入口）','治牲所'],
 ['銮驾库东库（官文五间；暂定大形；未经官照验证）','銮驾库东库'],
 ['内阁汉本堂（三间文字暂定体量，现存待核）','内阁汉本堂'],
 ['景行门（官刊：办公室；通路：游戏适配）','景行门'],
 ['值房（官文五间；屋顶朝向暂定；无现况图）','值房'],
 ['传心祝版房（三间暂定；身份位置未核）','传心祝版房'],
 ['大庖井（井深未验；浅井防坠游戏适配）','大庖井'],
 ['銮驾库南库（官文十间；暂定大形；未经官照验证）','銮驾库南库'],
 ...['中','东','西'].map(s=>[`南三所${s}所中殿（位置拟合；旧北壳身份未改）`,`南三所${s}所中殿`]),
 ['内阁东四间灰瓦耳房（文字依据候选）','内阁东耳房'],
 ['内阁西侧灰瓦耳房可见段（身份候选）','内阁西耳房'],
 ['内阁东三间黄瓦厢房（文字依据候选）','内阁东厢房'],
 ['内阁西三间黄瓦厢房（文字依据候选）','内阁西厢房'],
 ['内阁大库（具体库别待核）','内阁大库'],
 ['内阁大库第二体（文字拟合、库别待核）','内阁大库第二体'],
];
test('all known R158 map labels contain place names only',()=>{for(const [raw,name]of examples)assert.equal(publicPlaceName(raw),name);});
test('unknown and meaningful names are not regex-truncated or rebound',()=>{for(const name of ['三座门外三座石桥','内阁祝版房','传心殿祝版房','太和殿（保和殿旧称）','普通地名（东）','未登记（暂定）','',null])assert.equal(publicPlaceName(name),name);});
test('public item is copied only when needed; provenance and identity remain intact',()=>{const old={name:examples[0][0],objectId:'FC-X',sourceStatus:'UNVERIFIED',x:2,metadata:{verified:false}};const next=publicMapItem(old);assert.notEqual(next,old);assert.deepEqual(next,{...old,name:examples[0][1]});assert.equal(old.name,examples[0][0]);assert.equal(next.metadata,old.metadata);const plain={name:'文华殿'};assert.equal(publicMapItem(plain),plain);});
