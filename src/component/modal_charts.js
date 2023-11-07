import Modal from './modal';
import { t } from '../locale/locale';
import { h } from './element';
import { cssPrefix } from '../config';
import Button from './button';

export default class ModalCharts extends Modal {
  constructor() {
    super(t('charts.modalCharts.title'), [
      h('div', `${cssPrefix}-chart-list`).children(
        h('div', 'chart-p').html('<span>柱状图</span>').on('click', () => {
          console.log('insert charts');
        }),
      ),
    ], '800px', true);

    const buttons = h('div', `${cssPrefix}-modal-footer`)
      .children(h('div', `${cssPrefix}-buttons`)
        .children(
          new Button('cancel').on('click', () => this.btnClick('cancel')),
          new Button('ok', 'primary').on('click', () => this.btnClick('ok')),
        ));
    this.el.child(buttons);
    this.ok = () => {};
  }


  btnClick(it) {
    if (it === 'ok') {
      this.ok('bar');
    }
    this.hide();
  }
}
