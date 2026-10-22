import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { verifyBuildSource } from './build-identity.mjs';

const output = process.argv[2];
if (!output || !path.isAbsolute(output) || fs.existsSync(output)) throw Error('Destination must be a new absolute directory; existing rollback packages are never overwritten.');
const root = process.cwd();
// The local server serves root only. Subpath builds are verified separately, not mislabeled as root packages.
const build = verifyBuildSource({root, expectedBase:'/'});
const source = path.join(root, 'dist');
if (!fs.existsSync(path.join(source, 'index.html'))) throw Error('Build the production app first.');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const files = [];
function visit(directory, relative = '') {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const rel = path.posix.join(relative,entry.name), full = path.join(directory,entry.name);
    if (entry.isDirectory()) visit(full,rel);
    else if (entry.isFile()) { const bytes = fs.readFileSync(full); files.push({path:rel,bytes:bytes.length,sha256:sha(bytes)}); }
    else throw Error(`Unexpected non-regular build entry: ${rel}`);
  }
}
visit(source,'dist');
const support = path.join(root,'release',build.release.toLowerCase());
for (const name of ['start.mjs','README.txt']) if (!fs.existsSync(path.join(support,name))) throw Error(`Missing package support file: ${name}`);
fs.mkdirSync(output);
fs.cpSync(source,path.join(output,'dist'),{recursive:true});
for (const name of ['start.mjs','README.txt']) {
  const bytes = fs.readFileSync(path.join(support,name));
  fs.writeFileSync(path.join(output,name),bytes); files.push({path:name,bytes:bytes.length,sha256:sha(bytes)});
}
// Built provenance is taken from the verified build, never from HEAD at package time.
const metadata = { release:build.release,kind:'prebuilt production package; no deployment',sourceCommit:build.sourceCommit,build,files };
fs.writeFileSync(path.join(output,'SHA256SUMS.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify({output,buildId:build.buildId,sourceFingerprint:build.sourceFingerprint,files:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),manifestSha256:sha(fs.readFileSync(path.join(output,'SHA256SUMS.json')))},null,2));
