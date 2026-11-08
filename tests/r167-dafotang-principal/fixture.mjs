import * as T from 'three';
const placeId='place-outer-west-6cae88b6a2';
export function fixture() {
  const root=new T.Group(),f=new T.Group();root.name='outer-west';f.position.set(221.9,0,241.1);root.add(f);root.updateMatrixWorld(true);
  const kit={root,colliders:[],walkables:[],owned:[],rooms:[],mapItems:[],regions:[],plaques:[]};
  const g={id:placeId,key:'dafotang',w:45.7,d:16.2,y:.9,h:7.84,bays:7,front:-8.1,rear:8.1,
    warmRoomPartitions:[-1,1].map(side=>({x:side*45.7/7*1.5,doorZ:-5.9,doorW:1.8,doorH:2.65})),
    inventory:{status:'UNKNOWN',knownEmpty:false,accepted:false,entityId:placeId,withheldMeshCount:8,withheldColliderCount:8}};
  return {kit,f,g,p:{id:placeId,key:'dafotang',zone:'outer-west',name:'大佛堂'},item:{name:'大佛堂',kind:'hall',x:221.9,z:241.1,w:45.7,d:16.2,ph:.9,colH:7.84}};
}
