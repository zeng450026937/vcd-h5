import Vuem from 'vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      globalSearchText : '',
    };
  },
});

// model.use(() => {});

export default model;
