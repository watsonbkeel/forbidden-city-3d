import * as THREE from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
const unit=new THREE.Vector3(1,1,1);
const identity=o=>o&&o.visible&&o.matrixAutoUpdate&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(unit);
const bay=28/5,width=bay-.68,floor=.6,height=(6.72-6.72*.12)*.8,z=-13.7/2;
const centers=[0,1,3,4].map(i=>-14+(i+.5)*bay);
function sameGeometry(a,b){
 if(!a||a.index||Object.keys(a.attributes).sort().join()!=='normal,position,uv'||Object.keys(a.morphAttributes).length||a.drawRange.start!==0||a.drawRange.count!==Infinity||JSON.stringify(a.groups)!==JSON.stringify(b.groups))return false;
 return Object.entries(b.attributes).every(([k,v])=>{const x=a.attributes[k];return x&&!x.isInterleavedBufferAttribute&&!x.normalized&&x.itemSize===v.itemSize&&x.array.constructor===v.array.constructor&&x.array.length===v.array.length&&x.array.every((n,i)=>n===v.array[i]);});
}
/** Replaces only the four original south closed-bay panels. It intentionally
 * does not touch the R40 north glazing, either portal, original collision,
 * generic furniture, wall head, columns, five-bay proportions or roof.
 * Call once after buildEastResidentialFacade() has assigned structure data.
 */
