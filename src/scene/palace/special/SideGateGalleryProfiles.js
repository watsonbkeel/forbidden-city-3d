/** Four existing court galleries only. Official views support a roofed front
 * porch near the gate platform, not the retained 2.17m cliff. Dimensions below
 * are a practical engineering fit; existing lengths and unknown inventory stay.
 */
const rows={
  26:{id:'FC-3489F3B25A',name:'协和门南庑房',x:-103.37,z0:-415.5,z1:-314.5,facing:'x+'},
  27:{id:'FC-2D6DB6F0EC',name:'协和门北庑房',x:-103.37,z0:-286.1,z1:-222.2,facing:'x+'},
  32:{id:'FC-069E407017',name:'熙和门南庑房',x:107.6,z0:-415.5,z1:-315.1,facing:'x-'},
  33:{id:'FC-E9A79B1E5E',name:'熙和门北庑房',x:107.6,z0:-287.1,z1:-222.2,facing:'x-'},
};
export function sideGateGalleryOptions(zoneId,index,item){
 if(zoneId!=='axis-courts'||!Object.hasOwn(rows,index))return null;
 const r=rows[index];
 if(item.kind!=='corridor'||item.facing!==r.facing||JSON.stringify(item.from)!==JSON.stringify([r.x,r.z0])||JSON.stringify(item.to)!==JSON.stringify([r.x,r.z1]))throw Error('Side-gate gallery binding changed');
 return {depth:7,colH:3.6,platformHeight:2.4,frontEnclosureInset:2.2,continuousFrontPorch:true,name:r.name,objectId:r.id,surveyed:false};
}
/** Only actual anchored side gates join these existing galleries. The remaining
 * outer segment protects the exposed platform; no rail/body crosses the porch.
 */
export function sideGateGalleryRailEnd(g){
 const own=(g.profile==='xiehe'&&g.x===-106.47&&g.z===-300.3)||(g.profile==='xihe'&&g.x===110.7&&g.z===-301.1);
 return own?-.6:g.platformDepth/2;
}

const northDecks={
 'FC-2D6DB6F0EC':{x:-103.37,z0:-286.1,z1:-222.2},
 'FC-E9A79B1E5E':{x:107.6,z0:-287.1,z1:-222.2},
};
/** Preserve only the two actual hall-generated, flat stone-deck registrations.
 * This does not add a surface, alter the river, or authorize the water below it.
 */
export function validateSideGateGalleryDeck(id,box){
 const d=northDecks[id];
 if(!d||!box?.isBox3||[box.min.x-(d.x-4),box.max.x-(d.x+4),box.min.z-d.z0,box.max.z-d.z1,box.min.y-2.4,box.max.y-2.4].some(v=>!Number.isFinite(v)||Math.abs(v)>1e-7))throw Error('Invalid actual side-gallery deck registration');
 return id;
}
export function canCrossSideGateGalleryDeck(cm,position,radius,feetY){
 if(!Number.isFinite(radius)||radius<0||!Number.isFinite(feetY)||feetY<2.35)return false;
 return cm.walkables.some(w=>{
  if(w.type!=='box'||!Object.hasOwn(northDecks,w.sideGateGalleryDeck))return false;
  const b=w.box;
  // Existing registered support and full body footprint are mandatory. Ordinary
  // wall/column collision is still checked by CollisionManager after this gate.
  return b.min.y===2.4&&b.max.y===2.4&&position.x-radius>=b.min.x&&position.x+radius<=b.max.x&&position.z-radius>=b.min.z&&position.z+radius<=b.max.z;
 });
}
