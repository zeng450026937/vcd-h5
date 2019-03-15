/* eslint-disable import/no-extraneous-dependencies,new-cap,consistent-return */
import Vue from 'vue';
import Axios from 'axios';
import AES from 'browserify-aes';
import URL from 'url';
import PhoneBook from './PhoneBook';
import FavoriteContact from './FavoriteContact';

export default Vue.extend({
  data() {
    return {
      permissionVersion : 0,
      dataVersion       : 0,
      url               : null,
      phonebook         : null,
      favorite          : null,
      subscribe         : false,
      version           : 'v1',
      syncUrl           : null,
      loadMode          : 'AUTO',
    };
  },
  created() {
    this.phonebook = new PhoneBook({
      parent : this,
    });
    this.favorite = new FavoriteContact({
      parent : this,
    });
    // this.doSubscribe();
  },
  destroyed() {
    this.undoSubscribe();
  },
  computed : {
    ua() {
      return this.$root.account.ua;
    },
    negotiateUrl() {
      return this.$root.account.negotiateUrl;
    },
    username() {
      return this.$root.account.username;
    },
    password() {
      return this.$root.account.password;
    },
    aesPassword() {
      const cipher = new AES.createCipheriv('aes-128-ecb', '1105_VCCloud_Key', '');
      const cipherChunks = [];

      cipherChunks.push(cipher.update(this.password, 'utf8', 'base64'));
      cipherChunks.push(cipher.final('base64'));

      return cipherChunks.join('');
    },
  },
  methods : {
    doSubscribe() {
      this.subscribe = true;

      return this.initNegotiate().catch(() => {
      });
    },
    undoSubscribe() {
      this.subscribe = false;
    },

    async initNegotiate(url) {
      if (!this.negotiateUrl || !this.aesPassword) return Promise.reject();

      const { data } = await Axios.post(url || this.negotiateUrl, {
        phoneBookAcceptVersion : this.version,
      });

      if (data.ret <= 0) return Promise.reject(data.error);

      const {
        phoneBookUrl,
        apiVersion,
        phoneBookVersion,
        type,
        phoneBookLoadMode,
        favoriteContactsEnable,
      } = data.data;

      this.loadMode = phoneBookLoadMode || 'AUTO';

      if (this.version !== phoneBookVersion) {
        this.version = apiVersion;
      }

      this.syncUrl = URL.parse(phoneBookUrl);
      this.syncUrl.query = {
        dataVersion       : this.dataVersion,
        permissionVersion : this.permissionVersion,
        username          : this.username,
        password          : this.aesPassword,
      };

      this.doSync(type, favoriteContactsEnable);
    },
    doSync(type, favoriteContactsEnable) {
      if (favoriteContactsEnable) {
        this.favorite.doSync({ type });
      }
      this.phonebook.doSync({ type });
    },
  },
  watch : {
    negotiateUrl(val) {
      if (this.subscribe) {
        this.phonebook._reset();
        this.favorite._reset();
        this.initNegotiate().catch(() => {
        });
      }
    },
    ua(val) {
      if (val) {
        this.doSubscribe();
      }
      else {
        this.phonebook = new PhoneBook({
          parent : this,
        });
        this.favorite = new FavoriteContact({
          parent : this,
        });
      }
    },
  },
});
