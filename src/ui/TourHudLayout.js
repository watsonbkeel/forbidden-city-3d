import {attachTourTool,detachTourTool} from './TourTools.js';

/** Presentation-only ownership: keep the real controls, listeners and focus.
 * Flow layout handles wrapping and viewport changes without pixel/RAF caches. */
export class TourHudLayout {
  constructor(language, {document=globalThis.document}={}) {
    this.document=document;this.language=language;this.disposed=false;
    this.left=document.createElement('div');this.left.id='tour-primary-tools';
    document.body.appendChild(this.left);
    this.right=attachTourTool(language,document);
    document.body.setAttribute('data-tour-hud','top');
    this.sync=()=>{
      if(this.disposed)return;
      const focused=document.activeElement;
      const location=document.getElementById('location-panel');
      const settings=document.getElementById('structural-preview-button');
      const help=document.getElementById('help-panel');
      const mapOpen=document.body.classList.contains('map-open');
      if(mapOpen&&location?.parentNode===this.left)document.body.appendChild(location);
      if(!mapOpen){
        // SettingsMenu alone owns the entry while it is inside the open map.
        const nodes=[location,settings?.closest('#minimap')?null:settings,help].filter(Boolean);
        for(const [index,node] of nodes.entries()){
          const next=this.left.children[index];
          if(next!==node){if(next)this.left.insertBefore(node,next);else this.left.appendChild(node);}
        }
      }
      if(this.right.children[0]!==language)this.right.prepend(language);
      const preview=document.getElementById('minimap-preview')?'true':'false';
      if(this.right.getAttribute('data-map-preview')!==preview)this.right.setAttribute('data-map-preview',preview);
      if(focused?.isConnected&&document.activeElement!==focused)focused.focus({preventScroll:true});
    };
    const Observer=document.defaultView?.MutationObserver??globalThis.MutationObserver;
    if(Observer){
      this.observer=new Observer(this.sync);
      this.observer.observe(document.body,{childList:true,attributes:true,attributeFilter:['class']});
      this.observer.observe(this.left,{childList:true});
      this.observer.observe(this.right,{childList:true});
    }
    this.sync();
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;this.observer?.disconnect();
    for(const node of [...this.left.children])this.document.body.appendChild(node);
    this.left.remove();detachTourTool(this.language,this.document);
    this.document.body.removeAttribute('data-tour-hud');
  }
}
