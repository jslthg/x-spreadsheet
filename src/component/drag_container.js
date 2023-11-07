/* eslint-env browser */
import { Element, h } from './element';
import { cssPrefix } from '../config';
import { guid } from '../utils/guid';
import { tf } from '../locale/locale';
import { bindClickoutside, unbindClickoutside } from './event';


const menuItems = [
  { key: 'delete', title: tf('contextmenu.delete'), label: '' },
  { key: 'setup', title: tf('contextmenu.setup'), label: '' },
];

function buildMenuItem(item) {
  if (item.key === 'divider') {
    return h('div', `${cssPrefix}-item divider`);
  }
  return h('div', `${cssPrefix}-item`)
    .on('click', () => {
      this.itemClick(item.key);
      this.hide();
    })
    .children(
      item.title(),
      h('div', 'label').child(item.label || ''),
    );
}

function buildMenu(defaultMenus = []) {
  if (defaultMenus.length > 0) {
    return defaultMenus.map(it => buildMenuItem.call(this, it));
  }
  return menuItems.map(it => buildMenuItem.call(this, it));
}

class DragMenu {
  constructor(viewFn, defaultMenus = []) {
    this.menuItems = buildMenu.call(this, defaultMenus);
    this.el = h('div', `${cssPrefix}-drag-menu`)
      .children(...this.menuItems)
      .hide();
    this.viewFn = viewFn;
    this.itemClick = () => {};
  }


  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setPosition(x, y) {
    const { el } = this;
    el.show();
    const view = this.viewFn;
    el.css('left', `${x - view.left - 60}px`);
    el.css('top', `${y - view.top - 60}px`);

    bindClickoutside(el);
  }
}

export default class DragContainer extends Element {
  constructor(domEl, left = 0, top = 0, width = 0, height = 0) {
    // const { clientHeight, clientWidth } = document.documentElement;
    // const left = (clientWidth - width) / 2;
    // const top = (clientHeight - height) / 3;
    if (width <= 0 || height <= 0) {
      width = 400;
      height = 300;
    }
    super('div', `${cssPrefix}-drag-container`);
    this.attr('id', guid());

    this.contextMenu = new DragMenu({ left, top });
    this.children(
      h('div', `drag-content`).children(domEl)
        .on('mousedown', e => this.onMousedown(e)),
      h('div', `drag-circle`).children(
        h('div', `cc top-left`).on('mousedown', e => this.onResize(e, 'tl')),
        h('div', `cc top-center`).on('mousedown', e => this.onResize(e, 'tc')),
        h('div', `cc top-right`).on('mousedown', e => this.onResize(e, 'tr')),
        h('div', `cc middle-left`).on('mousedown', e => this.onResize(e, 'ml')),
        h('div', `cc middle-right`).on('mousedown', e => this.onResize(e, 'mr')),
        h('div', `cc bottom-left`).on('mousedown', e => this.onResize(e, 'bl')),
        h('div', `cc bottom-center`).on('mousedown', e => this.onResize(e, 'bc')),
        h('div', `cc bottom-right`).on('mousedown', e => this.onResize(e, 'br')),
      ),
      h('div', `${cssPrefix}-drag-mover`),
      this.contextMenu.el,
    );

    const css = {
      left: `${left}px`,
      top: `${top}px`,
    };

    Object.assign(css, { height: `${height}px`, width: `${width}px` });
    this.css(css);
    this.on('click', () => { this.selected(); });
    // 默认选择当前
    setTimeout(() => {
      this.selected();
    }, 100);

    this.contextMenu.itemClick = (type) => {
      this.menuClick(type);
    };

    this.resize = () => {};
  }

  menuClick(type) {
    const { el } = this;
    if (type === 'delete') {
      const overEl = this.parent();
      overEl.removeChild(el);
    }
  }

  selected() {
    const overEl = this.parent();
    if (overEl.el) {
      const thisId = this.getId();
      const children = overEl.children() || [];
      children.forEach((x) => {
        const n = new Element(x);
        if (n.hasClass(`${cssPrefix}-drag-container`) && n.attr('id') !== thisId) {
          n.active(false);
        }
      });
      this.active(true);
    }
  }

