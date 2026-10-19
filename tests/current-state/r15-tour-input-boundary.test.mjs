import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createDOM} from '../lib/ui-dom.mjs';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {attachTourTool,detachTourTool} from '../../src/ui/TourTools.js';

test('native tour disclosure and label clicks never lock walking pointer; canvas still locks',t=>{
 const d=createDOM(),saved=Object.fromEntries(['document','window','navigator'].map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 for(const[n,value]of Object.entries({document:d.document,window:d.window,navigator:{userAgent:'Node desktop'}}))Object.defineProperty(globalThis,n,{value,configurable:true});
 document.head=document.createElement('head');document.body.ownerDocument=document;
 Object.defineProperty(d.Element.prototype,'parentElement',{get(){return this.parentNode instanceof d.Element?this.parentNode:null;}});
 document.body.requestPointerLock=()=>{document.pointerLockElement=document.body;d.dispatch(document,'pointerlockchange');};document.exitPointerLock=()=>{document.pointerLockElement=null;d.dispatch(document,'pointerlockchange');};
 const c=new FirstPersonControls(new THREE.PerspectiveCamera(),document.body,new CollisionManager()),panel=document.createElement('details');attachTourTool(panel);
 let worldPointers=0;document.body.addEventListener('pointerdown',()=>worldPointers++);document.body.addEventListener('touchstart',()=>worldPointers++);
 t.after(()=>{detachTourTool(panel);c.dispose();for(const[n,v]of Object.entries(saved))v?Object.defineProperty(globalThis,n,v):delete globalThis[n];});
 for(const tag of['summary','span','label','input','button','select']){const el=document.createElement(tag);panel.appendChild(el);const e=d.dispatch(el,'click');assert.equal(c.controls.isLocked,false,tag);assert.equal(e.defaultPrevented,false,'native '+tag+' default preserved');for(const type of['pointerdown','touchstart']){const event=d.dispatch(el,type);assert.equal(event.defaultPrevented,false);}}
 assert.equal(worldPointers,0);const canvas=document.createElement('canvas');document.body.appendChild(canvas);d.dispatch(canvas,'click');assert.equal(c.controls.isLocked,true);
});
