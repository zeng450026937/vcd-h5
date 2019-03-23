import Vuem from '../vuem';
import rtc from '../../rtc';
import localContact from './local-contact';
import Store from './store';

const model = new Vuem();

let phoneBookStore;

let favoriteStore;

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
    loadMode() {
      return rtc.contact.loadMode;
    },
    currentUser() {
      return this.currentContact;
    },
    phoneBookLoaded() {
      return rtc.contact.phonebook.dataLoaded;
    },
    favoriteLoaded() {
      return rtc.contact.favorite.dataLoaded;
    },
    phoneBookStore() {
      phoneBookStore = new Store([], this.loadMode);

      if (!this.phoneBookLoaded) return phoneBookStore;

      if (this.loadMode === LOAD_MODE.SPLIT) return phoneBookStore.update(rtc.contact.phonebook.org.list);

      return phoneBookStore.update(rtc.contact.phonebook.list);
    },
    favoriteStore() {
      favoriteStore = new Store();

      if (!this.favoriteLoaded) return favoriteStore;

      return favoriteStore.update(rtc.contact.favorite.list);
    },
  },
  methods : {
    async findContacts(val) {
      return rtc.contact.phonebook.search({ key: val }).then((result) => (result.data || result)
        .map((c) => {
          if (c.attributes.number === this.username) {
            c.attributes.isSelf = true;
          }

          return Object.assign({
            parent : { isUser: true },
            nick   : /^(.*)\(.*\)$/.test(c.attributes.name)
              ? RegExp.$1.substr(-2, 2)
              : c.attributes.name.substr(-2, 2),
          }, c.attributes, c.node);
        }));
    },
    async getAsyncChildNodes(options) {
      const asyncData = phoneBookStore.getAsyncData(options.parentId);

      if (asyncData) return asyncData;

      const data = await rtc.contact.phonebook.childNodes(options);

      return phoneBookStore.updateAsyncData(options.parentId, data);
    },
  },
  watch : {
    loginStatus(val) {
      if (val === 'disconnected') {
        this.favoriteStore.destroy();
        this.phoneBookStore.destroy();
      }
    },

    loadMode(val) {
      if (val === 'SPLIT') {
        this.findContacts(this.username).then((result) => {
          result.every((contact) => {
            if (contact.number === this.username) {
              this.currentContact = contact;
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
