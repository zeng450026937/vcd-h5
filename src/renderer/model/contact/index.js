import Vuem from '../vuem';
import rtc from '../../rtc';
import localContact from './local-contact';
import Store from './store';

const model = new Vuem();

const userType = {
  STAFF : {
    isUser : true,
  },
  EXTERNAL_CONTACTS : {
    isExternal : true,
  },
  VMR : {
    isVMR : true,
  },
  DEVICE : {
    isDevice : true,
  },
  THIRD_PARTY_DEVICE : {
    isExternal : true,
  },

};

let phoneBookStore;

let favoriteStore;

let mixContactStore;

const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

model.mount('local', localContact);
model.provide({
  data() {
    return {
      formattedPhoneBook : null,
      formattedFavorite  : null,
      currentContact     : null,
      token              : null,
    };
  },
  computed : {
    LOAD_MODE() {
      return LOAD_MODE;
    },
    username() {
      return rtc.account.username;
    },
    loginStatus : () => rtc.account.status,
    isCloud() {
      return this.$getVM('login.sketch').isCloud;
    },
    contact() {
      const fetchContact = this.$getVM('fetchContact');

      return this.isCloud ? fetchContact || {} : rtc.contact;
    },
    loadMode() {
      return this.contact.loadMode || LOAD_MODE.AUTO;
    },
    currentUser() {
      return this.currentContact;
    },
    phoneBookLoaded() {
      return this.contact.phonebook.dataLoaded;
    },
    phoneBookLoadFailed() {
      return this.contact.phonebook.loadFailed || false;
    },
    favoriteLoaded() {
      return this.contact.favorite.dataLoaded;
    },
    favoriteLoadFailed() {
      return this.contact.favorite.loadFailed;
    },
    dataLoaded() {
      return this.favoriteLoaded && this.phoneBookLoaded;
    },
    favorite() {
      const tree = this.contact.favorite.list || [];

      this.replaceId('favorite', tree);

      return tree;
    },
    phoneBook() {
      return this.loadMode === LOAD_MODE.SPLIT
        ? this.contact.phonebook.org.list
        : this.contact.phonebook.list;
    },
    phoneBookStore() {
      phoneBookStore = new Store([], this.loadMode);

      if (!this.phoneBookLoaded) return phoneBookStore;

      return phoneBookStore.update(this.phoneBook);
    },
    favoriteStore() {
      favoriteStore = new Store();

      if (!this.favoriteLoaded) return favoriteStore;

      return favoriteStore.update(this.favorite);
    },
    mixContactStore() {
      mixContactStore = new Store([], this.loadMode);

      if (!this.phoneBookLoaded || !this.favoriteLoaded) return mixContactStore;

      const phoneBookRoot = this.phoneBook.find((node) => node.parentId == null);
      const favoriteRoot = this.favorite.find((node) => node.parentId == null);

      favoriteRoot.node.parentId = phoneBookRoot.node.id;

      const mix = [ ...this.favorite, ...this.phoneBook ];

      return mixContactStore.update(mix);
    },
  },
  methods : {
    replaceId(suffix, tree) {
      const rootNode = tree.find((n) => n.node.parentId == null);
      const rootGroup = tree.filter((n) => n.node.parentId === rootNode.node.id);

      rootNode.node.id = `${rootNode.node.id}${suffix}`;

      rootGroup.forEach((n) => {
        n.node.parentId = rootNode.node.id;
      });
    },
    search(params) {
      return this.isCloud
        ? this.contact.$phonebook.search(params)
        : this.contact.phonebook.search(params);
    },
    async findContacts(val) {
      return this.search({ key: val }).then((result) => (result.data || result)
        .map((c) => {
          if (c.attributes.number == null) c.attributes.number = c.attributes.name;

          if (c.attributes.number === this.username) {
            c.attributes.isSelf = true;
          }

          return Object.assign({
            ...this.getUserType(c.node.type),
            nick : /^(.*)\(.*\)$/.test(c.attributes.name)
              ? RegExp.$1.substr(-2, 2)
              : c.attributes.name.substr(-2, 2),
          }, c.attributes, c.node);
        }));
    },
    async getAsyncChildNodes(options) {
      const asyncData = phoneBookStore.getAsyncData(options.parentId); // 混合 情况下 异步加载会有问题；这里暂时不修改，等后续需求明确再修改

      if (asyncData) return asyncData;

      const data = await rtc.contact.phonebook.childNodes(options);

      return phoneBookStore.updateAsyncData(options.parentId, data);
    },
    getUserType(type) {
      return userType[type];
    },
  },


  watch : {
    loginStatus(val) {
      if (val === 'disconnected') {
        this.currentContact = null;
        this.favoriteStore.destroy();
        this.phoneBookStore.destroy();
      }
    },

    loadMode(val) {
      if (val === 'SPLIT') {
        this.findContacts(this.username).then((result) => {
          result.every((contact) => {
            // 考虑短号情况
            if (/^(\w*)\.?(\w*)/.test(contact.number)) {
              const number = RegExp.$2 || RegExp.$1;

              if (number === this.username) {
                this.currentContact = contact;
              }
            }

            return contact.number !== this.username;
          });
        });
      }
    },
  },
});

// model.use(() => {});

export default model;
