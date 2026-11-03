const world=pts=>pts.map(([x,z])=>[277.2+x,469+z]);
export const approaches=[];
for(const side of [-1,1])for(const reverse of [false,true]){
 const pts=world([[0,-4.5],[0,-1.25],[side*1.9,-1.25],[side*1.9,1.25],[0,1.25],[0,4.5]]);
 approaches.push({name:`${side<0?'-X':'+X'}-${reverse?'north-to-south':'south-to-north'}`,side,reverse,pts:reverse?pts.reverse():pts});
}
export const negativePlans=[
 {name:'central-stele',pts:world([[0,-1.5],[0,1.5]])},
 {name:'inner-pillar',pts:world([[2.1,-1.1],[2.1,-2.9]])},
 {name:'side-rail',pts:world([[1.9,0],[3.7,0]])},
 {name:'north-rail',pts:world([[1.3,2],[1.8,3.7]])},
];
export const globalPlans=approaches.map(p=>({...p,name:'gate-hall-return-'+p.name,pts:p.reverse?[[277.2,480.5],...p.pts,[277.2,451.2],...p.pts.toReversed(),[277.2,480.5]]:[[277.2,451.2],...p.pts,[277.2,480.5],...p.pts.toReversed(),[277.2,451.2]]}));
