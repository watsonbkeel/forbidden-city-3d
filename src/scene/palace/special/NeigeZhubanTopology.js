import * as T from 'three';
export const NEIGE_ZHUBAN_FIT=Object.freeze({x:-124.5,z:-391.9,width:9,depth:6,height:4.2,ownerZone:'axis-courts'});
/** Named historic Neige writing room west of Manbentang. Every metric and
 * visible closure is an engineering choice; no claim of surviving original,
 * historic flat roof, facade, entrance or room/bay census. */
export function createNeigeZhubanTopology({enabled=false}={}){
 if(enabled!==true)return null;
 const p=NEIGE_ZHUBAN_FIT,group=new T.Group(),geometries=[],materials=[],contacts=[];let disposed=false;
 group.name='neige-zhuban-historical-topology';group.position.set(p.x,0,p.z);
 const part=(name,w,h,d,y,color)=>{const g=new T.BoxGeometry(w,h,d);geometries.push(g);const m=new T.MeshStandardMaterial({color,roughness:.92});materials.push(m);const o=new T.Mesh(g,m);o.name=name;o.position.y=y;o.castShadow=o.receiveShadow=true;group.add(o);};
 try{part('thin-foundation-fit',9,.12,6,.06,0x888780);part('unknown-closed-core-fit',8.7,3.84,5.7,2.04,0xa79c87);part('neutral-closure-not-historic-flat-roof',9,.24,6,4.08,0x66645e);group.updateMatrixWorld(true);for(const m of group.children){const c=new T.Box3().setFromObject(m);c.neigeZhubanProxy=true;contacts.push(c);}}catch(e){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());throw e;}
 group.userData.structure={id:'neige-zhuban-historical-topology',sourceObjectId:'FC-15E0B02776',name:'内阁祝版房历史位置有限拟合',ownerZone:p.ownerZone,precisionClass:'TOPOLOGY_ONLY_ENGINEERING_MASSING',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',historicalEvidence:'named west of Manbentang; demolished marker in Republican-era plan',source:'https://www.dpm.org.cn/explore/building/236523.html',plan:'https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf',supported:['Neige identity distinct from Chuanxin same-name building','historical west-of-Manbentang relative topology'],fitted:['all world position, width/depth/height and neutral closed mass','colors, foundation and flat closure are engineering, not historical roof taxonomy'],bays:null,entryDirection:null,roofTaxonomy:null,currentSurvivalVerified:false,wholeObjectAccepted:false,interiorImplemented:false,newRooms:0,newMapItems:0,newTeleports:0,wallConnected:false};
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};return{group,geometries,materials,contacts,dispose};
}
