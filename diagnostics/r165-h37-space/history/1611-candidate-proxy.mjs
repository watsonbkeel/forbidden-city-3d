// Conservative CLOSED BOX space proxy, never a production appearance model.
import * as T from 'three';
export function createCandidate(){
 const root=new T.Group();root.name='H37-readonly-space-proxy';
 const material=new T.MeshBasicMaterial({color:0xa8a29a}),meshes=[],resources=[material];
 try{
 function box(role,x0,x1,y0,y1,z0,z1){if(!(x1>x0&&y1>y0&&z1>z0))throw Error('Invalid closed proxy '+role);const geometry=new T.BoxGeometry(1,1,1),m=new T.Mesh(geometry,material);m.name='H37-proxy/'+role;m.scale.set(x1-x0,y1-y0,z1-z0);m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);root.add(m);meshes.push(m);resources.push(geometry);return m;}
 for(const[i,[a,b]]of[[201.5,205.05],[207.75,213.8],[218.2,224.25],[226.95,230.5]].entries())box('high-wall-pier-'+i,a,b,0,7.3,309.8,310.6);
 for(const[c,a,b,h]of[['east',205.05,207.75,3.35],['middle',213.8,218.2,4],['west',224.25,226.95,3.35]])box('high-wall-over-'+c,a,b,h,7.3,309.8,310.6);
 box('wall-cap-conservative-closed-volume',201.15,230.85,7.3,7.9,309.5,310.9);
 for(const[name,x0,x1,o0,o1,h,roof0,roof1]of[
  ['east',204.2,208.6,205.05,207.75,3.35,4.95,5.65],
  ['middle',212.8,219.2,213.8,218.2,4,5.05,6.25],
  ['west',223.4,227.8,224.25,226.95,3.35,4.95,5.65],
 ]){
  box(name+'-left-jamb',x0,o0,0,h,309.2,309.8);box(name+'-right-jamb',o1,x1,0,h,309.2,309.8);
  box(name+'-header',x0,x1,h,roof0,309.2,309.8);
  box(name+'-canopy-conservative-volume',x0-.4,x1+.4,roof0,roof1,name==='middle'?308.4:308.6,309.8);
 }
 for(const[i,[a,b]]of[[208.6,212.8],[219.2,223.4]].entries()){box('short-wall-'+i,a,b,0,4.5,309.3,309.8);box('own-short-wall-roof-'+i,a,b,4.5,4.85,308.8,309.8);}
 const sideLeaves=[];
 for(const[name,x]of[['east',206.4],['west',225.6]])for(const sign of[-1,1])sideLeaves.push(box(name+'-closed-leaf-'+sign,x+(sign<0?-1.35:0),x+(sign<0?0:1.35),.05,3.35,310.14,310.26));
 const openLeaves=[box('middle-open-east-leaf-90deg',213.74,213.86,.05,3.95,310.2,312.4),box('middle-open-west-leaf-90deg',218.14,218.26,.05,3.95,310.2,312.4)];
 root.updateWorldMatrix(true,true);
 return {root,meshes,resources,sideLeaves,openLeaves,box};
 }catch(primary){const errors=[primary];for(const r of new Set(resources))try{r.dispose();}catch(e){errors.push(e);}throw errors.length===1?primary:new AggregateError(errors,'Proxy setup and cleanup');}
}
