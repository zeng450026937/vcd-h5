<template>
  <a-layout id="app-header" class="select-none" :class="{[`bg-${bgColor}`]: true}">
    <div class="flex flex-row text-grey-darkest items-center justify-end cursor-pointer mt-2">
      <common-header class="text-grey-dark mr-4"/>
    </div>
  </a-layout>
</template>

<script>
import CommonHeader from '../Shared/CommonHeader.vue';

export default {
  name       : 'MainHeader',
  components : {
    CommonHeader,
  },
  props : {
    title : {
      type    : String,
      default : '',
    },
    bgColor : {
      type    : String,
      default : 'white',
    },
  },
  methods : {
    clickMinimize() {
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
      this.$dispatch('sys.maximize');
      // screenfull.toggle(document.getElementById('app'));
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
  },
};
</script>
