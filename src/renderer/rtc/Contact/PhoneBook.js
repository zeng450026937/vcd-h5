import Axios from 'axios';
import URL from 'url';
import BaseInfo from './BaseInfo';
import { deepClone } from '../Utils';

const PHONE_MODE_LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

export default BaseInfo.extend({
  data() {
    return {
      org : {
        list  : null,
        tree  : null,
        map   : null,
        count : 0,
      },
    };
  },
  methods : {
    _reset() {
      this.org.list = null;
      this.org.tree = null;
      this.org.map = null;
      this.org.count = 0;
    },
    async doSync(params = {}) {
      const { type } = params;

      if (this.$parent.loadMode === PHONE_MODE_LOAD_MODE.SPLIT) {
        const result = await this.orgTree();

        return result;
      }

      const url = deepClone(this.$parent.syncUrl);

      url.pathname = `/api/${this.$parent.version}/external/phonebook/sync`;

      return this._doSync({
        url, type,
      });
    },
    async childNodes({ parentId, recursion = false, skip = 0, limit = 40 } = {}) {
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/phonebook/childNodes`;

      Object.assign(url.query, { //
        parentId,
        recursion,
        skip,
        limit,
      });

      const { data } = await Axios.get(URL.format(url));

      if (data.ret < 0) return Promise.reject(data.error);

      return data;
    },
    async orgTree() {
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/phonebook/orgTree`;
      const { data } = await Axios.get(URL.format(url));

      if (data.ret <= 0) return Promise.reject(data.error);

      // this.orgTree = data.data;
      this.org.list = data.data.dataList;
      this.org.count = data.data.count;

      const result = this.listToTreeAndMap(this.org.list);

      this.org.tree = result.tree;
      this.org.map = result.map;

      return Promise.resolve(data);
    },

    /**
     * 联系人搜索 V3 之后才会有
     * @param key
     * @param ids
     * @param numbers
     * @returns {Promise<*>}
     */
    async search({ key = '', ids, numbers } = {}) { // ids number undefined ?
      // 判断当前接口的版本
      if ([ 'v1', 'v2' ].some((v) => v === this.$parent.version)) return Promise.reject(new Error(`当前版本为${this.$parent.version}，暂不支持搜素`));

      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/phonebook/search`;
      const options = Object.create({});

      if (key) Object.assign(options, { key });
      if (ids) Object.assign(options, { ids });
      if (numbers) Object.assign(options, { numbers });
      Object.assign(url.query, options);

      const { data } = await Axios.get(URL.format(url));

      if (data.ret < 0) return Promise.reject(data.error);

      return Promise.resolve(this.$parent.loadMode === 'SPLIT' ? data.data.data : data.data);
    },
  },
});
