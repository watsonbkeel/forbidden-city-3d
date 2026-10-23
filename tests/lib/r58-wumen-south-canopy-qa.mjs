// Read-only existing-world canopy QA; never builds/loads a world or installs a layer.
import * as THREE from 'three';
import {DIMENSIONS,LAYOUT} from '../../src/config/constants.js';
import {wumenSouthCanopyProfiles,WUMEN_SOUTH_CANOPY_FIT as fit} from '../../src/scene/palace/special/WumenSouthPortalCanopies.js';
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const displayed=h=>{const m=Array.isArray(h.object.material)?h.object.material[h.face?.materialIndex??0]:h.object.material;return visible(h.object)&&m?.name==='roof_tile'&&m.visible!==false&&m.colorWrite!==false&&(!m.transparent||m.opacity>0);};
export function evaluateWumenSouthCanopies(W){
 if(!W?.scene?.isScene||!W.cm)throw TypeError('An existing scene and CollisionManager are required');
 const metadata=[];W.scene.traverse(o=>{for(const r of [o.userData.structure,...(o.userData.architecture??[])])if(r?.id==='axis/wumen-south-three-canopies')metadata.push(r);});
 const identity=metadata.length===1&&metadata[0].objectId==='FC-AD4377DF51'&&metadata[0].count===3;
 const dm=DIMENSIONS.WUMEN,profiles=wumenSouthCanopyProfiles({openings:[{x:-17.5,w:5},{x:0,w:9},{x:17.5,w:5}],southZ:dm.platformSouth,platformHeight:dm.platformHeight});
 const rows=profiles.map(p=>{
  const samples=[];
  for(const dx of [-p.width*.4,0,p.width*.4])for(const t of [.15,.65]){
   const x=p.centerX+dx,z=p.frontZ+p.depth*t+LAYOUT.WUMEN_Z,bottom=p.headY+fit.frontBottomAboveHead+fit.rise*t,top=bottom+fit.thickness;
   const ray=(y,sign,expected)=>new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,sign,0),0,1).intersectObject(W.scene,true).some(h=>displayed(h)&&Math.abs(h.point.y-expected)<1e-5);
   samples.push({dx,t,top:ray(top+.5,-1,top),bottom:ray(bottom-.5,1,bottom)});
  }
  const bodyClear=!W.cm.checkCollision(new THREE.Vector3(p.centerX,1.7,LAYOUT.WUMEN_Z+dm.platformSouth-.5),.5);
  return {centerX:p.centerX,samples,bodyClear,pass:samples.every(s=>s.top&&s.bottom)&&bodyClear};
 });
 return {pass:identity&&rows.every(r=>r.pass),identity,rows,boundary:'Three fitted south canopy volumes only; supplied-world CPU checks, NOT whole-Wumen/browser acceptance.'};
}
