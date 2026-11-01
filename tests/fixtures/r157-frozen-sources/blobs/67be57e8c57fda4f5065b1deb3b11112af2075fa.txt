/** A tagged overhead is the closed volume above a piecewise-linear X profile,
 * within [minZ,maxZ] and below topY. Its Box3 is broadphase only. Call clone once
 * at registration; queries consume the resulting deeply immutable value.
 */
const finite=Number.isFinite;
function validBox(box,strict=false){
  if(!box?.isBox3||!['x','y','z'].every(k=>finite(box.min[k])&&finite(box.max[k])&&(strict?box.min[k]<box.max[k]:box.min[k]<=box.max[k])))throw new TypeError('Overhead requires a finite ordered Box3');
}
export function cloneOverheadShape(input,box){
  validBox(box,true);
  if(input?.type!=='piecewise-linear-x'||typeof input.sourceId!=='string'||!input.sourceId.trim()||input.sourceId.trim()!==input.sourceId
    ||!Array.isArray(input.points)||input.points.length<2||![input.minZ,input.maxZ,input.topY].every(finite)||input.minZ>=input.maxZ)throw new TypeError('Invalid piecewise-linear overhead shape');
  const points=input.points.map((p,i)=>{
    if(!Array.isArray(p)||p.length!==2||!p.every(finite)||(i>0&&p[0]<=input.points[i-1][0])||p[1]>input.topY)throw new TypeError('Overhead points must be finite, strictly increasing and below topY');
    return Object.freeze([p[0],p[1]]);
  });
  if(points[0][0]!==box.min.x||points.at(-1)[0]!==box.max.x||Math.min(...points.map(p=>p[1]))!==box.min.y
    ||input.topY!==box.max.y||input.minZ!==box.min.z||input.maxZ!==box.max.z)throw new TypeError('Overhead shape must match its broadphase box bounds');
  return Object.freeze({type:'piecewise-linear-x',points:Object.freeze(points),minZ:input.minZ,maxZ:input.maxZ,topY:input.topY,sourceId:input.sourceId});
}

/** Exact minimum over the complete clipped footprint, including internal
 * vertices. Infinity means no XZ overlap. Closed-boundary contact is included.
 */
export function overheadHeightAtFootprint(shape,minX,maxX,minZ,maxZ){
  if(![minX,maxX,minZ,maxZ].every(finite)||minX>maxX||minZ>maxZ)throw new TypeError('Overhead footprint must have finite ordered bounds');
  const points=shape.points;
  if(maxZ<shape.minZ||minZ>shape.maxZ||maxX<points[0][0]||minX>points.at(-1)[0])return Infinity;
  let height=Infinity;
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],left=Math.max(minX,a[0]),right=Math.min(maxX,b[0]);
    if(left>right)continue;
    const y=x=>a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
    height=Math.min(height,y(left),y(right));
  }
  return height;
}
export function overheadIntersectsBox(shape,bodyBox){
  validBox(bodyBox);
  if(bodyBox.min.y>shape.topY)return false;
  const height=overheadHeightAtFootprint(shape,bodyBox.min.x,bodyBox.max.x,bodyBox.min.z,bodyBox.max.z);
  return bodyBox.max.y>=height;
}
