// Separate heavy gate: real full World, unmodified production controls/manager.
// The original A37 route/high-drop tests remain untouched and run separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildR52World} from '../../../../tests/lib/r52-world.mjs';
import {FirstPersonControls} from '../../../../src/controls/FirstPerson.js';
import {triangleBodyIntersects} from '../../../../src/utils/TriangleSupport.js';

test('Full World: authenticated outer-crown recovery on all three bridges reaches both real banks; outward/along-water directions stay blocked',async()=>{
 const W=await buildR52World(),rows=[],violations=[];
 const owned=W.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('wuying-bridge-rails:'));
 const clockDescriptor=Object.getOwnPropertyDescriptor(performance,'now');let now=0;
 Object.defineProperty(performance,'now',{configurable:true,writable:true,value:()=>now});
 try{
  assert.equal(owned.length,126);
  const run=({fps,index,side,direction,dx,dz,bank=false})=>{
   const cx=220.8+(index-1)*6.98,cz=-274.83,half=index===1?2.5:1.9,oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{},doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
   globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
   const camera=new W.THREE.PerspectiveCamera(),ctrl=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm),frames=[];
   let reachedDeck=false,reachedBank=false,impact=null,phase='drop';const bankSign=side;
   try{
    ctrl.controls.isLocked=true;ctrl.setPosition(cx+side*(half+.53),7.7,cz-3);ctrl.feetY=6;ctrl.groundY=0;ctrl.airborne=true;ctrl.verticalVelocity=0;camera.position.y=7.7;
    for(let i=0;i<fps*(bank?12:6);i++){
     now+=1000/fps;
     let mx=0,mz=0;
     if(i>=fps*2){
      if(phase==='drop')phase='recover';
      const px=camera.position.x-ctrl.bobOffset.x;
      if(phase==='center'&&Math.abs(px-cx)<.22)phase='bank';
      if(phase==='recover'){mx=dx;mz=dz;if(i%fps===0)ctrl.jump();}
      else if(phase==='center')mx=Math.sign(cx-px);
      else if(phase==='bank')mz=bankSign;
      ctrl.moveForward=!!(mx||mz);
      if(mx||mz){camera.position.sub(ctrl.bobOffset);camera.lookAt(camera.position.x+mx,camera.position.y,camera.position.z+mz);camera.position.add(ctrl.bobOffset);camera.updateMatrixWorld(true);}
     }
     ctrl.update();
     const x=camera.position.x-ctrl.bobOffset.x,z=camera.position.z-ctrl.bobOffset.z,feet=ctrl.feetY,body=new W.THREE.Box3(new W.THREE.Vector3(x-.5,feet+1e-6,z-.5),new W.THREE.Vector3(x+.5,feet+1.7,z+.5)),hits=owned.filter(c=>triangleBodyIntersects(c.triangleSupport,body)).map(c=>c.triangleSupport.id);
     frames.push({x,z,feet,airborne:ctrl.airborne,phase,hits});
     if(hits.length)violations.push({fps,index,side,direction,frame:i,hits});
     if(i===fps*2-1)impact={x,z,feet,airborne:ctrl.airborne};
     if(i>=fps*2&&Math.abs(x-cx)<half-.6&&feet<.5&&!ctrl.airborne){reachedDeck=true;if(bank&&phase==='recover')phase='center';else if(!bank)break;}
     if(phase==='bank'&&bankSign*(z-cz)>10.5&&feet<.03&&!ctrl.airborne){reachedBank=true;break;}
    }
    rows.push({fps,index,side,direction,bank,impact,reachedDeck,reachedBank,frames});
   }finally{ctrl.dispose();globalThis.document=oldDoc;globalThis.window=oldWindow;}
  };
  // Eighteen exact body-impact routes, with dry-bank continuation in both signs.
  for(const fps of[10,30,60])for(let index=0;index<3;index++)for(const side of[-1,1])run({fps,index,side,direction:'inward-to-bank',dx:-side,dz:0,bank:true});
  // Original independent-review point and eight directions, without mocks/hooks.
  for(const fps of[10,30,60])for(const[direction,dx,dz]of[['inward',-1,0],['outward',1,0],['north',0,1],['south',0,-1],['inward-north',-1,1],['inward-south',-1,-1],['outward-north',1,1],['outward-south',1,-1]])run({fps,index:1,side:1,direction,dx,dz});
  fs.writeFileSync(process.env.EVIDENCE_OUT??'../r158-wuying-bridges-evidence/production-world-crown.json',JSON.stringify({scope:'Full CPU World; actual production FirstPersonControls/CollisionManager; no GPU claim',rows,violations}));
  assert.equal(rows.length,42);assert.equal(violations.length,0,JSON.stringify(violations.slice(0,4)));
  for(const r of rows){const id=`${r.fps}/${r.index}/${r.side}/${r.direction}`;assert.ok(r.impact?.airborne&&r.impact.feet>1,`${id}: expected actual crown body impact, not a support`);
   if(r.bank)assert.ok(r.reachedDeck&&r.reachedBank,`${id}: must recover onto real deck and exit real dry bank`);
   else if(r.direction.startsWith('inward'))assert.ok(r.reachedDeck,`${id}: inward input+jump must reach real deck`);
   else{assert.equal(r.reachedDeck,false,id);for(const p of r.frames.slice(r.fps*2))assert.ok(Math.abs(p.x-r.impact.x)<1e-6&&Math.abs(p.z-r.impact.z)<1e-6,`${id}: water must still reject outward/along-water motion`);}
  }
 }finally{if(clockDescriptor)Object.defineProperty(performance,'now',clockDescriptor);else delete performance.now;W.dispose();}
});
