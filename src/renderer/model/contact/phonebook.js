import axios from 'axios';
import URL from 'url';
import { BaseContact } from './base-contact';

export class PhoneBook extends BaseContact {
  async sync(type = this.type) {
    if (this.loadmode === BaseContact.LOAD_MODE.SPLIT) {
      logger.warn(`phonebook load mode: ${BaseContact.LOAD_MODE.SPLIT}, maybe use orgTree() & childNodes() instead`);

      const data = await this.orgTree();

      return data;
    }

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/phonebook/sync`;
    url.query = {
      ...this.auth,
      // dataVersion: this.dataVersion,
      // permissionVersion: this.permissionVersion,
      type,
    };

    const res = await axios.get(URL.format(url));
    const data = this.checkRespones(res);

    // maybe update dataVersion & permissionVersion
    // this.permissionVersion = data.permissionVersion;
    // this.dataVersion = data.dataList[0].node.dataVersion;

    return data.dataList;
  }

  async childNodes(options) {
    const {
      parentId,
      recursion = false,
      skip = 0,
      limit = 40,
    } = options;

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/phonebook/childNodes`;
    url.query = {
      ...this.auth,
      parentId,
      recursion,
      skip,
      limit,
    };
    
    const res = await axios.get(URL.format(url));
    const data = this.checkRespones(res);

    return data;
  }

  async orgTree() {
    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/phonebook/orgTree`;
    url.query = {
      ...this.auth,
    };
    
    const res = await axios.get(URL.format(url));
    const data = this.throwIfError(res);

    return data.dataList;
  }

  // 联系人搜索 V3 之后才会有
  // const {
  //  key,
  //  ids,
  //  numbers,
  // } = options;
  async search(options) {
    if ([ 'v1', 'v2' ].indexOf(this.apiVersion) !== -1) throw new Error('not support');

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/phonebook/search`;
    url.query = {
      ...this.auth,
      ...options,
    };
    
    const res = await axios.get(URL.format(url));
    const data = this.throwIfError(res);

    return this.loadmode === BaseContact.LOAD_MODE.SPLIT ? data.data : data;
  }
}
