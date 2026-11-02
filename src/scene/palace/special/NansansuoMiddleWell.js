import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
export const NANSANSUO_MIDDLE_WELL_FIT=Object.freeze({x:-300,z:46.5,roofHalf:2,columnHalf:1.25,roofTop:4,rotation:0});
const ID='nansansuo-middle-well-pavilion',HOST='nansansuo-middle-court-middle-fit';
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Own official photo 7997: four red posts, broad green curved cover, low red
 * enclosure and pale well stone. Placement, dimensions, simplified rail, closed
 * roof centre and shallow safety bottom are engineering fits, NOT a survey.
 * One EXPAND-04 ancillary instance; no extra original-41 hall or public-access claim. */
export function buildNansansuoMiddleWell(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','mapItems','owned'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('middle well requires unchanged pre-finish host');
 if(kit.root.children.some(o=>o.userData.structure?.id===ID))throw Error('middle well duplicate: install once');
 const hosts=kit.root.children.filter(o=>o.userData.structure?.id===HOST),host=hosts[0];
 if(hosts.length!==1||host.userData.structure.objectId!=='FC-B875FF665E'||host.position.x!==-285.2||host.position.y!==0||host.position.z!==53.5||host.rotation.y!==0||!host.scale.equals(new T.Vector3(1,1,1)))throw Error('middle well requires retained middle-hall parent host');
 const reserve=new T.Box3(new T.Vector3(-302.2,.05,44.2),new T.Vector3(-297.8,5.4,48.8));
 if(kit.colliders.some(c=>reserve.intersectsBox(c.box??c)))throw Error('middle well reserved fit is occupied');
 const p=NANSANSUO_MIDDLE_WELL_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const geometries=[],materials=[],colliders=[];
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.88});materials.push(m);return m;};
 const red=mat('middle-well-plain-red-fit',0x9a382e),green=mat('middle-well-plain-green-cover-fit',0x426d55),wood=mat('middle-well-dark-timber-fit',0x46362d),stone=kit.lib.material('stone_slab');
 const mesh=(geometry,material,role)=>{const geo=applyBoxUV(geometry,material===stone?kit.lib.tileSize('stone_slab'):1);geometries.push(geo);const m=new T.Mesh(geo,material);m.name=ID+':'+role+':'+frame.children.length;m.userData.middleWellRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);return m;};
 const box=(role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 // Each roof side is a closed curved trapezoidal solid, not a roof-wide air box.
 const sector=()=>{const vertices=[],nx=4,ny=5,top=[];for(let j=0;j<=ny;j++){const t=j/ny,h=.32+1.68*t;for(let i=0;i<=nx;i++){const u=-1+2*i/nx;top.push([u*h,4-.75*t+.12*t*t+.20*u*u*t*t,-h]);}}const bottom=top.map(([x,y,z])=>[x,y-.12,z]),tri=(a,b,c)=>vertices.push(...a,...c,...b);for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;tri(top[a],top[c],top[b]);tri(top[b],top[c],top[d]);tri(bottom[a],bottom[b],bottom[c]);tri(bottom[b],bottom[d],bottom[c]);}const edge=[];for(let i=0;i<=nx;i++)edge.push(i);for(let j=1;j<=ny;j++)edge.push(j*(nx+1)+nx);for(let i=nx-1;i>=0;i--)edge.push(ny*(nx+1)+i);for(let j=ny-1;j>=1;j--)edge.push(j*(nx+1));for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];tri(top[a],top[b],bottom[a]);tri(top[b],bottom[b],bottom[a]);}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;};
 try{
  box('ground-flush-stone-fit',stone,2.95,.04,2.95,0,-.02,0);
  for(const x of[-1.25,1.25])for(const z of[-1.25,1.25]){mesh(new T.CylinderGeometry(.23,.25,.18,12).translate(x,.09,z),stone,'column-stone-foot');mesh(new T.CylinderGeometry(.135,.145,2.9,12).translate(x,1.63,z),red,'red-column');}
  for(const z of[-1.25,1.25])box('plain-bearing-beam',wood,2.75,.22,.20,0,3.08,z);
  for(const x of[-1.25,1.25])box('plain-bearing-beam',wood,.20,.22,2.75,x,3.08,0);
  for(let i=0;i<4;i++)mesh(sector().rotateY(i*Math.PI/2),green,'curved-green-roof-sector');
  box('closed-roof-centre-fit-not-observed',green,.64,.12,.64,0,3.94,0);
  // Three enclosed sides and a broad south viewing gap. Exact rail design/opening unverified.
  for(const y of[.22,.76]){for(const x of[-1.25,1.25])box('low-red-rail',red,.09,.09,2.5,x,y,0);box('low-red-rail',red,2.5,.09,.09,0,y,1.25);for(const x of[-.96,.96])box('short-front-rail-fit',red,.58,.09,.09,x,y,-1.25);}
  for(const v of[-.65,0,.65]){for(const x of[-1.25,1.25])box('coarse-rail-upright-fit',red,.07,.54,.07,x,.49,v);box('coarse-rail-upright-fit',red,.07,.54,.07,v,.49,1.25);}
  for(const x of[-.67,.67])box('front-gap-jamb-fit',red,.09,.79,.09,x,.395,-1.25);
  // Closed annulus, with real shallow visible bottom; depth is a safety fit only.
  mesh(new T.LatheGeometry([new T.Vector2(.26,.04),new T.Vector2(.51,.04),new T.Vector2(.51,.46),new T.Vector2(.26,.46),new T.Vector2(.26,.04)],24),stone,'visible-stone-well-collar');
  mesh(new T.CylinderGeometry(.265,.265,.04,24).translate(0,.02,0),stone,'visible-shallow-safety-bottom-fit');
  frame.updateMatrixWorld(true);
  for(const m of frame.children){const a=m.geometry.attributes.position,vertices=[];for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),c=shape.box.clone();c.triangleSupport=shape;colliders.push(c);m.userData.middleWellOwner=shape.id;}finally{g.dispose();}}
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,instanceId:'EXPAND-04-MIDDLE-WELL-01',parentObjectId:'FC-C640AE8651',name:'南三所中所井亭（位置与细部拟合）',...p,sourcePhoto:'https://img.dpm.org.cn/Uploads/Picture/dc/7997.jpg',sourcePage:'https://www.dpm.org.cn/explore/building/236452.html',locationVerified:false,surveyed:false,wholeCourtyardAccepted:false,roofTopStatus:'UNVERIFIED_SIMPLE_CLOSED_CAP_FIT_NO_CLAIM_OF_HISTORIC_APERTURE',wellDepthStatus:'SHALLOW_VISIBLE_SAFETY_FIT_NOT_MEASURED_DEPTH',dimensions:'ENGINEERING_FIT_NOT_SURVEY',railOpening:'SOUTH_VIEWING_GAP_GAME_FIT_NOT_REAL_ACCESS_CLAIM',unknown:['measured size and location','roof centre and detailed tile profile','precise rail pattern and entry side','well depth and unseen faces','GPU/mobile appearance'],triangleOwners:colliders.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...materials);return{frame,meta,colliders,materials};
}
