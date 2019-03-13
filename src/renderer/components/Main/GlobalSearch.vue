<template>
  <a-layout id="global-search" class="h-full bg-white">
    <template v-if="hasContacts">
      <div class="flex flex-col h-full">
        <div class="flex items-center h-7 px-3">
          <span class="flex flex-grow text-xs" @click="writeThis">企业联系人</span>
          <span v-if="showLoadMore"
                class="text-xs text-indigo cursor-pointer"
                @click="hasLoadMore = !hasLoadMore"
          >{{hasLoadMore ? '收起' : '更多'}}</span>
        </div>
        <contact-list hide-popup
                      :contactList="hasLoadMore ? remoteContacts : remoteContacts.slice(0, 5)"
                      highlightSelected/>
      </div>
    </template>
    <common-empty v-else class="mt-10"/>
  </a-layout>
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
    module : 'globalSearch',
    props  : [ 'searchText', 'hasLoadMore', 'remoteContacts' ],
  },
  computed : {
    hasContacts() {
      return this.remoteContacts.length > 0;
    },
    showLoadMore() {
      return this.remoteContacts.length > 5;
    },
    searchText : {
      get() {
        return this.$model.sketch.globalSearch.searchText;
      },
      set(val) {
        this.$model.sketch.globalSearch.searchText = val;
      },
    },
    hasLoadMore : {
      get() {
        return this.$model.sketch.globalSearch.hasLoadMore;
      },
      set(val) {
        this.$model.sketch.globalSearch.hasLoadMore = val;
      },
    },
    remoteContacts : {
      get() {
        return this.$model.sketch.globalSearch.searchResults;
      },
      set(val) {
        this.$model.sketch.globalSearch.searchResults = val;
      },
    },
  },
  created() {
    this.debounceSearch = debounce((val = '') => {
      if (!val) return;
      this.$model.contact.findContacts(val).then((result) => {
        this.remoteContacts = result || [];
      }).catch((err) => {
        console.warn(err.message);
      });
    }, 500);
  },
  methods : {
    writeThis() {
      console.warn(this);
      console.warn(this.name);
      console.warn(this.sketch);
      console.warn(this.$options);
      console.warn(this.$options.name);
      console.warn(this.$options.sketch);
    },
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
