/**
 * S 档内景注册表：data/interiors/*.json 静态导入（Vite 打包进 bundle，生产环境无需额外请求）。
 * 新增一座 S 档殿：在 data/interiors/ 放 <hallId>.json，再在这里 import 并加入 INTERIORS。
 */
import taihe from '../../../data/interiors/taihe.json';
import qianqing from '../../../data/interiors/qianqing.json';
import huangji from '../../../data/interiors/huangji.json';
import yangxin from '../../../data/interiors/yangxin.json';
import kunning from '../../../data/interiors/kunning.json';

export const INTERIORS = { taihe, qianqing, huangji, yangxin, kunning };
