import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='place-ningshou-aea7555b5e',NAME='敛禧门',done=new WeakSet();
const SOURCE={kind:'gate',name:NAME,x:-354,z:136.8,rot:'east',style:'triple',gateKind:'wall',structureStatus:'provisional-legacy-style-unimplemented'};
const WALL={kind:'wall',from:[-354,118],to:[-354,520],h:7,gaps:[{at:136.8,gate:NAME},{at:336.5,gate:'保泰门'}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,item,c){
 if(c.zoneId!=='ningshou'||c.itemIndex!==1)return false;
 const z=c.zoneJson,r=kit?.root;
 if(!same(item,SOURCE)||z?.id!=='ningshou'||z.items?.[1]!==item||!same(z.items[43],WALL)||z.items.filter(i=>i.name===NAME).length!==1||!r||r.name!=='ningshou'||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||['colliders','walkables','mapItems','owned','rooms','regions','plaques'].some(k=>!mutable(kit[k]))||done.has(kit)||r.children.some(f=>f.userData.structure?.id===ID))throw Error('Exact writable Lianxi source and adjacent east wall required once only');
 return true;
}
export function lianxiWallGaps(item,geometry,widths){
 if(!same(item,WALL)||geometry?.id!==ID||geometry?.portalCount!==3||!Array.isArray(geometry.portals)||geometry.portals.length!==3||!Number.isFinite(widths.get('保泰门'))||widths.get('保泰门')<=0)throw Error('Lianxi adjacent wall and retained BaoTai opening changed');
 return[...geometry.portals.map(p=>({at:136.8-p.x,w:p.bodyWidth})),{at:336.5,w:widths.get('保泰门')}];
}
/** A source-backed three-tower topology with deliberately simplified glaze.
 * Coordinates/scale, rear, open leaves and plain low hipped canopies are fits.
 * No invented relief inscription, nameboard, beast census or access claim. */
export function buildLianxiGate(kit,item,context){
 if(!validate(kit,item,context))return null;
 const frame=new T.Group();frame.name=NAME;frame.position.set(item.x,0,item.z);frame.rotation.y=Math.PI/2;
 const geometries=[],materials=[],colliders=[];
 const portals=[{id:'north',x:-6.5,width:2.8,pier:1,height:4,bodyTop:5.1},{id:'middle',x:0,width:3.6,pier:1.4,height:4.4,bodyTop:5.5},{id:'south',x:6.5,width:2.8,pier:1,height:4,bodyTop:5.1}].map(p=>({...p,bodyWidth:p.width+2*p.pier}));
 const own=g=>{geometries.push(g);return g},mat=(name,color,roughness=.7)=>{const m=new T.MeshStandardMaterial({name:'r164_lianxi_'+name,color,roughness});materials.push(m);return m};
 const mesh=(role,g,m,x,y,z)=>{const q=new T.Mesh(g,m);q.name='lianxi/'+role;q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;q.userData.lianxiFeature=true;frame.add(q);return q};
 const box=(role,m,w,h,d,x,y,z)=>mesh(role,own(new T.BoxGeometry(w,h,d)),m,x,y,z);
 try{
  const red=mat('red_glaze_fit',0x9d4936,.63),stone=mat('pale_plain_stone_fit',0xc6c2ae,.9),painted=mat('simplified_glazed_fields_fit',0xffffff,.54),roof=mat('kit_roof_tile_yellow_fit',0xb78e32,.55);painted.vertexColors=true;roof.map=kit.lib.material('roof_tile').map??null;
  for(const p of portals){
   for(const s of[-1,1]){const x=p.x+s*(p.width/2+p.pier/2);
    // Plain sumeru-profile courses; photographed carving is not fabricated.
    box(p.id+'/stone-foot-'+s,stone,p.pier,.18,2.8,x,.09,0);
    box(p.id+'/stone-waist-'+s,stone,p.pier-.12,.42,2.68,x,.39,0);
    box(p.id+'/stone-cap-'+s,stone,p.pier,.15,2.8,x,.675,0);
    const g=own(new T.BufferGeometry());paintedPier(g,p.pier,p.bodyTop-.75,2.8);mesh(p.id+'/glazed-pier-'+s,g,painted,x,(p.bodyTop+.75)/2,0);
    // Fully folded gameplay leaves remain outside each clear opening
    // and beyond the rear pier face, rather than hidden inside masonry.
    box(p.id+'/open-leaf-'+s,red,.12,p.height-.1,p.width/2-.05,p.x+s*(p.width/2+.08),(p.height-.1)/2,1.42+(p.width/2-.05)/2);
   }
   box(p.id+'/door-head',red,p.width,p.bodyTop-p.height,2.8,p.x,(p.bodyTop+p.height)/2,0);
   // Backing fills the original full-height wall behind each low canopy.
   box(p.id+'/upper-wall',red,p.bodyWidth,7-p.bodyTop,1,p.x,(7+p.bodyTop)/2,0);
   const g=own(new T.BufferGeometry());hip(g,p.bodyWidth+.3,3.1,.65);mesh(p.id+'/low-hipped-canopy-fit',g,roof,p.x,p.bodyTop,0);
   box(p.id+'/plain-ridge-fit',roof,Math.max(.5,p.bodyWidth-2.8),.12,.12,p.x,p.bodyTop+.65,0);
   const cap=own(new T.BufferGeometry());hip(cap,p.bodyWidth,1.12,.12);mesh(p.id+'/wall-top-cap-fit',cap,roof,p.x,7,0);
  }
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children){const g=own(new T.BufferGeometry());try{g.copy(m.geometry);g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),c=shape.box.clone();c.triangleSupport=shape;c.lianxiMesh=m.uuid;colliders.push(c)}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const geometry={id:ID,objectId:'FC-AEA7555B5E',name:NAME,gateKind:'three-wall-portals',portalCount:3,portals,depth:2.8,width:17.8,x:item.x,z:item.z,rot:Math.PI/2,wallHeight:7,scope:'THREE_WALL_GATE_TOWERS_WITH_SIMPLIFIED_GLAZE',wholeObjectAccepted:false,surveyed:false,openState:'GAMEPLAY_FULLY_OPEN_NOT_CURRENT_MUSEUM_PERMISSION',newWalkables:0,source:'https://www.dpm.org.cn/building/talk/224072.html',officialPdf:'https://img.dpm.org.cn/Uploads/pdf/2205/T00030_00.pdf',locationSource:'https://www.dpm.org.cn/explore/building/236451.html',photographSource:'https://www.sohu.com/a/66890164_200412',photographCredit:'CAA景观原创，2016；非故宫官方照片',supported:['Three adjacent glazed wall-gate towers below the palace wall','Own exterior photograph: pale stone bases, red fields with green/yellow glaze'],fitted:['Retained position; opening dimensions, spacing and low hipped roof profile','Simplified flush coloured medallions, no copied carved design','Unseen rear and fully-open leaf pose; no historic or current access claim'],unknown:['Surveyed dimensions, carved relief, concealed rear and roof details','Current condition, door pose and public opening','GPU/browser/mobile and whole World']};
 frame.userData.structure=geometry;frame.userData.gateGeometry=geometry;
 kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...materials);kit.mapItems.push({kind:'gate',name:NAME,x:item.x,z:item.z,w:2.8,d:17.8,objectId:geometry.objectId,gateProfile:'lianxi',portalCount:3,dimensionStatus:'MODEL_FIT_NOT_SURVEYED'});done.add(kit);return{width:17.8,geometry,frame,materials,colliders};
}
// Real closed low hip, with a ridge line and an underside. No large box in air.
function hip(g,w,d,h){const x=w/2,z=d/2,r=Math.max(.25,x-z),v=[[-x,0,-z],[x,0,-z],[x,0,z],[-x,0,z],[-r,h,0],[r,h,0]],faces=[[0,4,5],[0,5,1],[1,5,2],[2,5,4],[2,4,3],[3,4,0],[0,1,2],[0,2,3]],p=[],uv=[];for(const f of faces)for(const i of f){p.push(...v[i]);uv.push(v[i][0],v[i][2])}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
// Coplanar colour subdivisions on the actual pier face, not floating decals.
function paintedPier(g,w,h,d){const temp=new T.BoxGeometry(w,h,d),ps=[],ns=[],uv=[],cs=[],p=temp.attributes.position,n=temp.attributes.normal,u=temp.attributes.uv,red=new T.Color(0x9d4936),green=new T.Color(0x386953),gold=new T.Color(0xc3a147);
 const put=(v,no,tx,c)=>{ps.push(...v);ns.push(...no);uv.push(...tx);cs.push(c.r,c.g,c.b)};
 try{for(let j=0;j<temp.index.count;j++){const i=temp.index.getX(j);if(Math.abs(n.getZ(i))<.5)put([p.getX(i),p.getY(i),p.getZ(i)],[n.getX(i),n.getY(i),n.getZ(i)],[u.getX(i),u.getY(i)],red);}
 for(const s of[-1,1]){const rect=(x0,x1,y0,y1,color)=>{const q=[[x0,y0,s*d/2],[x1,y0,s*d/2],[x1,y1,s*d/2],[x0,y1,s*d/2]];for(let ids of[[0,1,2],[0,2,3]]){if(s<0)ids=ids.slice().reverse();for(const i of ids)put(q[i],[0,0,s],[q[i][0]/w+.5,q[i][1]/h+.5],color)}};
 const bx=w/2-.055,by=h/2-.35;rect(-w/2,-bx,-h/2,h/2,gold);rect(bx,w/2,-h/2,h/2,gold);rect(-bx,bx,-h/2,-h/2+.04,gold);rect(-bx,bx,-h/2+.04,-by,green);rect(-bx,bx,by,h/2-.04,green);rect(-bx,bx,h/2-.04,h/2,gold);
 const rings=[0,.63,.70,.77,1],point=(a,r)=>{const c=Math.cos(a),v=Math.sin(a);if(r===1){const q=1/Math.max(Math.abs(c),Math.abs(v));return[c*q*bx,v*q*by,s*d/2]}return[c*w*.39*r,v*h*.24*r,s*d/2]};for(let j=0;j<32;j++){const a=j*Math.PI/16,b=(j+1)*Math.PI/16;for(let k=0;k<4;k++){const q=[point(a,rings[k]),point(b,rings[k]),point(b,rings[k+1]),point(a,rings[k+1])],color=k===0?(j%4===0?gold:green):k===1?gold:k===2?green:red;for(let ids of k===0?[[0,2,3]]:[[0,1,2],[0,2,3]]){if(s>0)ids=ids.slice().reverse();for(const i of ids)put(q[i],[0,0,s],[q[i][0]/w+.5,q[i][1]/h+.5],color)}}}}
 g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setAttribute('normal',new T.Float32BufferAttribute(ns,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(cs,3));return g;
 }finally{temp.dispose()}}
