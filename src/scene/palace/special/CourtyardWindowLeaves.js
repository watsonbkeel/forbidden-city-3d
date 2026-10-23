import * as THREE from 'three';

// Independently fitted to each gate's own courtyard photograph, not measured
// joinery. Only one upper transom + six lower framed leaves, short solid fields
// and diagonal middle lattice are source-supported. All numbers below are
// UNKNOWN fitted dimensions/density/angle; the unseen outward face is untouched.
export const COURTYARD_WINDOW_FITS=Object.freeze({
  xihe:Object.freeze({sourceImage:'s5e9d4bf591346.jpg',sourceId:'R58A-SIDE-IMG-01',transomRatio:.205,separator:.11,stile:.047,rail:.055,topFieldRatio:.08,bottomFieldRatio:.105,pitch:.43,slope:1.08,barWidth:.022}),
  xiehe:Object.freeze({sourceImage:'s5e9d4981afba5.jpg',sourceId:'R58A-SIDE-IMG-09',transomRatio:.225,separator:.12,stile:.05,rail:.06,topFieldRatio:.09,bottomFieldRatio:.10,pitch:.45,slope:1.0,barWidth:.023}),
});

/** Layout occupies only the existing .13-wide outer frame's clear interior. */
export function courtyardWindowLayout({profile,cx,clear,bottom,height,z}) {
  const fit=COURTYARD_WINDOW_FITS[profile];
  if(!fit)return null;
  const left=cx-clear/2+.065,right=cx+clear/2-.065,low=bottom+.065,high=bottom+height-.065;
  const split=high-(high-low)*fit.transomRatio,lowerTop=split-fit.separator/2;
  const leafWidth=(right-left)/6,leafHeight=lowerTop-low;
  const leaves=Array.from({length:6},(_,index)=>{
    const x0=left+index*leafWidth,x1=left+(index+1)*leafWidth;
    const middleBottom=low+fit.rail+leafHeight*fit.bottomFieldRatio;
    const middleTop=lowerTop-fit.rail-leafHeight*fit.topFieldRatio;
    return {index,left:x0,right:x1,bottom:low,top:lowerTop,innerLeft:x0+fit.stile,innerRight:x1-fit.stile,middleBottom,middleTop};
  });
  return {fit,left,right,bottom:low,top:high,split,lowerTop,leaves,z,front:z+.09,
    transom:{left,right,bottom:split+fit.separator/2,top:high}};
}

/** Caller retains the exact outer frame/backing/sill/header and collider. */
export function buildCourtyardWindowLeaves(kit,pane,options) {
  const layout=courtyardWindowLayout(options);if(!layout)return [];
  const {fit,leaves,transom,z}=layout,material=kit.lib.material('wood_column'),added=[];
  const tag=(o,role,data={})=>{o.name=role;o.userData={role,profile:options.profile,bay:options.bay,side:'rear',sourceId:fit.sourceId,sourceImage:fit.sourceImage,status:'PHOTO_FIT',visualAcceptance:'VERIFY_PENDING',...data};return o;};
  // New solids are wholly inside the inherited frame and in front of the
  // unchanged opaque backing (z+.04). They are not global pruning occluders:
  // unrelated retained triangles must never change because this detail exists.
  const box=(parent,role,left,right,bottom,top,data={})=>{
    const mesh=tag(kit.mesh(parent,new THREE.BoxGeometry(right-left,top-bottom,.05),material,(left+right)/2,(bottom+top)/2,z+.065),role,data);added.push(mesh);return mesh;
  };
  box(pane,'courtyard-window-separator',layout.left,layout.right,layout.split-fit.separator/2,layout.split+fit.separator/2);
  const lattice=(parent,rect)=>{
    const width=rect.right-rect.left,height=rect.top-rect.bottom,cx=(rect.left+rect.right)/2,cy=(rect.bottom+rect.top)/2;
    for(const slope of [-fit.slope,fit.slope]){
      const extent=(height+Math.abs(slope)*width)/2,half=fit.barWidth*Math.sqrt(1+slope*slope)/2;
      const limit=Math.floor((extent-half)/fit.pitch);
      for(let k=-limit;k<=limit;k++){
        let polygon=[[-width/2,-height/2],[width/2,-height/2],[width/2,height/2],[-width/2,height/2]];
        for(const sign of [-1,1])polygon=clip(polygon,p=>half-sign*(p[1]-slope*p[0]-k*fit.pitch));
        if(polygon.length<3)continue;
        const mesh=tag(kit.mesh(parent,prism(polygon,.035),material,cx,cy,z+.06),'courtyard-window-diagonal',{slope,intercept:k*fit.pitch,clipRect:rect});
        added.push(mesh);
      }
    }
  };
  for(const leaf of leaves){
    const group=tag(new THREE.Group(),'courtyard-window-leaf',{leaf:leaf.index});pane.add(group);
    for(const [left,right] of [[leaf.left,leaf.innerLeft],[leaf.innerRight,leaf.right]])box(group,'courtyard-window-leaf-stile',left,right,leaf.bottom,leaf.top);
    box(group,'courtyard-window-leaf-rail',leaf.innerLeft,leaf.innerRight,leaf.bottom,leaf.bottom+fit.rail);
    box(group,'courtyard-window-leaf-rail',leaf.innerLeft,leaf.innerRight,leaf.top-fit.rail,leaf.top);
    box(group,'courtyard-window-solid-field',leaf.innerLeft,leaf.innerRight,leaf.bottom+fit.rail,leaf.middleBottom,{field:'bottom'});
    box(group,'courtyard-window-solid-field',leaf.innerLeft,leaf.innerRight,leaf.middleTop,leaf.top-fit.rail,{field:'top'});
    lattice(group,{left:leaf.innerLeft,right:leaf.innerRight,bottom:leaf.middleBottom,top:leaf.middleTop});
  }
  const group=tag(new THREE.Group(),'courtyard-window-transom');pane.add(group);
  lattice(group,transom);
  return added;
}

// Convex half-plane clipping trims the FULL strip width at the exact opening,
// not merely its centreline. No bar ends are buried in columns or nearby beams.
function clip(polygon,distance){
  const result=[];
  for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length],da=distance(a),db=distance(b);
    if(da>=-1e-12)result.push(a);
    if((da>0&&db<0)||(da<0&&db>0))result.push([a[0]+(b[0]-a[0])*da/(da-db),a[1]+(b[1]-a[1])*da/(da-db)]);
  }
  return result.filter((p,i)=>Math.hypot(p[0]-result[(i+1)%result.length][0],p[1]-result[(i+1)%result.length][1])>1e-9);
}

// One closed convex strip. Minimal fan caps and one quad per edge, no bevels,
// steps, subdivision skins or zero-length cuts; every geometry is build-owned.
function prism(polygon,depth){
  const positions=[],uv=[];
  const tri=(a,b,c)=>{positions.push(...a,...b,...c);for(const p of [a,b,c])uv.push(p[0],p[1]);};
  const front=polygon.map(p=>[...p,depth/2]),back=polygon.map(p=>[...p,-depth/2]);
  for(let i=1;i<polygon.length-1;i++){tri(front[0],front[i],front[i+1]);tri(back[0],back[i+1],back[i]);}
  for(let i=0;i<polygon.length;i++){const j=(i+1)%polygon.length;tri(back[i],back[j],front[j]);tri(back[i],front[j],front[i]);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();return geometry;
}
