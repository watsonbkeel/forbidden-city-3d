import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
// DPM236471 explicitly documents pierced cloud-dragon loops and gilded corbels.
// Geometry below is a simplified loop/curve family, never a replica dragon or survey.
export function buildNingshouSouthFrieze(c){
 const{p,f,kit}=c,bw=p.localW/7,z=-p.localD/2,top=p.ph+p.colH,mats={};for(const[k,color]of Object.entries({wood:0x794231,gold:0xb39a57,blue:0x405a80,green:0x426958})){mats[k]=new T.MeshStandardMaterial({name:'ningshou_frieze_'+k+'_photo_fit',color,roughness:.88});kit.owned.push(mats[k]);}
 for(let bay=0;bay<7;bay++){
  const parts=[],x=-p.localW/2+(bay+.5)*bw,ww=bw-.28;
  const put=(role,geo,mat,xx,yy,zz)=>{const m=c.tag(kit.mesh(f,geo,mats[mat],xx,yy,zz),'ningshou-frieze-'+role,{precision:'SIMPLIFIED_PIERCED_LOOP_AND_CORBEL_FORM_NOT_CLOUD_DRAGON_REPLICA',bay});parts.push(m);return m;};
  const box=(role,mat,w,h,d,xx,yy,zz)=>put(role,new T.BoxGeometry(w,h,d),mat,xx,yy,zz);
  for(const[role,yy,mat]of[['upper-painted-band',top-.25,'blue'],['lower-painted-band',top-1.1,'green']]){
   // Back face embeds into retained eave front where they coincide vertically.
   box(role,mat,bw,.19,.24,x,yy,z-.20);
   for(const s of[-1,1])box('painted-band-edge','gold',bw,.025,.035,x,yy+s*.07,z-.335);
   for(let j=0;j<4;j++){const cx=x+(j-1.5)*bw/4;for(const s of[-1,1])box('painted-field-mark','gold',bw/4-.12,.018,.035,cx,yy+s*.035,z-.34);}
  }
  const fy=top-.68,cell=ww/4;
  for(let j=0;j<4;j++){
   const xx=x-ww/2+(j+.5)*cell,w=cell-.08;
   box('pierced-field-top','wood',w,.112,.13,xx,fy+.28,z-.20);box('pierced-field-bottom','wood',w,.112,.13,xx,fy-.28,z-.20);
   for(const s of[-1,1])box('pierced-field-side','wood',.055,.56,.13,xx+s*(w-.055)/2,fy,z-.20);
   const curve=(role,points,closed=false)=>put(role,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(([a,b])=>new T.Vector3(a,b,0)),closed),24,.022,5,closed),'gold',xx,fy,z-.245);
   const rx=(w-.16)/2,ry=.21,ring=[];for(let k=0;k<20;k++){const a=k*Math.PI/10;ring.push([Math.cos(a)*rx,Math.sin(a)*ry]);}curve('pierced-loop-fit',ring,true);
   for(const s of[-1,1])box('loop-frame-connector','gold',.04,.12,.06,xx,fy+s*.245,z-.245);
   curve('connected-scroll-fit',[[-rx,0],[-rx*.45,.09],[0,-.04],[rx*.45,-.09],[rx,0]]);
  }
  for(const sign of[-1,1]){
   const shape=new T.Shape(),L=Math.min(1.42,ww*.23);shape.moveTo(0,0);shape.lineTo(sign*L,0);shape.bezierCurveTo(sign*(L*.9),-.13,sign*(L*.7),-.17,sign*(L*.52),-.18);shape.bezierCurveTo(sign*(L*.35),-.18,sign*(L*.36),-.40,sign*(L*.20),-.42);shape.lineTo(0,-.46);shape.closePath();
   const geo=new T.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false}),cx=x-sign*bw/2;
   put('paired-corbel-fit',geo,'gold',cx,top-1.195,z-.26);
   // Geometric curl remains a plain bounded arc, not carved dragon anatomy.
   const pts=[];for(let k=0;k<=16;k++){const a=k*Math.PI/16;pts.push(new T.Vector3(sign*(.15+L*.55*k/16),-.11-.08*Math.sin(a),0));}
   put('corbel-line-fit',new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,.022,5,false),'wood',cx,top-1.195,z-.28);
  }
  const all=[];f.traverse(m=>{if(m.isMesh)all.push(m)});const values=[],source=[];for(const m of parts){m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){source.push({mesh:all.indexOf(m),triangle:i/3});for(let k=0;k<3;k++){const v=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld);values.push(v.x,v.y,v.z);}}}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],'ningshou-south-frieze-'+bay),b=owner.box.clone();b.triangleSupport=owner;b.ningshouFrieze={bay,source};kit.colliders.push(b);g.dispose();
 }
 const data={object:'FC-E66DFE768F',source:p.source,accepted:false,scope:'SEVEN_SOUTH_BAYS_PIERCED_UPPER_LOOPS_TWO_PAINTED_BANDS_AND_PAIRED_CORBEL_OUTLINES',openwork:'OFFICIAL_TEXT_ATTESTED_TYPE_NO_SOLID_BACKING',pattern:'SIMPLIFIED_LOOPS_CURVES_AND_COLOR_FIELDS_NOT_ORIGINAL_CLOUD_DRAGON_PAINT_OR_CARVING',dimensions:'MODEL_FIT_NOT_SURVEY',currentInventoryVerified:false,newWalkables:0,newUpperDestinations:0,retained:['six fitted south windows and all other doors/windows','east secondary original access and three north doors','roof and original columns/beams','legacy unverified model name sign'],missing:['exact cloud dragon carving','measured panel counts and sizes','historical painted motifs and current colorimetry','verified original plaque reproduction']};f.userData.ningshouSouthFrieze=data;return data;
}
