import rtc from '../../rtc';
import kom from '..';

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
  'phone.book.vmr.root.name' : {
    name  : '虚拟会议室',
    isVMR : true,
  },
  'phone.book.servicenumber.root.name' : {
    name      : '服务号',
    isService : true,
  },
};

function unique(arr) {
  const result = {};

  for (let i = 0; i < arr.length; i++) {
    result[arr[i].id] = result[arr[i].id] || arr[i];
  }

  return Object.values(result);
}

class ContactBase {
  constructor(data = {}) {
    this.id = data.id;
    this.parent = data.parent || { isUser: true };
    this.parentId = data.parentId || (data.parent && data.parent.id);
    this.isGroup = false;
    this.key = this.id;
    this.title = data.name || '';
    this.type = data.type || '';
  }
}

class Contact extends ContactBase {
  constructor(data = {}) {
    super(data);
    this.name = data.name || '';
    this.nick = /^(.*)\(.*\)$/.test(this.name) ? RegExp.$1.substr(-2, 2) : this.name.substr(-2, 2);
    this.number = data.number || '';
    if (data.number === rtc.account.username) {
      this.isSelf = true;
      kom.vm.contact.currentContact = this;
    }
    this.phone = data.extension || '';
    this.email = data.email || '';
    this.avatar = this.parent.isUser ? '' : this.parent.avatar;
    this.scopedSlots = { title: 'title' }; // just for tree/
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
      this.info = groupMap[data.name] || Object.assign({}, groupMap[data.i18nKey], { name: data.name });
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
      const res = val.data.data;
      const contactItems = res ? res.map((c) => new Contact(
        Object.assign({}, c.attributes, c.node, { parent: this })
      )) || [] : [];

      // NOTICE the param'seq is fixed
      this.items = unique([ ...this.items, ...contactItems ]);
      this.children = this.items;
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
    contact.children = contact.items; // for tree
    if (!contact.isRoot) {
      contact.amount = contact.amount || 0;
      contact.parent.amount += contact.amount || 0;
      contact.level = () => contact.parent.level() + 1;
    }
    else {
      contact.loadMode = loadMode;
      contact.level = () => 1;
    }
  }
  else if (loadMode !== 'SPLIT' && contact.parent) {
    contact.parent.amount += 1;
    contact.level = () => contact.parent.level() + 1;
  }

  return contact;
}
