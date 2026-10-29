import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
// DPM236476: nine bays, middle three door bays, sill walls elsewhere.
// Photo gold divisions are simplified rectangular fields, NOT copied carving.
export function buildHuangjiSouthFront(c){
 const{p,f,kit}=c,z=-p.localD/2+p.gallery,bw=p.localW/9,h=p.colH-.42,mats={};
 for(const[k,color]of Object.entries({gold:0xb79a55,red:0x65352d,dark:0x3f2825,stone:0x797268})){mats[k]=new T.MeshStandardMaterial({name:'huangji_front_'+k+'_photo_fit',color,roughness:.87});kit.owned.push(mats[k]);}
 const replace=new Set(['window-frame','window-mullion','step-lattice']);
 for(const m of [...f.children]){if(!m.isMesh||Math.abs(m.position.z-z)>.2)continue;const role=m.userData.role;if(replace.has(role)){m.removeFromParent();m.geometry.dispose();}else if(['window-backing','sill-wall','door-transom'].includes(role)){m.material=mats[role==='sill-wall'?'stone':role==='window-backing'?'dark':'red'];m.userData.huangjiSouthMaterialFit=true;}}
 for(let bay=0;bay<9;bay++){
  const parts=[],x=-p.localW/2+(bay+.5)*bw,pw=bw-.16,door=bay>=3&&bay<=5;
  // Preserve the photographed outer face while extending each solid back into
  // the retained backing (front z-.0275), eliminating floating applied trim.
  const box=(role,mat,w,hh,d,xx,yy,zz=z-.105)=>{const front=zz-d/2,rear=Math.max(zz+d/2,z-.015);const m=c.tag(kit.mesh(f,new T.BoxGeometry(w,hh,rear-front),mats[mat],xx,yy,(front+rear)/2),'huangji-front-'+role,{bay,precision:'PHOTO_BOUNDED_RECTANGULAR_FIELDS_NOT_ORIGINAL_LATTICE_OR_CARVING'});parts.push(m);return m;};
  function field(cx,width,bottom,top,n,lower=true){
   const height=top-bottom,leaf=width/n,waist=bottom+height*.29;
   for(let j=0;j<=n;j++)box('gold-stile','gold',.045,height,.07,cx-width/2+j*leaf,(bottom+top)/2);
   for(const yy of[bottom,waist,top])box('gold-rail','gold',width,.055,.07,cx,yy);
   for(let j=0;j<n;j++){
    const xx=cx-width/2+(j+.5)*leaf,ww=leaf-.10;
    if(lower){const lo=bottom+.08,hi=waist-.08;box('lower-panel','red',ww,hi-lo,.05,xx,(lo+hi)/2,z-.09);for(const s of[-1,1]){box('lower-panel-outline','gold',.022,hi-lo-.08,.028,xx+s*(ww/2-.035),(lo+hi)/2,z-.132);box('lower-panel-outline','gold',ww-.07,.022,.028,xx,(lo+hi)/2+s*((hi-lo)/2-.04),z-.132);}}
    const low=waist+.09,high=top-.09;
    // Sparse geometric subdivisions: no asserted original dragon or fret count.
    for(const s of[-1,1])box('upper-field-outline','gold',.025,high-low,.035,xx+s*(ww/2-.03),(low+high)/2,z-.12);
    for(const yy of[low,high])box('upper-field-outline','gold',ww-.06,.025,.035,xx,yy,z-.12);
    for(let k=1;k<12;k++)box('upper-field-crossrail-fit','gold',ww-.06,.014,.028,xx,low+k*(high-low)/12,z-.12);
    for(const s of[-1,1])box('upper-field-inner-mullion-fit','gold',.014,high-low,.028,xx+s*ww/6,(low+high)/2,z-.12);
   }
  }
  if(!door)field(x,pw-.10,p.ph+.9,p.ph+h-.18,6);
  else{
   const dw=3.2,fill=(pw-dw)/2-.03;
   for(const s of[-1,1])field(x+s*(dw/2+(pw-dw)/4),fill-.10,p.ph+.9,p.ph+h-.18,1);
   field(x,dw,p.ph+3.45,p.ph+h-.18,4,false);
   // Gold jamb facing stays outside the unchanged 3.2 m clear opening.
   for(const s of[-1,1])box('open-door-jamb-facing','gold',.045,3.2,.035,x+s*(dw/2+.075),p.ph+1.6,z-.105);
  }
  const all=[];f.traverse(m=>{if(m.isMesh)all.push(m)});
  // Separate closed solids: a disconnected overlapping bay shell is not a
  // valid parity volume and can falsely classify the open door as interior.
  for(const m of parts){const values=[],source=[];m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){source.push({mesh:all.indexOf(m),triangle:i/3});for(let k=0;k<3;k++){const v=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld);values.push(v.x,v.y,v.z);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));const owner=triangleInstance(createTriangleTemplate(geo),[0,0,0],'huangji-south-front-'+bay+'-'+all.indexOf(m)),b=owner.box.clone();b.triangleSupport=owner;b.huangjiFront={bay,source};kit.colliders.push(b);geo.dispose();}
 }
 const data={source:p.source,image:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efef346e4a8b.jpg',accepted:false,bays:9,scope:'SOUTH_GOLD_PARTITION_OUTLINES_WAIST_RAILS_LOWER_RECTANGULAR_PANEL_FIELDS',dimensions:'MODEL_FIT_NOT_SURVEY',pattern:'SIMPLIFIED_RECTANGULAR_FIELDS_NOT_ORIGINAL_CARVED_OR_PAINTED_MOTIFS',currentInventoryVerified:false,newWalkables:0,newUpperDestinations:0,retained:['three playable south clear openings','all rear doors and facade','original roof platform steps','interior GLB four gold columns caisson and exact fallback'],missing:['measured lattice subdivisions and dimensions','exact carved painted motifs','current inventory and visitor permissions']};f.userData.huangjiSouthFront=data;return data;
}
