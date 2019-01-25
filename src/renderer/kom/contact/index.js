import rtc from '../../rtc';

import { formatContact as formatPhoneBook } from './Contact';
import { formatFavorite } from './Favorite';

export default {
  data() {
    return {
      formattedPhoneBook : null,
      formattedFavorite  : null,
    };
  },
  computed : {
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
    selectedPhoneBook() {
      function search(contact) {
        let result = [];

        if (!contact) return result;

        if (contact.isGroup) {
          contact.items.forEach((iter) => {
            result = result.concat(search(iter));
          });
        }
        else if (contact.selected) {
          result.push(contact);
        }

        return result;
      }

      return search(this.contacts);
    },
  },
  methods : {
    getGroupByID(id) {
      let group = null;

      function search(g) {
        if (g.isGroup && !group) {
          if (g.id === id) {
            group = g;
          }
          else {
            g.items.forEach((iter) => {
              if (g.isGroup && !group) search(iter);
            });
          }
        }
      }
      search(this.contacts);

      return group;
    },
    async findContacts(_val, val = String(_val).length === 1 ? `0${_val}` : String(_val)) {
      const result = await rtc.contact.phonebook.search({ key: val });

      return result.map((c) => {
        const { id } = c.node;
        const index = this.selectedPhoneBook.findIndex((s) => s.id === id);

        if (index < 0) return this.phoneBookFormat(Object.assign({}, c.attributes, c.node));
        else return this.selectedPhoneBook[index];
      });
    },
    phoneBookFormat(val) {
      return formatPhoneBook(val, this.loadMode);
    },
    formatFavorite,
  },
  watch : {
    rawPhoneBook(val) {
      this.formattedPhoneBook = formatPhoneBook(val, this.loadMode);
    },
    rawFavorite(val) {
      this.formattedFavorite = formatFavorite(val);
    },
  },
};
