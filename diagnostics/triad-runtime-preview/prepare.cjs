const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname,repo=path.resolve(root,'../..');
fs.mkdirSync(path.join(root,'vendor'),{recursive:true});
for(const [dest,src] of [['three.js','three/build/three.module.js'],['BufferGeometryUtils.js','three/examples/jsm/utils/BufferGeometryUtils.js']])fs.copyFileSync(path.join(repo,'node_modules',src),path.join(root,'vendor',dest));
const id=JSON.parse(fs.readFileSync(path.join(root,'identity.json')));for(const [p,x] of Object.entries(id.files)){const b=fs.readFileSync(path.join(root,p));if(b.length!==x.bytes||crypto.createHash('sha256').update(b).digest('hex')!==x.sha256)throw Error('identity '+p)}console.log('All pinned file bytes verified');