  /**
   * 调整大小
    * @param ev
   * @param type
   */
  onResize(ev, type) {
    if (!this.hasClass('active')) {
      return;
    }
    ev.preventDefault();
    const that = this;
    const { el } = this;
    // 获取左上角坐标
    const elTlx = el.offsetLeft;
    const elTly = el.offsetTop;
    // 获取右上角坐标
    const elTrx = el.offsetLeft + el.offsetWidth;
    const elTry = el.offsetTop;
    // 获取左下角坐标
    const elBlx = el.offsetLeft;
    const elBly = el.offsetTop + el.offsetHeight;
    // 获取右下角坐标
    const elBrx = el.offsetLeft + el.offsetWidth;
    const elBry = el.offsetTop + el.offsetHeight;

    const minOffset = 20;
    document.onmousemove = function (e) {
      let left = e.clientX;
      let top = e.clientY;
      if (type === 'tl') {
        if (left > elBrx - minOffset) {
          left = elBrx - minOffset;
        }
        if (top > elBry - minOffset) {
          top = elBry - minOffset;
        }
        const width = elBrx - left;
        const height = elBry - top;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
      } else if (type === 'tc') {
        if (top > elBly - minOffset) {
          top = elBly - minOffset;
        }
        const height = elBly - top;
        el.style.height = `${height}px`;
        el.style.top = `${top}px`;
      } else if (type === 'tr') {
        if (left < elBlx + minOffset) {
          left = elBlx + minOffset;
        }
        if (top > elBly - minOffset) {
          top = elBly - minOffset;
        }
        const width = left - elBlx;
        const height = elBly - top;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.left = `${elBlx}px`;
        el.style.top = `${top}px`;
      } else if (type === 'ml') {
        if (left > elBrx - minOffset) {
          left = elBrx - minOffset;
        }
        const width = elBrx - left;
        el.style.width = `${width}px`;
        el.style.left = `${left}px`;
      } else if (type === 'mr') {
        if (left < elBlx + minOffset) {
          left = elBlx + minOffset;
        }
        const width = left - elBlx;
        el.style.width = `${width}px`;
      } else if (type === 'bl') {
        if (left > elTrx - minOffset) {
          left = elTrx - minOffset;
        }
        if (top < elTry + minOffset) {
          top = elTry + minOffset;
        }
        const width = elTrx - left;
        const height = top - elTry;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.left = `${left}px`;
        el.style.top = `${elTry}px`;
      } else if (type === 'bc') {
        if (top < elTly + minOffset) {
          top = elTly + minOffset;
        }
        const height = top - elTly;
        el.style.height = `${height}px`;
      } else if (type === 'br') {
        if (left < elTlx + minOffset) {
          left = elTlx + minOffset;
        }
        if (top < elTly + minOffset) {
          top = elTly + minOffset;
        }
        const width = left - elTlx;
        const height = top - elTly;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
      }
    };

    // 释放鼠标
    document.onmouseup = function (e) { // 当鼠标弹起来的时候不再移动
      that.resize();
      this.onmousemove = null;
      this.onmouseup = null; // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
    };
  }

  onMousedown(ev) {
    if (!this.hasClass('active')) {
      return;
    }
    const { el, contextMenu } = this;
    const diffX = ev.clientX - el.offsetLeft;
    const diffY = ev.clientY - el.offsetTop;

    // contextMenu.hide();
    if (ev.button === 2) {
      contextMenu.setPosition(ev.clientX, ev.clientY);
    } else {
      document.onmousemove = function (e) {
        let left = e.clientX - diffX;
        let top = e.clientY - diffY;

        // 控制拖拽物体的范围只能在浏览器视窗内，不允许出现滚动条
        if (left < 0) {
          left = 0;
        } else if (left > window.innerWidth - el.offsetWidth) {
          left = window.innerWidth - el.offsetWidth;
        }
        if (top < 0) {
          top = 0;
        } else if (top > window.innerHeight - el.offsetHeight) {
          top = window.innerHeight - el.offsetHeight;
        }

        // 移动时重新得到物体的距离，解决拖动时出现晃动的现象
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
      };
      // 释放鼠标
      document.onmouseup = function (e) { // 当鼠标弹起来的时候不再移动
        this.onmousemove = null;
        this.onmouseup = null; // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
      };
    }
    ev.stopPropagation();
  }

  /**
   * 获取dom id
   * @returns {*|Element}
   */
  getId() {
    return this.attr('id');
  }
}
