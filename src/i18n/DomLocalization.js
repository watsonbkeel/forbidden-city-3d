const attributes=['aria-label','aria-valuetext','title','placeholder','alt'];
const skipTags=new Set(['SCRIPT','STYLE','CODE','PRE']);
/** In-place legacy UI presentation. Does not replace elements, values or events. */
export function localizeDom(root,{store,translate,MutationObserver=globalThis.MutationObserver}={}) {
  const texts=new WeakMap(),attrs=new WeakMap();let disposed=false,queued=false;
  const eligible=node=>{
    if(!root.contains(node))return false;
    for(let n=node.nodeType===1?node:node.parentNode;n;n=n.parentNode){
      if(n.nodeType===1&&(skipTags.has(n.tagName)||n.getAttribute('translate')==='no'))return false;
      if(n===root)break;
    }
    return true;
  };
  function updateText(node){
    if(!eligible(node))return;
    // A textarea's DOM text is its default editable value, not UI copy.
    for(let n=node.parentNode;n;n=n.parentNode){if(n.tagName==='TEXTAREA')return;if(n===root)break;}
    let row=texts.get(node);const current=node.nodeValue;
    if(!row||current!==row.output)row={source:current,output:current};
    const output=translate(row.source,store.locale);row.output=output;texts.set(node,row);
    if(current!==output)node.nodeValue=output;
  }
  function updateAttributes(node){
    if(!eligible(node))return;
    let rows=attrs.get(node);if(!rows){rows=new Map();attrs.set(node,rows);}
    for(const key of attributes){const current=node.getAttribute(key);if(current===null){rows.delete(key);continue;}
      let row=rows.get(key);if(!row||current!==row.output)row={source:current,output:current};
      const output=translate(row.source,store.locale);row.output=output;rows.set(key,row);if(current!==output)node.setAttribute(key,output);
    }
  }
  function walk(node){
    if(node.nodeType===3){updateText(node);return;}
    if(node.nodeType!==1||!eligible(node))return;
    updateAttributes(node);for(const child of node.childNodes)walk(child);
  }
  const refresh=()=>{if(!disposed)walk(root);};
  const schedule=()=>{if(queued||disposed)return;queued=true;queueMicrotask(()=>{queued=false;refresh();});};
  const unsubscribe=store.subscribe(schedule);
  const observer=MutationObserver?new MutationObserver(records=>{
    if(disposed)return;
    for(const record of records){if(record.type==='characterData')updateText(record.target);else if(record.type==='attributes')updateAttributes(record.target);else if(record.type==='childList')for(const node of record.addedNodes)walk(node);}
  }):null;
  refresh();observer?.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
  return {refresh,dispose(){disposed=true;unsubscribe();observer?.disconnect();}};
}
