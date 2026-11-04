// Navigation only. These points follow the retained five visible 0.1m stone
// treads in XunyanSouthFront; they are a game circulation fit, not a survey.
export function fitXunyanSouthApproach(p){
 if(p?.key!=='xunyan')return false;
 const expected={id:'place-ningshou-9a08e177bc',name:'寻沿书屋',x:-334.5,z:423.7,localW:17.6,localD:10.7,ph:.5,rot:0,gallery:1.25};
 if(Object.entries(expected).some(([k,v])=>p[k]!==v)||p.portals?.length!==2)throw Error('Exact Xunyan south approach profile required');
 const q=p.portals[0],door=-p.localD/2+p.gallery;
 if(q?.side!=='front'||q.x!==0||q.z!==door||q.worldX!==p.x||q.worldZ!==p.z+door||q.width!==2.8||Object.getOwnPropertyDescriptor(q,'approachPoints')?.writable!==true)throw Error('Mutable exact Xunyan front portal required');
 const edge=-(p.localD/2+.5),run=1.35,n=5,toe=edge-run;
 const points=[[0,toe-1,0],[0,toe-.6,0],...Array.from({length:n},(_,i)=>[0,toe+(i+.5)*run/n,Math.fround(p.ph*(i+1)/n)]),[0,edge+.65,p.ph],[0,door,p.ph],[0,door+.7,p.ph]];
 q.approachPoints=points.map(([localX,localZ,feetY])=>({localX,localZ,x:p.x+localX,z:p.z+localZ,feetY}));
 return true;
}
