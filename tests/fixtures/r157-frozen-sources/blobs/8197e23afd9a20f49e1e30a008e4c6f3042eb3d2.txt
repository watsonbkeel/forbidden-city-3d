import * as THREE from 'three';
/** Only the central rear porch bay visible above the gate nameboard. The image
 * does not establish the entire ceiling, surveyed grid, or a dragon facsimile. */
export function buildQianqingGatePorchCoffers(builder,parent,{width,depth}){
 const half=+(width/10).toFixed(6),p={id:'qianqing-central-rear-porch-coffers',source:'https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c36cf3.jpg',captureDate:null,urlDate:'2020-11-17',accepted:false,wholeCeilingSurveyed:false,
  x0:-half,x1:half,z0:depth/6,z1:depth/2,bottomY:8.18,panelY:8.3,nx:9,nz:7,dimensionStatus:'ONE_REGISTERED_BAY_PHOTO_RELATION_FIT_NOT_SURVEY',figureStatus:'PLAIN_BLUE_GOLD_MEDALLION_NOT_A_DRAGON_FACSIMILE',unknowns:['Complete porch ceiling extent and grid count','Exact framing dimensions','Original figurative paint and wear'],colliders:[]};
 const size=256,pixels=new Uint8Array(size*size*4),green=[42,72,64],blue=[32,57,111],gold=[145,124,72],shadow=[40,46,43];
 // Original geometric colour fields. No photograph pixels, generated animal,
 // calligraphy, historical wear or invented iconography are used.
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const edge=Math.min(x,y,size-1-x,size-1-y),r=Math.hypot(x-127.5,y-127.5);let c=edge<10?shadow:green;if(edge>21&&edge<25)c=gold;if(edge>30)c=blue;if(Math.abs(r-81)<2.2)c=gold;if(r<74)c=blue;const k=(y*size+x)*4;pixels.set([...c,255],k);}
 const texture=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
 const panel=builder.ownMat('qianqing_gate_coffer_panel',{name:'qianqing_gate_coffer_panel',map:texture,roughness:.9,metalness:0,side:THREE.DoubleSide});panel.userData.figureStatus=p.figureStatus;panel.addEventListener('dispose',()=>texture.dispose());
 const frame=builder.ownMat('qianqing_gate_coffer_frame',{name:'qianqing_gate_coffer_frame',color:0x39473e,roughness:.9});
 const w=p.x1-p.x0,d=p.z1-p.z0,geo=new THREE.PlaneGeometry(w,d),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*p.nx,uv.getY(i)*p.nz);
 const plane=new THREE.Mesh(geo,panel);plane.rotation.x=Math.PI/2;plane.position.set(0,p.panelY,(p.z0+p.z1)/2);plane.name='qianqing-central-porch-coffer-panel';parent.add(plane);
 const proxy=(x0,y0,z0,x1,y1,z1)=>{const index=builder.colliders.length;builder.col(x0,y0,z0,x1,y1,z1);p.colliders.push({index,min:builder.colliders.at(-1).min.toArray(),max:builder.colliders.at(-1).max.toArray()});};
 // Thin panel and each projecting batten get their own bounded proxy. No
 // full-bay low false ceiling and no new walkable/rescue surface is created.
 proxy(p.x0,p.panelY-.004,p.z0,p.x1,p.panelY+.004,p.z1);
 const add=(ww,dd,x,z)=>{builder.box(parent,frame,ww,.12,dd,x,8.24,z);proxy(x-ww/2,p.bottomY,z-dd/2,x+ww/2,p.panelY,z+dd/2);};
 for(let i=0;i<=p.nx;i++)add(.07,d,p.x0+i*w/p.nx,(p.z0+p.z1)/2);
 for(let i=0;i<=p.nz;i++)add(w,.07,0,p.z0+i*d/p.nz);
 return p;
}
