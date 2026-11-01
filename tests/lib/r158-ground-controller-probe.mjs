// Unit-test environment only. Both historical and current controls execute their
// real constructors/dispose; no capability stub, prototype-only instance or
// physics hook is supplied. updateGround inputs remain authored by the test.
import * as THREE from 'three';import assert from 'node:assert/strict';import {createDOM} from './ui-dom.mjs';
export function groundControllerProbe(){
 const keys=['document','window','navigator'],saved=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)])),dom=createDOM(),element=dom.document.createElement('div'),instances=[];element.ownerDocument=dom.document;
 Object.defineProperty(globalThis,'document',{value:dom.document,configurable:true,writable:true});Object.defineProperty(globalThis,'window',{value:dom.window,configurable:true,writable:true});Object.defineProperty(globalThis,'navigator',{value:{userAgent:'CPU ground-only constructor probe',maxTouchPoints:0},configurable:true});
 return {make(Class,collisionManager,state){const c=new Class(new THREE.PerspectiveCamera(),element,collisionManager);instances.push(c);Object.assign(c,state);return c;},dispose(){try{for(const c of instances.reverse())c.dispose();assert.equal(dom.document.listenerCount(),0,'real controls release document listeners');assert.equal(dom.window.listenerCount(),0,'real controls release window listeners');assert.equal(element.listenerCount(),0,'real controls release element listeners');}finally{for(const k of keys){if(saved[k])Object.defineProperty(globalThis,k,saved[k]);else delete globalThis[k];}}}};
}
