import * as THREE from 'three';

// Xiehe's OWN courtyard/west photograph s5e9d4981afba5.jpg locates six
// scalloped ends at the three central openings. This is a low-poly outline
// fit, not a measured carving, a paint reconstruction, or Xihe's profile.
const outline=Object.freeze([
  [0,0],[1.34,0],[1.29,-.09],[1.21,-.11],[1.16,-.19],
  [1.06,-.21],[1.01,-.17],[.94,-.25],[.84,-.29],[.78,-.25],
  [.71,-.34],[.61,-.37],[.55,-.32],[.47,-.40],[.34,-.43],
  [.27,-.40],[.23,-.52],[.14,-.56],[.06,-.55],[0,-.51],
].map(Object.freeze));
export const XIEHE_COURTYARD_KNEE_FIT=Object.freeze({
  projection:1.34,drop:.56,depth:.16,outline,
  trianglesPerKnee:4*outline.length-8,
  status:'PHOTO_FIT_NOT_SURVEYED',
  projectionRange:[1.1,1.55],dropRange:[.43,.72],depthRange:[.12,.17],
  depthStatus:'ENGINEERING_ASSUMPTION_PHOTO_UNRESOLVED',
});

function kneeGeometry(g) {
  // SideGate uses CylinderGeometry(radius, radius*1.04, columnH, 10).
  // The inward decagon facet spans z=±sin(18°)*radius, wider than ±.08.
  // Its x varies linearly with the tapered radius at each vertex Y. This
  // reaches the existing facet exactly, without embedding or floating.
  const attachX=y=>Math.sin(2*Math.PI/5)*g.radius*(1+.04*(.65-y)/g.columnH);
  const pos=[],uv=[],half=XIEHE_COURTYARD_KNEE_FIT.depth/2;
  const point=(i,z)=>[attachX(outline[i][1])+outline[i][0],outline[i][1],z];
  const face=(a,b,c,expected)=>{
    const n=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...c),new THREE.Vector3(...a)));
    if(n.dot(new THREE.Vector3(...expected))<0)[b,c]=[c,b];
    for(const p of [a,b,c]){pos.push(...p);uv.push(p[0],-p[1]);}
  };
  const tris=THREE.ShapeUtils.triangulateShape(outline.map(p=>new THREE.Vector2(...p)),[]);
  for(const z of [-half,half])for(const tri of tris)face(...tri.map(i=>point(i,z)),[0,0,Math.sign(z)]);
  // Omit the buried top edge (beam underside) and root edge (column facet).
  // Adjacent retained structure closes the visible assembly. Adding either
  // skin would create duplicate coplanar faces; no host face is deleted.
  for(let i=1;i<outline.length-1;i++){
    const j=i+1,[x,y]=outline[i],[xx,yy]=outline[j],normal=[y-yy,xx-x,0];
    const a=point(i,-half),b=point(j,-half),c=point(j,half),d=point(i,half);
    face(a,b,c,normal);face(a,c,d,normal);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.computeVertexNormals();return geometry;
}

/** Six courtyard/local +Z members only. No outward-side or whole-gate claim. */
export function buildXieheCourtyardKnees(kit,frame,g) {
  if(g.profile!=='xiehe')return [];
  const members=[];
  for(const bay of [1,2,3])for(const direction of [1,-1]){
    const columnX=g.columnXs[direction===1?bay:bay+1];
    const member=kit.mesh(frame,kneeGeometry(g),kit.lib.material('caihua_beam'),columnX,g.platformY+g.columnH-.65,g.depth/2);
    if(direction===-1)member.rotation.y=Math.PI;
    member.name='xiehe-courtyard-knee';
    Object.assign(member.userData,{role:member.name,objectId:'FC-9E59B14A3C',bay,direction,columnX,side:'rear',cardinal:'west',status:'PHOTO_FIT',captureDate:null,
      fit:{projection:1.34,drop:.56,depth:.16},sourceImages:['s5e9d4981afba5.jpg'],visualAcceptance:'VERIFY_PENDING',
      contact:'Exact existing tapered decagon facet and beam underside; buried root/top skins omitted',
      collision:'UNCHANGED: lowest added surface is 4.99 m above platform; standing/jump envelope independently checked'});
    members.push(member);
  }
  return members;
}
