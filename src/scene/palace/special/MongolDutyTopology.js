import * as T from 'three';
export const MONGOL_DUTY_FIT=Object.freeze({x:-99,z:194,width:6,depth:4,height:4.2,ownerZone:'axis-courts'});
/** D13 independently named north/interior of Jingyun. Every metric and shape is MODEL_FIT, not a surveyed footprint. */
export function createMongolDutyTopology({enabled=false}={}){
 if(enabled!==true)return null;
 const p=MONGOL_DUTY_FIT,group=new T.Group(),geometries=[],materials=[],contacts=[];let disposed=false;
 group.name='mongol-duty-historical-topology';group.position.set(p.x,0,p.z);
 const part=(name,w,h,d,y,color)=>{const g=new T.BoxGeometry(w,h,d);geometries.push(g);const m=new T.MeshStandardMaterial({color,roughness:.92});materials.push(m);const o=new T.Mesh(g,m);o.name=name;o.position.y=y;o.castShadow=o.receiveShadow=true;group.add(o);};
 try{part('thin-foundation-fit',6,.12,4,.06,0x888780);part('unknown-closed-core-fit',5.7,3.84,3.7,2.04,0xa79c87);part('neutral-closure-not-historic-flat-roof',6,.24,4,4.08,0x66645e);group.updateMatrixWorld(true);const c=new T.Box3().setFromObject(group);c.mongolDutyProxy=true;contacts.push(c);}catch(e){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());throw e;}
 group.userData.structure={id:'mongol-duty-historical-topology',sourceObjectId:'FC-A9B0A95830',name:'蒙古王公大臣值房历史拓扑有限拟合',ownerZone:p.ownerZone,precisionClass:'MODEL_FIT',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',historicalEvidence:'Official text names Mongol princes/ministers duty rooms and Jiuqing separately north inside Jingyun gate; exact joint boundary unknown',source:'https://www.dpm.org.cn/explore/building/236497.html',supported:['independent D13 name','north/interior of Jingyun relative topology only'],fitted:['ALL coordinates, dimensions, closed core, neutral cap, colors; no claim of exact location or historic roof'],excludedIdentities:['FC-CC6E0C0C81','FC-418DFCE4F5'],bays:null,entryDirection:null,roofTaxonomy:null,currentSurvivalVerified:false,wholeObjectAccepted:false,interiorImplemented:false,newRooms:0,newMapItems:0,newTeleports:0};
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};return{group,geometries,materials,contacts,dispose};
}
