// Test-only structural sampling, not invented ramps or proof of passage.
export function dedicatedGateRoute(g,portalX=0){
 const p=g.profile;if(!['cining-entry','shouan-entry'].includes(p?.profile))return null;
 const c=p.profile==='cining-entry',x=c?222.2:277,z=c?155.7:362;
 if(p.x!==x||p.z!==z||g.x!==x||g.z!==z||g.rot!==0||g.dir?.[0]!==0||g.dir?.[1]!==1)throw Error('dedicated gate identity/transform changed');
 if(!p.portalCenters.includes(portalX))throw Error('source portal required');
 let samples,front,rear,platformY;
 if(c){front=5.235;rear=4.595;platformY=p.platformY;samples=[-5.235,-5.075,-4.915,-4.755,-4.595,0,p.rearInnerLine,4.595];}
 else if(portalX===0){front=2.85;rear=7.7;platformY=p.portals.find(q=>q.x===portalX).floor;samples=[-2.85,-2.55,-2.25,-1.95,-1.65,0,1.65,1.95,2.25,2.55,2.85,4.3,4.6,4.9,p.screen.z,7.1,7.4,7.7];}
 else{front=1.3;rear=1.3;platformY=p.portals.find(q=>q.x===portalX).floor;samples=[-1.3,0,1.3];}
 const forward=samples.map(v=>[p.x+portalX,p.z+v]);
 return{center:[p.x+portalX,p.z],front,rear,platformY,passage(direction){if(![-1,1].includes(direction))throw Error('exact passage direction required');return(direction===1?forward:forward.toReversed()).map(p=>[...p]);}};
}
