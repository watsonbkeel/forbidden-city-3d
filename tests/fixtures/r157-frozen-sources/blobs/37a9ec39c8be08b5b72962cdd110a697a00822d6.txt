import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
const source='https://www.dpm.org.cn/explore/building/236543.html';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const unit=new T.Vector3(1,1,1),reject=()=>{throw Error('Shunzhen central north face source mismatch');};
const writable=(o,key)=>{if(!Object.isExtensible(o))return false;for(let q=o;q;q=Object.getPrototypeOf(q)){const d=Object.getOwnPropertyDescriptor(q,key);if(d)return q===o&&'value'in d&&d.writable;}return true;};
function sameGeometry(a,b){return a&&!a.index&&!Object.keys(a.morphAttributes).length&&a.drawRange.start===0&&a.drawRange.count===Infinity&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&Object.keys(a.attributes).length===Object.keys(b.attributes).length&&Object.entries(b.attributes).every(([key,v])=>{const q=a.attributes[key];return q&&!q.isInterleavedBufferAttribute&&q.normalized===v.normalized&&q.itemSize===v.itemSize&&q.count===v.count&&q.array.constructor===v.array.constructor&&q.array.every((n,i)=>n===v.array[i]);});}
function path(points,kind=T.Shape){const s=new kind();s.moveTo(...points[0]);for(const p of points.slice(1))s.lineTo(...p);s.closePath();return s;}
const rect=(a,b,c,d)=>[[a,c],[b,c],[b,d],[a,d]];
const clipped=(x,w,lo,hi,c)=>[[x-w/2+c,lo],[x+w/2-c,lo],[x+w/2,lo+c],[x+w/2,hi-c],[x+w/2-c,hi],[x-w/2+c,hi],[x-w/2,hi-c],[x-w/2,lo+c]];
function patch(points,holes=[]){const s=path(points);for(const p of holes)s.holes.push(path(p,T.Path));const g=new T.ShapeGeometry(s,1);g.translate(0,0,1.75);return g;}
function withoutNorth(source){const pos=source.attributes.position,normal=source.attributes.normal,ids=[];for(let i=0;i<pos.count;i+=3){if([0,1,2].every(k=>normal.getZ(i+k)>.99))continue;ids.push(i,i+1,i+2);}if(ids.length!==30)reject();const g=new T.BufferGeometry();for(const[key,v]of Object.entries(source.attributes)){const a=[];for(const i of ids)for(let k=0;k<v.itemSize;k++)a.push(v.array[i*v.itemSize+k]);g.setAttribute(key,new T.Float32BufferAttribute(a,v.itemSize,v.normalized));}g.computeBoundingBox();g.computeBoundingSphere();return g;}
/** Color-region replacement on the three original north planes only. No
 * sculpted relief, extrusion, extra platform/contact or copied side-gate fit. */
