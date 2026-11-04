import * as T from 'three';
const ITEM={kind:'gate',name:'宁寿门',x:-294,z:224,w:31.4,d:13.7,style:'hall',gateKind:'five-bay',structureStatus:'provisional-preserved-baseline'};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/** Two independently visible white-stone approaches only. Their five tread
 * subdivisions and dimensions fit the retained .45m game platform, not survey.
 * Central danbi, parapets, bronze lions and the original gate shell are untouched. */
export function buildNingshouSideApproach(kit,f,{zoneId,itemIndex,item}){
 if(zoneId!=='ningshou'||item?.name!=='宁寿门')return false;
 const w=31.4,d=Math.min(Math.max(6.4,w*.3),10),y=.45,edge=-(d+1.6)/2,run=1.2,width=3.2,n=5;
 if(itemIndex!==3||!same(item,ITEM)||f?.parent!==kit?.root||kit.root.parent||f.position.x!==item.x||f.position.y!==0||f.position.z!==item.z||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||kit.root.position.lengthSq()||!kit.root.quaternion.equals(new T.Quaternion())||!kit.root.scale.equals(new T.Vector3(1,1,1))||[f,kit.root].some(g=>!g.matrixAutoUpdate||!g.matrixWorldAutoUpdate)||!mutable(f.children)||!mutable(kit.owned)||!mutable(kit.colliders)||!mutable(kit.walkables)||!Object.isExtensible(f.userData.structure)||('ningshouSideApproach' in f.userData.structure)||!same(f.userData.structure,{gateKind:'five-bay',storeys:1,eaveCount:1,portalCount:3}))throw Error('Exact mutable NingShou five-bay gate required, once only');
 const original=f.children.filter(m=>m.isMesh&&m.position.x===0&&m.position.z===0&&Math.abs(m.position.y-(y-.03))<1e-10);
 if(original.length!==1)throw Error('Original NingShou platform top required');
 const top=original[0],raw=new T.BoxGeometry(w+1.7,.08,d+1.7);let expected;
 try{expected=raw.toNonIndexed();if(top.geometry.index||!top.quaternion.equals(new T.Quaternion())||!top.scale.equals(new T.Vector3(1,1,1)))throw Error('Original NingShou platform transform changed');for(const key of['position','normal']){const a=top.geometry.attributes[key],b=expected.attributes[key];if(!a||a.itemSize!==b.itemSize||a.count!==b.count||a.array.some((v,i)=>!Object.is(v,b.array[i])))throw Error('Original NingShou platform buffer changed');}}
 finally{raw.dispose();expected?.dispose();}
 const originalFloor=kit.walkables.filter(q=>q.type==='box'&&q.box.min.x===item.x-(w+1.6)/2&&q.box.max.x===item.x+(w+1.6)/2&&q.box.min.y===y&&q.box.max.y===y&&q.box.min.z===item.z+edge&&q.box.max.z===item.z-edge);
 if(originalFloor.length!==1)throw Error('Original NingShou platform support changed');
 for(const cx of[-w/5,w/5]){const reserve=new T.Box3(new T.Vector3(item.x+cx-width/2,.001,item.z+edge-run),new T.Vector3(item.x+cx+width/2,y+.001,item.z+edge));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve)))throw Error('NingShou side approach occupied');}
 const stage=new T.Group(),geos=[],contacts=[],walks=[];let material;
 stage.name='ningshou-side-approaches';
 try{
  material=new T.MeshStandardMaterial({name:'r164_ningshou_side_step_stone_fit',color:0xd8d5cb,roughness:.9});
  for(const side of[-1,1])for(let i=0;i<n;i++){
   const height=y*(i+1)/n,depth=run/n,cx=side*w/5,z=edge-run+(i+.5)*depth,g=new T.BoxGeometry(width,height,depth);geos.push(g);
   const m=new T.Mesh(g,material);m.name=`ningshou-side-step/${side<0?'east':'west'}/${i}`;m.position.set(cx,height/2,z);m.castShadow=m.receiveShadow=true;m.userData={r164NingshouSideStep:true,role:'visible-side-tread',sourceObjectId:'FC-1E971B3E74',fitNotSurvey:true};stage.add(m);m.updateWorldMatrix(true,false);
   const b=new T.Box3().setFromObject(m,true).translate(new T.Vector3(item.x,0,item.z));b.r164NingshouSideStep=true;b.ningshouStepId=m.name;contacts.push(b);
   const plane=b.clone();plane.min.y=plane.max.y;walks.push({type:'box',box:plane,rescue:false,r164NingshouSideStep:true,ningshouStepId:m.name});
  }
 }catch(e){for(const g of geos)g.dispose();material?.dispose();throw e;}
 const meta={id:'place-ningshou-1e971b3e74-side-approaches',sourceObjectId:'FC-1E971B3E74',originalObjectId:'FC-1E971B3E74',sources:['https://www.dpm.org.cn/explore/building/236520.html','https://img.dpm.org.cn/Uploads/Picture/dc/1628[1024].jpg'],scope:'TWO_SOUTH_SIDE_APPROACHES_ONLY',wholeObjectAccepted:false,surveyed:false,treadCountVerified:false,centralRouteChanged:false,originalGamePlatformHeight:y,originalGameDepth:d,declaredDataDepth:item.d,edge,run,groups:[-1,1].map(s=>({id:s<0?'east':'west',centerX:s*w/5,width,treads:n})),surfacePolicy:'CLOSED_VISIBLE_BOX_TREADS_WITH_IDENTICAL_VERTEX_BOUNDS_AND_TOPS_NO_RAMP',fitted:['Metric dimensions and five subdivision levels to retained game platform','Plain white stone color, not measured current colorimetry'],remaining:['Central danbi/sloping carved stone, rails and bronze lions not reconstructed','Generic original gate depth/enclosure and precise facade are not surveyed or completed','Complete World, browser/GPU/mobile and real museum admission']};
 stage.userData.structure=meta;f.add(stage);kit.colliders.push(...contacts);kit.walkables.push(...walks);kit.owned.push(material);f.userData.structure.ningshouSideApproach=meta;return meta;
}
