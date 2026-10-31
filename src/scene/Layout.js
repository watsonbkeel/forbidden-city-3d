import { LAYOUT, DIMENSIONS } from '../config/constants.js';
import { JINSHUI_BRIDGES } from './palace/river.js';

/**
 * 故宫中轴线建筑布局数据（P0c-1 起为真实米制，原点 = 太和殿中心，+Z 北，x 负 = 东）
 * 包含每个建筑的位置、尺寸、类型等信息；中轴位置取 LAYOUT，尺寸取 DIMENSIONS。
 */

const { halfX: PALACE_HALF_X, minZ: PALACE_MIN_Z, maxZ: PALACE_MAX_Z } = LAYOUT.PALACE_RECT;
const PALACE_CZ = (PALACE_MIN_Z + PALACE_MAX_Z) / 2; // derived from current model bounds; not the official survey centre
const CITY_WALL_T = 8.6; // 宫城城墙厚（底宽 8.62，dimensions.md）

// 御花园：园墙 z 422.7（坤宁门）~ 518.3（顺贞门），东西墙 x ±68
const GARDEN_Z0 = 422.7;
const GARDEN_Z1 = 518.3;

export const PALACE_LAYOUT = [
  // 护城河（筒子河）- 环绕整个紫禁城（anchors.json：外缘 940.5 × 1147.5，中心 (−0.4, 88.9)）
  {
    name: '筒子河',
    type: 'moat',
    position: { x: -0.4, y: -0.5, z: 88.9 }, // 中心位置
    dimensions: {
      width: 940.5,  // 外围总宽（含河道）
      depth: 1147.5, // 外围总深（含河道）
      riverWidth: 52, // 河道宽度
      height: 0.8,
    },
  },
  
  // 外围城墙 - 紫禁城最外层（外皮 x ±376.5、z −425 ~ 547 (current model; official 961m extent remains an engineering residual)；内侧尺寸 = 外皮 − 2 × 墙厚）
  {
    name: '外围城墙',
    type: 'outer_wall',
    position: { x: 0, y: 0, z: PALACE_CZ },
    dimensions: {
      width: PALACE_HALF_X * 2 - CITY_WALL_T * 2,                // ≈ 735.8 内侧总宽
      depth: PALACE_MAX_Z - PALACE_MIN_Z - CITY_WALL_T * 2,      // derived inner depth; do not confuse current model 972m extent with official 961m
      wallHeight: 10,
      wallThickness: CITY_WALL_T,
    },
  },
  
  // 午门
  {
    name: '午门',
    type: 'gate',
    position: { x: 0, y: 0, z: LAYOUT.WUMEN_Z },
    dimensions: { ...DIMENSIONS.WUMEN },
    features: {
      hasWings: true,      // 雁翅楼
      roofType: 'wudian',  // 庑殿顶
      roofLayers: 2,       // 重檐
    },
  },
  
  // 内金水河和金水桥（中桥 (0.7, −310.8)；五桥 x = 0、±13、±30，dimensions.md:85）
  // 桥位 / 桥宽显式给出（palace/river.js 为唯一数据源），buildRiver 与 Collision.checkRiverCrossing 共用。
  // R36: original five-bridge bow plus explicit independently fitted southern continuations.
  // dimensions below retain the legacy map record, not the actual channel polygon or a surveyed extent.
  {
    name: '金水河',
    type: 'river',
    southWaterProfile: 'r36-south-precinct',
    position: { x: 0, y: -0.3, z: LAYOUT.JINSHUI_RIVER_Z },
    bridges: JINSHUI_BRIDGES,
    source: 'estimated',
    dimensions: {
      width: 100,
      depth: 15,
      height: 0.5,
    },
  },
  
  // 太和门
  {
    name: '太和门',
    type: 'gate',
    position: { x: 0, y: 0, z: LAYOUT.TAIHE_GATE_Z },
    dimensions: { ...DIMENSIONS.TAIHE_GATE },
    features: {
      roofType: 'xieshan',
      roofLayers: 2,
    },
  },
  
  // 太和殿
  {
    name: '太和殿',
    type: 'palace',
    position: { x: 0, y: 0, z: LAYOUT.TAIHE_Z },
    dimensions: { ...DIMENSIONS.TAIHE },
    features: {
      roofType: 'wudian',
      roofLayers: 2,
      hasBrackets: true,   // 斗拱
      hasRailings: true,   // 栏杆
      hasPassage: true,    // 前后门洞可通行
    },
  },
  
  // 中和殿
  {
    name: '中和殿',
    type: 'palace',
    position: { x: 0, y: 0, z: LAYOUT.ZHONGHE_Z },
    dimensions: { ...DIMENSIONS.ZHONGHE },
    features: {
      roofType: 'xieshan',  // 歇山顶
      roofLayers: 1,
      hasBrackets: true,
      hasRailings: true,
      hasPassage: true,    // 前后门洞可通行
    },
  },
  
  // 保和殿
  {
    name: '保和殿',
    type: 'palace',
    position: { x: 0, y: 0, z: LAYOUT.BAOHE_Z },
    dimensions: { ...DIMENSIONS.BAOHE },
    features: {
      roofType: 'wudian',
      roofLayers: 2,
      hasBrackets: true,
      hasRailings: true,
      hasPassage: true,    // 前后门洞可通行
    },
  },
  
  // 乾清门
  {
    name: '乾清门',
    type: 'gate',
    position: { x: 0, y: 0, z: LAYOUT.QIANQING_GATE_Z },
    dimensions: { ...DIMENSIONS.QIANQING_GATE },
    features: {
      roofType: 'wudian',
      roofLayers: 1,
    },
  },
  
  // 乾清宫
  {
    name: '乾清宫',
    type: 'palace',
    position: { x: 0, y: 0, z: LAYOUT.QIANQING_Z },
    dimensions: { ...DIMENSIONS.QIANQING, baseLayers: 1 },
    features: {
      roofType: 'wudian',
      roofLayers: 2,
      hasBrackets: true,
      hasRailings: true,
      hasPassage: true,    // 前后门洞可通行
    },
  },
  
  // 交泰殿
  {
    name: '交泰殿',
    type: 'palace',
    position: { x: 0, y: 0, z: LAYOUT.JIAOTAI_Z },
    dimensions: { ...DIMENSIONS.JIAOTAI, baseLayers: 1 },
    features: {
      roofType: 'xieshan',
      roofLayers: 1,
      hasBrackets: true,
      hasRailings: true,
      hasPassage: true,    // 前后门洞可通行
    },
  },
  
  // 坤宁宫
  {
    name: '坤宁宫',
    type: 'palace',
    position: { x: 0, y: 0, z: LAYOUT.KUNNING_Z },
    dimensions: { ...DIMENSIONS.KUNNING, baseLayers: 1 },
    features: {
      roofType: 'wudian',
      roofLayers: 2,
      hasBrackets: true,
      hasRailings: true,
      hasPassage: true,    // 两端穿廊；南门偏东，北中墙封闭，详见坤宁宫专用profile
    },
  },
  
  // 御花园（园墙 136 × 95.6，中心 z 470.5；elements 的 position 为相对园中心的偏移）
  {
    name: '御花园',
    type: 'garden',
    position: { x: 0, y: 0, z: LAYOUT.IMPERIAL_GARDEN_Z },
    dimensions: {
      width: 136,
      depth: GARDEN_Z1 - GARDEN_Z0,
    },
    features: {
      hasTrees: true,
      hasRocks: true,
      hasPavilions: true,
    },
    elements: [
      // 钦安殿（anchors.json (0, 493.1) 24.1 × 14.1；高度沿用旧值）
      {
        name: '钦安殿',
        type: 'pavilion',
        position: { x: 0, y: 0, z: 493.1 - LAYOUT.IMPERIAL_GARDEN_Z },
        dimensions: {
          width: 24.1,
          depth: 14.1,
          height: 18,
        },
      },
      // 堆秀山（anchors.json (−29.1, 509.1) 19.3 × 15.1；高约 10）
      {
        name: '堆秀山',
        type: 'rockery',
        position: { x: -29.1, y: 0, z: 509.1 - LAYOUT.IMPERIAL_GARDEN_Z },
        dimensions: {
          width: 19.3,
          depth: 15.1,
          height: 10,
        },
      },
    ],
  },
  
  // 神武门
  {
    name: '神武门',
    type: 'gate',
    position: { x: 0, y: 0, z: LAYOUT.SHENWU_Z },
    dimensions: { ...DIMENSIONS.SHENWU },
    features: {
      roofType: 'wudian',
      roofLayers: 2,
    },
  },
];

/**
 * 获取建筑数据
 */
export function getBuildingData(name) {
  return PALACE_LAYOUT.find(item => item.name === name);
}

/**
 * 获取所有建筑列表
 */
export function getAllBuildings() {
  return PALACE_LAYOUT.filter(item => item.type !== 'river');
}

/**
 * 获取所有宫殿（不含门）
 */
export function getAllPalaces() {
  return PALACE_LAYOUT.filter(item => item.type === 'palace');
}
