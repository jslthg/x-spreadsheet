import Modal from './modal';
import { t } from '../locale/locale';
import { h } from './element';
import { cssPrefix } from '../config';
import Button from './button';
import FormField from './form_field';
import FormInput from './form_input';

export default class ModalSlash extends Modal {
  constructor() {
    const txt = new FormField(
      new FormInput('100%', ''),
      { required: true },
    );
    super(t('slash.modal.title'), [
      h('div', `${cssPrefix}-modal-slash`).children(
        h('div', 'form-item').children(
          h('div', 'form-item-label').children(
            h('label', '').html('example:aaa|bbb'),
          ),
          h('div', 'form-item-control').children(txt.el),
        ),
      ),
    ], '300px');

    const buttons = h('div', `${cssPrefix}-modal-footer`)
      .children(h('div', `${cssPrefix}-buttons`)
        .children(
          new Button('cancel').on('click', () => this.btnClick('cancel')),
          new Button('ok', 'primary').on('click', () => this.btnClick('ok')),
        ));
    this.input = txt;
    this.el.child(buttons);
    this.ok = () => {};
  }

  btnClick(it) {
    if (it === 'ok') {
      this.ok(this);
    }
    this.hide();
  }

  setValue(cell = null) {
    const { input } = this;
    input.val(cell != null ? cell.text : '');
  }
}
