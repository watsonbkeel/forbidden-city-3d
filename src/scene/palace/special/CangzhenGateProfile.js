import * as T from "three";
export const CANGZHEN_ID="FC-9ABF21A275";
export const CANGZHEN_SOURCE="https://www.dpm.org.cn/explore/building/236555.html";
export const CANGZHEN_PHOTO="https://img.dpm.org.cn/Uploads/Picture/dc/20551[1024].jpg";
export const CANGZHEN_SCOPE=Object.freeze({zh:"苍震门独立门体及同轴局部墙段；北侧外墙与门内墙街尚未完整复原。截面不是历史出口，开启姿态及尺度为游览模型拟合。",en:"Independent Cangzhen Gate and limited aligned wall sections. The northern outer wall and inner wall-street remain incomplete. The cut is not a historic exit; dimensions and open leaves are visitor-model fits."});
const retained={"21":{"kind":"gate","name":"延禧门","x":-147.5,"z":303.2},"22":{"kind":"courtWalls","x0":-169.2,"x1":-127.2,"z0":303.2,"z1":353.2,"gates":[{"side":"s","at":-147.5,"gate":"延禧门"}]},"52":{"kind":"courtWalls","x0":-215,"x1":-150,"z0":203.3,"z1":300,"gates":[{"side":"s","at":-181,"gate":"奉先门"}]}};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,"length")?.writable;
export function validateCangzhenHost(kit,z){
 if(z?.id!=="east-six")return false;
 const r=kit?.root;
 if(!r||r.name!=="east-six"||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||["colliders","walkables","owned","rooms","mapItems","regions","plaques"].some(k=>!mutable(kit[k]))||Object.entries(retained).some(([i,v])=>JSON.stringify(z.items?.[i])!==JSON.stringify(v))||z.items?.some(i=>i.name==="苍震门")||r.children.some(c=>c.userData.structure?.sourceObjectId===CANGZHEN_ID))throw Error("Exact mutable Cangzhen host and retained Fengxian/Yanxi input required");
 return true;
}
