import Axios from 'axios';
import URL from 'url';
import BaseInfo from './BaseInfo';
import { deepClone } from '../Utils';

export default BaseInfo.extend({
  methods : {
    doSync(params = {}) {
      const { type } = params;
      const url = deepClone(this.$parent.syncUrl);

      url.pathname = `/api/${this.$parent.version}/external/favoriteContacts/sync`;

      return this._doSync({
        url, type,
      });
    },
    async categoryAdd({ groupName, contacts } = {}) {
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/favoriteContacts/category/add`;

      const params = Object.assign(url.query || {}, {
        name : groupName,
        contacts,
      });

      url.query = {};
      const { data } = await Axios.post(URL.format(url), params);

      if (data.ret <= 0) return Promise.reject(data.error);
      
      return Promise.resolve(data);
    },

    async categoryDelete({ id } = {}) {
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/favoriteContacts/category/delete`;

      const params = Object.assign(url.query || {}, {
        id,
      });

      url.query = {};
      const { data } = await Axios.post(URL.format(url), params);

      if (data.ret <= 0) return Promise.reject(data.error);

      return Promise.resolve(data);
    },

    async categoryEdit({ id, name, contacts } = {}) {
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/favoriteContacts/category/edit`;

      const params = Object.assign(url.query || {}, {
        id,
        name,
        contacts,
      });

      url.query = {};
      const { data } = await Axios.post(URL.format(url), params);

      if (data.ret <= 0) return Promise.reject(data.error);

      return Promise.resolve(data);
    },

    async categoryUpdateIndex({ id, type, index, parentId } = {}) {
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/favoriteContacts/category/updateIndex`;

      const params = Object.assign(url.query || {}, {
        id,
        type,
        index,
        parentId,
      });

      url.query = {};
      const { data } = await Axios.post(URL.format(url), params);

      if (data.ret < 0) return Promise.reject(data.error);
      
      return Promise.resolve(data);
    },
    async add({ contactsId, type, categoryIds } = {}) {
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/favoriteContacts/add`;

      const params = Object.assign(url.query || {}, {
        type,
        contactsId,
        categoryIds,
      });

      url.query = {};
      const { data } = await Axios.post(URL.format(url), params);

      if (data.ret < 0) return Promise.reject(data.error);

      return Promise.resolve(data);
    },

    async delete({ relations } = {}) { // {categoryId: '',contacts: ''}
      const url = deepClone(this.$parent.syncUrl);

      if (!url) return Promise.reject();

      url.pathname = `/api/${this.$parent.version}/external/favoriteContacts/delete`;

      const params = Object.assign(url.query || {}, {
        relations,
      });

      url.query = {};
      const { data } = await Axios.post(URL.format(url), params);

      if (data.ret < 0) return Promise.reject(data.error);

      return Promise.resolve(data);
    },


  },
});
