const PHOTO='https://img.dpm.org.cn/Uploads/image/2025/09/29/c2f44b867bfa08-NeYmtDOcI218985.png';
/** Source-visible central front frame only. The spaces between bars remain
 * geometrically empty; no opaque sheet, borrowed photo pixels or rear-wall claim. */
export function buildGuhuaFrontOpenwork({add,width,y,height,openingHeight,f,cx,cz,innerDepth}){
 if(!f||Math.abs(cx)>1e-6||Math.abs(cz+innerDepth/2)>1e-6||Math.abs(width-10.7/3)>1e-6||y!==.5||height!==4.15||openingHeight!==3.05||f.userData.r139GuhuaOpenwork)throw Error('R139 Guhua front central frame binding mismatch');
 const solid=(role,w,h,x,yy)=>{const m=add(role,'black',w,h,.08,x,y+yy,0,true);m.userData.r139GuhuaOpenwork=true;return m;};
 const rect=(role,x,yy,w,h,t=.032)=>{
  for(const sign of [-1,1]){
   solid(role,t,h,x+sign*(w-t)/2,yy);
   solid(role,w-2*t,t,x,yy+sign*(h-t)/2);
  }
 };
 const outerW=width-.36,upperLo=openingHeight+.25,upperHi=height-.14,upperH=upperHi-upperLo,mid=(upperLo+upperHi)/2;
 // Long lintel rectangles contain smaller tied rectangles. Count and bar
 // thickness are source-bounded model fits, not a restored motif facsimile.
 rect('r139-guhua-front-lintel-outer',0,mid,outerW,upperH);
 const cells=3,cellW=outerW/cells;
 for(let i=0;i<cells;i++){
  const x=-outerW/2+(i+.5)*cellW;
  rect('r139-guhua-front-lintel-nested',x,mid,cellW-.08,upperH*.54);
  for(const sign of [-1,1])solid('r139-guhua-front-lintel-tie',.032,(upperH-upperH*.54)/2+.032,x,mid+sign*(upperH+upperH*.54)/4);
 }
 // Narrow, genuinely open vertical side grids sit alongside the pre-existing
 // posts. The central route remains >2.8m, rather than filling the door as glass.
 const sideW=.34,sideCenter=width/2-sideW/2,sideBottom=.13,sideTop=openingHeight-.15,sideH=sideTop-sideBottom;
 for(const sign of [-1,1]){
  const x=sign*sideCenter;rect('r139-guhua-front-side-open-frame',x,(sideTop+sideBottom)/2,sideW,sideH);
  const count=4,h=sideH/count;
  for(let i=0;i<count;i++){
   const yy=sideBottom+(i+.5)*h;
   rect('r139-guhua-front-side-nested',x,yy,sideW*.58,h*.70,.025);
   for(const s of [-1,1])solid('r139-guhua-front-side-tie',.025,(h-h*.70)/2+.025,x,yy+s*(h+h*.70)/4);
  }
 }
 return f.userData.r139GuhuaOpenwork={originalObjectId:'FC-A1EA21A7C3',source:PHOTO,scope:'CENTRAL_FRONT_OPEN_FRAME_ONLY',dimensionStatus:'SOURCE_VISIBLE_NESTED_RECTANGLE_RELATIONSHIP_MODEL_FIT_NOT_SURVEYED',clearCentralWidth:width-2*sideW,minimumOpeningHeight:openingHeight-.15,opaquePhotoPlane:false,officialPixelsEmbedded:false,wholeObjectAccepted:false,remaining:['Corner cloud carving and fine gold motifs','Independent other bay/back/side pattern verification','Nanmu floral ceiling and rolled roof fidelity']};
}
