/** Exact presentation aliases only. Builder evidence, candidate identities and
 * uncertainty remain in structure metadata and the versioned research ledger.
 * Never strip arbitrary parentheses: they may be part of a real place name. */
const names = new Map([
 ['銮驾库东库（官文五间；暂定大形；未经官照验证）；空置两层游戏适配（非室内复原）', '銮驾库东库'],
 ['銮驾库南库（官文十间；暂定大形；未经官照验证）；空置两层游戏适配（非室内复原）', '銮驾库南库'],
 ['治牲所（暂定硬山；词条歇山冲突未验；游戏入口）', '治牲所'],
 ['銮驾库东库（官文五间；暂定大形；未经官照验证）', '銮驾库东库'],
 ['銮驾库南库（官文十间；暂定大形；未经官照验证）', '銮驾库南库'],
 ['内阁汉本堂（三间文字暂定体量，现存待核）', '内阁汉本堂'],
 ['景行门（官刊：办公室；通路：游戏适配）', '景行门'],
 ['值房（官文五间；屋顶朝向暂定；无现况图）', '值房'],
 ['传心祝版房（三间暂定；身份位置未核）', '传心祝版房'],
 ['大庖井（井深未验；浅井防坠游戏适配）', '大庖井'],
 ['南三所中所中殿（位置拟合；旧北壳身份未改）', '南三所中所中殿'],
 ['南三所东所中殿（位置拟合；旧北壳身份未改）', '南三所东所中殿'],
 ['南三所西所中殿（位置拟合；旧北壳身份未改）', '南三所西所中殿'],
 ['内阁东四间灰瓦耳房（文字依据候选）', '内阁东耳房'],
 ['内阁西侧灰瓦耳房可见段（身份候选）', '内阁西耳房'],
 ['内阁东三间黄瓦厢房（文字依据候选）', '内阁东厢房'],
 ['内阁西三间黄瓦厢房（文字依据候选）', '内阁西厢房'],
 ['内阁大库（具体库别待核）', '内阁大库'],
 ['内阁大库第二体（文字拟合、库别待核）', '内阁大库第二体'],
]);
export const publicPlaceName = name => names.get(name) ?? name;
export function publicMapItem(item) {
 const name = publicPlaceName(item.name);
 return name === item.name ? item : {...item, name};
}
