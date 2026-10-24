import * as THREE from 'three';
import {createDOM} from './ui-dom.mjs';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {PLAYER} from '../../src/config/constants.js';
export function fixture(t,{position=[0,0,3]}={}) {
  const d=createDOM(),saved=new Map(['document','window','navigator','performance'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  let now=1000;
  for(const [key,value] of Object.entries({document:d.document,window:d.window,navigator:{userAgent:'R65 desktop fixture',maxTouchPoints:0},performance:{now:()=>now}}))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  d.document.head=d.document.createElement('head');
  Object.defineProperty(d.Element.prototype,'ownerDocument',{get:()=>d.document});
  Object.defineProperty(d.Element.prototype,'dataset',{get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}});
  d.Element.prototype.blur=function(){if(d.document.activeElement===this)d.document.activeElement=d.document.body;};
  const canvas=d.document.createElement('canvas');d.document.body.appendChild(canvas);
  canvas.requestPointerLock=()=>{d.document.pointerLockElement=canvas;d.dispatch(d.document,'pointerlockchange');};
  d.document.exitPointerLock=()=>{d.document.pointerLockElement=null;d.dispatch(d.document,'pointerlockchange');};
  const camera=new THREE.PerspectiveCamera(),cm=new CollisionManager(),controls=new FirstPersonControls(camera,canvas,cm);
  controls.setHeadBob(false);controls.setPosition(position[0],position[1]+PLAYER.HEIGHT,position[2]);controls.lock();
  t.after(()=>{controls.dispose();for(const [k,v]of saved){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}});
  const key=(code,type='keydown',extra={})=>d.dispatch(d.document.body,type,{code,...extra});
  return {...d,camera,cm,controls,key,
    mouse(x,y=0){d.dispatch(d.document,'mousemove',{movementX:x,movementY:y});},
    step(dt=1/60){now+=dt*1000;controls.update();},
    player(){return{position:[camera.position.x-controls.bobOffset.x,controls.feetY,camera.position.z-controls.bobOffset.z],radius:.5,height:PLAYER.HEIGHT};},
  };
}