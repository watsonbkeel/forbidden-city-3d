// 分区数据清单。用静态 import 而不是运行时 fetch：
// - Vite 构建时打进包里，生产环境无需把 data/ 拷到 public/
// - 同步可用，ZoneManager.init() 不需要 await
// 新增分区：在此追加一行 import 并放进 ZONES 数组。
import axisCourts from './axis-courts.json';
import eastSix from './east-six.json';
import westSix from './west-six.json';
import ningshou from './ningshou.json';
import outerEast from './outer-east.json';
import outerWest from './outer-west.json';
import garden from './garden.json';

export const ZONES = [axisCourts, eastSix, westSix, ningshou, outerEast, outerWest, garden];
