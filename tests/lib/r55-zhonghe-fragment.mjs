import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from './inner-palace-fixture.mjs';
import {meshRows as commonRows,hash,geometrySignature} from './r54-jiaotai-fragment.mjs';
export {hash,geometrySignature};
export const ZHONGHE_FLOOR=8.6;
export function zhongheFragment({plinth=false,merge=false}={}) {
  const scene=new THREE.Scene(),builder=new PalaceBuilder(scene,library()),group=new THREE.Group();
  group.name='R55 Zhonghe production fragment';
  const data=structuredClone(PALACE_LAYOUT.find(h=>h.name==='中和殿'));
  if(plinth)builder.buildPlinth(group,{z0:65,w:28,d:28,y:8,ph:.6,stairW:4.6,stairSides:['south','north','east','west'],stairCenters:[-19/3,0,19/3],zhongheImperial:true});
  builder.buildHall(group,data,ZHONGHE_FLOOR);group.updateMatrixWorld(true);
  const shell=group.getObjectByName('中和殿·现状结构');
  if(merge)builder.finish(group);else {scene.add(group);builder.ownedObjects.add(group);}
  scene.updateMatrixWorld(true);return{scene,builder,group,shell,data};
}
export function meshRows(group) {
  const rows=commonRows(group),meshes=[];group.traverse(m=>{if(m.isMesh)meshes.push(m);});
  return rows.map((r,i)=>({...r,displayId:meshes[i].userData.zhongheDisplayId??null}));
}
export function legacyDisplay(builder) {
  const group=new THREE.Group();builder.throneArea(group,{x0:0,y:8.6,H:6.6,ztb0:66.2,ztb1:71.4,thW:4.56,bayW:19/3,text:'允执厥中',caisson:false,jiaotai:false});
  group.updateMatrixWorld(true);return group;
}
export const ZHONGHE_CAMERAS=[
  {id:'front',position:[0,10.3,60.2],target:[0,10.1,69.1],fov:65},
  {id:'left-oblique',position:[-5.8,10.3,65.1],target:[0,9.9,69.2],fov:65},
  {id:'right-oblique',position:[5.8,10.3,65.1],target:[0,9.9,69.2],fov:65},
  {id:'rear-clearance',position:[0,10.3,73],target:[0,9.9,69.2],fov:80},
];
