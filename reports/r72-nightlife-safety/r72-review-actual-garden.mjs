import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import {createHash} from 'node:crypto';
const root=process.argv[2]??'/workspace/scratch/02a8023d1a85/r72-nightlife-safety';
const load=p=>import(pathToFileURL(`${root}/${p}`));
const THREE=await load('node_modules/three/build/three.module.js');
const {GardenBuilder}=await load('src/scene/GardenBuilder.js');
const {gardenLibrary}=await load('tests/lib/r48-garden-fixture.mjs');
const {PALACE_LAYOUT}=await load('src/scene/Layout.js');
const {fixture}=await load('tests/lib/r72-player-fixture.mjs');
const {PLAYER}=await load('src/config/constants.js');
const scene=new THREE.Scene(),b=new GardenBuilder(scene,gardenLibrary());b.build(PALACE_LAYOUT.find(i=>i.type==='garden'));scene.updateMatrixWorld(true);
const cleanup=[],f=fixture({after:fn=>cleanup.push(fn)});f.cm.addColliders(b.colliders);f.cm.addWalkables(b.walkables);
const rock=scene.getObjectByName('duixiu_rockery');if(!rock)throw Error('Actual rock mesh not found');
const [cx,,cz]=b.rockPos.toArray(),ray=new THREE.Raycaster(),cases=[],penetrating=[],trapped=[],visualGaps=[];
rock.material.side=THREE.DoubleSide;
const positions=[];
const reset=(x,y,z)=>{for(const k of ['KeyD','KeyA','KeyW','KeyS','Space'])f.key(k,'keyup');f.controls.velocity.set(0,0,0);f.controls.setPosition(x,y+PLAYER.HEIGHT,z);};
// North half of the actual mountain, facing Shenwumen, including ring rocks.
for(let x=-12;x<=12;x+=2)for(let z=0;z<=10;z+=2)positions.push([x,z]);
for(const fps of[10,60])for(const [dx,dz]of positions){
 const x=cx+dx,z=cz+dz;reset(x,22,z);f.controls.feetY=22;f.camera.position.y=22+PLAYER.HEIGHT;f.controls.airborne=true;
 for(let i=0;i<fps*4;i++)f.step(1/fps);
 const y=f.controls.feetY,collision=f.cm.checkCollision(f.camera.position,.5);if(collision)penetrating.push({fps,dx,dz,y});
 ray.set(new THREE.Vector3(x,40,z),new THREE.Vector3(0,-1,0));const hits=ray.intersectObject(rock,false);const top=hits[0]?.point.y??null;
 const gap=top===null?null:top-y;if(gap>PLAYER.HEIGHT)visualGaps.push({fps,dx,dz,landedFeet:y,visibleTop:top,gap});
 const exits=[];
 for(const key of['KeyD','KeyA','KeyW','KeyS']){
  reset(x,y,z);f.key(key);
  for(let i=0;i<fps*5;i++)f.step(1/fps);
  f.key(key,'keyup');const [ex,ey,ez]=f.player().position;
  const escaped=Math.hypot(ex-x,ez-z)>18&&ey<.1&&!f.cm.checkCollision(f.camera.position,.5);
  exits.push({key,escaped,end:[ex,ey,ez]});
 }
 const sample={fps,localStart:[dx,y,dz],visibleTop:top,visibleIntersections:hits.map(h=>h.point.y),collision,exits};cases.push(sample);if(!exits.some(e=>e.escaped))trapped.push(sample);
}
const result={root,sourceHashes:Object.fromEntries(['src/scene/GardenBuilder.js','src/scene/garden/rocks.js','src/scene/palace/special/TaiheCore.js'].map(p=>[p,createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')])),actualParameters:{center:b.rockPos.toArray(),dimensions:b.rockDim},cases:cases.length,penetrating,trapped,visualGaps,details:cases};
const output=process.argv[3]??'/tmp/r72-review-actual-garden.json';fs.writeFileSync(output,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,details:undefined,output},null,2));cleanup.reverse().forEach(fn=>fn());b.dispose();if(trapped.length||penetrating.length)process.exitCode=1;
