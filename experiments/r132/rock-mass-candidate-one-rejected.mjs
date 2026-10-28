// DIAGNOSTIC ONLY: whole-mass photo-fit experiment, not installed in product.
import * as T from'three';import{faceTriplanarUV}from'../../src/scene/garden/shapes.js';import{createTriangleTemplate,triangleInstance}from'../../src/utils/TriangleSupport.js';
const rnd=n=>{const a=Math.sin(n*127.1+43.7)*43758.5453123;return a-Math.floor(a)},f=Math.fround;
export function applyRockMassCandidate(b,options){
 const[cx,cy,cz]=b.profile.center,source=new T.Mesh(new T.BufferGeometry(),new T.MeshBasicMaterial({side:T.DoubleSide})),positions=[];
 for(const g of b.geometries){const p=g.attributes.position,ix=g.index;for(let i=0;i<(ix?.count??p.count);i++){const j=ix?ix.getX(i):i;positions.push(p.getX(j),p.getY(j),p.getZ(j));}}
 source.geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));source.updateMatrixWorld(true);source.geometry.computeBoundingSphere();const ray=new T.Raycaster(),pieces=[];
 const pathSamples=[];for(const r of b.profile.routes)for(let i=1;i<r.points.length;i++){const a=r.points[i-1],c=r.points[i],n=Math.ceil(Math.hypot(c[0]-a[0],c[2]-a[2])/.2);for(let j=0;j<=n;j++){const t=j/n;pathSamples.push([a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t,a[2]+(c[2]-a[2])*t,1.25]);}}
 for(let t=-3.7;t<=3.7;t+=.15)for(const[x,z]of[[-3.7,t],[3.7,t],[t,-3.7],[t,3.7]])pathSamples.push([x,10.5,z,.75]);
 function rock(hit,angle,seed,scale){const origin=new T.Vector3(hit.x-cx,hit.y-cy,hit.z-cz),radial=new T.Vector3(Math.sin(angle),0,Math.cos(angle)),tangent=new T.Vector3(radial.z,0,-radial.x),width=scale*(.85+rnd(seed+1)*.55),height=scale*(.47+rnd(seed+2)*.42),depth=scale*(.35+rnd(seed+3)*.35),g=new T.IcosahedronGeometry(1,2),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const u=new T.Vector3().fromBufferAttribute(p,i);const noise=1+.13*Math.sin(u.x*4.1+seed)*Math.cos(u.z*3.7-seed*.3)+.08*Math.sin(u.y*7+u.x*4.3+seed*.7);const along=u.x*width*noise+.20*u.y*width,vertical=u.y*height*noise+.11*u.x*height,deep=u.z*depth*noise;const v=origin.clone().addScaledVector(tangent,along).addScaledVector(radial,deep+.12).add(new T.Vector3(0,vertical,0));
   // Preserve the actual whole-body corridor, not only nominal centre points.
   for(const[x,y,z,r]of pathSamples){if(v.y<y-.12||v.y>y+2.05)continue;const dx=v.x-x,dz=v.z-z,d=Math.hypot(dx,dz);if(d<r){const q=d>1e-9?r/d:0;v.x=x+dx*q;v.z=z+dz*q;}}
   if(Math.abs(v.x)<1.65&&v.z< -3.25&&v.y<3.25){g.dispose();return null;}
   p.setXYZ(i,f(cx+v.x),f(cy+v.y),f(cz+v.z));}
  g.computeVertexNormals();faceTriplanarUV(g,options.tile??3);const colors=[];for(let i=0;i<p.count;i++){const shade=.62+.12*rnd(seed+8)+.025*Math.sin(p.getY(i)*2.3+p.getX(i));colors.push(shade,shade*.985,shade*.94);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingBox();return g;
 }
 let seed=0;for(let layer=0;layer<7;layer++){const y=.9+layer*1.43,number=layer>4?25:34;for(let k=0;k<number;k++){const angle=(k+.33*(layer%3)+.21*rnd(seed+20))/number*Math.PI*2,dir=new T.Vector3(-Math.sin(angle),0,-Math.cos(angle));ray.set(new T.Vector3(cx+Math.sin(angle)*18,cy+y,cz+Math.cos(angle)*18),dir);const hits=ray.intersectObject(source,false);const hit=hits.find(q=>q.point.y<cy+10.6);seed++;if(!hit)continue;const g=rock(hit.point,angle,seed,layer<3?1.15+ rnd(seed+4)*.48:1.0+rnd(seed+4)*.40);if(g)pieces.push({g,id:'duixiu:r132-mass:'+seed});}}
 source.geometry.dispose();source.material.dispose();for(const{g,id}of pieces){g.userData.naturalOwner=id;const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],id),box=shape.box.clone();box.triangleSupport=shape;box.duixiuTerrain=true;b.geometries.push(g);b.colliders.push(box);}b.profile={...b.profile,rockMassCandidate:{status:'DIAGNOSTIC_NOT_ACCEPTED',approach:'nonperiodic interlocking stone shoulders over retained real massif; same-source closed faces; not surveyed',pieces:pieces.length}};return b;
}
