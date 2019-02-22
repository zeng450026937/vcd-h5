import Base from './base';

export default class ContactDB extends Base {
  constructor(dbName, storesOpt, version) {
    super(dbName, storesOpt, version);
  }

  async updateContactInfo(storeName, key, val, data) {
    const contactCollection = this.find(storeName, key, val);
    const contactList = await contactCollection.toArray().then((contacts) => Promise.resolve(contacts));

    if (contactList.length > 0) {
      contactCollection.modify(data);
    }
    else {
      this.add(storeName, data);
    }
  }
}
