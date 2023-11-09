

export default class Chart {
  constructor(id, chartType, option, left, top, width, height, cellRange, url) {
    this.id = id;
    this.chartType = chartType;
    this.option = option;
    this.url = url;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.cellRange = cellRange;
  }
}
