import Vuem from './vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      searchText    : '',
      hasLoadMore   : false,
      searchResults : [],
    };
  },
});

// model.use(() => {});

export default model;
