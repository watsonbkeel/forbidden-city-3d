import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const base='b6498da08a690be8c029057b1bd9ec95cfcb66cf',sha=b=>createHash('sha256').update(b).digest('hex');
const p='data/characters/world-source-freeze.json',old=execFileSync('git',['show',base+':'+p]),previous=JSON.parse(old);
const archive='data/characters/world-source-freeze-r69-k-cining-area.json';if(fs.existsSync(archive)&&!fs.readFileSync(archive).equals(old))throw Error('Previous manifest archive differs');fs.writeFileSync(archive,old);
const extra=[];
const files=[...new Set([...previous.files.map(f=>f.path),...extra])].sort().map(path=>({path,sha256:sha(fs.readFileSync(path))}));
const changed=previous.files.filter(f=>sha(fs.readFileSync(f.path))!==f.sha256).map(f=>({path:f.path,beforeSHA256:f.sha256,afterSHA256:sha(fs.readFileSync(f.path))}));
const freeze={schemaVersion:previous.schemaVersion+1,baselineCommit:base,purpose:'R70-L bounded shared corner-finial photo silhouette and whole L review. Preserves cumulative R69 and R65 behavior. Not complete L acceptance or GPU verification',provenance:{previousWorldVersion:'R69-K',previousReleaseCommit:base,previousManifestPath:archive,previousManifestSHA256:sha(old),previousFileCount:previous.files.length,fileCount:files.length,changedPreviouslyTrackedSources:changed,newlyTrackedSources:files.filter(f=>!previous.files.some(o=>o.path===f.path))},files};
fs.writeFileSync(p,JSON.stringify(freeze,null,2)+'\n');
fs.writeFileSync('release.json',JSON.stringify({release:'R70'},null,2)+'\n');
fs.mkdirSync('release/r70',{recursive:true});fs.writeFileSync('release/r70/start.mjs',fs.readFileSync('release/r69/start.mjs','utf8').replaceAll('R69','R70'));
console.log(JSON.stringify({worldSourceFiles:files.length,changed:changed.map(f=>f.path),archiveSha:sha(old)}));

fs.writeFileSync('release/r70/README.txt', 'R70-L cumulative local production package.\nRun: node start.mjs\nThis package is not a GitHub Pages deployment or full L-section acceptance.\nOfficial reference photographs are not included.\n');
