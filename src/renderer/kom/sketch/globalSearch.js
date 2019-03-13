export default {
  data() {
    return {
      hasLoadMore   : false,
      searchText    : '',
      searchResults : [],
    };
  },
  watch : {
    searchText(val) {
      if (!val) this.searchResults.length = 0;
    },
  },
};
