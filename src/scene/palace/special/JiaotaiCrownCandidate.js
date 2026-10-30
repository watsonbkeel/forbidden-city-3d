import * as THREE from 'three';

// Official self-view pano 94-3 / 94-1 establishes the oval crown, short neck
// and layered base. Every radius/height below is a MODEL_FIT, not a survey.
export const JIAOTAI_CROWN_CANDIDATE = Object.freeze({
  id:'jiaotai-whole-object-crown-candidate-v1', entityId:'FC-DD2C183004',
  status:'SOURCE_GUIDED_PARTIAL_MODEL_FIT',
});
export function validateJiaotaiCrownCandidate(o) {
  if(o.jiaotaiCrownCandidate===undefined)return false;
  if(o.jiaotaiCrownCandidate!==JIAOTAI_CROWN_CANDIDATE||o.type!=='pavilion'||o.width!==19.4||o.depth!==19.4||o.baseY!==8.36||o.height!==5.2||o.overhang!==2.5||o.layers!==1||o.brackets!==true||o.sides!==4||o._lift!==undefined||o.walkingBeastProfile!==undefined||o.wumenVerticalProfile!==undefined||o.detail!==undefined&&o.detail!=='high'&&o.detail!=='low')throw Error('Jiaotai crown candidate requires the exact reviewed canonical roof inputs');
  return true;
}
export function createJiaotaiCrownGeometry() {
  // The two own-object views show egg : neck-and-seat about 1.1–1.3.
  // Retain total fitted height 1.56, coordinate the full seat rather than
  // leaving an oversized egg sitting almost directly on the roof.
  const neckHeight=.72,eggHeight=.84;
  const profile=[[.52,0],[.52,.09],[.45,.13],[.45,.21],[.33,.25],[.27,.29],[.24,.39],[.25,.46]].map(([r,y])=>[r,y*neckHeight/.46]);
  // Smooth single ovoid above the neck; no extra generic pagoda-like waists.
  for(let i=0;i<=20;i++){const t=i/20,theta=Math.PI*(.12+.88*t);if(i===20)break;profile.push([.40*Math.sin(theta),neckHeight+eggHeight*(Math.cos(Math.PI*.12)-Math.cos(theta))/(Math.cos(Math.PI*.12)+1)]);}
  const n=48,vertices=[0,0,0],uv=[.5,0],indices=[];
  for(const[r,y]of profile)for(let j=0;j<n;j++){const a=j*2*Math.PI/n;vertices.push(r*Math.cos(a),y,r*Math.sin(a));uv.push(j/n,y/1.56);}
  const top=vertices.length/3;vertices.push(0,1.56,0);uv.push(.5,1);
  for(let j=0;j<n;j++){const next=(j+1)%n;indices.push(0,1+j,1+next);for(let k=0;k<profile.length-1;k++){const a=1+k*n+j,b=1+k*n+next,c=a+n,d=b+n;indices.push(a,c,b,b,c,d);}indices.push(1+(profile.length-1)*n+j,top,1+(profile.length-1)*n+next);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData={scope:'SOURCE_GUIDED_PARTIAL_MODEL_FIT',entityId:JIAOTAI_CROWN_CANDIDATE.entityId,source:'Official own-object panorama 94-3 and 94-1',dimensions:'MODEL_FIT_NOT_MEASURED',eggToSeatRatio:eggHeight/neckHeight,remaining:'Exact gilding, ornament relief, corner animals, original dimensions and actual new high-place safety unverified'};return g;
}
