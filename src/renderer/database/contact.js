import Base from './base';

class Contact extends Base {
  async updateContactInfo(storeName, key, val, data) {
    const contactCollection = this.find(storeName, key, val);
    const contactList = await contactCollection.toArray();

    return contactList.length > 0
      ? contactCollection.modify(data)
      : this.add(storeName, data);
  }

  async fullUpdate(storeName, data) {
    await this.clear(storeName);

    this.bulkAdd(storeName, data.map((item) => (
      {
        id          : item.node.id,
        parentId    : item.node.parentId == null ? 'rootNode' : item.node.parentId,
        attributes  : item.attributes,
        node        : item.node,
        type        : item.node.type,
        dataVersion : Number(item.node.dataVersion),
      }
    )));
  }

  async incrementUpdate(storeName, data) {
    this.db.transaction('rw', this.db[storeName], () => {
      data.forEach((item) => {
        this.updateContactInfo(storeName, 'id', item.node.id, {
          id          : item.node.id,
          parentId    : item.node.parentId == null ? 'rootNode' : item.node.parentId,
          attributes  : item.attributes,
          node        : item.node,
          type        : item.node.type,
          dataVersion : Number(item.node.dataVersion),
        });
      });
    });
  }

  getAllStaff(storeName) {
    return this.find(storeName, 'type', 'STAFF').toArray();
  }

  getAllGroup(storeName) {
    return this.find(storeName, 'type', 'ORG').toArray();
  }

  getChild(storeName, id) {
    return this.find(storeName, 'parentId', id).toArray();
  }

  getLocalContact(val) {
    return this.find('localContact', '[account+server]', val).toArray();
  }

  searchLocalContact(key, val) {
    return this.find('localContact', key, val).toArray();
  }
}

export default new Contact(
  'contactDB',
  {
    contacts         : '++sn, parentId, id, type, dataVersion',
    phoneBook        : '++sn, parentId, id, type, dataVersion',
    localContact     : '++sn, number, name, phone, [account+server], [account+server+id]',
    contactsVersion  : '++sn, dataVersion, permissionVersion',
    phoneBookVersion : '++sn, dataVersion, permissionVersion',
  },
  1
);
