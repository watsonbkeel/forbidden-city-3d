import * as T from 'three';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export {T};
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadPinnedLayout,assertCurrentSource,SOURCE_PATH,assertNoOverrides} from './source-view.mjs';
export const repo=fileURLToPath(new URL('../../',import.meta.url));
export const source=SOURCE_PATH;
assertNoOverrides();
export const baseline=await loadPinnedLayout('r264');
export async function candidate(){assertCurrentSource();return import(new URL('../../'+source,import.meta.url));}
export function fixture({supports=true}={}){
 const root=new T.Group();root.name='outer-west';const f=new T.Group();f.position.set(221.9,0,241.1);root.add(f);
 const kit={root,colliders:[],owned:[],walkables:[],rooms:[],mapItems:[],regions:[],plaques:[]};
 const id='place-outer-west-6cae88b6a2';
 const g={id,w:45.7,d:16.2,y:.9,h:7.84,bays:7,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN',knownEmpty:false,accepted:false,entityId:id,withheldMeshCount:8,withheldColliderCount:8},warmRoomPartitions:[-1,1].map(s=>({x:s*45.7/7*1.5,doorZ:-5.9,doorW:1.8,doorH:2.65}))};
 if(supports){const principal=new T.Group();principal.userData.dafotangPrincipal='dafotang-shakyamuni-historical-fit';f.add(principal);const material=new T.MeshStandardMaterial({name:'dafotang_principal_fitted_support',color:0x685241,metalness:.05,roughness:.85});kit.owned.push(material);
  for(const[role,w,h,d,y]of[['support-foot',2.2,.16,1.8,.98],['support-waist',1.9,.46,1.52,1.29],['support-top',2.12,.18,1.72,1.61]]){const m=new T.Mesh(new T.BoxGeometry(w,h,d).translate(0,y,5.6),material);m.name='dafotang-shakyamuni-historical-fit/'+role;principal.add(m);root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(m);box.dafotangPrincipalMesh=m.uuid;box.dafotangPrincipalRole=role;kit.colliders.push(box);}
  g.historicalPrincipal={id:'dafotang-shakyamuni-historical-fit',supportDimensions:[2.2,.8,1.8],dimensionStatus:'FIGURE_AND_LOTUS_HEIGHT_SOURCED__SUPPORT_AND_POSITION_MODEL_FIT'};
 }
 const p={id,key:'dafotang',zone:'outer-west'},item={name:'大佛堂',kind:'hall',x:221.9,z:241.1,w:45.7,d:16.2,ph:.9,colH:7.84};
 let disposed=false;return {context:{kit,f,g,p,item},dispose(){if(disposed)return;disposed=true;const geos=new Set();root.traverse(m=>{if(m.geometry)geos.add(m.geometry)});for(const g of geos)g.dispose();for(const m of new Set(kit.owned))m.dispose();root.clear();}};
}
export function triangles(g){const p=g.attributes.position,ix=g.index,out=[];for(let i=0;i<(ix?.count??p.count);i+=3)out.push(new T.Triangle(...[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k))));return out;}
export function sectionFloor(g,x){let y=Infinity;for(const t of triangles(g))for(const[a,b]of[[t.a,t.b],[t.b,t.c],[t.c,t.a]]){if(x>=Math.min(a.x,b.x)-1e-7&&x<=Math.max(a.x,b.x)+1e-7){if(Math.abs(a.x-b.x)<1e-10){if(Math.abs(x-a.x)<1e-7)y=Math.min(y,a.y,b.y);}else{const u=Math.max(0,Math.min(1,(x-a.x)/(b.x-a.x)));y=Math.min(y,a.y+u*(b.y-a.y));}}}return y;}
export const beam=out=>out.frame.children.find(m=>m.userData.dafotangLayoutRole==='lower-front-entablature');