export function applyJingrenSouthWindows(kit,frame,item){
 const g=frame?.userData.structure;
 const expected={kind:'hall',name:'景仁宫',structure:'east-residential-facade',facadeProfile:'jingren-rear-entry',x:-93.4,z:331,w:28,d:13.7,pad:.8,ph:.6,colH:6.72,bays:5,roof:'xieshan',enter:true,throne:true};
 if(!item||Object.entries(expected).some(([k,v])=>item[k]!==v)||['rot','backDoor','roomBays','open','frontEnclosureInset','panelBuilder','layers','eaveCount','storeys','roofH','hardGableEnd','brackets'].some(k=>item[k]!==undefined)||!g||g.id!=='east-six/jingren-rear-entry'||g.profile!=='jingren-rear-entry'||g.name!=='景仁宫'||g.rearEntry!==true||g.storeys!==1||g.eaveCount!==1||g.frontEnclosureInset!==0||g.jingrenSouthWindows||['x','z','w','d'].some(k=>g[k]!==item[k])||frame.parent!==kit?.root||kit.root.name!=='east-six'||!frame.visible||!frame.matrixAutoUpdate||!near(frame.position.x,item.x)||frame.position.y!==0||!near(frame.position.z,item.z)||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(unit))return false;
 for(let p=kit.root;p;p=p.parent)if(!identity(p))return false;
 const translation=new THREE.Matrix4().makeTranslation(item.x,0,item.z);
 if(!frame.matrix.equals(translation)||!frame.matrixWorld.equals(translation))return false;
 const all=[];kit.root.traverse(m=>{if(m.isMesh)all.push(m);});
 const material=kit.lib.material('lattice_doors'),tile=kit.lib.tileSize('lattice_doors');if(!Number.isFinite(tile)||tile<=0)return false;
 const reference=applyBandUV(new THREE.BoxGeometry(width,height,.14),tile),targets=[];
 for(const cx of centers){
  const matches=frame.children.filter(m=>m.isMesh&&near(m.position.x,cx)&&near(m.position.y,floor+height/2)&&near(m.position.z,z));
  if(matches.length!==1){reference.dispose();return false;}
  const m=matches[0],collider={min:[item.x+cx-bay/2,floor,item.z+z-.25],max:[item.x+cx+bay/2,floor+3,item.z+z+.25]};
  if(m.isInstancedMesh||m.isSkinnedMesh||m.material!==material||!m.visible||!m.castShadow||!m.receiveShadow||!m.matrixAutoUpdate||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(unit)||!sameGeometry(m.geometry,reference)||all.some(o=>o!==m&&o.geometry===m.geometry)||kit.colliders.filter(b=>['min','max'].every(k=>collider[k].every((n,i)=>near(b[k].getComponent(i),n)))).length!==1){reference.dispose();return false;}
  targets.push(m);
 }
 reference.dispose();
 const meta={windowCount:4,source:'https://www.dpm.org.cn/explore/building/236509.html',photos:['https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d167f9a32e.jpg','https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c13f4.jpg'],photographyDate:null,status:'VERIFY_PENDING',accepted:false,scope:'FOUR_SOUTH_CLOSED_BAYS_ONLY',dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_SURVEYED',patternStatus:'BROAD_SQUARE_GRID_FLANKED_BY_NARROW_DIAMOND_FIELDS; FINE_PATTERN_PARTIAL_AND_REPEAT_COUNT_FIT',unknown:'Exact dimensions, grid repeat counts, joinery, historic paint and backing material are not measured; original five-bay spacing and building envelope remain fitted.',collisions:'ORIGINAL_FOUR_CLOSED_BAY_COLLIDERS_UNCHANGED',sillHeight:1.35,southPlane:z,windowCenters:centers,windowWidth:width,windowTop:floor+height,centerFieldFraction:.58};
 const owned=(name,color)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness:.88,metalness:0});kit.owned.push(m);return m;};
 const red=owned('jingren_south_red_frame',0x8e3027),stone=owned('jingren_south_grey_sill',0x777b77),back=owned('jingren_south_closed_recess',0x393d39),fine=owned('jingren_south_pale_diamond',0xb0aaa0);
 for(let index=0;index<4;index++){
  const cx=centers[index],group=new THREE.Group();group.name='jingren-south-sill-window';group.userData.jingrenSouthWindow={windowIndex:index,centerX:cx,...meta};frame.add(group);
  const box=(role,mat,w,h,d,x,y,zz=z,angle=0)=>{const m=kit.mesh(group,new THREE.BoxGeometry(w,h,d),mat,x,y,zz);m.rotation.z=angle;m.name='jingren-south-'+role;m.userData.jingrenSouthWindow={role,windowIndex:index,photographyDate:null,dimensionStatus:meta.dimensionStatus};return m;};
  const bottom=floor+meta.sillHeight,top=floor+height,t=.12,mid=(bottom+top)/2,innerBottom=bottom+t,innerTop=top-t,innerH=innerTop-innerBottom,centerW=(width-4*t)*.58,sideW=(width-4*t-centerW)/2;
  box('masonry-sill',stone,width,meta.sillHeight,.24,cx,floor+meta.sillHeight/2);
  for(const x of[cx-width/2+t/2,cx+width/2-t/2])box('outer-jamb',red,t,top-bottom,.18,x,mid,z-.025);
  for(const y of[bottom+t/2,top-t/2])box('outer-rail',red,width-2*t,t,.18,cx,y,z-.025);
  for(const s of[-1,1])box('major-field-divider',red,t,innerH,.18,cx+s*(centerW+t)/2,mid,z-.025);
  box('broad-field-backing',back,centerW,innerH,.04,cx,mid,z+.035);
  // Visible broad square grid is real solid geometry. Eight by ten cells is
  // a fitted rhythm, not a claim to the official photo's exact repeat count.
  for(let i=1;i<8;i++)box('square-grid-vertical',red,.045,innerH,.07,cx-centerW/2+i*centerW/8,mid,z-.075);
  for(let i=1;i<10;i++)box('square-grid-horizontal',red,centerW,.045,.07,cx,innerBottom+i*innerH/10,z-.075);
  for(const s of[-1,1]){
   const sideX=cx+s*(centerW/2+t+sideW/2),xa=sideX-sideW/2+.025,xb=sideX+sideW/2-.025,ya=innerBottom+.025,yb=innerTop-.025;
   box('narrow-field-backing',back,sideW,innerH,.04,sideX,mid,z+.035);
   // Separately clipped small diagonal solids stop inside each narrow field.
   // Ornamental junctions, hinges and historic painting remain unclaimed.
   for(const slope of[-1,1])for(let k=Math.ceil(Math.min(ya-slope*xa,ya-slope*xb)/.32)*.32;k<Math.max(yb-slope*xa,yb-slope*xb);k+=.32){
    const pts=[];for(const x of[xa,xb]){const y=slope*x+k;if(y>=ya&&y<=yb)pts.push([x,y]);}for(const y of[ya,yb]){const x=(y-k)/slope;if(x>=xa&&x<=xb&&!pts.some(p=>Math.hypot(x-p[0],y-p[1])<1e-8))pts.push([x,y]);}if(pts.length!==2)continue;const[a,b]=pts,length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.03)continue;box('fitted-diamond-grille',fine,length,.022,.045,(a[0]+b[0])/2,(a[1]+b[1])/2,z-.063,Math.atan2(b[1]-a[1],b[0]-a[0]));
   }
  }
 }
 for(const m of targets){m.removeFromParent();m.geometry.dispose();}
 g.jingrenSouthWindows=meta;return true;
}
