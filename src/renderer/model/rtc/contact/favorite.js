import axios from 'axios';
import URL from 'url';
import { BaseContact } from './base-contact';

export class Favorite extends BaseContact {
  async sync(type = this.type) {
    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/favoriteContacts/sync`;
    url.query = {
      ...this.auth,
      type,
    };

    const res = await axios.get(URL.format(url));
    const data = this.checkRespones(res);

    return data.dataList;
  }

  async addCategory(options) {
    // { contactsId, type } = contacts
    const { name, contacts } = options;

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/favoriteContacts/category/add`;
    const param = {
      ...this.auth,
      name,
      contacts,
    };

    const res = await axios.post(URL.format(url), param);
    const data = this.checkRespones(res);

    return data;
  }

  async deleteCategory(options) {
    const { id } = options;

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/favoriteContacts/category/delete`;
    const param = {
      ...this.auth,
      id,
    };

    const res = await axios.post(URL.format(url), param);
    const data = this.checkRespones(res);

    return data;
  }

  async editCategory(options) {
    // { contactsId, type } = contacts
    const { id, name, contacts } = options;

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/favoriteContacts/category/edit`;
    const param = {
      ...this.auth,
      id,
      name,
      contacts,
    };

    const res = await axios.post(URL.format(url), param);
    const data = this.checkRespones(res);

    return data;
  }

  async updateCategoryIndex(options) {
    const { id, type, index, parentId } = options;

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/favoriteContacts/category/updateIndex`;
    const param = {
      ...this.auth,
      id,
      type,
      index,
      parentId,
    };

    const res = await axios.post(URL.format(url), param);
    const data = this.checkRespones(res);

    return data;
  }

  async add(options) {
    const { contactsId, type, categoryIds } = options;

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/favoriteContacts/add`;
    const param = {
      ...this.auth,
      type,
      contactsId,
      categoryIds,
    };

    const res = await axios.post(URL.format(url), param);
    const data = this.checkRespones(res);

    return data;
  }

  async delete(options) {
    // {categoryId: '',contacts: ''} = relations
    const { relations } = options;

    const url = URL.parse(this.url);

    url.pathname = `/api/${this.apiVersion}/external/favoriteContacts/delete`;
    const param = {
      ...this.auth,
      relations,
    };

    const res = await axios.post(URL.format(url), param);
    const data = this.checkRespones(res);

    return data;
  }
}
