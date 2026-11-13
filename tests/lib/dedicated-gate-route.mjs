// Test-only structural sampling, not invented ramps or proof of passage.
export function dedicatedGateRoute(g,portalX=0){
 const p=g.profile;if(!p)return null;
 const kind=p.profile??(p.id==='garden/shunzhen-gates'?'shunzhen':p.entityId==='FC-0EACBA1911'?'yinghua':null);
 const origins={'cining-entry':[222.2,155.7],'shouan-entry':[277,362],shunzhen:[.5,518.3],yinghua:[277.2,461.4],'shoukang-entry':[288.6,193.9]};if(!Object.hasOwn(origins,kind))return null;
 const c=kind==='cining-entry',[x,z]=origins[kind];
 if(p.x!==x||p.z!==z||g.x!==x||g.z!==z||g.rot!==0||g.dir?.[0]!==0||g.dir?.[1]!==1)throw Error('dedicated gate identity/transform changed');
 if(!p.portalCenters.includes(portalX))throw Error('source portal required');
 let samples,front,rear,platformY;
 if(kind==='shunzhen'){front=rear=1.8;platformY=0;samples=[-1.8,-1.75,0,1.75,1.8];}
 else if(kind==='yinghua'){front=rear=1.65;platformY=p.floor;samples=[-1.65,-1.4,0,1.4,1.65];}
 else if(kind==='shoukang-entry'){front=1.65;rear=3.15;platformY=p.floor;samples=[-1.65,-1.4,0,1.4,1.65,3.15];}
 else if(c){front=5.235;rear=4.595;platformY=p.platformY;samples=[-5.235,-5.075,-4.915,-4.755,-4.595,0,p.rearInnerLine,4.595];}
 else if(portalX===0){front=2.85;rear=7.7;platformY=p.portals.find(q=>q.x===portalX).floor;samples=[-2.85,-2.55,-2.25,-1.95,-1.65,0,1.65,1.95,2.25,2.55,2.85,4.3,4.6,4.9,p.screen.z,7.1,7.4,7.7];}
 else{front=1.3;rear=1.3;platformY=p.portals.find(q=>q.x===portalX).floor;samples=[-1.3,0,1.3];}
 const forward=samples.map(v=>[p.x+portalX,p.z+v]);
 return{center:[p.x+portalX,p.z],front,rear,platformY,passage(direction){if(![-1,1].includes(direction))throw Error('exact passage direction required');return(direction===1?forward:forward.toReversed()).map(p=>[...p]);}};
}
