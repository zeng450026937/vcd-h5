import Vuem from '../vuem';
import rtc from '../../rtc';
import localContact from './local-contact';
import Store from './store';

const model = new Vuem();

let phoneBookStore;

let favoriteStore;


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
      phoneBookStore = new Store();

      if (!this.phoneBookLoaded) return phoneBookStore;

      return phoneBookStore.update(rtc.contact.phonebook.list);
    },
    favoriteStore() {
      favoriteStore = new Store();

      if (!this.favoriteLoaded) return favoriteStore;

      return favoriteStore.update(rtc.contact.favorite.list);
    },
  },
  methods : {
    // async findContacts(val) {
    //   return rtc.contact.phonebook.search({ key: val }).then((result) => (result.data || result)
    //     .map((c) => {
    //       if (c.attributes.number === this.username) {
    //         c.attributes.isSelf = true;
    //       }
    //
    //       return Object.assign({
    //         parent : { isUser: true },
    //         nick   : /^(.*)\(.*\)$/.test(c.attributes.name)
    //           ? RegExp.$1.substr(-2, 2)
    //           : c.attributes.name.substr(-2, 2),
    //       }, c.attributes, c.node);
    //     }));
    // },
  },
  watch : {
    // rawPhoneBook(val) {
    //   this.formattedPhoneBook = formatPhoneBook(val, this.loadMode);
    // },
    // rawFavorite(val) {
    //   this.formattedFavorite = formatFavorite(val);
    // },
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
