import * as THREE from 'three';
import {TAIHE_CORE,TAIHE_FALLBACK_OWNER} from '../palace/special/TaiheCoreProfile.js';
import {TAIHE_DAIS_FRONT} from '../palace/special/TaiheDaisFront.js';
// Finished architectural treads, lips, paving and retained door sills. This is
// a private two-route contact channel, never an extra player floor/collider.
const ARCHITECTURAL=/kit_floor_flat|stone_slab|sumeru_band|marble_material|wood_column_material|wall_brick_material|qianqing-(?:front-stone|interior-brick)|taihe_square_brick_floor/;
const distanceSegment=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[2]-a[2],d=dx*dx+dz*dz,t=d?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/d)):0;return Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);};
export function diskTouchesTriangle(x,z,r,v){const side=(a,b)=>(b[0]-a[0])*(z-a[2])-(b[2]-a[2])*(x-a[0]),a=side(v[0],v[1]),b=side(v[1],v[2]),c=side(v[2],v[0]);return(a>=0&&b>=0&&c>=0)||(a<=0&&b<=0&&c<=0)||Math.min(distanceSegment(x,z,v[0],v[1]),distanceSegment(x,z,v[1],v[2]),distanceSegment(x,z,v[2],v[0]))<r;}
/** Maximum of a planar real triangle on a circular lower-body footprint.
 * Candidates are triangle vertices, circle/edge intersections and the plane's
 * uphill circle point. No bounding-box fill or unrendered supporting plane. */
