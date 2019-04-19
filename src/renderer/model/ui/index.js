import Vuem from '../vuem';

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
});

export default model;
