/***
 * author:1494
 * date:2019/5/8
 * description: 模拟后端接口
 * use：new Paging(data)
 */
export default class Paging {
  constructor(data = [], filter, sort) {
    this.data = data;
    this.params = {};
    this.filter = filter;
    this.sort = sort;
  }

  setData(data) {
    this.data = data;
  }

  setFilter(filter) {
    this.filter = filter;
  }

  setSort(sort) {
    this.sort = sort;
  }
  /**
   * 过滤操作
   * @returns {any}
   */
  getFilter() {
    return this.filter ? this.data.filter(this.filter) : this.data;
  }

  getPagedList(params) {

    return  new Promise(resolve => {

      this.params = params;

      const data = this.getFilter();
      const {skip, limit} = this.params;
      const total = data.length;
      resolve({
        ret: total,
        data: Object.assign({
          total,
          data: data.slice(skip, skip + limit)
        }, this.params)
      });
    });
  }
}