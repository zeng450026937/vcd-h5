/* eslint-disable import/no-extraneous-dependencies,new-cap,consistent-return */
import Vue from 'vue';
import Axios from 'axios';
import URL from 'url';
import { arrayfy } from '../Utils';

const PHONE_BOOK_TYPE = {
  STAFF             : 'STAFF',
  DEVICE            : 'DEVICE',
  VMR               : 'VMR',
  EXTERNAL_CONTACTS : 'EXTERNAL_CONTACTS',
  SERVICE_NUMBER    : 'SERVICE_NUMBER',
};

export default Vue.extend({
  data() {
    return {
      syncUrl : '',
      count   : 0,
      map     : null,
      list    : null,
      tree    : null,
    };
  },
  computed : {
    username() {
      return this.$parent.username;
    },
    password() {
      return this.$parent.aesPassword;
    },
  },
  methods : {
    _reset() {
      this.list = null;
      this.tree = null;
      this.map = null;
      this.count = 0;
    },
    async _doSync(params) {
      const { url, type } = params;

      url.query.type = arrayfy(type || Object.values(PHONE_BOOK_TYPE)).join(',');
      this.syncUrl = url;

      const { data } = await Axios.get(URL.format(url));

      if (data.ret <= 0) return Promise.reject(data.error);

      this.count = data.data.count;
      this.list = data.data.dataList;

      const result = this.listToTreeAndMap(this.list);

      this.tree = result.tree;
      this.map = result.map;
    },
    listToTreeAndMap(list) {
      let rootId = 0;

      const nodes = list.reduce((pre, cur) => {
        if (!cur.node.parentId) rootId = cur.node.id;
        cur.attributes.child = [];
        cur.attributes.parent = cur.node.parentId;
        cur.attributes.type = cur.node.type;
        cur.attributes.id = cur.node.id;
        pre[cur.node.id] = cur.attributes;

        return pre;
      }, {});

      Object.keys(nodes).forEach((id) => {
        const node = nodes[id];

        if (!node.parent) return;

        const parentId = node.parent;
        const parentNode = nodes[parentId];

        parentNode.child.push(node);
      });

      return {
        tree : nodes[rootId],
        map  : nodes,
      };
    },
  },
});
