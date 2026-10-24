import * as THREE from 'three';

// Own-source PHOTO_FIT contours only. Never substitutes relief, inscriptions,
// hidden sides, surveyed dimensions, or a newly accessible summit.
function lathe(points){
 const g=new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),24),p=g.attributes.position,ix=g.index,kept=[];
 for(let i=0;i<ix.count;i+=3){const js=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)],t=new THREE.Triangle(...js.map(j=>new THREE.Vector3().fromBufferAttribute(p,j)));if(t.getArea()>1e-12)kept.push(...js);}
 g.setIndex(kept);return g;
}
export function addQianqiuFinial(builder,group){
 const fit={source:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d3ca8f21a5.jpg',status:'VISIBLE_STACKED_CONTOUR_PHOTO_FIT',accepted:false,photographyDate:null,decoration:'UNRECONSTRUCTED_PLAIN_BANDS_AND_CROWN'};
 const body=builder.own(new THREE.MeshStandardMaterial({name:'qianqiu_finial_plain_patina',color:0x486056,roughness:.65,metalness:.2}));
 const add=(role,points,mat)=>{const m=new THREE.Mesh(lathe(points),mat);m.name=m.userData.role=role;m.userData.sourceFit={...fit};m.castShadow=m.receiveShadow=true;group.add(m);};
 add('qianqiu-finial-base',[[0,8.04],[.16,8.04],[.27,8.12],[.27,8.18],[.20,8.23],[0,8.23]],builder.goldMat);
 add('qianqiu-finial-vase',[[0,8.20],[.18,8.20],[.23,8.29],[.26,8.40],[.22,8.51],[.14,8.59],[.13,8.70],[.19,8.74],[0,8.74]],body);
 add('qianqiu-finial-neck-band',[[0,8.67],[.145,8.67],[.19,8.72],[.19,8.76],[.14,8.78],[0,8.78]],builder.goldMat);
 add('qianqiu-finial-crown',[[0,8.75],[.15,8.75],[.26,8.82],[.29,8.90],[.27,9.02],[.20,9.06],[.075,9.08],[.045,9.15],[0,9.19]],body);
}
export function addYujingSouthRail(box,stone){
 // Only the photo-visible front. The other three inherited slabs are explicitly
 // retained unverified, not silently supplied with guessed post counts.
 for(const x of[-2.4,-.8,.8,2.4])box('yujing-south-rail-post',.18,.85,.2,x,.775,-2.4,stone,false);
 for(const y of[.40,.86])box('yujing-south-rail-horizontal',4.8,.1,.18,0,y,-2.4,stone,false);
}
