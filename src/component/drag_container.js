/* eslint-env browser */
import { Element, h } from './element';
import { cssPrefix } from '../config';
import { tf } from '../locale/locale';
import { bindClickoutside, unbindClickoutside } from './event';
import helper from '../core/helper';


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
  constructor(defaultMenus = []) {
    this.menuItems = buildMenu.call(this, defaultMenus);
    this.el = h('div', `${cssPrefix}-drag-menu`)
      .children(...this.menuItems)
      .hide();
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
    el.css('left', `${x}px`);
    el.css('top', `${y}px`);

    bindClickoutside(el);
  }
}


function getMoveOffset(e, diffX, diffY) {
  const { el } = this;
  let left = e.clientX - diffX;
  let top = e.clientY - diffY;

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
  return { left, top };
}

function changeData(left, top) {
  const { dp } = this;
  let t;
  // 更新dp内部数据
  if (this.hasClass('chart')) {
    t = dp.charts.get(this.getId());
  } else if (this.hasClass('image')) {
    t = dp.images.get(this.getId());
  }
  if (t != null && t !== undefined) {
    const sc2 = dp.getCellRectByXY(left, top);
    const ec2 = dp.getCellRectByXY(left + t.width, top + t.height);
    Object.assign(t,
      {
        top,
        left,
        cellRange:
              {
                sc: { ri: sc2.ri, ci: sc2.ci },
                ec: { ri: ec2.ri, ci: ec2.ci },
              },
      });
  }
}


export default class DragContainer extends Element {
  constructor(dp, domEl, left = 0, top = 0, width = 400, height = 300, type = 'image') {
    super('div', `${cssPrefix}-drag-container ${type}`);
    const id = helper.guid();
    this.attr('id', id);
    domEl.attr('id', `${id}_cm`);
    this.dp = dp;
    this.contextMenu = new DragMenu();
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


    this.offset({
      left, top, height, width,
    });
    this.on('click', () => { this.selected(); });
    // 默认选择当前
    setTimeout(() => {
      this.selected();
    }, 100);

    this.contextMenu.itemClick = (t) => {
      this.menuClick(t);
    };

    this.resize = () => {};
    this.move = () => {};
  }

  menuClick(type) {
    const { el, dp } = this;
    if (type === 'delete') {
      const overEl = this.parent();
      overEl.removeChild(el);
      if (this.hasClass('image')) {
        dp.images.delete(this.getId());
      } else if (this.hasClass('chart')) {
        dp.charts.delete(this.getId());
      }
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
    const s = this.offset();
    // 获取左上角坐标
    const elTlx = s.left;
    const elTly = s.top;
    // 获取右上角坐标
    const elTrx = s.left + s.width;
    const elTry = s.top;
    // 获取左下角坐标
    const elBlx = s.left;
    const elBly = s.top + s.height;
    // 获取右下角坐标
    const elBrx = s.left + s.width;
    const elBry = s.top + s.height;

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
        that.offset({
          left, top, width, height,
        });
      } else if (type === 'tc') {
        if (top > elBly - minOffset) {
          top = elBly - minOffset;
        }
        const height = elBly - top;
        that.offset({
          top, height,
        });
      } else if (type === 'tr') {
        if (left < elBlx + minOffset) {
          left = elBlx + minOffset;
        }
        if (top > elBly - minOffset) {
          top = elBly - minOffset;
        }
        const width = left - elBlx;
        const height = elBly - top;
        that.offset({
          top, width, height,
        });
      } else if (type === 'ml') {
        if (left > elBrx - minOffset) {
          left = elBrx - minOffset;
        }
        const width = elBrx - left;
        that.offset({
          left, width,
        });
      } else if (type === 'mr') {
        if (left < elBlx + minOffset) {
          left = elBlx + minOffset;
        }
        const width = left - elBlx;
        that.offset({
          width,
        });
      } else if (type === 'bl') {
        if (left > elTrx - minOffset) {
          left = elTrx - minOffset;
        }
        if (top < elTry + minOffset) {
          top = elTry + minOffset;
        }
        const width = elTrx - left;
        const height = top - elTry;
        that.offset({
          left, width, height,
        });
      } else if (type === 'bc') {
        if (top < elTly + minOffset) {
          top = elTly + minOffset;
        }
        const height = top - elTly;
        that.offset({ height });
      } else if (type === 'br') {
        if (left < elTlx + minOffset) {
          left = elTlx + minOffset;
        }
        if (top < elTly + minOffset) {
          top = elTly + minOffset;
        }
        const width = left - elTlx;
        const height = top - elTly;
        that.offset({ width, height });
      }
    };

    // 释放鼠标
    document.onmouseup = function () {
      const { left, top } = that.offset();
      const { rowHeight, colWidth } = that.getFirstCell(left, top);
      that.offset({ left: colWidth, top: rowHeight });
      // 更新dp内部数据

      changeData.call(that, colWidth, rowHeight);

      that.resize(that);
      this.onmousemove = null;
      this.onmouseup = null;
    };
  }

  onMousedown(ev) {
    if (!this.hasClass('active')) {
      return;
    }
    const that = this;
    const { el, contextMenu } = this;
    const diffX = ev.clientX - el.offsetLeft;
    const diffY = ev.clientY - el.offsetTop;

    contextMenu.hide();
    if (ev.button === 2) {
      const { left, top } = this.offset();
      contextMenu.setPosition(ev.clientX - left - 60, ev.clientY - top - 60);
    } else {
      document.onmousemove = function (e) {
        const { left, top } = getMoveOffset.call(that, e, diffX, diffY);
        that.offset({ left, top });
      };
      // 释放鼠标
      document.onmouseup = function (e) {
        const { left, top } = getMoveOffset.call(that, e, diffX, diffY);
        const { rowHeight, colWidth } = that.getFirstCell(left, top);
        that.offset({ left: colWidth, top: rowHeight });

        // 更新dp内部数据
        changeData.call(that, colWidth, rowHeight);

        that.move(that);
        this.onmousemove = null;
        this.onmouseup = null;
      };
    }
    ev.stopPropagation();
  }

  getFirstCell(left, top) {
    const { dp } = this;
    const firstCell = dp.getCellRectByXY(left, top);

    let rowHeight = 0; let colWidth = 0;
    for (let i = 0; i <= firstCell.ri; i += 1) {
      rowHeight += dp.rows.getHeight(i);
    }
    for (let i = 0; i <= firstCell.ci; i += 1) {
      colWidth += dp.cols.getWidth(i);
    }
    return { rowHeight, colWidth };
  }

  /**
   * 获取dom id
   * @returns {*|Element}
   */
  getId() {
    return this.attr('id');
  }
}
