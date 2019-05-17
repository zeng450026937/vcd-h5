import Vuem from '../vuem';
import { Phonebook } from './phonebook';
import { getTemporaryToken } from './token';
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
      token     : null,
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
      const account = this.$getVM('account');

      return account.serverType === 'cloud';
    },
    isRegistered() {
      return rtc.account.status === 'registered';
    },
  },
  beforeCreate() {
    this.$phonebook = new Phonebook();
  },
  async created() {
    if (this.isCloud) {
      this.token = await this.getToken();
    }

    rtc.account.$on('negotiateUrlUpdated', this.initNegotiate);
    rtc.account.$on('phonebookUpdated', this.initNegotiate);
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
    async getToken() {
      return getTemporaryToken();
    },
    format(contacts) {
      contacts.forEach((n) => {
        n.node.type = CONTACT_TYPES[n.node.type];
      });
    },
    async initNegotiate() {
      // this.phonebook.dataLoaded = false;
      // this.phonebook.dataLoadFailed = false;
      //
      // if (this.isCloud) {
      //   this.$phonebook.negotiate();
      //
      //   return this.$phonebook.sync()
      //     .then((list) => {
      //       list._isVue = true;
      //       this.format(list);
      //       this.phonebook.list = list;
      //       this.phonebook.dataLoaded = true;
      //     }).catch((e) => {
      //       this.phonebook.dataLoadFailed = true;
      //     });
      // }

      return rtc.contact.initNegotiate().catch(() => {});
    },

  },
  watch : {
    isRegistered(val) {
      if (!val) this.reset();
    },
    token(val) {
      if (val && this.$phonebook) {
        this.$phonebook.updateToken(val);
      }
    },
  },

});


export default model;
