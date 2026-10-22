#!/usr/bin/env node
/**
 * 删除 COS 上指定的旧版本哈希资产（显式传入 key，不做模糊匹配）
 * 用法: node scripts/delete-cos-objects.mjs gugong/assets/xxx.js gugong/assets/yyy.css
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const COS = require('cos-nodejs-sdk-v5');

const config = {
  SecretId: process.env.TENCENTCLOUD_SECRET_ID,
  SecretKey: process.env.TENCENTCLOUD_SECRET_KEY,
  Bucket: 'hk-server-1251741609',
  Region: 'ap-hongkong',
};

if (!config.SecretId || !config.SecretKey) {
  console.error('缺少环境变量 TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY');
  process.exit(1);
}

const keys = process.argv.slice(2);
if (keys.length === 0) {
  console.error('用法: node scripts/delete-cos-objects.mjs <key1> <key2> ...');
  process.exit(1);
}

// 安全阀：只允许删除 gugong/assets/ 下的 .js/.css，且必须是带哈希的构建产物
const HASHED = /^gugong\/assets\/index-[A-Za-z0-9_-]{8}\.(js|css)$/;
const rejected = keys.filter(k => !HASHED.test(k));
if (rejected.length) {
  console.error('以下 key 不符合「gugong/assets/ 下带哈希的 js/css」安全规则，已拒绝:', rejected);
  process.exit(1);
}

const cos = new COS({ SecretId: config.SecretId, SecretKey: config.SecretKey });

function del(key) {
  return new Promise((resolve, reject) => {
    cos.deleteObject({ Bucket: config.Bucket, Region: config.Region, Key: key }, (err, data) => {
      if (err) reject(err); else resolve(data);
    });
  });
}

async function main() {
  console.log(`即将删除 ${keys.length} 个对象:`);
  keys.forEach(k => console.log(`  - ${k}`));
  for (const k of keys) {
    await del(k);
    console.log(`✅ 已删除 ${k}`);
  }
  console.log('完成');
}

main().catch(err => { console.error('删除失败:', err); process.exit(1); });
