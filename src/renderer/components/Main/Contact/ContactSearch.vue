<template>
  <a-layout id="global-search" class="h-full bg-white">
    <template v-if="hasContacts">
      <div class="flex flex-col h-full">
        <contact-list hide-popup
                      checkable
                      :highlight-selected="false"
                      :video-icon="false"
                      :audio-icon="false"
                      @onCheck="onCheck"
                      :contactList="remoteContacts"/>
      </div>
    </template>
    <common-empty v-else class="mt-10"/>
  </a-layout>
</template>

<script>
import { debounce } from 'lodash';
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import ContactList from './ContactList.vue';

export default {
  name       : 'GlobalSearch',
  components : {
    CommonEmpty,
    ContactList,
  },
  props : {
    searchText : {
      type    : String,
      default : '',
    },
    checkedKeys : {
      type : Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      remoteContacts : [],
    };
  },
  computed : {
    hasContacts() {
      return this.remoteContacts.length > 0;
    },
  },
  created() {
    this.debounceSearch = debounce((val = '') => {
      if (!val) return;
      this.remoteContacts.length = 0;
      this.$model.contact.findContacts(val).then((result) => {
        result = result || [];
        let checkedNum = 0;

        result.every((r) => {
          r.checked = this.checkedKeys.some((c) => c === r.id);
          if (r.checked) checkedNum++;
          
          return checkedNum !== this.checkedKeys.length;
        });
        this.remoteContacts = result;
      }).catch((err) => {
        console.warn(err.message);
      });
    }, 500);
  },
  methods : {
    onCheck(contact) {
      this.$emit('onCheck', contact);
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
