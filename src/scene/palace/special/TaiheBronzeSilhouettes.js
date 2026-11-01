import * as T from 'three';
// Own Taihe photos 1607/1608. Coarse recognizable contours only; no measured
// sculpture, carving or hidden ornament. Keep the caller's existing body proxy.
export function buildTaiheBronze(parent,material,{kind,x,y,z}){
 if(!['turtle','crane'].includes(kind)||![x,y,z].every(Number.isFinite))throw Error('Invalid Taihe bronze input');
 const g=new T.Group();g.name=`taihe-bronze-${kind}`;g.position.set(x,y,z);g.userData={bronzeKind:kind,measured:false,source:kind==='turtle'?'https://img.dpm.org.cn/Uploads/Picture/dc/1607%5B1024%5D.jpg':'https://img.dpm.org.cn/Uploads/Picture/dc/1608.jpg',dimensionStatus:'PHOTO_SILHOUETTE_FIT_WITHIN_RETAINED_PROXY',unknown:['scales and carving','exact dimensions','orientation and unseen detail']};g.userData.structure={id:`axis/taihe-bronze-${kind}-${x}`,objectId:'FC-A478209231',scope:'OWN_PHOTO_MAJOR_SILHOUETTE_ONLY',kind,source:g.userData.source,dimensionStatus:g.userData.dimensionStatus,wholeObjectAccepted:false};parent.add(g);
 const add=(role,geo,pos,scale=[1,1,1])=>{const m=new T.Mesh(geo,material);m.position.fromArray(pos);m.scale.fromArray(scale);m.castShadow=m.receiveShadow=true;m.userData={taiheBronze:true,role};m.name=`taihe-${kind}-${role}`;g.add(m);return m;};
 const oval=(role,pos,s)=>add(role,new T.SphereGeometry(1,12,8),pos,s);
 const link=(role,a,b,r0,r1=r0)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),m=add(role,new T.CylinderGeometry(r1,r0,d.length(),10),A.clone().add(B).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;};
 if(kind==='turtle'){
  oval('body',[0,1.52,.03],[.51,.28,.55]);oval('shell',[0,1.76,.12],[.64,.40,.60]);
  for(const s of[-1,1])for(const e of[-1,1]){link('leg',[s*.37,1.54,e*.36],[s*.53,1.31,e*.46],.17,.14);oval('foot',[s*.53,1.28,e*.48],[.20,.08,.22]);}
  const curve=new T.CatmullRomCurve3([[0,1.48,-.38],[0,1.78,-.57],[0,2.16,-.58],[0,2.40,-.56]].map(p=>new T.Vector3(...p)));
  add('neck',new T.TubeGeometry(curve,10,.155,8,false),[0,0,0]);oval('head',[0,2.47,-.57],[.21,.19,.20]);oval('snout',[0,2.48,-.71],[.16,.09,.075]);
  for(const s of[-1,1]){link('horn',[s*.13,2.57,-.49],[s*.17,2.76,-.39],.06,.015);oval('eye',[s*.175,2.51,-.65],[.04,.04,.04]);}
  link('tail',[0,1.42,.55],[0,1.28,.75],.11,.015);
 }else{
  for(const s of[-1,1]){link('leg',[s*.13,1.24,.05],[s*.13,1.88,.03],.035);for(const dx of[-.07,0,.07])link('toe',[s*.13,1.23,.05],[s*.13+dx,1.23,-.13],.018,.012);}
  oval('body',[0,2.04,.05],[.24,.35,.28]);for(const s of[-1,1])oval('wing',[s*.17,2.02,.10],[.095,.30,.24]);
  link('tail',[0,1.98,.23],[0,1.57,.43],.15,.015);
  const curve=new T.CatmullRomCurve3([[0,2.23,-.09],[0,2.41,-.20],[0,2.66,-.22],[0,2.81,-.24]].map(p=>new T.Vector3(...p)));
  add('neck',new T.TubeGeometry(curve,12,.045,8,false),[0,0,0]);oval('head',[0,2.82,-.25],[.065,.07,.09]);link('beak',[0,2.85,-.30],[0,2.98,-.46],.028,0);
 }
 return g;
}
