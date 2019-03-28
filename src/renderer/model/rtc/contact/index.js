import axios from 'axios';
import crypto from 'crypto';
import Vuem from '../../vuem';
import { PhoneBook } from './phonebook';
import { Favorite } from './favorite';

const model = new Vuem();

model.provide({
  data() {
    return {
      negotiateUrl           : null,
      favoriteContactsEnable : false,
      phonebookLastUpdated   : null,
      favoriteLastUpdated    : null,
    };
  },

  methods : {
    async negotiate(url = this.negotiateUrl) {
      if (!url) throw new Error('negotiate url is required');
      if (!this.account) throw new Error('not ready');
      if (!this.account.registered) throw new Error('not available');

      const { data } = await axios.post(
        url,
        { phoneBookAcceptVersion: this.phoneBookVersion }
      );

      if (data.ret <= 0) throw new Error(data.error);

      const config = data.data;

      const { phonebook, favorite } = this;

      phonebook.init(config);
      favorite.init(config);

      const auth = {
        dataVersion       : 0, // force full update
        permissionVersion : 0, // force full update
        username          : this.account.username,
        password          : this.genAES(this.account.password),
      };

      phonebook.auth = auth;
      favorite.auth = auth;

      this.favoriteContactsEnable = config.favoriteContactsEnable;
    },

    genAES(input) {
      const cipher = crypto.createCipheriv('aes-128-ecb', '1105_VCCloud_Key', '');
      const cipherChunks = [];

      cipherChunks.push(cipher.update(input, 'utf8', 'base64'));
      cipherChunks.push(cipher.final('base64'));

      return cipherChunks.join('');
    },

    async sync() {
      this.phonebookList = await this.phonebook.sync();
      this.phonebookLastUpdated = Date.now();

      if (this.favoriteContactsEnable) {
        this.favoriteList = await this.favorite.sync();
        this.favoriteLastUpdated = Date.now();
      }
    },
  },

  async created() {
    this.phonebook = new PhoneBook();
    this.favorite = new Favorite();
    this.phonebookList = [];
    this.phonebookList._isVue = true;
    this.favoriteList = [];
    this.favoriteList._isVue = true;

    await this.$nextTick();

    const account = this.$getVM('account');

    account.$on('negotiateUrlUpdated', async(url) => {
      this.negotiateUrl = url;
      await this.negotiate();
      await this.sync();
    });
    account.$on('phonebookUpdated', this.sync);

    this.account = account;
  },

  beforeDestroy() {
    this.phonebook = null;
    this.favorite = null;

    this.phonebookList = null;
    this.favoriteList = null;
  },
});

export default model;
