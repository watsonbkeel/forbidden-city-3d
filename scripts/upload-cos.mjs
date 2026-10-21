#!/usr/bin/env node
/**
 * 上传构建产物到腾讯云 COS（中国香港桶）
 * 用途：tour.bkeel.com 加速方案测试
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const COS = require('cos-nodejs-sdk-v5');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const config = {
  SecretId: process.env.TENCENTCLOUD_SECRET_ID,
  SecretKey: process.env.TENCENTCLOUD_SECRET_KEY,
  Bucket: 'hk-server-1251741609',
  Region: 'ap-hongkong',
  LocalPath: path.resolve(__dirname, '../dist'),
  RemotePath: '/gugong/',
};

// 验证环境变量
if (!config.SecretId || !config.SecretKey) {
  console.error('❌ 缺少环境变量：TENCENTCLOUD_SECRET_ID 或 TENCENTCLOUD_SECRET_KEY');
  process.exit(1);
}

const cos = new COS({
  SecretId: config.SecretId,
  SecretKey: config.SecretKey,
});

// 递归获取所有文件
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 上传单个文件
function uploadFile(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: config.Bucket,
        Region: config.Region,
        Key: remotePath,
        Body: fs.createReadStream(localPath),
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(data);
      }
    );
  });
}

// 主函数
async function main() {
  console.log('📦 开始上传构建产物到 COS...');
  console.log(`   本地路径: ${config.LocalPath}`);
  console.log(`   目标桶: ${config.Bucket}`);
  console.log(`   远程路径: ${config.RemotePath}`);
  console.log('');

  const files = getAllFiles(config.LocalPath);
  console.log(`📁 找到 ${files.length} 个文件`);
  console.log('');

  let uploaded = 0;
  let totalSize = 0;

  for (const file of files) {
    const relativePath = path.relative(config.LocalPath, file);
    const remotePath = config.RemotePath + relativePath.replace(/\\/g, '/');
    const fileSize = fs.statSync(file).size;
    totalSize += fileSize;

    try {
      await uploadFile(file, remotePath);
      uploaded++;
      console.log(`✅ [${uploaded}/${files.length}] ${relativePath} (${(fileSize / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`❌ 上传失败: ${relativePath}`, err.message);
      process.exit(1);
    }
  }

  console.log('');
  console.log(`✅ 上传完成！共 ${uploaded} 个文件，总大小 ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🌐 测试地址: http://test-cos.bkeel.com${config.RemotePath}`);
}

main().catch((err) => {
  console.error('❌ 上传失败:', err);
  process.exit(1);
});
