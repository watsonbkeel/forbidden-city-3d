import * as T from 'three';
const ITEM={kind:'gate',name:'宁寿门',x:-294,z:224,w:31.4,d:13.7,style:'hall',gateKind:'five-bay',structureStatus:'provisional-preserved-baseline'};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const p=Object.getOwnPropertyDescriptor(o,k);return p?.writable===true&&!p.get&&!p.set};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/** Official front three bays are an open hall. Recede only the two inherited
 * inner solid piers to the existing door line; rear depth and z=0 line are
 * model fits, not surveyed historic framing. No changes to public physics. */
export function fitNingshouFrontHall(kit,f,{zoneId,itemIndex,item}){
 if(zoneId!=='ningshou'||item?.name!=='宁寿门')return false;
 const b=31.4/5,D=31.4*.3,pierD=D-.8,ph=.45,h=6.6,structure=f?.userData?.structure;
 if(itemIndex!==3||!equal(item,ITEM)||f?.parent!==kit?.root||kit.root.parent||!structure||structure.gateKind!=='five-bay'||structure.storeys!==1||structure.portalCount!==3||structure.ningshouSideApproach?.originalObjectId!=='FC-1E971B3E74'||!Object.isExtensible(structure)||('ningshouFrontHall'in structure)||!mutable(f.children)||!mutable(kit.colliders)||f.position.x!==item.x||f.position.y!==0||f.position.z!==item.z||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||kit.root.position.lengthSq()||!kit.root.quaternion.equals(new T.Quaternion())||!kit.root.scale.equals(new T.Vector3(1,1,1))||[kit.root,f].some(q=>!q.matrixAutoUpdate||!q.matrixWorldAutoUpdate))throw Error('Exact mutable NingShou side-step baseline required, once only');
 const targets=[],contacts=[],expected=[];
 try{
  for(const [name,width,height,depth,cy]of[['wall_red',1,h,pierD,ph+h/2],['wall_brick',1.1,1,pierD+.1,ph+.5]]){
   const raw=new T.BoxGeometry(width,height,depth);expected.push(raw);const shape=raw.toNonIndexed();expected.push(shape);
   for(const sign of[-1,1]){
    const px=sign*b/2,found=f.children.filter(m=>m.isMesh&&m.material===kit.lib.material(name)&&m.position.x===px&&m.position.y===cy&&m.position.z===0);
    if(found.length!==1)throw Error('Original NingShou inner pier identity changed');const m=found[0],g=m.geometry;
    if(!writable(m,'geometry')||!Object.isExtensible(m.userData)||('r164NingshouFrontPier'in m.userData)||g.index||!m.quaternion.equals(new T.Quaternion())||!m.scale.equals(new T.Vector3(1,1,1))||!m.matrixAutoUpdate||!m.matrixWorldAutoUpdate)throw Error('Mutable original inner pier required');
    let owners=0;kit.root.traverse(o=>{if(o.isMesh&&o.geometry===g)owners++});if(owners!==1)throw Error('NingShou pier geometry has another owner');
    for(const key of['position','normal']){const a=g.attributes[key],e=shape.attributes[key];if(!a||a.itemSize!==e.itemSize||a.count!==e.count||a.array.some((v,i)=>!Object.is(v,e.array[i])))throw Error('Original NingShou inner pier buffer changed');}
    targets.push({m,old:g,depth});
   }
  }
  for(const sign of[-1,1]){const px=item.x+sign*b/2,box=new T.Box3(new T.Vector3(px-.5,ph,item.z-pierD/2),new T.Vector3(px+.5,ph+3,item.z+pierD/2)),indices=kit.colliders.flatMap((c,i)=>c.isBox3&&c.equals(box)?[i]:[]);if(indices.length!==1||!writable(kit.colliders,String(indices[0])))throw Error('Owned mutable NingShou inner pier contact required');const index=indices[0],source=kit.colliders[index];if(Object.keys(source).some(k=>!['isBox3','min','max'].includes(k)))throw Error('NingShou pier has unexpected contact ownership');const next=source.clone();next.min.z=item.z;next.r164NingshouFrontPier=true;contacts.push({index,source,next});}
 }finally{for(const g of expected)g.dispose();}
 const staged=[];
 try{for(const row of targets){const g=new T.BufferGeometry();staged.push(g);g.copy(row.old);g.scale(1,1,.5);g.translate(0,0,row.depth/4);g.computeBoundingBox();g.computeBoundingSphere();}}
 catch(e){for(const g of staged)g.dispose();throw e;}
 const meta={id:'place-ningshou-1e971b3e74-front-hall',originalObjectId:'FC-1E971B3E74',sourceObjectId:'FC-1E971B3E74',sources:['https://www.dpm.org.cn/explore/building/236520.html','https://img.dpm.org.cn/Uploads/Picture/dc/1628[1024].jpg'],scope:'TWO_INNER_PIERS_FRONT_HALF_ONLY',wholeObjectAccepted:false,surveyed:false,changedMeshes:4,changedColliders:2,newMaterials:0,newWalkables:0,originalDoorLineZ:0,originalGameDepth:D,declaredDataDepth:item.d,retained:['all original columns and doors, outer piers and side bays','original rear half of two inner piers','platform, side steps, plaque, roof and every other gate'],fitted:['front/back boundary follows inherited door line, not surveyed gold-column position','remaining rear pier depth, original generic gate depth and material texture scale'],remaining:['precise historic door-plane and post arrangement','central danbi, stone rails, bronze lions and complete gate fidelity','World, browser/GPU and mobile validation']};
 const record=new T.Group();record.name='ningshou-front-open-hall-record';record.userData.structure=meta;
 // All ordinary writable owners are checked before touching any original.
 // User-installed throwing disposal/event callbacks are outside this guarantee.
 for(let i=0;i<targets.length;i++){targets[i].m.geometry=staged[i];targets[i].m.userData.r164NingshouFrontPier=true;}
 for(const row of contacts)kit.colliders[row.index]=row.next;
 f.add(record);structure.ningshouFrontHall=meta;
 for(const row of targets)row.old.dispose();return meta;
}
