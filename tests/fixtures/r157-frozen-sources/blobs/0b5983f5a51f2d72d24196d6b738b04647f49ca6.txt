import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';

const SOURCE='https://www.dpm.org.cn/classify_detail/180962.html';
/** The old 46.6 × 32 envelope is a compound, not one deep Chinese hall.
 * This closes only the officially documented exterior TYPE/topology. All
 * component dimensions, window counts and colours below remain reversible fits.
 */
export function baoyunGeometry(item){
  if(item?.structure!=='baoyun-western-storehouse'||item.name!=='宝蕴楼'||item.x!==300.9||item.z!==-217.7||item.w!==46.6||item.d!==32||item.enter!==false)throw Error('Baoyun requires its registered, exterior-only compound envelope');
  return{id:'baoyun-western-storehouse',x:item.x,z:item.z,w:item.w,d:item.d,storeys:2,semiBasement:true,source:SOURCE,
    sourcePeriod:'2013_WHOLE_EXTERIOR_AND_2024_REPAIRED_MAIN_FACADE_NOT_2026_CONDITION',photographyDate:null,
    photos:['https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg','https://img.dpm.org.cn/Uploads/Picture/dc/60278.jpg','https://img.dpm.org.cn/Uploads/Picture/dc/60282.jpg'],
    dimensionStatus:'RETAINED_COMPOUND_ENVELOPE_AND_VISUAL_COMPONENT_FITS_NOT_SURVEYED',interiorPolicy:'CLOSED_UNMODELED_NO_GENERIC_PALACE_FURNITURE',
    bodyBase:1.2,storeyH:4.4,eaves:10,roofRise:3.1,
    blocks:[{id:'north-main',x:0,z:12,w:46.6,d:8},{id:'east-wing',x:-19.5,z:-2.75,w:7.6,d:21.5},{id:'west-wing',x:19.5,z:-2.75,w:7.6,d:21.5}],
    limitations:['North main building and east/west wings, two floors over a semi-basement and open white-column connecting galleries are official.','Whole-complex topology uses 2013 photos; the 2024-12-27 official façade photo updates the red/pale finish. Neither proves 2026 condition or measured component sizes.','No interior collection, historic furniture, basement circulation or visitor access is invented.']};
}
export function buildBaoyunStorehouse(kit,item){
  const g=baoyunGeometry(item),f=kit.frame(g.x,g.z);f.name='宝蕴楼西式库房院群';f.userData.structure=g;
  const mat=(name,color,roughness=.88)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness});kit.owned.push(m);return m;};
  const red=mat('baoyun_red_plaster',0xb94a32),pale=mat('baoyun_pale_stone',0xd8d1b7),grey=mat('baoyun_basement_stone',0x82786b),roof=mat('baoyun_grey_hip_roof',0x65635c),dark=mat('baoyun_iron_window',0x252a29,.64),joint=mat('baoyun_plaster_courses',0x7c6454);
  const box=(role,m,w,h,d,x,y,z,parent=f)=>{const o=kit.mesh(parent,applyBoxUV(new THREE.BoxGeometry(w,h,d),1),m,x,y,z);o.name=role;o.userData.role=role;return o;};
  const surface=(role,m,quads)=>{const pos=[];for(const q of quads)for(const i of[0,1,2,0,2,3])pos.push(...q[i]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();const o=kit.mesh(f,applyBoxUV(geo,1),m,0,0,0);o.name=role;return o;};
  const window=(x,y,z,w,h,rot=0)=>{const q=new THREE.Group();q.position.set(x,y,z);q.rotation.y=rot;f.add(q);box('baoyun-iron-window',dark,w,h,.045,0,0,0,q);for(const s of[-1,1]){box('baoyun-window-white-trim',pale,.12,h+.24,.15,s*(w/2+.06),0,-.025,q);box('baoyun-window-white-trim',pale,w,.12,.15,0,s*(h/2+.06),-.025,q);}for(const s of[-1,0,1])box('baoyun-window-iron-bar',grey,.025,h,.04,s*w/4,0,-.05,q);};
  for(const b of g.blocks){
    box('baoyun-semibasement',grey,b.w,g.bodyBase,b.d,b.x,g.bodyBase/2,b.z);
    box('baoyun-western-masonry',red,b.w,2*g.storeyH,b.d,b.x,g.bodyBase+g.storeyH,b.z);
    // Unmodelled rooms are truly closed, not generic palace furnishings behind
    // a misleading open door. The courtyard remains actual open ground.
    kit.col(f,b.x-b.w/2,0,b.z-b.d/2,b.x+b.w/2,g.eaves,b.z+b.d/2);
    for(const y of[g.bodyBase,g.bodyBase+g.storeyH,g.eaves])box('baoyun-storey-white-band',pale,b.w+.22,.2,b.d+.22,b.x,y,b.z);
    for(let y=g.bodyBase+.65;y<g.eaves;y+=.65){box('baoyun-horizontal-plaster-course',joint,b.w,.035,.025,b.x,y,b.z-b.d/2-.014);for(const s of[-1,1])box('baoyun-horizontal-plaster-course',joint,.025,.035,b.d,b.x+s*(b.w/2+.014),y,b.z);}
    // Straight four-sloped roofs, not yellow Chinese roofs or upturned eaves.
    const hx=b.w/2+.45,hz=b.d/2+.45,alongX=b.w>b.d,ridge=Math.max(0,(alongX?b.w-b.d:b.d-b.w)/2),Y=g.eaves+.18,R=Y+g.roofRise;
    const A=[b.x-hx,Y,b.z-hz],B=[b.x+hx,Y,b.z-hz],C=[b.x+hx,Y,b.z+hz],D=[b.x-hx,Y,b.z+hz],L=alongX?[b.x-ridge,R,b.z]:[b.x,R,b.z-ridge],H=alongX?[b.x+ridge,R,b.z]:[b.x,R,b.z+ridge];
    surface('baoyun-straight-four-slope-roof',roof,alongX?[[A,L,H,B],[B,H,H,C],[C,H,L,D],[D,L,L,A]]:[[A,L,L,B],[B,L,H,C],[C,H,H,D],[D,H,L,A]]);
    if(b.id==='north-main'){
      for(let k=-5;k<=5;k++){if(Math.abs(k)<1.1)continue;for(let l=0;l<2;l++)window(b.x+k*3.75,g.bodyBase+2.25+l*g.storeyH,b.z-b.d/2-.035,1.12,2.15);window(b.x+k*3.75,.55,b.z-b.d/2-.04,.78,.62);}
    }else{
      const s=Math.sign(b.x),face=b.x-s*b.w/2;
      for(let k=0;k<5;k++){const z=b.z-b.d/2+2.4+k*4.15;for(let l=0;l<2;l++)window(face-s*.035,g.bodyBase+2.25+l*g.storeyH,z,1.08,2.15,s>0?Math.PI/2:-Math.PI/2);}
    }
  }
  // White open column galleries on BOTH storeys connect north and side wings.
  // Column spacing is a photo fit, not a sourced bay count.
  for(const s of[-1,1])for(let l=0;l<2;l++){
    const y=g.bodyBase+l*g.storeyH,x=s*14.5;
    if(l===0){box('baoyun-closed-gallery-plinth',grey,2.5,g.bodyBase,21.5,x,g.bodyBase/2,-2.75);kit.col(f,x-1.25,0,-13.5,x+1.25,g.bodyBase,8);}
    box('baoyun-open-gallery-floor',pale,2.5,.18,21.5,x,y-.09,-2.75);box('baoyun-open-gallery-entablature',pale,2.5,.32,21.5,x,y+4.15,-2.75);
    for(let k=0;k<7;k++){const z=-13.3+k*3.55;box('baoyun-gallery-white-column',pale,.28,4.0,.28,x-s*1.04,y+2,z);box('baoyun-gallery-column-capital',pale,.48,.2,.48,x-s*1.04,y+3.95,z);kit.col(f,x-s*1.04-.14,y,z-.14,x-s*1.04+.14,y+4,z+.14);}
    if(l===1){box('baoyun-gallery-white-rail',pale,.16,.16,21.3,x-s*1.04,y+1,-2.75);for(let k=0;k<37;k++)box('baoyun-gallery-baluster',pale,.07,.85,.07,x-s*1.04,y+.48,-13.1+k*.58);}
  }
  // Dated north façade photograph: central flat-roof porch and a raised
  // triangular dormer/pediment. No temporary repair banner/scaffold is copied.
  const porchZ=6.15;
  box('baoyun-front-porch-base',grey,6.5,1.2,3.7,0,.6,porchZ);kit.col(f,-3.25,0,porchZ-1.85,3.25,1.2,porchZ+1.85);
  for(const s of[-1,1]){box('baoyun-porch-square-column',pale,.6,4.2,.6,s*2.6,3.3,4.7);kit.col(f,s*2.6-.3,1.2,4.4,s*2.6+.3,5.4,5);}
  box('baoyun-flat-porch-roof',pale,7.1,.45,4.2,0,5.6,porchZ);box('baoyun-closed-central-door',dark,2.45,3.3,.06,0,2.85,7.95);
  const ped=new THREE.Shape();ped.moveTo(-3,0);ped.lineTo(3,0);ped.lineTo(0,3);ped.closePath();const pg=new THREE.ExtrudeGeometry(ped,{depth:.25,bevelEnabled:false});const pm=kit.mesh(f,pg,pale,0,10,7.8);pm.name='baoyun-central-triangular-pediment';
  for(const [x,h]of[[-1.15,1],[1.15,1]])window(x,10+h/2,7.76,.5,h);
  box('baoyun-central-inscription-panel-untextured',pale,.8,1.8,.04,0,10.95,7.74); // 2024 photo: center is an inscription, not a third window.
  box('baoyun-green-eaves-gutter',mat('baoyun_green_gutter',0x396547),47.6,.14,.15,0,10.13,7.5);
  for(let k=1;k<=6;k++){const h=k*.2,z=2.35+k*.32;box('baoyun-porch-stair',pale,4.9,h,.32,0,h/2,z);}
  kit.col(f,-2.45,0,2.51,2.45,1.2,4.43); // Not an approved interior route.
  kit.mapRect(f,'hall',item.name,g.w,g.d,{structure:g.id,source:SOURCE,interiorPolicy:g.interiorPolicy});
  kit.region(item.name,g.x-g.w/2,g.x+g.w/2,g.z-g.d/2,g.z+g.d/2);
  return{f,g};
}
