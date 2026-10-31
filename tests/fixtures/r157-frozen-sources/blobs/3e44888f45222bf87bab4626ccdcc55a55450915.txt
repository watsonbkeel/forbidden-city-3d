import * as THREE from 'three';
// Own official exterior 0 / porch detail 2. Decorative images are deliberately
// omitted: these plain fields express visible joinery, not original motifs.
export function addYiheSouthPorch(kit,f,item,g){
 const p=g.fit,bay=item.w/7,y=item.ph;
 const metadata={object:'FC-D653A5843E',source:'https://www.dpm.org.cn/explore/building/236516.html',photos:[0,2],accepted:false,scope:'SOUTH_JOINERY_AND_OPEN_PORCH_ONLY',dimensions:'MODEL_FIT_NOT_MEASURED',limitations:['Four fields per window and 24 coffers are fitted counts.','Open door pose is for retained circulation, not photographed inventory.','Dragon motifs, carving, exact color and original calligraphy omitted.','2025 plan, Suian west entry, narrow necks, roof and stairs unchanged.']};
 // Remove south-facing decorative meshes only. The solid enclosure, reverse
 // faces and all navigation are retained byte-for-byte.
 for(const m of [...f.children])if(['yihe-facade-panel','yihe-facade-grid'].includes(m.userData.role)&&[-11.585,-11.615,-5.385,-5.415].some(z=>Math.abs(m.position.z-z)<1e-6)){m.removeFromParent();m.geometry.dispose();}
 const mats={};for(const[n,c]of Object.entries({red:0x81372d,green:0x315d51,blue:0x324e74,field:0xa8946c,gold:0xb39b64,dark:0x413a2d})){mats[n]=new THREE.MeshStandardMaterial({name:'yihe_south_'+n+'_plain_fit',color:c,roughness:.84});kit.owned.push(mats[n]);}
 function box(role,mat,w,h,d,x,yy,z){const m=kit.mesh(f,new THREE.BoxGeometry(w,h,d),mats[mat],x,yy,z);m.name='yihe-south-'+role;m.userData={role:m.name,dimensionStatus:metadata.dimensions};return m;}
 for(const[z,cx]of[[p.front,-2*bay],[p.front,2*bay],[p.mainFront,-bay],[p.mainFront,bay]]){
  const width=bay-.65,cell=width/4;
  for(let j=0;j<4;j++){
   const x=cx-width/2+(j+.5)*cell;
   box('window-field','field',cell-.09,2.55,.045,x,y+2.25,z-.16);
   for(const s of[-1,1])box('window-frame','red',.07,3.35,.07,x+s*(cell-.07)/2,y+2.58,z-.2);
   for(const yy of[.98,1.7,3.52,4.22])box('window-frame','red',cell,.065,.07,x,y+yy,z-.2);
   box('transom','dark',cell-.1,.59,.035,x,y+3.88,z-.16);
   for(let k=1;k<5;k++)box('window-grille','red',.025,1.72,.055,x-cell/2+k*cell/5,y+2.6,z-.22);
   for(let k=1;k<5;k++)box('window-grille','red',cell-.09,.025,.055,x,y+1.7+k*1.82/5,z-.22);
  }
 }
 // Four leaves folded against the outside of the unchanged 3.2 m clear opening.
 for(const s of[-1,1])for(let j=0;j<2;j++){
  const x=s*(1.68+j*.13),z=p.mainFront-.48;
  box('open-leaf','red',.1,3.05,.72,x,y+1.55,z);
  box('leaf-field','dark',.015,1.85,.57,x-s*.059,y+1.85,z);
 }
 const cy=y+item.colH-.82-.1,x0=-1.5*bay+.05,x1=1.5*bay-.05,z0=p.front+.18,z1=p.mainFront-.18,cw=(x1-x0)/6,cd=(z1-z0)/4;
 for(let i=0;i<6;i++)for(let j=0;j<4;j++){
  const x=x0+(i+.5)*cw,z=z0+(j+.5)*cd;
  box('coffer-field','green',cw-.08,.06,cd-.08,x,cy,z);
  box('coffer-inner','blue',cw-.36,.025,cd-.34,x,cy-.05,z);
  // Plain border only; no fabricated round dragon emblem.
  for(const s of[-1,1]){box('coffer-border','gold',.035,.018,cd-.29,x+s*(cw-.3)/2,cy-.068,z);box('coffer-border','gold',cw-.29,.018,.035,x,cy-.068,z+s*(cd-.3)/2);}
 }
 for(let i=0;i<=6;i++)box('coffer-grid','green',.08,.18,z1-z0,x0+i*cw,cy-.02,(z0+z1)/2);
 for(let j=0;j<=4;j++)box('coffer-grid','green',x1-x0,.18,.08,0,cy-.02,z0+j*cd);
 g.southPorch=metadata;
}