export function triangleDiskMaxY(x,z,r,v){
 const [a,b,c]=v,dx=b[0]-a[0],dz=b[2]-a[2],ex=c[0]-a[0],ez=c[2]-a[2],det=dx*ez-ex*dz;
 if(Math.abs(det)<1e-12)return -Infinity;
 const gx=((b[1]-a[1])*ez-(c[1]-a[1])*dz)/det,gz=(dx*(c[1]-a[1])-ex*(b[1]-a[1]))/det;
 const inside=(px,pz)=>{const u=((px-a[0])*ez-ex*(pz-a[2]))/det,w=(dx*(pz-a[2])-(px-a[0])*dz)/det;return u>=-1e-12&&w>=-1e-12&&u+w<=1+1e-12;};
 let max=-Infinity;const take=(px,pz)=>{max=Math.max(max,a[1]+gx*(px-a[0])+gz*(pz-a[2]));};
 if(r===0)return inside(x,z)?a[1]+gx*(x-a[0])+gz*(z-a[2]):-Infinity;
 for(const p of v)if((p[0]-x)**2+(p[2]-z)**2<=r*r)take(p[0],p[2]);
 const gradient=Math.hypot(gx,gz),px=gradient?x+r*gx/gradient:x,pz=gradient?z+r*gz/gradient:z;if(inside(px,pz))take(px,pz);
 for(let i=0;i<3;i++){const p=v[i],q=v[(i+1)%3],ux=q[0]-p[0],uz=q[2]-p[2],ox=p[0]-x,oz=p[2]-z,A=ux*ux+uz*uz,B=2*(ox*ux+oz*uz),C=ox*ox+oz*oz-r*r,D=B*B-4*A*C;if(A===0||D<0)continue;for(const t of[(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)])if(t>=0&&t<=1)take(p[0]+t*ux,p[2]+t*uz);}
 return max;
}
// Only the authored dais deck and its central removable cover. Other red/gold
// furniture and ornaments never become walkable merely because of material.
function taiheDaisSupport(mesh,v,approved=false){
 if((!approved&&mesh.userData.taiheCoreOwner!==TAIHE_FALLBACK_OWNER)||!/^taihe_(lacquer|dark_gold)$/.test(mesh.material?.name??''))return false;
 const d=TAIHE_CORE.dais,epsilon=1e-5,within=(p,x0,x1,z0,z1,y0,y1)=>p[0]>=x0-epsilon&&p[0]<=x1+epsilon&&p[2]>=z0-epsilon&&p[2]<=z1+epsilon&&p[1]>=y0-epsilon&&p[1]<=y1+epsilon;
 if(v.every(p=>within(p,-d.width/2-.02,d.width/2+.02,d.z0-.02,d.z1+.02,d.height,d.height+.06)))return true;
 const half=TAIHE_DAIS_FRONT.cover.width/2,toe=d.z0-d.steps*d.stepRun;
 return v.every(p=>within(p,-half,half,toe,d.z0,0,d.height+.06));
}
export class SharedRestSurfaces{
 constructor(relevant){this.relevant=relevant;this.rows=[];this.cells=new Map();this.globals=[];}
 collect(root,zone,{taiheCore=false,allowHiddenRoot=false}={}){const rows=[];root.updateWorldMatrix(true,true);root.traverse(mesh=>{if(!mesh.isMesh||!mesh.geometry?.attributes.position||!(ARCHITECTURAL.test(mesh.name+' '+mesh.material?.name)||mesh.userData.taiheCoreOwner===TAIHE_FALLBACK_OWNER||taiheCore)||mesh.material?.visible===false||mesh.material?.side===THREE.BackSide)return;for(let p=mesh;p;p=p.parent)if(p.visible===false&&!(allowHiddenRoot&&p===root))return;const g=mesh.geometry,p=g.attributes.position,index=g.index,start=g.drawRange.start??0,end=Math.min(index?.count??p.count,start+g.drawRange.count);for(let i=start;i<end;i+=3){const indices=[0,1,2].map(k=>index?index.getX(i+k):i+k),local=indices.map(n=>new THREE.Vector3().fromBufferAttribute(p,n).toArray()),dais=taiheDaisSupport(mesh,local,taiheCore),v=local.map(q=>new THREE.Vector3(...q).applyMatrix4(mesh.matrixWorld).toArray()),sloped=Math.max(...v.map(a=>a[1]))-Math.min(...v.map(a=>a[1]))>1e-6;if(v[0][1]<0||v[0][1]>16||(!ARCHITECTURAL.test(mesh.name+' '+mesh.material?.name)&&!dais)||sloped&&!dais)continue;const cross=(v[1][2]-v[0][2])*(v[2][0]-v[0][0])-(v[1][0]-v[0][0])*(v[2][2]-v[0][2]);if(cross<=1e-8)continue;const b=[Math.min(...v.map(a=>a[0])),Math.max(...v.map(a=>a[0])),Math.min(...v.map(a=>a[2])),Math.max(...v.map(a=>a[2]))];if(!this.relevant({min:{x:b[0],z:b[2]},max:{x:b[1],z:b[3]}}))continue;rows.push({v,b,sloped,geometry:new WeakRef(g),index:index?new WeakRef(index):null,offset:i,y:Math.max(...v.map(a=>a[1])),zone,attribute:new WeakRef(p),indices,raw:indices.flatMap(n=>[p.getX(n),p.getY(n),p.getZ(n)])});}});return rows;}
 add(root,zone,options){this.rows.push(...this.collect(root,zone,options));}
 signature(rows){return JSON.stringify(rows.map(r=>r.v));}
 rebind(root,zone){const next=this.collect(root,zone),old=this.rows.filter(r=>r.zone===zone);if(this.signature(next)!==this.signature(old))return false;this.rows=this.rows.filter(r=>r.zone!==zone).concat(next);this.index();return true;}
 index(){this.cells.clear();this.globals=[];for(const row of this.rows){const b=row.b,x0=Math.floor(b[0]/4),x1=Math.floor(b[1]/4),z0=Math.floor(b[2]/4),z1=Math.floor(b[3]/4);if((x1-x0+1)*(z1-z0+1)>128){this.globals.push(row);continue;}for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const k=`${x},${z}`;if(!this.cells.has(k))this.cells.set(k,[]);this.cells.get(k).push(row);}}this.stats={triangles:this.rows.length,numericBytes:this.rows.length*22*8};}
 height(x,z,feet,radius,isOffline){let height=-Infinity;const candidates=new Set(this.globals);for(let a=Math.floor((x-radius)/4);a<=Math.floor((x+radius)/4);a++)for(let b=Math.floor((z-radius)/4);b<=Math.floor((z+radius)/4);b++)for(const row of this.cells.get(`${a},${b}`)??[])candidates.add(row);for(const row of candidates){if(x+radius<row.b[0]||x-radius>row.b[1]||z+radius<row.b[2]||z-radius>row.b[3]||!diskTouchesTriangle(x,z,radius,row.v))continue;const y=row.sloped?triangleDiskMaxY(x,z,radius,row.v):row.y;if(y>feet+.6||y<feet-1)continue;if(!isOffline(row.zone)){const a=row.attribute.deref(),g=row.geometry.deref(),index=row.index?.deref()??null;if(!a||!g||g.attributes.position!==a||(g.index??null)!==index||index&&row.indices.some((n,k)=>index.getX(row.offset+k)!==n)||row.indices.some((n,i)=>a.getX(n)!==row.raw[i*3]||a.getY(n)!==row.raw[i*3+1]||a.getZ(n)!==row.raw[i*3+2]))return NaN;}height=Math.max(height,y);}return height;}
 dispose(){this.rows=[];this.cells.clear();this.globals=[];}
}
