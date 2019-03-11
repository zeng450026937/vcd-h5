import rtc from '../../rtc';
import pinyin from '../../utils/pinyin';

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
  },
  methods : {
    async findContacts(val) {
      return rtc.contact.phonebook.search({ key: val }).then((result) => result.data.map((c) => Object.assign({
        group  : c.attributes.searchKey.slice(0, 1).toUpperCase(),
        parent : { isUser: true },
        nick   : /^(.*)\(.*\)$/.test(c.attributes.name) ? RegExp.$1.substr(-2, 2) : c.attributes.name.substr(-2, 2),
      }, c.attributes, c.node)));
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
