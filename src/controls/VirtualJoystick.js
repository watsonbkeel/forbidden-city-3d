/**
 * 虚拟摇杆控制器
 * 用于移动端触摸控制
 */

export class VirtualJoystick {
  constructor(container) {
    this.container = container;
    this.active = false;
    this.baseX = 0;
    this.baseY = 0;
    this.stickX = 0;
    this.stickY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.touchId = null;
    
    this.maxRadius = 50;
    
    this.createElements();
    this.bindEvents();
  }
  
  /**
   * 创建 DOM 元素
   */
  createElements() {
    // 摇杆底座
    this.base = document.createElement('div');
    this.base.className = 'joystick-base';
    this.base.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 80px;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      display: none;
      z-index: 1000;
    `;
    
    // 摇杆
    this.stick = document.createElement('div');
    this.stick.className = 'joystick-stick';
    this.stick.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.6);
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;
    
    this.base.appendChild(this.stick);
    this.container.appendChild(this.base);
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);
    this.container.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.container.addEventListener('touchend', this._onTouchEnd, { passive: false });
    this.container.addEventListener('touchcancel', this._onTouchEnd, { passive: false });
  }
  
  /**
   * 触摸开始处理
   */
  onTouchStart(e) {
    if (this.active) return;
    const touch = Array.from(e.changedTouches).find(t =>
      t.clientX < window.innerWidth / 3 &&
      t.clientY > window.innerHeight * 2 / 3 &&
      !t.target?.closest?.('button, a, input, select, textarea, [role="button"]')
    );
    if (!touch) return;
    e.preventDefault();
    this.touchId = touch.identifier;
    
    this.baseX = touch.clientX;
    this.baseY = touch.clientY;
    this.stickX = 0;
    this.stickY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.stick.style.transform = 'translate(-50%, -50%)';
    
    this.base.style.display = 'block';
    this.base.style.left = `${this.baseX - 50}px`;
    this.base.style.top = `${this.baseY - 50}px`;
    
    this.active = true;
  }
  
  /**
   * 触摸移动处理
   */
  onTouchMove(e) {
    if (!this.active) return;
    
    const touch = Array.from(e.changedTouches).find(t => t.identifier === this.touchId);
    if (!touch) return;
    e.preventDefault();
    
    const dx = touch.clientX - this.baseX;
    const dy = touch.clientY - this.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.maxRadius) {
      this.stickX = (dx / distance) * this.maxRadius;
      this.stickY = (dy / distance) * this.maxRadius;
    } else {
      this.stickX = dx;
      this.stickY = dy;
    }
    
    // 更新摇杆位置
    this.stick.style.transform = `translate(calc(-50% + ${this.stickX}px), calc(-50% + ${this.stickY}px))`;
    
    // 计算归一化的偏移量（-1 到 1）
    this.deltaX = this.stickX / this.maxRadius;
    this.deltaY = this.stickY / this.maxRadius;
  }
  
  /**
   * 触摸结束处理
   */
  onTouchEnd(e) {
    const touches = Array.from(e.changedTouches);
    const touch = touches.find(t => t.identifier === this.touchId);
    
    if (!touch) return;
    
    this.reset();
  }

  reset() {
    this.active = false;
    this.touchId = null;
    this.stickX = 0;
    this.stickY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.base.style.display = 'none';
    this.stick.style.transform = 'translate(-50%, -50%)';
  }
  
  /**
   * 获取当前偏移量
   */
  getDelta() {
    return {
      x: this.deltaX,
      y: this.deltaY,
    };
  }
  
  /**
   * 检查是否激活
   */
  isActive() {
    return this.active;
  }
  
  /**
   * 销毁
   */
  dispose() {
    this.container.removeEventListener('touchstart', this._onTouchStart);
    this.container.removeEventListener('touchmove', this._onTouchMove);
    this.container.removeEventListener('touchend', this._onTouchEnd);
    this.container.removeEventListener('touchcancel', this._onTouchEnd);
    this.reset();
    if (this.base && this.base.parentNode) {
      this.base.parentNode.removeChild(this.base);
    }
  }
}
