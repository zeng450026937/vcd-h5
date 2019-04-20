<template>
  <div id="global-search" class="bg-white w-full">
    <template v-if="hasContacts">
      <div class="flex flex-col">
        <div class="flex items-center h-7 px-3">
          <span class="flex flex-grow text-xs">企业联系人</span>
          <span v-if="showLoadMore"
                class="text-xs text-indigo cursor-pointer"
                @click="hasLoadMore = !hasLoadMore"
          >{{hasLoadMore ? '收起' : '更多'}}</span>
        </div>
        <contact-list hide-popup
                      :highlightContent="searchText"
                      :contactList="hasLoadMore ? searchResults : searchResults.slice(0, 5)"
                      highlightSelected/>
      </div>
    </template>
    <common-empty v-else class="mt-10"/>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import CommonEmpty from '../Shared/CommonEmpty.vue';
import ContactList from './Contact/ContactList.vue';

export default {
  name       : 'GlobalSearch',
  components : {
    CommonEmpty,
    ContactList,
  },
  sketch : {
    ns    : 'main',
    props : [ 'hasLoadMore', 'searchText', 'searchResults' ],
  },
  computed : {
    hasContacts() {
      return this.searchResults.length > 0;
    },
    showLoadMore() {
      return this.searchResults.length > 5;
    },
    phoneBookLoaded() {
      return this.$model.contact.phoneBookLoaded;
    },
    phoneBookStore() {
      return this.$model.contact.phoneBookStore;
    },
  },
  created() {
    this.debounceSearch = debounce((val = '') => {
      if (!val) return;
      this.$model.contact.findContacts(val).then((result) => {
        this.searchResults = result || [];
      }).catch((err) => {
        console.warn(err.message);

        if (!this.phoneBookLoaded) return;

        this.$nextTick(() => {
          this.searchResults = this.phoneBookStore.search(val);
        });
      });
    }, 500);
  },
  methods : {
  },
  watch : {
    searchText : {
      handler(val) {
        if (!val.trim()) return;
        Promise.resolve().then(() => { // this.$nextTick
          this.debounceSearch(val.trim());
        });
      },
      immediate : true,
    },
  },
};
</script>
