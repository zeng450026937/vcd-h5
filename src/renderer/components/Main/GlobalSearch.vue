<template>
  <a-layout id="global-search" class="h-full bg-white">
    <common-empty/>
  </a-layout>
</template>

<script>
import CommonEmpty from '../Shared/CommonEmpty.vue';

export default {
  name       : 'GlobalSearch',
  components : {
    CommonEmpty,
  },
  props : {
    searchText : {
      type    : String,
      default : '',
    },
  },
};
</script>
