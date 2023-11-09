
// constructor(id, chartType, option, left, top, width, height, cellRange, url) {
//   this.id = id;
//   this.chartType = chartType;
//   this.option = option;
//   this.url = url;
//   this.left = left;
//   this.top = top;
//   this.width = width;
//   this.height = height;
//   this.cellRange = cellRange;
// }
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

  insert(id, img = {}) {
    this._[id] = img;
    this.len += 1;
  }

  delete(id) {
    delete this._[id];
    this.len -= 1;
  }
}
