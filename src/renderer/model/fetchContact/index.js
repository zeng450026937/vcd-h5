import { ipcRenderer } from 'electron';
import Vuem from '../vuem';
import { Phonebook } from './phonebook';
import rtc from '../../rtc';


const model = new Vuem();

const CONTACT_TYPES = [
  'VIRTUAL_GROUP',
  'STAFF_GROUP',
  'STAFF',
  'DEVICE_GROUP',
  'DEVICE',
  'VMR_GROUP',
  'VMR',
  'MEETING_ROOM_GROUP',
  'MEETING_ROOM',
  'THIRD_PARTY_DEVICE_GROUP',
  'THIRD_PARTY_DEVICE',
  'PARTY_MANAGER',
];

model.provide({
  data() {
    return {
      phonebook : {
        dataLoaded : false,
        loadFailed : false,
        list       : [],
      },
      favorite : {
        dataLoaded : false,
        loadFailed : false,
        list       : [],
      },

    };
  },
  computed : {
    isCloud() {
      return this.$getVM('login.sketch').isCloud;
    },
    isRegistered() {
      return rtc.account.status === 'registered';
    },
    digest() {
      return this.$getVM('digest');
    },
    token() {
      return this.digest.token;
    },
    port() {
      return '9996';
    },
    baseURL() {
      return `${this.digest.protocol}${this.digest.domain}:${this.port}`;
    },
  },
  watch : {
    isRegistered(val) {
      if (!val) return this.reset();
      if (this.$phonebook && this.baseURL) {
        this.$phonebook.updateBaseURL(this.baseURL);
      }
      this.initNegotiate();
    },
    token(val) {
      if (val && this.$phonebook) {
        this.$phonebook.updateToken(val);
      }
    },
  },
  async created() {
    this.$phonebook = new Phonebook({ baseURL: this.baseURL });

    rtc.account.$on('negotiateUrlUpdated', this.initNegotiate);
    if (!this.isCloud) {
      rtc.account.$on('phonebookUpdated', this.initNegotiate);
    }
    else {
      ipcRenderer.on('phone-book-update', this.initNegotiate);
    }
  },
  middleware : {
    async sync(ctx, next) {
      await next();

      return this.$phonebook.sync();
    },
  },
  methods : {
    reset() {
      this.phonebook = {
        dataLoaded : false,
        loadFailed : false,
        list       : [],
      };
      this.$phonebook.reset();
    },
    format(contacts) {
      contacts.forEach((n) => {
        n.node.type = CONTACT_TYPES[n.node.type];
      });
    },
    async initNegotiate() {
      this.phonebook.dataLoaded = false;
      this.phonebook.dataLoadFailed = false;

      if (this.isCloud) {
        await this.$phonebook.negotiate();

        return this.$phonebook.sync()
          .then((list) => {
            list._isVue = true;
            this.format(list);
            this.phonebook.list = list;
            this.phonebook.dataLoaded = true;
          }).catch((e) => {
            this.phonebook.dataLoadFailed = true;
          });
      }

      return rtc.contact.initNegotiate().catch(() => {});
    },

  },


});


export default model;
