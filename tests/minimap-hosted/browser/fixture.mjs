import {decodeMetadata} from '/tmp/minimap-zone-export/codec.mjs';
import '/tmp/minimap-r379-exact/style.css';
import {Minimap} from '/tmp/minimap-r379-exact/src/ui/Minimap.js';
import {FLIGHT_BOUNDS} from '/tmp/minimap-r379-exact/src/scene/flight/FlightEnvelope.js';
import {localeStore} from '/tmp/minimap-r379-exact/src/i18n/LocaleStore.js';
const data=await (await fetch('/map-items.json')).json();
if(data.complete!==true) throw Error('Incomplete production map data');
localeStore.setLocale('en');
const map=new Minimap({items:decodeMetadata(data.mapItemsEncoded),worldBounds:FLIGHT_BOUNDS,preview:true});

function inspect(){
 const notice=map.container.querySelector('#minimap-moat-status');if(!notice)throw Error('missing factual moat notice');
 const s=map.pxPerUnit,c=document.createElement("canvas").getContext("2d");
 const rows=map.labelPaintRecords.map(l=>{const p=map.mapToScreen(l.x,l.y);const size=l.size*s;c.font=`${l.bold?'bold ':''}${size}px sans-serif`;c.textAlign='center';c.textBaseline='middle';const glyphs=l.text.split('\n').map((line,i,lines)=>{const m=c.measureText(line),y=p.y+(i-(lines.length-1)/2)*size;return {line,left:p.x-m.actualBoundingBoxLeft,right:p.x+m.actualBoundingBoxRight,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent};});return {...l,screen:p,glyphs,logicalBounds:{left:p.x-l.width*s/2,right:p.x+l.width*s/2,top:p.y-l.height*s/2,bottom:p.y+l.height*s/2}}});
 return{moatNotice:{hidden:notice.hidden,inert:notice.inert,text:notice.textContent},width:innerWidth,height:innerHeight,dpr:devicePixelRatio,mapDpr:map.dpr,locale:localeStore.locale,compact:map.compact,visible:map.visible,panel:map.container.getBoundingClientRect().toJSON(),panelScrollTop:map.container.scrollTop,view:{...map.view},canvas:map.canvas.getBoundingClientRect().toJSON(),viewW:map.viewW,viewH:map.viewH,scale:s,k:map.view.k,allItemCount:map.items.length,rows};
}
window.qa={map,inspect};window.qaReady=true;
