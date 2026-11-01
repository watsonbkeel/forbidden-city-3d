import {hasShortcutModifier,isTextEntryTarget} from '../controls/InputTargets.js';

/** A small, recoverable help control. It does not own movement or pointer lock. */
export class HelpPanel {
 constructor({isMobile=false,anchor=null}={}){
  this.anchor=anchor;
  this.element=document.createElement('section');this.element.id='help-panel';
  this.button=document.createElement('button');this.button.type='button';this.button.textContent=isMobile?'操作帮助':'操作帮助 · ?';
  this.button.setAttribute('aria-controls','help-panel-body');
  this.body=document.createElement('div');this.body.id='help-panel-body';
  const lines=isMobile?[
   '左下方向盘移动；同方向推住2秒后加速','拖动画面转向；右下按钮跳跃与锁定视角','地图打开时仍可移动；地点卡可查看介绍','直升机面板可上下机、切视角及自动观光','安全落地后选择“下飞机”恢复步行',
  ]:[
   'WASD / 方向键移动；长按2秒后加速','鼠标转向；空格跳跃；Q / E 水平转向','M 打开地图，地图打开时仍可移动','H 上下直升机；空中须先安全落地','Esc 释放鼠标并打开飞行操作面板','点击面板“继续”返回飞行；? 收起帮助',
  ];
  for(const line of lines){const p=document.createElement('p');p.textContent=line;this.body.appendChild(p);}
  this.element.append(this.button,this.body);document.body.appendChild(this.element);
  this._click=e=>{e.stopPropagation();this.setExpanded(!this.expanded);};this.button.addEventListener('click',this._click);
  this._key=e=>{
   if(e.defaultPrevented||e.repeat||hasShortcutModifier(e)||isTextEntryTarget(e.target)||!(e.key==='?'||(e.code==='Slash'&&e.shiftKey)))return;
   e.preventDefault();this.setExpanded(!this.expanded);
  };
  window.addEventListener('keydown',this._key);this.setExpanded(false);
  this._layout=()=>this.placeBelow(this.anchor);window.addEventListener('resize',this._layout);
  if(anchor&&globalThis.ResizeObserver){this.observer=new ResizeObserver(this._layout);this.observer.observe(anchor);}
  this._layout();
 }
 placeBelow(anchor){const r=anchor?.getBoundingClientRect?.();if(!r||!Number.isFinite(r.bottom)||!Number.isFinite(r.left))return;const top=Math.max(8,r.bottom+8);this.element.style.top=`${top}px`;this.element.style.left=`${Math.max(8,r.left)}px`;this.body.style.maxHeight=`${Math.max(60,(window.innerHeight??757)-top-20)}px`;}
 setExpanded(value){this.expanded=!!value;this.body.hidden=!this.expanded;this.button.setAttribute('aria-expanded',String(this.expanded));}
 dispose(){window.removeEventListener('keydown',this._key);window.removeEventListener('resize',this._layout);this.observer?.disconnect();this.button.removeEventListener('click',this._click);this.element.remove();}
}
