import Vuem from '../vuem';
import rtc from '../../rtc';

const model = new Vuem();


model.provide({
  data() {
    return {
      currentPhoneBookGroup   : 'rootNode',
      currentPhoneBookContact : {},
      currentFavoriteGroup    : 'rootNode',
      currentFavoriteContact  : {},

    };
  },
  methods : {
    reset() {
      this.currentPhoneBookGroup = 'rootNode';
      this.currentPhoneBookContact = {};
      this.currentFavoriteGroup = 'rootNode';
      this.currentFavoriteContact = {};
    },
  },
  computed : {
    isRegistered() {
      return rtc.account.status === 'registered';
    },
  },
  watch : {
    isRegistered(val) {
      if (!val) this.reset();
    },
  },
});

export default model;
