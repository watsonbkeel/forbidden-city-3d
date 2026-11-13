// Collision-only substitute, not a real PBR/texture provider. Keep distinct from
// r48-real-texture-library while matching material cache identity and parameters.
export function stubLibrary(THREE) {
 const materials=new Map();
 const lib={materials,material(name,params={}){
  const key=`${name}|${JSON.stringify(params)}`;
  if(materials.has(key))return materials.get(key);
  const {normalScale,...rest}=params;
  const material=new THREE.MeshStandardMaterial({name,...rest});
  if(material.normalMap){const s=normalScale??1;material.normalScale=Array.isArray(s)?new THREE.Vector2(s[0],s[1]):new THREE.Vector2(s,s);}
  material.name=`${name}_material`;
  materials.set(key,material);return material;
 },tileSize:()=>1,aspect:()=>1};
 return new Proxy(lib,{get:(t,k)=>k in t?t[k]:()=>null});
}
