import * as T from 'three';
function stripUnion(rectangles,z0,z1){
 const axes=k=>[...new Set(rectangles.flatMap(r=>[r[k],r[k+1]]).map(v=>+v.toFixed(7)))].sort((a,b)=>a-b),xs=axes(0),ys=axes(2);
 const nx=xs.length-1,ny=ys.length-1,filled=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let x=0;x<nx;x++)for(let y=0;y<ny;y++){const cx=(xs[x]+xs[x+1])/2,cy=(ys[y]+ys[y+1])/2;filled[x][y]=rectangles.some(([a,b,c,d])=>cx>a-1e-8&&cx<b+1e-8&&cy>c-1e-8&&cy<d+1e-8);}
 const pos=[],normal=[],uv=[];
 const face=(corners,n)=>{for(const i of[0,1,2,0,2,3]){pos.push(...corners[i]);normal.push(...n);uv.push(corners[i][0],corners[i][1]);}};
 const at=(x,y)=>filled[x]?.[y]??false;
 // Merge adjacent occupied cells into disjoint coplanar rectangles. The
 // exact same grid/occupancy owns the outline; only redundant face splits go.
 const used=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(at(x,y)&&!used[x][y]){
  let right=x+1,top=y+1;
  while(right<nx&&at(right,y)&&!used[right][y])right++;
  while(top<ny&&Array.from({length:right-x},(_,k)=>x+k).every(k=>at(k,top)&&!used[k][top]))top++;
  for(let i=x;i<right;i++)for(let j=y;j<top;j++)used[i][j]=true;
  const a=xs[x],b=xs[right],c=ys[y],d=ys[top];
  face([[a,c,z0],[a,d,z0],[b,d,z0],[b,c,z0]],[0,0,-1]);
  face([[a,c,z1],[b,c,z1],[b,d,z1],[a,d,z1]],[0,0,1]);
 }
 // Keep every exterior and opening-return side, coalescing only contiguous
 // boundary segments on the same plane with the same outward normal.
 for(let x=0;x<=nx;x++)for(const sign of[-1,1]){
  const exposed=y=>sign<0?at(x,y)&&!at(x-1,y):at(x-1,y)&&!at(x,y);
  for(let y=0;y<ny;){if(!exposed(y)){y++;continue;}const start=y;while(y<ny&&exposed(y))y++;
   const a=xs[x],c=ys[start],d=ys[y];
   if(sign<0)face([[a,c,z0],[a,c,z1],[a,d,z1],[a,d,z0]],[-1,0,0]);
   else face([[a,c,z0],[a,d,z0],[a,d,z1],[a,c,z1]],[1,0,0]);
  }
 }
 for(let y=0;y<=ny;y++)for(const sign of[-1,1]){
  const exposed=x=>sign<0?at(x,y)&&!at(x,y-1):at(x,y-1)&&!at(x,y);
  for(let x=0;x<nx;){if(!exposed(x)){x++;continue;}const start=x;while(x<nx&&exposed(x))x++;
   const a=xs[start],b=xs[x],c=ys[y];
   if(sign<0)face([[a,c,z0],[b,c,z0],[b,c,z1],[a,c,z1]],[0,-1,0]);
   else face([[a,c,z0],[a,c,z1],[b,c,z1],[b,c,z0]],[0,1,0]);
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeBoundingBox();geo.computeBoundingSphere();return geo;
}

export function buildShoukangRearWindow(kit,parent,{cx,bottom,top,z,width,red,dark,role}){
 const group=new T.Group();group.name='shoukang-rear-window-leaf';group.userData.shoukangRear={role:'window-leaf'};parent.add(group);
 const add=(geo,mat,name)=>{const m=kit.mesh(group,geo,mat,0,0,0);m.name='shoukang-rear-'+name;m.userData.shoukangRear={role:name};return m;};
 const t=.08,x0=cx-width/2,x1=cx+width/2,split=bottom+(top-bottom)*.47;
 add(new T.BoxGeometry(width,top-bottom,.10).translate(cx,(bottom+top)/2,z+.03),dark,'opaque-glass-surrogate');
 const rects=[[x0,x0+t,bottom,top],[x1-t,x1,bottom,top],[x0+t,x1-t,bottom,bottom+t],[x0+t,x1-t,top-t,top],[x0+t,x1-t,split-.055,split+.055]];
 // Broad upper orthogonal stepped runs; counts and joinery are photo fits.
 const ring=(a,b,c,d,s)=>rects.push([a,a+s,c,d],[b-s,b,c,d],[a+s,b-s,c,c+s],[a+s,b-s,d-s,d]);
 const a=x0+t+.10,b=x1-t-.10,lo=split+.15,hi=top-t-.10;
 ring(a,b,lo,hi,.035);ring(a+.12,b-.12,lo+.13,hi-.13,.03);
 const mid=(a+b)/2;rects.push([mid-.017,mid+.017,lo+.08,hi-.08],[a+.06,b-.06,(lo+hi)/2-.017,(lo+hi)/2+.017]);
 // Lower glass square fields, not a copied upper stepped repeat.
 const cy=(bottom+t+split-.055)/2;rects.push([cx-.025,cx+.025,bottom+t,split-.055],[x0+t,x1-t,cy-.025,cy+.025]);
 add(stripUnion(rects,z-.12,z-.02),red,'fitted-step-and-square-grille');return group;
}
