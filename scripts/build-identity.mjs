import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Only runtime/build inputs, never git identity, generated dist, reports or tests.
// Include untracked input bytes too: a commit alone cannot identify a dirty build.
const inputs = ['index.html', 'main.js', 'style.css', 'src', 'data', 'public',
  'package.json', 'package-lock.json', 'vite.config.js', 'release.json', 'scripts/build-identity.mjs'];
const hash = value => createHash('sha256').update(value).digest('hex');
export function normalizeBase(base = '/') {
  if (!/^\/(?!\/)[A-Za-z0-9_./-]*\/$/.test(base) && base !== '/') throw Error('Build base must be an absolute same-origin directory path.');
  if (base.split('/').some(part => part === '.' || part === '..')) throw Error('Build base cannot contain relative segments.');
  return base;
}
export function sourceFingerprint(root) {
  const digest = createHash('sha256');
  function visit(relative) {
    const full = path.join(root, relative);
    if (!fs.existsSync(full)) return;
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(full).sort()) visit(path.posix.join(relative, entry));
    } else if (stat.isFile()) {
      const bytes = fs.readFileSync(full);
      digest.update(`${relative.length}:${relative}:${bytes.length}:`); digest.update(bytes);
    } else throw Error(`Build input must be a regular file or directory: ${relative}`);
  }
  inputs.forEach(visit);
  return digest.digest('hex');
}
function git(root, args, fallback) {
  try { return execFileSync('git', args, { cwd:root, encoding:'utf8', stdio:['ignore','pipe','ignore'] }).trim(); }
  catch { return fallback; }
}
export function createBuildInfo({ root = process.cwd(), base = '/', sourceCommit, sourceDirty } = {}) {
  base = normalizeBase(base);
  const { release } = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
  if (!/^R\d+[A-Za-z0-9.-]*$/.test(release)) throw Error('Invalid release identifier.');
  const fingerprint = sourceFingerprint(root);
  return {
    schema:1, release, buildId:`${release}-${hash(JSON.stringify([release, fingerprint, base])).slice(0, 12)}`,
    sourceFingerprint:fingerprint,
    sourceCommit:sourceCommit ?? git(root, ['rev-parse', 'HEAD'], null),
    sourceDirty:sourceDirty ?? Boolean(git(root, ['status', '--porcelain', '--untracked-files=all', '--', ...inputs], 'unknown')),
    base,
  };
}
export function verifyBuildSource({ root = process.cwd(), dist = path.join(root, 'dist'), expectedBase } = {}) {
  const metadataPath = path.join(dist, 'build-info.json');
  if (!fs.existsSync(metadataPath)) throw Error('Missing dist/build-info.json; rebuild before packaging.');
  const built = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const current = createBuildInfo({ root, base:expectedBase ?? built.base });
  if (built.schema !== 1 || built.sourceFingerprint !== current.sourceFingerprint || built.release !== current.release || built.buildId !== current.buildId || built.base !== current.base) {
    throw Error('Stale dist: source fingerprint, release or base does not match. Rebuild before packaging.');
  }
  const htmlPath = path.join(dist, 'index.html');
  if (!fs.existsSync(htmlPath)) throw Error('Mixed dist: missing HTML entry point.');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const htmlId = html.match(/<meta\b[^>]*name="palace-build-id"[^>]*content="([^"]+)"/)?.[1];
  if (htmlId !== built.buildId) throw Error('Mixed dist: HTML build identity differs from build-info.json.');
  const jsUrl = html.match(/<script\b[^>]*src="([^"]+\.js)"/)?.[1];
  if (!jsUrl?.startsWith(built.base)) throw Error('Mixed dist: missing same-base JavaScript entry.');
  const relative = jsUrl.slice(built.base.length);
  if (!relative || relative.startsWith('/') || /[?#\\]/.test(relative) || relative.split('/').some(part => part === '..' || part === '.')) throw Error('Mixed dist: invalid JavaScript entry path.');
  const jsPath = path.join(dist, relative);
  if (!fs.existsSync(jsPath) || !fs.lstatSync(jsPath).isFile()) throw Error('Mixed dist: missing JavaScript entry file.');
  const js = fs.readFileSync(jsPath, 'utf8');
  if (!js.includes(built.buildId) || !js.includes(built.sourceFingerprint)) throw Error('Mixed dist: JavaScript build identity differs from build-info.json.');
  return built;
}
export function releaseIdentityPlugin() {
  let info;
  return {
    name:'palace-release-identity',
    config(config) {
      info = createBuildInfo({ root:path.resolve(config.root ?? process.cwd()), base:config.base ?? '/' });
      // Define values must exist during config resolution, before Vite creates
      // its define transformer. Mutating them in configResolved is too late.
      return { define:{ __HAS_BUILD_INFO__:'true', __BUILD_INFO__:JSON.stringify(info) } };
    },
    configResolved(config) {
      if (config.base !== info.base) throw Error('Resolved build base changed after identity generation.');
    },
    transformIndexHtml(html) {
      return {
        html:html.replace('版本信息准备中', `${info.release} · 构建 ${info.buildId.split('-').at(-1)}`),
        tags:[{tag:'meta',attrs:{name:'palace-build-id',content:info.buildId},injectTo:'head'},
          {tag:'meta',attrs:{name:'palace-source-fingerprint',content:info.sourceFingerprint},injectTo:'head'},
          {tag:'meta',attrs:{name:'palace-build-base',content:info.base},injectTo:'head'}],
      };
    },
    generateBundle() { this.emitFile({type:'asset',fileName:'build-info.json',source:JSON.stringify(info,null,2)+'\n'}); },
  };
}
