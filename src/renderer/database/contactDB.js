import Base from './base';

class ContactDB extends Base {
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

  async fullUpdate(storeName, data) {
    await this.clear(storeName);

    this.bulkAdd(storeName, data.map((item) => (
      {
        id          : item.node.id,
        parentId    : item.node.parentId == null ? 'rootNode' : item.node.parentId,
        attributes  : item.attributes,
        node        : item.node,
        dataVersion : Number(item.node.dataVersion),
      }
    )));
    // this.updateContactInfo(
    //   'dataVersion',
    //   'sn',
    //   1,
    //   { dataVersion, permissionVersion: data.data.permissionVersion }
    // );
  }

  async incrementUpdate(storeName, data) {
    data.forEach((item) => {
      this.updateContactInfo(storeName, 'id', item.node.id, {
        id          : item.node.id,
        parentId    : item.node.parentId == null ? 'rootNode' : item.node.parentId,
        attributes  : item.attributes,
        node        : item.node,
        dataVersion : Number(item.node.dataVersion),
      });
    });
  }
}

export default new ContactDB(
  'contactDB',
  {
    contacts         : '++sn, parentId, id, dataVersion',
    phoneBook        : '++sn, parentId, id, dataVersion',
    contactsVersion  : '++sn, dataVersion, permissionVersion',
    phoneBookVersion : '++sn, dataVersion, permissionVersion',
  },
  1
);
