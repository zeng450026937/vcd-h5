const groupMap = {
  'phone.book.favoritecontacts.root.name' : '常用联系人',
};

class FavoriteBase {
  constructor(data) {
    this.id = data.id;
    this.name = data.name || '';
    this.parent = data.parent;
    this.parentId = data.parentId || (data.parent && data.parent.id);
    this.isGroup = false;
  }
}
class FavoriteContact extends FavoriteBase {
  constructor(data) {
    super(data);
    this.number = data.number || '';
    this.phone = data.extension || '';
    this.email = data.email || '';
    this.avatar = 'indigo-dark';
    this.nick = /^(.*)\(.*\)$/.test(this.name) ? RegExp.$1.substr(-2, 2) : this.name.substr(-2, 2);
  }
}

class FavoriteContactGroup extends FavoriteBase {
  constructor(data) {
    super(data);
    this.name = groupMap[data.name] || data.name;
    this.isGroup = true;
    this.isUser = true;
    this.isRoot = !data.parent;
    this.fullPath = [];
    this.avatar = 'icon-zuzhi';

    if (!this.isRoot) {
      this.fullPath.push(...this.parent.fullPath);
    }
    this.fullPath.push({
      id   : this.id,
      text : this.name,
    });
  }
}

export { FavoriteBase, FavoriteContactGroup };

export function formatFavorite(data) {
  if (!data) return null;
  const isGroup = /ORG/.test(data.type);
  const contact = isGroup ? new FavoriteContactGroup(data) : new FavoriteContact(data);

  if (isGroup) {
    contact.items = data.child.map((c) => {
      c.parent = contact;

      return formatFavorite(c);
    });
    if (!contact.isRoot) {
      contact.amount = contact.amount || 0;
      contact.parent.amount = (contact.parent.amount || 0) + (contact.amount || 0);
    }
  }
  else if (contact.parent) {
    contact.parent.amount = (contact.parent.amount || 0) + 1;
  }

  return contact;
}