export function applyShunzhenNorthFrame(kit,frame,p){
 if(frame?.userData.structure?.id!=='garden/shunzhen-gates')return false;
 if(frame.userData.shunzhenNorthFrame)return false;
 if(frame.userData.structure!==p||p.x!==.5||p.z!==518.3||p.wallInterfaceWidth!==20.6||p.depth!==3.5||p.pierWidth!==1.4||p.bodyTop!==6.5||p.portals.length!==3||p.portals.some((o,i)=>o.x!==[-7.1,0,7.1][i]||o.w!==[3.6,5,3.6][i]||o.h!==5)||!writable(frame.userData,'structure')||!writable(frame.userData,'shunzhenNorthFrame')||frame.parent!==kit.root||kit.root.parent||!kit.root.visible||!kit.root.matrixAutoUpdate||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(unit)||!frame.visible||!frame.matrixAutoUpdate||!frame.position.equals(new T.Vector3(.5,0,518.3))||frame.rotation.toArray().slice(0,3).some(Boolean)||!frame.scale.equals(unit))reject();
 const all=[];kit.root.traverse(m=>{if(m.isMesh)all.push(m);});const targets=[];
 for(const [name,w,h,x,y]of[['shunzhen-pier',1.4,5.5,-3.2,3.75],['shunzhen-pier',1.4,5.5,3.2,3.75],['shunzhen-overdoor',5,1.5,0,5.75]]){
  const found=frame.children.filter(m=>m.name===name&&near(m.position.x,x)&&near(m.position.y,y)&&m.position.z===0);if(found.length!==1)reject();const m=found[0],ref=applyBoxUV(new T.BoxGeometry(w,h,3.5),kit.lib.tileSize('wall_red'));let ok=false;try{ok=m.isMesh&&writable(m,'geometry')&&!m.isInstancedMesh&&!m.isSkinnedMesh&&m.visible&&m.matrixAutoUpdate&&m.material===kit.lib.material('wall_red')&&!m.rotation.toArray().slice(0,3).some(Boolean)&&m.scale.equals(unit)&&sameGeometry(m.geometry,ref)&&!all.some(q=>q!==m&&q.geometry===m.geometry);}finally{ref.dispose();}if(!ok)reject();targets.push(m);
 }
 for(const x of[-3.2,3.2])if(kit.colliders.filter(c=>near(c.min.x,.5+x-.7)&&near(c.max.x,.5+x+.7)&&near(c.min.y,0)&&near(c.max.y,3)&&near(c.min.z,516.55)&&near(c.max.z,520.05)).length!==1)reject();
 const group=new T.Group();group.name='shunzhen-central-north-frame';const geos=[],materials=[],priorOwned=[...kit.owned],old=targets.map(m=>m.geometry),priorChildren=[...frame.children];
 try{
  const green=new T.MeshStandardMaterial({name:'shunzhen_fitted_north_green',color:0x38685d,roughness:.43});materials.push(green);const yellow=new T.MeshStandardMaterial({name:'shunzhen_fitted_north_yellow',color:0xb59441,roughness:.43});materials.push(yellow);
  const add=(geo,mat,role)=>{geos.push(geo);const m=kit.mesh(group,geo,mat,0,0,0);m.userData.shunzhenNorthFrame={role};m.name='shunzhen-north-'+role;return m;};
  const outer=[[-3.9,1],[-2.5,1],[-2.5,5],[2.5,5],[2.5,1],[3.9,1],[3.9,6.5],[-3.9,6.5]],panels=[-3.2,3.2].map(x=>clipped(x,1.1,1.08,5.12,.22)),header=rect(-3.75,3.75,5.25,5.85),headerInner=rect(-3.68,3.68,5.32,5.78),topBand=rect(-3.75,3.75,6.30,6.36);
  add(patch(outer,[...panels,header,topBand]),green,'green-ground');add(patch(headerInner),green,'green-ground');add(patch(header,[headerInner]),yellow,'yellow-outline');add(patch(topBand),yellow,'yellow-outline');
  for(const [i,x]of[-3.2,3.2].entries()){const inner=clipped(x,.94,1.16,5.04,.18);add(patch(panels[i],[inner]),yellow,'yellow-outline');const geo=patch(inner),uv=geo.attributes.uv,tile=kit.lib.tileSize('wall_red');for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)/tile,uv.getY(j)/tile);add(geo,kit.lib.material('wall_red'),'red-core');}
  const rest=old.map(g=>{const r=withoutNorth(g);geos.push(r);return r;});
  frame.add(group);kit.owned.push(...materials);targets.forEach((m,i)=>{m.geometry=rest[i];});
  const meta={source,panorama:'vp3703 autumn sph1943321033436155904; b face level640 tile1,1 only',photoHash:'88e9f91ce0af81a794ecc5b3f9eb08e99561a93b16c404c1acfb51b0a5bab98b',photographyDate:null,scope:'CENTRAL_NORTH_GLAZED_FACE_COLOR_COMPOSITION_ONLY',dimensions:'R90_INHERITED_ENVELOPE_AND_PHOTO_COLOR_FIT_NOT_SURVEY',precision:'BROAD_CLIPPED_RED_FIELDS_AND_BANDS_NOT_EXACT_CARVING',stoneFoot:'DEFERRED_NOT_CONFUSED_WITH_SEPARATE_LAMP_PEDESTALS',sideGates:'UNCHANGED_NOT_COPIED',roof:'UNCHANGED_NO_BACKGROUND_FINIAL_TRANSFER',wholeGateAccepted:false,newColliders:0,newWalkables:0};
  frame.userData.structure={...p,northFrame:meta};frame.userData.shunzhenNorthFrame=meta;
 }catch(error){targets.forEach((m,i)=>{m.geometry=old[i];});T.Object3D.prototype.remove.call(frame,group);for(const m of priorChildren)m.parent=frame;Array.prototype.splice.call(frame.children,0,frame.children.length,...priorChildren);Array.prototype.splice.call(kit.owned,0,kit.owned.length,...priorOwned);frame.userData.structure=p;delete frame.userData.shunzhenNorthFrame;for(const g of new Set(geos))g.dispose();for(const m of materials)m.dispose();throw error;}
 for(const g of old)g.dispose();return true;
}
