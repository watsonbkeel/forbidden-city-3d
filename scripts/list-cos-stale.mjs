#!/usr/bin/env node
/**
 * 列出 COS /gugong/ 下对象，并与本地 dist 比对，识别可删除的旧版本哈希资产
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const COS = require('cos-nodejs-sdk-v5');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  SecretId: process.env.TENCENTCLOUD_SECRET_ID,
  SecretKey: process.env.TENCENTCLOUD_SECRET_KEY,
  Bucket: 'hk-server-1251741609',
  Region: 'ap-hongkong',
  Prefix: 'gugong/',
  LocalDist: path.resolve(__dirname, '../dist'),
};

if (!config.SecretId || !config.SecretKey) {
  console.error('缺少环境变量 TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY');
  process.exit(1);
}

const cos = new COS({ SecretId: config.SecretId, SecretKey: config.SecretKey });

function listAllObjects() {
  return new Promise((resolve, reject) => {
    const objects = [];
    cos.getBucket({
      Bucket: config.Bucket,
      Region: config.Region,
      Prefix: config.Prefix,
      MaxKeys: 1000,
    }, (err, data) => {
      if (err) return reject(err);
      (data.Contents || []).forEach(o => objects.push({ Key: o.Key, Size: o.Size }));
      resolve(objects);
    });
  });
}

function getLocalFiles() {
  const files = [];
  function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  }
  walk(config.LocalDist);
  return files.map(f => 'gugong/' + path.relative(config.LocalDist, f).replace(/\\/g, '/'));
}

async function main() {
  const remote = await listAllObjects();
  const local = new Set(getLocalFiles());
  console.log(`COS 对象数: ${remote.length}，本地 dist 文件数: ${local.size}\n`);

  const stale = remote.filter(o => !local.has(o.Key));
  const missing = [...local].filter(k => !remote.some(o => o.Key === k));

  console.log('=== 可删除（COS 有、本地构建已无此文件）===');
  let staleSize = 0;
  for (const o of stale) { staleSize += o.Size; console.log(`  ${o.Key}  (${(o.Size / 1024).toFixed(1)} KB)`); }
  console.log(`小计: ${stale.length} 个文件, ${(staleSize / 1024 / 1024).toFixed(2)} MB\n`);

  if (missing.length) {
    console.log('=== 警告：本地有但 COS 缺失 ===');
    missing.forEach(k => console.log(`  ${k}`));
  }
}

main().catch(err => { console.error('失败:', err); process.exit(1); });
