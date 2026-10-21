import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=process.cwd(),imp=p=>import(pathToFileURL(path.join(root,p))),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const THREE=await imp('node_modules/three/build/three.module.js');
const {ZoneBase}=await imp('src/scene/zones/ZoneBase.js');
const {TextureLibrary,TEXTURE_SPECS}=await imp('src/utils/TextureLibrary.js');
const {library}=await imp('tests/lib/inner-palace-fixture.mjs');
const realLibrary=()=>{const lib=new TextureLibrary();for(const k of Object.keys(TEXTURE_SPECS))lib.colors.set(k,new THREE.Texture({width:64,height:64}));return lib;};
function capture(kit,lib){kit.root.updateMatrixWorld(true);const raw=[],physical=[],materials={};kit.root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,a=Array.isArray(m.material)?m.material:[m.material];for(const mat of a)materials[mat?.name??"null"]=(materials[mat?.name??"null"]??0)+1;const norm=n=>n?.replace(/_material$/,'');const p={name:norm(m.name),role:m.userData.role??null,materials:a.map(mat=>norm(mat?.name)),matrix:m.matrixWorld.toArray(),position:Array.from(g.attributes.position.array),normal:g.attributes.normal?Array.from(g.attributes.normal.array):null,index:g.index?Array.from(g.index.array):null};physical.push(p);raw.push({...p,name:m.name,materials:a.map(mat=>({name:mat?.name,color:mat?.color?.getHex(),side:mat?.side,opacity:mat?.opacity,transparent:mat?.transparent})),attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]]))});});return{meshCount:raw.length,raw:hash(raw),physical:hash(physical),materials,navigation:hash({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems})};}
const out={root,halls:{}};
for(const file of fs.readdirSync('data/zones').filter(x=>x.endsWith('.json')).sort()){const d=JSON.parse(fs.readFileSync('data/zones/'+file));for(const [i,item]of d.items.entries()){if(item.kind!=='hall')continue;const row={name:item.name??null,structure:item.structure??null};for(const [kind,create]of [['stub',library],['real',realLibrary]]){const lib=create(),b=new ZoneBase(lib,d);try{b.buildHall(item);row[kind]=capture(b.kit,lib);}catch(e){row[kind]={error:e.message};}finally{b.kit.dispose(b.kit.root);lib.dispose?.();}}out.halls[d.id+'/'+i]=row;}}
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2));console.log('Captured',Object.keys(out.halls).length,'halls at',root);
