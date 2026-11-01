import * as THREE from 'three';
import {createGatePlaque} from './GatePlaques.js';

/** The museum's close-up establishes a vertical Han-left / Manchu-right name
 * board between the southern eaves. The simplified silhouette, Han font and
 * dimensions below are model fits, not a tracing, transcription or survey. */
export function buildQinanNamePlaque(kit,frame,g){
  // GatePlaques owns the Canvas texture through its material dispose event.
  // Adapt only this hall's ownership, without changing the shared plaque atlas.
  const owner={_own:new Map(),ownMat(key,params){const m=new THREE.MeshStandardMaterial(params);this._own.set(key,m);kit.owned.push(m);return m;}};
  const bottom=g.datum.columnBaseTopY+g.mainBody.enclosureApproximation.upperDrumBottomRelativeY;
  const top=g.levels.upperEavePurlinBottom,height=1.45,width=1.36;
  if(top-bottom<height+.2)throw new Error('Qinan plaque does not fit the retained inter-eave band');
  const p=createGatePlaque(owner,{id:'qinan-south-name-plaque',text:'欽安殿',width,height,depth:.12,layout:'vertical',style:'gate-name',side:'south'});
  p.position.set(0,(bottom+top)/2,-g.upperColumnHeadGrid.depth/2-.2);
  p.userData.role='qinan-name-plaque';
  Object.assign(p.userData.gatePlaque,{
    source:'https://www.dpm.org.cn/explore/building/236494.html',
    photograph:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efef832a6177.jpg',
    originalLayout:'VERTICAL_HAN_LEFT_MANCHU_RIGHT',
    renderedLayout:'HAN_ONLY_SEMANTIC_APPROXIMATION',
    omittedScript:{script:'Manchu',status:'DEFERRED_UNVERIFIED_TRANSCRIPTION_AND_FONT'},
    mount:{kind:'south-main-hall-inter-eave-band',bottom,top,dimensionBasis:'PHOTO_LOCATION_MODEL_FIT_NOT_SURVEY'},
  });
  frame.add(p);return p;
}
