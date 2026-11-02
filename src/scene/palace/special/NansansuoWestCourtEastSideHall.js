import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {isBuiltNansansuoFrontFrame} from './NansansuoFrontHalls.js';
export const NANSANSUO_WEST_COURT_EAST_SIDE_FIT=Object.freeze({x:-264.5,z:36,width:8.4,depth:3.6,eave:3.4,ridge:5.2,roofDepth:4.4,rotation:-Math.PI/2});
const ID='nansansuo-west-first-east-side-hall',identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Official prose supports three bays and the front side halls' non-projecting
 * hard-gable form. No own facade photo or measured footprint: all dimensions,
 * placement, colours, closed panels and inward orientation are plain game fits.
 * Independent WEST COURT inner-east reserve and inward orientation; reusing the bounded
 * plain vocabulary does NOT assert historically identical east/west facades.
 * Actual western front roof minX=-261.312535095 gives reserve gap.787464905m,
 * proposed full-roof gap.987464855m. The middle-west x=-267.2 route and
 * all retained roofs/side halls remain fixed; independently scanned inner band.
 * One ancillary instance, never a new original-41 identity or accessible room. */
export function buildNansansuoWestCourtEastSideHall(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','mapItems','owned'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('west inner-east side hall requires unchanged pre-finish host');
 if(kit.root.children.some(o=>o.userData.structure?.id===ID))throw Error('west inner-east side hall duplicate installation');
 const fronts=kit.root.children.filter(o=>o.userData.nansansuoFrontHall?.objectId==='FC-172C8CBF68'),host=fronts[0],wells=kit.root.children.filter(o=>o.userData.structure?.id==='nansansuo-middle-well-pavilion'),well=wells[0];
 if(fronts.length!==1||!isBuiltNansansuoFrontFrame(host)||host.position.x!==-251.8||host.position.y!==0||host.position.z!==39||host.rotation.y!==0||!host.scale.equals(new T.Vector3(1,1,1))||wells.length!==1||well.position.x!==-300||well.position.y!==0||well.position.z!==46.5||well.userData.structure.instanceId!=='EXPAND-04-MIDDLE-WELL-01')throw Error('west inner-east side hall requires retained actual front and well hosts');
 const east=kit.root.children.filter(o=>o.userData.structure?.id==='nansansuo-middle-first-east-side-hall');if(east.length!==1||east[0].position.x!==-300||east[0].position.y!==0||east[0].position.z!==36||east[0].rotation.y!==-Math.PI/2||east[0].userData.structure.instanceId!=='EXPAND-04-MIDDLE-FIRST-EAST-01'||kit.colliders.filter(c=>c.triangleSupport?.id.startsWith('nansansuo-middle-first-east-side-hall:')).length!==32)throw Error('west side hall requires retained east host and32 owners');
 const midWest=kit.root.children.filter(o=>o.userData.structure?.id==='nansansuo-middle-first-west-side-hall');if(midWest.length!==1||midWest[0].position.x!==-270.6||midWest[0].position.y!==0||midWest[0].position.z!==36||midWest[0].rotation.y!==Math.PI/2||midWest[0].userData.structure.instanceId!=='EXPAND-04-MIDDLE-FIRST-WEST-01'||kit.colliders.filter(c=>c.triangleSupport?.id.startsWith('nansansuo-middle-first-west-side-hall:')).length!==32)throw Error('west inner-east side hall requires retained middle west host and32 owners');
 const west=kit.root.children.filter(o=>o.userData.structure?.id==='nansansuo-west-first-west-side-hall');if(west.length!==1||west[0].position.x!==-238.6||west[0].position.y!==0||west[0].position.z!==36||west[0].rotation.y!==Math.PI/2||west[0].userData.structure.instanceId!=='EXPAND-04-WEST-FIRST-WEST-01'||kit.colliders.filter(c=>c.triangleSupport?.id.startsWith('nansansuo-west-first-west-side-hall:')).length!==32)throw Error('west inner-east side hall requires retained western court host and32 owners');
 const outerEast=kit.root.children.filter(o=>o.userData.structure?.id==='nansansuo-east-first-east-side-hall');if(outerEast.length!==1||outerEast[0].position.x!==-330.7||outerEast[0].position.y!==0||outerEast[0].position.z!==36||outerEast[0].rotation.y!==-Math.PI/2||outerEast[0].userData.structure.instanceId!=='EXPAND-04-EAST-FIRST-EAST-01'||kit.colliders.filter(c=>c.triangleSupport?.id.startsWith('nansansuo-east-first-east-side-hall:')).length!==32)throw Error('west inner-east side hall requires retained outer-east host and32 owners');
 const reserve=new T.Box3(new T.Vector3(-266.9,.05,31.2),new T.Vector3(-262.1,5.8,40.8));if(kit.colliders.some(c=>reserve.intersectsBox(c.box??c)))throw Error('west inner-east side hall reserved fit occupied');
 const p=NANSANSUO_WEST_COURT_EAST_SIDE_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);frame.rotation.y=p.rotation;
 const geometries=[],materials=[],colliders=[];const mat=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.86});materials.push(m);return m;};
 const red=mat('west-court-east-side-plain-red-fit',0x884033),green=mat('west-court-east-side-green-colour-fit',0x48674d),wood=mat('west-court-east-side-plain-closed-timber-fit',0x604735),stone=kit.lib.material('stone_slab');
 const mesh=(geometry,material,role)=>{const g=applyBoxUV(geometry,material===stone?kit.lib.tileSize('stone_slab'):1);geometries.push(g);const m=new T.Mesh(g,material);m.name=ID+':'+role+':'+frame.children.length;m.userData.westCourtEastSideRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);return m;};
 const box=(role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const height=z=>p.eave+(p.ridge-p.eave)*(.45*(1-Math.abs(z)/2.2)+.55*(1-Math.abs(z)/2.2)**2),points=Array.from({length:13},(_,i)=>{const z=-2.2+4.4*i/12;return[z,height(z)]});
 try{
  box('ground-flush-stone-fit',stone,8.4,.04,3.6,0,-.02,0);
  for(const z of[-1.8,1.8]){box('closed-long-wall-fit',red,8.4,3.4,.20,0,1.7,z);box('plain-low-stone-fit',stone,8.4,.55,.24,0,.275,z);box('plain-bearing-beam-fit',wood,8.4,.20,.24,0,3.30,z);}
  for(const sign of[-1,1]){box('plain-hard-gable-end-wall',stone,.18,3.4,3.6,sign*4.11,1.7,0);const upper=[[-1.8,3.4],...Array.from({length:13},(_,i)=>{const z=-1.8+3.6*i/12;return[z,height(z)-.12]}),[1.8,3.4]];mesh(prism(upper,sign<0?-4.2:4.02,sign<0?-4.02:4.2),stone,'plain-flush-upper-gable');}
  for(const x of[-4.2,-1.4,1.4,4.2])mesh(new T.CylinderGeometry(.12,.13,3.4,10).translate(x,1.7,-1.86),red,'three-bay-front-column');
  for(const x of[-2.8,0,2.8]){const h=x===0?2.68:1.9,y=x===0?1.42:1.8;box('closed-front-panel-fit',wood,2.40,h,.07,x,y,-1.95);for(const dx of[-1.24,1.24])box('plain-panel-jamb-fit',red,.08,h+.08,.09,x+dx,y,-2.0);for(const yy of[y-h/2,y+h/2])box('plain-panel-head-foot-fit',red,2.56,.08,.09,x,yy,-2.0);}
  mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.12])],-4.2,4.2),green,'plain-curved-hard-gable-roof');
  box('plain-ridge-fit',green,8.4,.10,.16,0,5.23,0);
  frame.updateMatrixWorld(true);for(const m of frame.children){const a=m.geometry.attributes.position,vertices=[];for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),c=shape.box.clone();c.triangleSupport=shape;colliders.push(c);m.userData.westCourtEastSideOwner=shape.id;}finally{g.dispose();}}
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,instanceId:'EXPAND-04-WEST-FIRST-EAST-01',parentObjectId:'FC-C640AE8651',name:'南三所西所东配殿',hostObjectId:'FC-172C8CBF68',courtyardStage:'FIRST_COURT_ONLY',...p,bays:3,roofEvidence:'OFFICIAL_PROSE_FRONT_SIDE_HALL_NON_PROJECTING_HARD_GABLE',sourcePage:'https://www.dpm.org.cn/explore/building/236452.html',sourcePaper:'https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf',sourcePaperPage:142,sourcePaperIssue:'2020/10 total222',locationVerified:false,ownFacadePhotoVerified:false,surveyed:false,wholeCourtyardAccepted:false,realPublicAccessClaim:false,interiorFurnishings:0,dimensions:'ENGINEERING_FIT_NOT_SURVEY',colourStatus:'PLAIN_GREEN_RED_GREY_ENGINEERING_FIT_NOT_OWN_FACADE_SAMPLE',frontStatus:'CLOSED_PLAIN_PANELS_INWARD_ORIENTATION_FIT_NOT_OBSERVED_DOORS_WINDOWS',unknown:['measured dimensions and exact current position','own facade and window-door pattern','precise colours and decorative details','current interior or admission','GPU/mobile appearance'],triangleOwners:colliders.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...materials);return{frame,meta,colliders,materials};
}
