import Vuem from 'vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      searchText : '',
    };
  },
});

// model.use(() => {});

export default model;
