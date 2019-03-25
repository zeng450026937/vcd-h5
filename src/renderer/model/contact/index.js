import Vuem from '../vuem';
import rtc from '../../rtc';
import localContact from './local-contact';
import { formatContact as formatPhoneBook } from './Contact';
import { formatFavorite } from './favorite-contact';

const model = new Vuem();

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
    rawFavorite() {
      return rtc.contact.favorite.tree || [];
    },
    rawPhoneBook() {
      const { phonebook } = rtc.contact;

      return this.loadMode === 'SPLIT' ? phonebook.org.tree || {}
        : phonebook.tree || phonebook.org.tree || {};
    },
    phoneBook() {
      return this.formattedPhoneBook;
    },
    favorite() {
      return this.formattedFavorite;
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
    phoneBookFormat(val) {
      return formatPhoneBook(val, this.loadMode);
    },
  },
  watch : {
    rawPhoneBook(val) {
      this.formattedPhoneBook = formatPhoneBook(val, this.loadMode);
    },
    rawFavorite(val) {
      this.formattedFavorite = formatFavorite(val);
    },
    loginStatus(val) {
      if (val === 'disconnected') {
        this.formattedPhoneBook = null;
        this.formattedFavorite = null;
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
