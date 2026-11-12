import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {CANGZHEN_ID,CANGZHEN_SOURCE,CANGZHEN_PHOTO,CANGZHEN_SCOPE,validateCangzhenHost} from './CangzhenGateProfile.js';
import {cangzhenPrism,tiePolygon,cangzhenWallCapRoof,cangzhenDoorCanopy} from './CangzhenGateGeometry.js';
const installed=new WeakMap();
/** A named single EAST-facing glazed wall gate, not a detached street arch.
 * North end z312 is a model CUT. The historic wall/inner low wall remain open
 * research scope. All scale and open-leaf dimensions are MODEL_FIT. */
export function buildCangzhenGate(kit,zone){
 if(!validateCangzhenHost(kit,zone))return null;
 if(installed.has(kit))throw Error('Cangzhen already installed');
 const frame=new T.Group();frame.name='苍震门';const geometries=[],materials=[],contacts=[],walkables=[];let released=false;
 const material=(name,color)=>{const m=new T.MeshStandardMaterial();materials.push(m);m.setValues({name:'cangzhen/'+name,color,roughness:.78,side:T.DoubleSide});return m;};
 const add=(name,g,mat)=>{geometries.push(g);const m=new T.Mesh(g,mat);m.name='cangzhen/'+name;m.castShadow=m.receiveShadow=true;frame.add(m);return m;};
 const box=(name,mat,x0,y0,z0,x1,y1,z1)=>{const g=new T.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return add(name,g,mat);};
 const free=()=>{if(released)return false;released=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();return true;};
 let meta;
 try{
  const red=material('red-fields-fit',0x9b493a),brick=material('grey-brick-fit',0x5e5a53),stone=material('pale-layered-stone-fit',0xbdb8a6),green=material('green-glaze-fit',0x3c6d58),yellow=material('yellow-glaze-fit',0xc29942),door=material('open-red-leaves-fit',0x7e3024);
  add('south-tie-brick',cangzhenPrism(tiePolygon(.56),0,1,[0,1,2]),brick);
  add('south-tie-red',cangzhenPrism(tiePolygon(.5),1,6.5,[0,1,2]),red);
  // Cap brick eave is a third independently clipped layer (same .56 as old).
  add('south-tie-cap-brick',cangzhenPrism(tiePolygon(.56),6.5,6.7,[0,1,2]),brick);
  box('north-fragment-brick',brick,-215.56,0,306.3,-214.44,1,312);
  box('north-fragment-red',red,-215.5,1,306.3,-214.5,6.5,312);
  box('remaining-cap-brick',brick,-215.56,6.5,301.3,-214.44,6.7,312);
  add('wall-cap-roof',cangzhenWallCapRoof(),yellow);
  // The inherited cap ridge is .18 high, .198 wide: clip its own box separately.
  const ridgeHalf=.099,poly=[[-215-ridgeHalf,300],[-215,300],[-215,300+ridgeHalf],[-215+ridgeHalf,300+ridgeHalf],[-215+ridgeHalf,312],[-215-ridgeHalf,312]];
  add('wall-cap-ridge',cangzhenPrism(poly,7.209,7.389,[0,1,2]),yellow);
  for(const [s,a,b]of[[-1,301.3,302.5],[1,305.1,306.3]]){
   box('stone-foot/'+s,stone,-216,0,a,-214,.18,b);
   box('stone-waist/'+s,stone,-215.94,.18,a,-214.06,.52,b);
   box('stone-cap/'+s,stone,-216,.52,a,-214,.68,b);
   box('red-pier/'+s,red,-215.87,.68,a,-214.13,4.65,b);
   // Coarse framing outside aperture, no fine relief or invented inscriptions.
   for(const x of[-215.96,-214.04]){
    box('yellow-border/'+s+'/'+x,yellow,x-.025,.68,a,x+.025,4.65,a+.10);
    box('yellow-border-end/'+s+'/'+x,yellow,x-.025,.68,b-.10,x+.025,4.65,b);
   }
   const za=s<0?302.35:305.15,zb=za+.10;
   box('open-leaf/'+s,door,-215.4,.06,za,-214.15,4.28,zb);
   for(let row=0;row<5;row++)for(let col=0;col<3;col++)box('plain-stud-fit/'+s+'/'+row+'/'+col,yellow,-215.3+col*.42,.65+row*.67,za-.015,-215.25+col*.42,.70+row*.67,za);
  }
  box('header-clear-4.3',green,-215.9,4.3,302.5,-214.1,4.98,305.1);
  box('high-wall-above-gate',red,-215.5,4.98,301.3,-214.5,6.5,306.3);
  for(const y of[4.48,4.82]){box('east-green-band/'+y,green,-215.99,y,301.3,-215.92,y+.22,306.3);box('east-yellow-band/'+y,yellow,-216,y-.04,301.3,-215.92,y,306.3);}
  add('low-door-canopy',cangzhenDoorCanopy(),yellow);
  const threshold=box('threshold-fit',door,-215.7,0,302.5,-214.3,.06,305.1);threshold.userData.cangzhenThreshold=true;
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children){const shape=triangleInstance(createTriangleTemplate(m.geometry),[0,0,0],m.name),c=shape.box.clone();if(m!==threshold)c.triangleSupport=shape;c.cangzhenMesh=m.name;if(m===threshold){c.cangzhenThreshold=true;const top=c.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false});}contacts.push(c);}
  const b=new T.Box3().setFromObject(frame,true);if(!new T.Box3(new T.Vector3(-217,-.0001,299.9999),new T.Vector3(-213,7.6,312.0001)).containsBox(b))throw Error('Cangzhen actual geometry escaped approved local budget');
  meta={id:'cangzhen-limited-wall-gate-r273',objectId:CANGZHEN_ID,sourceObjectId:CANGZHEN_ID,name:'苍震门',zoneId:'east-six',x:-215,z:303.8,front:'east-negative-X',portalCount:1,clearWidth:2.6,clearHeight:4.3,thresholdHeight:.06,northCutNotHistoricEndpoint:312,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:CANGZHEN_SOURCE,ownPhoto:CANGZHEN_PHOTO,scopeNote:{...CANGZHEN_SCOPE},sourceSupported:['single east-facing glazed gate with two leaves','layered pale stone feet, red fields, yellow and green glazed bands','low canopy with high red wall continuing above','outer street wall continues north'],fitted:['all coordinates and dimensions','open leaves and low threshold for model circulation','coarse color/profile and hidden rear','finite north model cut, no historical endpoint claim'],unknown:['complete northern outer wall and inner low wall/street','named western Zhaohua gate runtime','full carved relief, Manchu/calligraphic details','full World/browser/GPU/mobile acceptance'],npcScope:'2.6m does not support two max-radius NPCs side by side; yielding not claimed complete',newRooms:0,newMapItems:0};
  frame.userData.structure=meta;
 }catch(error){free();throw error;}
 const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};
 try{kit.root.add(frame);kit.colliders.push(...contacts);kit.walkables.push(...walkables);kit.owned.push(...materials);}
 catch(error){if(frame.parent===kit.root)frame.removeFromParent();for(const key of Object.keys(lengths))Array.prototype.splice.call(kit[key],lengths[key]);free();throw error;}
 const result={frame,meta,contacts,materials,uninstall(){if(installed.get(kit)!==result)return false;frame.removeFromParent();for(const [key,items]of[['colliders',contacts],['walkables',walkables],['owned',materials]])for(const v of items){const i=kit[key].indexOf(v);if(i>=0)kit[key].splice(i,1);}installed.delete(kit);return free();}};
 installed.set(kit,result);return result;
}
