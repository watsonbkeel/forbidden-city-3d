/**
 * zone-lint.cjs - 校验 data/zones/*.json 符合 schema
 * 
 * 检查项：
 * 1. 必需字段：id, name, bounds, neighbors, items
 * 2. bounds 格式：{ minX, maxX, minZ, maxZ }
 * 3. items 中的 kind 必须是已知类型
 * 4. 所有 item 的坐标落在 bounds 内
 * 5. wall gaps 引用的 gate 存在
 * 6. id 不重复
 */

const fs = require('fs');
const path = require('path');

const ZONES_DIR = path.join(__dirname, '../data/zones');
const KNOWN_KINDS = new Set([
  'gate', 'wall', 'courtWalls', 'hall', 'corridor', 
  'cityGate', 'region', 'nineDragonWall'
]);

const REQUIRED_FIELDS = {
  zone: ['id', 'name', 'bounds', 'neighbors', 'items'],
  bounds: [], // 支持两种格式：minX/maxX/minZ/maxZ 或 x0/x1/z0/z1
};

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`❌ ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`⚠️  ${msg}`);
  warnings++;
}

function checkBounds(bounds, zoneId) {
  // 支持两种格式：minX/maxX/minZ/maxZ 或 x0/x1/z0/z1
  const hasMinMax = 'minX' in bounds && 'maxX' in bounds && 'minZ' in bounds && 'maxZ' in bounds;
  const hasX0X1 = 'x0' in bounds && 'x1' in bounds && 'z0' in bounds && 'z1' in bounds;
  
  if (!hasMinMax && !hasX0X1) {
    error(`${zoneId}: bounds 缺少必需字段（需要 minX/maxX/minZ/maxZ 或 x0/x1/z0/z1）`);
    return;
  }
  
  let minX, maxX, minZ, maxZ;
  if (hasMinMax) {
    minX = bounds.minX;
    maxX = bounds.maxX;
    minZ = bounds.minZ;
    maxZ = bounds.maxZ;
  } else {
    minX = bounds.x0;
    maxX = bounds.x1;
    minZ = bounds.z0;
    maxZ = bounds.z1;
  }
  
  if (typeof minX !== 'number' || typeof maxX !== 'number' || 
      typeof minZ !== 'number' || typeof maxZ !== 'number') {
    error(`${zoneId}: bounds 字段非数值`);
    return;
  }
  
  if (minX >= maxX) {
    error(`${zoneId}: bounds minX >= maxX (或 x0 >= x1)`);
  }
  if (minZ >= maxZ) {
    error(`${zoneId}: bounds minZ >= maxZ (或 z0 >= z1)`);
  }
}

function getItemPos(item) {
  // 提取 item 的位置（可能是 x/z、pos、at 等）
  if (item.x !== undefined && item.z !== undefined) {
    return { x: item.x, z: item.z };
  }
  if (item.pos && Array.isArray(item.pos)) {
    return { x: item.pos[0], z: item.pos[2] ?? item.pos[1] };
  }
  if (item.at !== undefined) {
    // wall 的 at 是 z 坐标，x 由 line 决定
    return null; // wall 单独处理
  }
  return null;
}

function checkItemInBounds(item, idx, bounds, zoneId) {
  const pos = getItemPos(item);
  if (!pos) return; // wall 等特殊 kind 跳过
  
  const { x, z } = pos;
  
  // 支持两种 bounds 格式
  const minX = bounds.minX ?? bounds.x0;
  const maxX = bounds.maxX ?? bounds.x1;
  const minZ = bounds.minZ ?? bounds.z0;
  const maxZ = bounds.maxZ ?? bounds.z1;
  
  const margin = 5; // 允许 5m 余量
  
  if (x < minX - margin || x > maxX + margin || z < minZ - margin || z > maxZ + margin) {
    warn(`${zoneId}: items[${idx}] (${item.kind}) 位置 [${x},${z}] 超出 bounds (余量 ${margin}m)`);
  }
}

function checkWallGaps(item, idx, gateNames, zoneId) {
  if (item.kind !== 'wall' || !item.gaps) return;
  
  for (let i = 0; i < item.gaps.length; i++) {
    const gap = item.gaps[i];
    if (gap.gate && !gateNames.has(gap.gate)) {
      error(`${zoneId}: items[${idx}].gaps[${i}] 引用未知 gate "${gap.gate}"`);
    }
    if (gap.gate && gap.w !== undefined) {
      warn(`${zoneId}: items[${idx}].gaps[${i}] 同时有 gate 和 w，w 会被忽略`);
    }
  }
}

function lintZone(filePath) {
  const zoneId = path.basename(filePath, '.json');
  let zone;
  
  try {
    zone = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    error(`${zoneId}: JSON 解析失败 - ${e.message}`);
    return null;
  }
  
  // 检查必需字段
  for (const field of REQUIRED_FIELDS.zone) {
    if (zone[field] === undefined) {
      error(`${zoneId}: 缺少字段 ${field}`);
    }
  }
  
  // 检查 bounds
  if (zone.bounds) {
    checkBounds(zone.bounds, zoneId);
  }
  
  // 检查 items
  if (!Array.isArray(zone.items)) {
    error(`${zoneId}: items 不是数组`);
    return zone.id;
  }
  
  const gateNames = new Set();
  
  // 第一遍：收集所有 gate 名称
  zone.items.forEach((item, idx) => {
    if (item.kind === 'gate' && item.name) {
      gateNames.add(item.name);
    }
  });
  
  // 第二遍：检查每个 item
  zone.items.forEach((item, idx) => {
    if (!item.kind) {
      error(`${zoneId}: items[${idx}] 缺少 kind`);
      return;
    }
    
    if (!KNOWN_KINDS.has(item.kind)) {
      error(`${zoneId}: items[${idx}] 未知 kind "${item.kind}"`);
    }
    
    checkItemInBounds(item, idx, zone.bounds, zoneId);
    checkWallGaps(item, idx, gateNames, zoneId);
  });
  
  return zone.id;
}

// 主流程
const files = fs.readdirSync(ZONES_DIR).filter(f => f.endsWith('.json'));

if (files.length === 0) {
  error('data/zones/ 目录下没有 JSON 文件');
  process.exit(1);
}

console.log(`检查 ${files.length} 个 zone 文件...\n`);

const ids = new Set();
const duplicates = [];

files.forEach(file => {
  const filePath = path.join(ZONES_DIR, file);
  const id = lintZone(filePath);
  
  if (id) {
    if (ids.has(id)) {
      duplicates.push(id);
    }
    ids.add(id);
  }
});

if (duplicates.length > 0) {
  error(`重复的 zone id: ${duplicates.join(', ')}`);
}

console.log(`\n检查完成：${files.length} 个文件`);
console.log(`❌ 错误: ${errors}`);
console.log(`⚠️  警告: ${warnings}`);

process.exit(errors > 0 ? 1 : 0);
