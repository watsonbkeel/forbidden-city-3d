// These four metadata heights correspond to the real raised stone surface,
// not a relaxed Teleport tolerance or an invisible rescue plane.
export function fitQingshouConnectionApproach(p){
 if(!['xunyan','qingshou'].includes(p?.key))return false;
 const x=p.key==='xunyan',expected=x?{id:'place-ningshou-9a08e177bc',name:'寻沿书屋',x:-334.5,z:423.7,localW:17.6,localD:10.7}:{id:'place-ningshou-0d5f3d5831',name:'庆寿堂',x:-334.8,z:439.6,localW:17,localD:9.8};
 if(Object.entries({...expected,ph:.5,rot:0,gallery:1.25}).some(([k,v])=>p[k]!==v)||p.portals?.length!==2)throw Error('Exact Qingshou connection profile required');
 const index=x?1:0,q=p.portals[index],sign=x?1:-1,door=sign*(p.localD/2-p.gallery),edge=sign*(p.localD/2+.5),toe=edge+sign*.05;
 const wanted=[[0,toe+sign,0],[0,toe,0],[0,edge-sign*.15,.5],[0,door,.5],[0,door-sign*.7,.5]].map(([localX,localZ,feetY])=>({localX,localZ,x:p.x+localX,z:p.z+localZ,feetY}));
 if(q?.side!==(x?'rear':'front')||q.x!==0||q.z!==door||q.worldX!==p.x||q.worldZ!==p.z+door||q.width!==2.8||Object.getOwnPropertyDescriptor(q,'approachPoints')?.writable!==true||JSON.stringify(q.approachPoints)!==JSON.stringify(wanted))throw Error('Exact mutable original connection approach required');
 q.approachPoints=q.approachPoints.map((v,i)=>({...v,feetY:i<2?.5:v.feetY}));return true;
}
