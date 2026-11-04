// Navigation only: sample the three retained walking ramps and begin on ground
// before their toes. These are game circulation fits, not measured museum paths.
const entries={
 yueshi:['place-ningshou-78e6a34c2d','阅是楼',-334.5,390.1,18.4,10.2,1.25,1.25,0],
 fori:['place-ningshou-2318b5f73b','佛日楼',-319.8,513.3,11.5,8.9,1.1,1.25,0],
 juanqin:['place-ningshou-f4d12b27e6','倦勤斋',-252.6,513.6,31.5,8.8,1.1,.9,-7],
};
export function fitThreeHallSouthApproaches(p){
 if(!p||!Object.hasOwn(entries,p.key))return false;
 const row=entries[p.key];
 const[id,name,x,z,localW,localD,gallery,run,doorX]=row;
 const expected={id,name,x,z,localW,localD,gallery,ph:.5,rot:0};
 if(Object.entries(expected).some(([k,v])=>p[k]!==v)||p.portals?.length!==1)throw Error('Exact three-hall south approach profile required');
 const q=p.portals[0],doorZ=-localD/2+gallery,edge=-(localD/2+.5),toe=edge-run;
 if(q?.side!=='front'||q.x!==doorX||q.z!==doorZ||q.worldX!==x+doorX||q.worldZ!==z+doorZ||q.width!==2.8||Object.getOwnPropertyDescriptor(q,'approachPoints')?.writable!==true)throw Error('Mutable exact three-hall front portal required');
 const points=[[doorX,toe-1,0],[doorX,toe-.2,0],...Array.from({length:5},(_,i)=>[doorX,toe+(i+.5)*run/5,p.ph*(i+.5)/5]),[doorX,edge+.15,p.ph],[doorX,doorZ,p.ph],[doorX,doorZ+.7,p.ph]];
 q.approachPoints=points.map(([localX,localZ,feetY])=>({localX,localZ,x:x+localX,z:z+localZ,feetY}));
 return true;
}
