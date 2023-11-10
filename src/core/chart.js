
export default class Charts {
  constructor(len) {
    this._ = {};
    this.len = len;
  }

  setData(d) {
    if (d.len) {
      this.len = d.len;
      delete d.len;
    }
    this._ = d;
  }

  getData() {
    const { len } = this;
    return Object.assign({ len }, this._);
  }

  get(id) {
    return this._[id];
  }

  insert(id, chart = {}) {
    this._[id] = chart;
    this.len += 1;
  }

  delete(id) {
    delete this._[id];
    this.len -= 1;
  }
}
