/** Shared flow layout keeps optional clock and aircraft controls from covering
 * one another. Each details element remains keyboard-operable and scrollable. */
export function attachTourTool(element){
  let host=document.getElementById('tour-tools');
  if(!host){host=document.createElement('div');host.id='tour-tools';host.style.cssText='position:fixed;right:14px;top:94px;z-index:1160;display:flex;flex-direction:column;gap:6px;max-width:min(310px,calc(100vw - 28px));max-height:calc(100dvh - 120px);overflow:auto;scrollbar-width:thin;pointer-events:none';document.body.appendChild(host);
    // Keep panel controls (including native summary/labels) out of world input.
    // Do not preventDefault: sliders, details and assistive activation stay native.
    for(const type of ['click','pointerdown','touchstart'])host.addEventListener(type,event=>event.stopPropagation());
  }
  host.setAttribute('data-map-preview',document.getElementById('minimap-preview')?'true':'false');
  if(!document.getElementById('tour-tools-style')){
    const style=document.createElement('style');style.id='tour-tools-style';
    style.textContent=`#tour-tools[data-map-preview=true]{top:142px!important;max-height:calc(100dvh - 328px)!important}
      body.map-open #tour-tools[data-map-preview=true]{visibility:hidden}
      @media(orientation:landscape){#tour-tools[data-map-preview=true]{top:40px!important;right:148px!important;max-height:calc(100dvh - 150px)!important}}`;
    document.head.appendChild(style);
  }
  element.style.pointerEvents='auto';element.setAttribute('name','palace-tour-tool');host.appendChild(element);return host;
}
export function detachTourTool(element){const host=element.parentElement;element.remove();if(host?.id==='tour-tools'&&!host.children.length){host.remove();document.getElementById('tour-tools-style')?.remove();}}
