<template>
  <div class="flex flex-grow h-full">
    <div class="h-full flex flex-col w-full">
      <div class="border-b dial-search-title">拨号搜素结果（{{searchResult.length}}）</div>
      <div class="h-full flex justify-center items-center" v-if="!searchResult.length">
        <common-empty image="empty-result"/>
      </div>
      <contact-list v-else
                    hide-popup
                    class="mx-1"
                    :contactList="searchResult"
                    :highlightContent="highLightKey"
                    highlightSelected>
      </contact-list>

    </div>
  </div>
</template>

<script>

import ContactList from '../Main/Contact/ContactList.vue';
import CommonEmpty from '../Shared/CommonEmpty.vue';


export default {
  name  : 'searchList',
  props : {
    searchResult : {
      type : Array,
      default() {
        return [];
      },
    },
    highLightKey : {
      type : String,
      default() {
        return '';
      },
    },
  },
  components : {
    CommonEmpty,
    ContactList,
  },
};
</script>

<style scoped>
.dial-search-title {
  padding: 12px 20px;
}
</style>
