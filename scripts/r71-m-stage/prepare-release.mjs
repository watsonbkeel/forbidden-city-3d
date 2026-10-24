import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const base='2b8e4333eb99ae95b73dba4533364f9f9a92e4a9',sha=b=>createHash('sha256').update(b).digest('hex');
const p='data/characters/world-source-freeze.json',old=execFileSync('git',['show',base+':'+p]),previous=JSON.parse(old);
const archive='data/characters/world-source-freeze-r70-l-water-walls.json';if(fs.existsSync(archive)&&!fs.readFileSync(archive).equals(old))throw Error('Previous manifest archive differs');fs.writeFileSync(archive,old);
const extra=['src/ui/SettingsMenu.js','src/scene/palace/special/DuanmenBackdrop.js'];
const files=[...new Set([...previous.files.map(f=>f.path),...extra])].sort().map(path=>({path,sha256:sha(fs.readFileSync(path))}));
const changed=previous.files.filter(f=>sha(fs.readFileSync(f.path))!==f.sha256).map(f=>({path:f.path,beforeSHA256:f.sha256,afterSHA256:sha(fs.readFileSync(f.path))}));
const freeze={schemaVersion:previous.schemaVersion+1,baselineCommit:base,purpose:'R71-M optional boundary-exterior Duanmen distant fit. Preserves cumulative R70; not an enterable or measured reconstruction, no GPU acceptance',provenance:{previousWorldVersion:'R70-L',previousReleaseCommit:base,previousManifestPath:archive,previousManifestSHA256:sha(old),previousFileCount:previous.files.length,fileCount:files.length,changedPreviouslyTrackedSources:changed,newlyTrackedSources:files.filter(f=>!previous.files.some(o=>o.path===f.path))},files};
fs.writeFileSync(p,JSON.stringify(freeze,null,2)+'\n');
fs.writeFileSync('release.json',JSON.stringify({release:'R71'},null,2)+'\n');
fs.mkdirSync('release/r71',{recursive:true});fs.writeFileSync('release/r71/start.mjs',fs.readFileSync('release/r70/start.mjs','utf8').replaceAll('R70','R71'));
console.log(JSON.stringify({worldSourceFiles:files.length,changed:changed.map(f=>f.path),archiveSha:sha(old)}));

fs.writeFileSync('release/r71/README.txt', 'R71-M cumulative local distant exterior production package.\nRun: node start.mjs\nThis package is not a GitHub Pages deployment or full M-section acceptance.\nOfficial reference photographs are not included.\n');
