/** Default-off local contact-rig fit. Neither surveyed architecture nor runtime installation.
 * Rectangles follow separately read2021 exhibition-plan regions; all heights,
 * receiving blocks and nominal25m scale are explicit engineering assumptions. */
const scale=25/377.5;
const sides={
 east:{entry:[1174,1040,1273,1269],innerTurn:[1174,1269,1273,1393],outward:[1273,1269,1460,1393],outerFold:[1460,1269,1563,1485],return:[1168,1397,1460,1485],neck:[1145,1420,1168,1500],receiver:[1125,1420,1145,1500]},
 west:{entry:[1452,1044,1555,1269],innerTurn:[1452,1269,1555,1393],outward:[1260,1269,1452,1393],outerFold:[1168,1269,1260,1485],return:[1260,1397,1558,1485],neck:[1558,1440,1582,1524],receiver:[1582,1440,1602,1524]},
};
const x=(side,u)=>side==='east'?-30.025-(u-667)*scale:30.025+(2060-u)*scale;
const z=v=>(1309.75-v)*scale;
const pieces=[];
for(const [side,regions] of Object.entries(sides)){
  for(const [kind,b] of Object.entries(regions)){
   const [u0,v0,u1,v1]=b,minX=x(side,u1),maxX=x(side,u0),minZ=z(v1),maxZ=z(v0);
   let axis='x',a0=minX,a1=maxX,y0,y1;
   if(kind==='entry'){axis='z';a0=maxZ;a1=minZ;y0=0;y1=3.3;}
   else if(kind==='innerTurn'){y0=y1=3.3;}
   else if(kind==='outward'){a0=side==='east'?maxX:minX;a1=side==='east'?minX:maxX;y0=3.3;y1=10;}
   else if(kind==='outerFold'){y0=y1=10;}
   else if(kind==='return'){a0=side==='east'?minX:maxX;a1=side==='east'?maxX:minX;y0=10;y1=11.9;}
   else if(kind==='neck'){a0=side==='east'?minX:maxX;a1=side==='east'?maxX:minX;y0=11.9;y1=12.3;}
   else y0=y1=12.3;
   pieces.push(Object.freeze({id:`${side}/${kind}`,axis,minX,maxX,minZ,maxZ,a0,a1,y0,y1,baseY:0,bodySlice:.25}));
  }
}
export const WUMEN_JOINT_ASCENT_FIT=Object.freeze({status:'ENGINEERING_CONTACT_RIG_NOT_ARCHITECTURE_ACCEPTANCE',coordinateSpace:'WUMEN_LOCAL_XZ',runtimeInstalled:false,routeAcceptance:false,pieces:Object.freeze(pieces)});
