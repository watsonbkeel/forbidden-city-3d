import{snapshot,hash}from'../r165-xuanshou-south-front/compound-snapshot.mjs';
export const neighborhoodSnapshot=(kit,roots=kit.root.children,counts)=>({component:snapshot(kit,roots,counts),metadata:roots.map(r=>({name:r.name,position:r.position.toArray(),userData:r.userData}))});
export{hash};
