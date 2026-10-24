import fs from'node:fs';import{pathToFileURL}from'node:url';
const root='/workspace/scratch/02a8023d1a85/r72-nightlife-safety',load=p=>import(pathToFileURL(root+'/'+p));
const {buildWorld}=await load('tests/lib/world.mjs');const W=await buildWorld();const {fixture}=await load('tests/lib/r72-player-fixture.mjs'),{PLAYER}=await load('src/config/constants.js');const cleanup=[],f=fixture({after:fn=>cleanup.push(fn)});f.controls.collisionManager=W.cm;f.cm=W.cm;
const cases=[];const reset=(x,y,z)=>{for(const key of['KeyD','KeyA','KeyW','KeyS','Space'])f.key(key,'keyup');f.controls.velocity.set(0,0,0);f.controls.setPosition(x,y+PLAYER.HEIGHT,z);};
for(const fps of[10,60])for(const[dx,dz]of[[-10,2],[10,0],[-6,8],[0,8],[2,8],[0,0],[2,4]]){
 const x=-29.1+dx,z=509.1+dz;reset(x,22,z);f.controls.feetY=22;f.camera.position.y=22+PLAYER.HEIGHT;f.controls.airborne=true;for(let i=0;i<fps*4;i++)f.step(1/fps);const y=f.controls.feetY,collision=f.cm.checkCollision(f.camera.position,.5),exits=[];
 for(const key of['KeyD','KeyA','KeyW','KeyS']){reset(x,y,z);f.key(key);for(let i=0;i<fps*5;i++)f.step(1/fps);f.key(key,'keyup');const [ex,ey,ez]=f.player().position;exits.push({key,end:[ex,ey,ez],escaped:Math.hypot(ex-x,ez-z)>18&&ey<.1&&!f.cm.checkCollision(f.camera.position,.5)});}
 cases.push({fps,start:[x,y,z],collision,exits});
}
const result={cases:cases.length,penetrating:cases.filter(c=>c.collision),trapped:cases.filter(c=>!c.exits.some(e=>e.escaped)),details:cases};fs.writeFileSync('/tmp/r72-review-fullworld-focus.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,details:undefined},null,2));cleanup.reverse().forEach(fn=>fn());if(result.penetrating.length||result.trapped.length)process.exitCode=1;
