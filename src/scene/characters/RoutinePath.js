import * as THREE from 'three';
import {PLAYER} from '../../config/constants.js';
import {CollisionManager} from '../../utils/Collision.js';
export function staticRoutineNavigation(source){const cm=new CollisionManager();cm.colliders=source.colliders;cm.walkables=source.walkables;cm.rivers=source.rivers;cm._grid=source._grid;return cm;}
/** Bounded incremental A* over actual static controller navigation. No rays
 * through walls, fixed-height guesses or teleport fallback. One caller advances
 * a few yields per frame; failure preserves the character's current position. */
export function* findRoutinePath(cm,start,target,{step=.65,maxNodes=30000,margin=12,radius=.32}={}){
 const clearSegment=(a,b)=>{
  const eye=new THREE.Vector3(a[0],a[1]+PLAYER.HEIGHT,a[2]);
  const goal=new THREE.Vector3(b[0],a[1]+PLAYER.HEIGHT,b[2]);
  const result=cm.getValidPosition(eye,goal,radius,a[1],PLAYER.STEP_UP,a[1]);
  if(Math.hypot(result.x-b[0],result.z-b[2])>.015)return null;
  const floor=Math.max(cm.getGroundHeight(result.x,result.z,a[1],PLAYER.STEP_UP),cm.supportHeight(result.x,result.z,a[1]+PLAYER.STEP_UP,radius));
  if(Math.abs(floor-a[1])>PLAYER.STEP_UP+.001)return null;
  result.y=floor+PLAYER.HEIGHT;const p=[result.x,floor,result.z];
  return cm.checkCollision(result,radius)?null:p;
 };
 if(!start.every(Number.isFinite)||!target.every(Number.isFinite))return{status:'error',reason:'Invalid routine endpoints'};
 const direct=Math.hypot(start[0]-target[0],start[2]-target[2])<=step*1.5?clearSegment(start,target):null;if(direct&&Math.abs(direct[1]-target[1])<.15)return{status:'ready',points:[[...start],[...target]],visited:0};
 const minX=Math.min(start[0],target[0])-margin,maxX=Math.max(start[0],target[0])+margin,minZ=Math.min(start[2],target[2])-margin,maxZ=Math.max(start[2],target[2])+margin;
 const heap=[],best=new Map(),heuristic=p=>Math.hypot(p[0]-target[0],p[2]-target[2]);
 const key=p=>`${Math.round((p[0]-start[0])/step)},${Math.round((p[2]-start[2])/step)},${Math.round(p[1]*5)}`;
 const push=n=>{heap.push(n);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return top;};
 const first={p:[...start],g:0,f:heuristic(start),parent:null};push(first);best.set(key(start),0);
 for(let visited=0;heap.length&&visited<maxNodes;visited++){
  if(visited%16===0)yield{visited,pending:heap.length};
  const current=pop();if(current.g>best.get(key(current.p))+1e-6)continue;
  if(heuristic(current.p)<step*1.5){const end=clearSegment(current.p,target);if(end&&Math.abs(end[1]-target[1])<.15){const points=[target];for(let n=current;n;n=n.parent)points.push(n.p);return{status:'ready',points:points.reverse(),visited};}}
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=current.p[0]+dx*step,z=current.p[2]+dz*step;if(x<minX||x>maxX||z<minZ||z>maxZ)continue;
   const p=clearSegment(current.p,[x,current.p[1],z]);if(!p)continue;
   const g=current.g+Math.hypot(p[0]-current.p[0],p[1]-current.p[1],p[2]-current.p[2]),k=key(p);if(g>=(best.get(k)??Infinity)-1e-6)continue;
   best.set(k,g);push({p,g,f:g+heuristic(p),parent:current});
  }
 }
 return{status:'error',reason:'No verified routine path within bounded search'};
}
