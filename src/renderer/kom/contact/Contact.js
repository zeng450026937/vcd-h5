import rtc from '../../rtc';

const avatarColor = () => 'indigo-dark';

const groupMap = {
  root : {
    name   : '亿联网络技术股份有限公司',
    isRoot : true,
  },
  'phone.book.staff.root.name' : {
    name   : '联系人',
    isUser : true,
  },
  'phone.book.device.root.name' : {
    name     : '会议室设备',
    isDevice : true,
  },
  'phone.book.externalcontacts.root.name' : {
    name       : '其他联系人',
    isExternal : true,
  },
  其他联系人 : {
    name       : '其他联系人',
    isExternal : true,
  },
  'phone.book.vmr.root.name' : {
    name  : '虚拟会议室',
    isVMR : true,
  },
  'phone.book.servicenumber.root.name' : {
    name      : '服务号',
    isService : true,
  },
  亿联云视讯体验大厅与技术支持 : {
    name      : '亿联云视讯体验大厅与技术支持',
    isService : true,
  },
};

function unique(arr) {
  const result = {};

  for (let i = 0; i < arr.length; i++) {
    result[arr[i].id] = result[arr[i].id] ? result[arr[i].id] : arr[i];
  }

  return Object.values(result);
}

class ContactBase {
  constructor(data = {}) {
    this.id = data.id;
    this.parent = data.parent || { isUser: true };
    this.parentId = data.parentId || (data.parent && data.parent.id);
    this.selected = data.selected || false;
    this.isGroup = false;
    this.key = this.id;
    this.title = data.name || '';
    this.type = data.type || '';
  }

  toggleSelect(selected) {
    if (this.selected === selected) return;

    this.selected = selected;

    if (this.isGroup) {
      this.items.forEach((c) => {
        c.toggleSelect(selected);
      });
    }

    let parent = this.parent;

    while (parent) {
      if (!selected) {
        parent.selected = selected;
      }
      else {
        parent.selected = !parent.items.some((c) => !c.selected);
        if (!parent.selected) break;
      }

      parent = parent.parent;
    }
  }
}

class Contact extends ContactBase {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.number = data.number || '';
    if (data.number === rtc.account.username) {
      this.isSelf = true;
      rtc.account.currentContact = this;
    }
    this.phone = data.extension || '';
    this.email = data.email || '';
    this.avatar = this.parent.isUser ? avatarColor() : this.parent.avatar;
    this.scopedSlots = { title: 'title' }; // just for tree
    this.isLeaf = true; // just for tree
  }
}

class ContactGroup extends ContactBase {
  constructor(data = {}) {
    super(data);

    this.info = {};

    if (!data.parent) {
      Object.assign(this.info, {
        name   : data.name || '',
        isRoot : true,
      });
    }
    else if (this.parent.isRoot) {
      this.info = groupMap[data.name];
    }
    else {
      Object.assign(this.info, this.parent.info, {
        name : data.name || '',
      });
    }
    Object.keys(this.info).forEach((k) => {
      this[k] = this.info[k];
    });

    this.items = [];
    this.isGroup = true;
    this.amount = data.amount || 0;
    this.avatar = this.isUser ? 'icon-zuzhi'
      : this.isDevice ? 'icon-huiyishishebei'
        : this.isExternal ? 'icon-zuzhi'
          : this.isService ? 'icon-wangluo'
            : this.isVMR ? 'icon-xunihuiyishi' : 'icon-zuzhi';
    this.title = this.name; // for select
  }

  childNodes({ recursion = false, skip = 0, limit = 100 } = {}) {
    return this.amount > 0
      ? rtc.contact.phonebook.childNodes({ parentId: this.id, recursion, skip, limit })
      : Promise.resolve([]);
  }

  addChildNodes(recursion = false) {
    if (recursion) {
      this.items.forEach((g) => {
        if (g.isGroup && !g.hasLoad) {
          g.addChildNodes(recursion);
        }
      });
    }
    if (this.hasLoad) return Promise.resolve();
    this.hasLoad = true;

    return this.childNodes().then((val) => {
      const selected = this.selected;
      const res = val.data.data;
      const contactItems = res ? res.map((c) => new Contact(
        Object.assign({}, c.attributes, c.node, { parent: this, selected })
      )) || [] : [];

      // NOTICE the param'seq is fixed
      this.items = unique([ ...this.items, ...contactItems ]);
    });
  }
}

export default {
  groupMap,
  ContactBase,
  Contact,
  ContactGroup,
};

export function formatContact(data, loadMode) {
  if (!data || Object.keys(data).length <= 0) return null;
  const isGroup = /ORG/.test(data.type);
  const contact = isGroup ? new ContactGroup(data) : new Contact(data);

  if (isGroup) {
    contact.hasLoad = loadMode !== 'SPLIT';
    contact.items = data.child.map((c) => {
      c.parent = contact;

      return formatContact(c, loadMode);
    });
    contact.children = contact.items; // for select
    if (!contact.isRoot) {
      contact.amount = contact.amount || 0;
      contact.parent.amount += contact.amount || 0;
    }
    else {
      contact.loadMode = loadMode;
    }
  }
  else if (loadMode !== 'SPLIT' && contact.parent) {
    contact.parent.amount += 1;
  }

  return contact;
}
