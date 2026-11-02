import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createDOM } from '../lib/ui-dom.mjs';
import { FlightTour } from '../../src/scene/flight/FlightTour.js';
import { FlightEnvelope } from '../../src/scene/flight/FlightEnvelope.js';
import { CollisionManager } from '../../src/utils/Collision.js';

export function fixture(t,{mobile=false}={}){
  const d=createDOM(),old={document:globalThis.document,window:globalThis.window};
  Object.assign(globalThis,{document:d.document,window:d.window});
  d.document.head=d.document.createElement('head');
  Object.defineProperty(d.Element.prototype,'dataset',{get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}});
  d.Element.prototype.blur=function(){if(d.document.activeElement===this)d.document.activeElement=d.document.body;};
  const camera=new THREE.PerspectiveCamera(),canvas=d.document.createElement('canvas');d.document.body.appendChild(canvas);camera.position.set(22,1.7,-494);
  let locks=0,unlocks=0,stops=0,paused=false;
  const controls={camera,domElement:canvas,isMobile:mobile,mapOpen:false,controls:{isLocked:false},motion:{},stop(){stops++;},lock(){locks++;},unlock(){unlocks++;d.document.pointerLockElement=null;d.dispatch(d.document,'pointerlockchange');},setPosition(x,y,z){camera.position.set(x,y,z);},lookAt(x,z){camera.lookAt(x,camera.position.y,z);}};
  const f=new FlightTour({scene:new THREE.Scene(),camera,controls,collisionManager:new CollisionManager(),zoneManager:{ensureLoadedAt(){}},envelope:new FlightEnvelope(),isPaused:()=>paused});
  t.after(()=>{f.dispose();Object.assign(globalThis,old);});
  const lock=()=>{d.document.pointerLockElement=canvas;d.dispatch(d.document,'pointerlockchange');controls.controls.isLocked=true;};
  const unlock=()=>{d.document.pointerLockElement=null;d.dispatch(d.document,'pointerlockchange');controls.controls.isLocked=false;};
  const key=(code,extra={})=>d.dispatch(d.document.body,'keydown',{code,...extra});
  const board=()=>{assert(f.board());lock();};
  return {...d,f,controls,board,lock,unlock,key,setPaused:v=>paused=v,counts:()=>({locks,unlocks,stops})};
}
