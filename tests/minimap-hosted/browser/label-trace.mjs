// Diagnostic only: observes queued values after original drawing, never mutates them.
const must=(ok,message)=>{if(!ok)throw Error('label trace: '+message);};
const priority=l=>l.bold?(/后殿|配殿|庑房|值房|朝房|耳房/.test(l.targetName)?1:0):2;
const close=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=1e-9;
export function replayLabels(candidates,actual,scale,ctx){
 must(Number.isFinite(scale)&&scale>0,'scale');must(Array.isArray(candidates)&&Array.isArray(actual)&&candidates.length<=2048&&actual.length<=2048,'records budget');
 for(const c of candidates)must(typeof c.text==='string'&&c.text.length<=8192&&Number.isFinite(c.x)&&Number.isFinite(c.y),'candidate domain');
 const sorted=candidates.map((label,index)=>({label,index})).sort((a,b)=>priority(a.label)-priority(b.label)||a.index-b.index);
 const accepted=[],decisions=[];
 for(const {label,index} of sorted){
  const text=label.text.replace(/（(旧址|外观)）$/,'\n（$1）'),lines=text.split('\n');
  const size=(label.bold?13:12)/scale;ctx.font=`${label.bold?'bold ':''}${size*scale}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  const measuredFont=ctx.font,measuredWidths=lines.map(line=>ctx.measureText(line).width);must(measuredWidths.every(w=>Number.isFinite(w)&&w>=0),'measurement');
  const width=(Math.max(...measuredWidths)+4)/scale,height=size*lines.length+2/scale,gap=2/scale;
  const first=accepted.find(p=>Math.abs(p.x-label.x)<(p.width+width)/2+gap&&Math.abs(p.y-label.y)<(p.height+height)/2+gap);
  const row={candidateIndex:index,priority:priority(label),text,name:label.targetName,placeId:label.placeId??null,x:label.x,y:label.y,width,height,size,bold:label.bold,...(label.mode?{mode:label.mode}:{}),...(label.facilityId?{facilityId:label.facilityId}:{})};
  decisions.push({...row,measurement:{font:measuredFont,lineWidths:measuredWidths,labelScale:scale},decision:first?'REJECTED_COLLISION':'ACCEPTED',firstBlocker:first?{candidateIndex:first.candidateIndex,name:first.name,text:first.text,x:first.x,y:first.y,width:first.width,height:first.height}:null});
  if(!first)accepted.push(row);
 }
 must(accepted.length===actual.length,'accepted count mismatch: no causal report allowed');
 for(let i=0;i<accepted.length;i++){
  const a=accepted[i],b=actual[i];for(const k of ['text','name','bold','mode','facilityId'])must(a[k]===b[k],`record ${i} ${k} mismatch`);
  must(a.placeId===(b.placeId??null),`record ${i} placeId mismatch`);
  for(const k of ['x','y','width','height','size'])must(close(a[k],b[k]),`record ${i} ${k} mismatch`);
 }
 return {validatedAgainstActual:true,labelScale:scale,candidateCount:candidates.length,acceptedCount:accepted.length,decisions};
}
export function classifyScreen(label,map,ctx){
 const s=map.pxPerUnit,p=map.mapToScreen(label.x,label.y),halfW=label.width*s/2,halfH=label.height*s/2;
 const logical={left:p.x-halfW,right:p.x+halfW,top:p.y-halfH,bottom:p.y+halfH};
 const skipped=logical.right<0||logical.left>map.viewW||logical.bottom<0||logical.top>map.viewH;
 ctx.font=`${label.bold?'bold ':''}${label.size*s}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 const lines=label.text.split('\n');const glyphs=lines.map((line,index)=>{const m=ctx.measureText(line),y=p.y+(index-(lines.length-1)/2)*label.size*s;const b={left:p.x-m.actualBoundingBoxLeft,right:p.x+m.actualBoundingBoxRight,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent};must(Object.values(b).every(Number.isFinite),'missing native glyph bounds');const outside=b.left<0||b.right>map.viewW||b.top<0||b.bottom>map.viewH;const intersects=Math.max(0,b.left)<Math.min(map.viewW,b.right)&&Math.max(0,b.top)<Math.min(map.viewH,b.bottom);const visibility=b.right<=b.left||b.bottom<=b.top?'EMPTY_BOUNDS':!intersects?'FULLY_OFFSCREEN':outside?'PARTIAL':'FULLY_VISIBLE';return {line,...b,visibility};});
 return {name:label.name,text:label.text,logical,paintDisposition:skipped?'SKIPPED_FULLY_OFFSCREEN':'PAINTED',glyphs,font:ctx.font,labelScale:s,potentialInkBBoxClipping:!skipped&&glyphs.some(g=>g.visibility==='PARTIAL'),fullyOffscreenLineCount:skipped?0:glyphs.filter(g=>g.visibility==='FULLY_OFFSCREEN').length,boundsLimitation:'Native glyph bounding boxes only; partial overlap is potential clipping, screenshot review required, not per-pixel proof'};
}
export function installLabelObserver(Minimap){
 const original=Minimap.prototype.drawStatic,snapshots=new WeakMap();must(typeof original==='function','missing original');
 function observed(...args){const result=original.apply(this,args);if(Array.isArray(this.labelQueue))snapshots.set(this,structuredClone(this.labelQueue));return result;}
 Minimap.prototype.drawStatic=observed;
 return {inspect(map,ctx){must(map.baseLabelScale===map.pxPerUnit,'stale/non-screen candidate scale');must(snapshots.has(map),'no natural render observed');const replay=replayLabels(snapshots.get(map),map.labelPaintRecords,map.pxPerUnit,ctx);return {...replay,paint:map.labelPaintRecords.map(l=>classifyScreen(l,map,ctx)),scope:'Collision rejection is distinct from accepted-label Canvas clipping; user pan is not a default layout defect.'};},restore(){must(Minimap.prototype.drawStatic===observed,'observer ownership changed');Minimap.prototype.drawStatic=original;}};
}
