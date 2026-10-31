import * as THREE from 'three';

export const WUMEN_NORTHWEST_PAVILION_ID='INSTANCE-A-WUMEN-WEST-NORTH-PAVILION';
export const WUMEN_NORTHWEST_NORTH_FIT=Object.freeze({
  revision:'r157-northwest-own-plan-six-v1',
  source:'https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf',
  printedPage:153,renderSize:Object.freeze([2304,3000]),rowY:1162,
  // Independently observed northwest north row, NOT northeast/southwest mirror.
  // Approximate 1–2 pixel reading; retain the model's 11m width and 7.5m height.
  planAxes:Object.freeze([1599,1636,1697,1787,1848,1885]),
  xs:Object.freeze([1599,1636,1697,1787,1848,1885].map(p=>5.5-(p-1599)*11/286).reverse()),
  northZ:5.5,
});
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;

/** One existing northwest NORTH row only. No other faces, roofs or runtime
 * proxies change; clone meshes share HallKit's surviving geometry/material. */
export function refineWumenNorthwestNorthColumns(body,{instanceId}={}) {
  if(instanceId!==WUMEN_NORTHWEST_PAVILION_ID)return false;
  const fit=WUMEN_NORTHWEST_NORTH_FIT;
  if(body?.userData.structure?.northColumnFit===fit.revision)return false;
  const columns=body?.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&near(m.position.z,fit.northZ)).sort((a,b)=>a.position.x-b.position.x)??[];
  const proxies=body?.userData.colliders?.filter(b=>near((b.min.z+b.max.z)/2,fit.northZ))??[],oldXs=[-5.5,-11/6,11/6,5.5];
  if(!body?.isGroup||!near(body.userData.topY,7.5)||!near(body.position.x,47.7)||!near(body.position.y,12.3)||!near(body.position.z,-6)
    ||!body.quaternion.equals(new THREE.Quaternion())||!body.scale.equals(new THREE.Vector3(1,1,1))||columns.length!==4||proxies.length!==4
    ||!columns.every((m,i)=>near(m.position.x,oldXs[i])&&near(m.position.y,3.3)&&m.geometry===columns[0].geometry&&m.material===columns[0].material
      &&m.quaternion.equals(new THREE.Quaternion())&&m.scale.equals(new THREE.Vector3(1,1,1)))
    ||!oldXs.every(x=>proxies.filter(b=>near((b.min.x+b.max.x)/2,x)&&near(b.min.y,0)&&near(b.max.y,3)&&near(b.max.x-b.min.x,.5)&&near(b.max.z-b.min.z,.5)).length===1))
    throw Error('R157 retained northwest north pavilion row mismatch');
  const added=fit.xs.slice(1,-1).map(x=>{const m=columns[1].clone();m.position.x=x;return m;}),next=[columns[0],...added,columns[3]],geometry=columns[0].geometry;
  geometry.computeBoundingBox();
  const replacement=next.map(m=>{const b=geometry.boundingBox.clone().translate(m.position);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);return b;});
  let inserted=false;
  body.userData.colliders=body.userData.colliders.flatMap(b=>{if(!proxies.includes(b))return[b];if(inserted)return[];inserted=true;return replacement;});
  body.remove(columns[1],columns[2]);body.add(...added);
  body.userData.structure={...body.userData.structure,id:WUMEN_NORTHWEST_PAVILION_ID,parentId:'FC-86C9330D65',
    northColumnFit:fit.revision,northColumnXs:[...fit.xs],northColumnZ:fit.northZ,northColumnCount:6,
    northColumnSource:{source:fit.source,printedPage:153,planAxes:[...fit.planAxes],rowY:fit.rowY,
      basis:'APPROXIMATE_OWN_PAGE_PIXEL_REGISTRATION_WITHIN_RETAINED_MODEL_NOT_SURVEY',
      runtimeCollision:'UNCHANGED_CLOSED_NORTH_PAVILION_BODY_AABB_NO_NEW_ACCESS'},wholeObjectAccepted:false};
  return true;
}
