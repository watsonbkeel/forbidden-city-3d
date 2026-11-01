import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

/** Own east-view type fit only. Retained station spacing and all dimensions are
 * engineering approximations, not a carving survey or a whole-gate acceptance. */
export function buildXieheEastRampRails(kit,frame,g,r) {
 if(g.profile!=='xiehe'||r!==g.ramps[0]||r.zTop!==-6||r.zToe!==-23.75||r.leftTop!==-9||r.rightTop!==9)throw Error('Xiehe east ramp identity mismatch');
 const owners=[],material=kit.lib.material('marble');
 const add=(parts,geometry,role)=>{const mesh=new THREE.Mesh(geometry,material);mesh.name=`xiehe-east-rail-${role}`;mesh.userData.xieheEastRail={role};mesh.castShadow=mesh.receiveShadow=true;frame.add(mesh);parts.push(mesh);return mesh;};
 const box=(parts,role,w,h,d,x,y,z)=>add(parts,new THREE.BoxGeometry(w,h,d).translate(x,y,z),role);
 const yAt=z=>r.yTop*(1-(z-r.zTop)/(r.zToe-r.zTop));
 const strip=(parts,role,x,a,b,low,high,thickness=.18)=>{
  const shape=new THREE.Shape();shape.moveTo(-a,yAt(a)+low);shape.lineTo(-b,yAt(b)+low);shape.lineTo(-b,yAt(b)+high);shape.lineTo(-a,yAt(a)+high);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:thickness,steps:1,bevelEnabled:false});geometry.rotateY(Math.PI/2);geometry.translate(x-thickness/2,0,0);return add(parts,geometry,role);
 };
 const crown=(parts,x,y,z)=>{
  const n=8,positions=[],indices=[],rings=[[0,.09],[.045,.14],[.14,.10]];
  for(const[h,radius]of rings)for(let i=0;i<n;i++){const a=2*Math.PI*i/n;positions.push(x+radius*Math.cos(a),y+h,z+radius*Math.sin(a));}
  for(let k=0;k<rings.length-1;k++)for(let i=0;i<n;i++){const a=k*n+i,b=k*n+(i+1)%n;indices.push(a,a+n,b,b,a+n,b+n);}
  const bottom=positions.length/3;positions.push(x,y,z);const apex=positions.length/3;positions.push(x,y+.24,z);
  for(let i=0;i<n;i++){indices.push(bottom,i,(i+1)%n);indices.push(apex,2*n+(i+1)%n,2*n+i);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const uv=[];for(let i=0;i<positions.length;i+=3)uv.push(positions[i],positions[i+1]);geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return add(parts,geometry,'coarse-pointed-crown');
 };
 const n=Math.ceil(Math.hypot(r.zToe-r.zTop,r.yTop)/2),stations=Array.from({length:n+1},(_,i)=>r.zTop+(r.zToe-r.zTop)*i/n);
 for(const side of[-1,1]){
  const x=side*9;
  for(const[i,z]of stations.entries()){
   const parts=[],y=yAt(z),bottom=Math.max(0,Math.min(r.yTop,yAt(z-.12),yAt(z+.12)));
   box(parts,'post-foot',.24,y+.14-bottom,.24,x,(bottom+y+.14)/2,z);
   box(parts,'post-stem',.20,.78,.20,x,y+.53,z);crown(parts,x,y+.92,z);
   owners.push({id:`${side}:post-${i}`,parts});
  }
  for(let i=0;i<n;i++){
   const parts=[],a=stations[i]-.10,b=stations[i+1]+.10;
   strip(parts,'lower-solid-panel',x,a,b,.16,.50);
   strip(parts,'bottom-strip',x,a,b,-.01,.16,.22);
   strip(parts,'middle-strip',x,a,b,.50,.565,.20);
   strip(parts,'upper-coping',x,a,b,.78,.88,.24);
   // Coarse open-band division only: no invented floral relief/count claim.
   for(const t of[1/3,2/3]){const z=a+(b-a)*t;strip(parts,'open-band-support-fit',x,z+.045,z-.045,.565,.78,.16);}
   owners.push({id:`${side}:panel-${i}`,parts});
  }
 }
 frame.userData.xieheEastRails={scope:'TWO_EAST_SLOPE_RUNS_ONLY',sourceSphere:'2054726937400414214',sourceViews:['3-f','0-f','0-b'],dimensions:'RETAINED_RAMP_AND_STATIONS_ENGINEERING_FIT',carving:'COARSE_SOLID_LOWER_OPEN_UPPER_AND_POINTED_POST_TYPE_NOT_EXACT_RELIEF',wholeObjectAccepted:false,remaining:['Platform return and side rails','Continuous low steps','Exact floral carving and measured dimensions']};
 // Invoke after covered-face pruning so physical triangles are precisely those
 // still rendered, never the pre-pruning mesh or conservative rail-top boxes.
 return()=>{
  frame.updateMatrixWorld(true);
  for(const{id,parts}of owners){const values=[];for(const mesh of parts){const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,v=new THREE.Vector3();for(let i=0;i<(ix?.count??p.count);i++){v.fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(mesh.matrixWorld);values.push(v.x,v.y,v.z);}}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(values,3));
   try{const owner=triangleInstance(createTriangleTemplate(geometry),[0,0,0],`xiehe-east-rail:${id}`),bounds=owner.box.clone();bounds.triangleSupport=owner;kit.colliders.push(bounds);}finally{geometry.dispose();}
  }
 };
}
