<template>
  <div id="app-header" class="h-14 bg-white border-b">
    <div class="flex dragable h-full">
      <span v-if="title" class="title-content">
        {{title}}
      </span>
      <span v-else class="title-content">
        <slot name="title"></slot>
      </span>
      <slot name="content"></slot>
      <div class="flex flex-grow no-dragable py-1">
        <div class="w-full h-full dragable"/>
      </div>
      <div class="select-none">
        <div class="flex flex-row text-grey-darkest items-center justify-end cursor-pointer">
          <common-header class="text-grey-dark"/>
        </div>
      </div>
    </div>
  </div>
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
  },
  methods : {
    clickMinimize() {
      this.$dispatch('application.minimize');
    },
    clickMaximize() {
      this.$dispatch('application.maximize');
    },
    clickClose() {
      this.$dispatch('application.close');
    },
  },
};
</script>
<style lang="less">
  #app-header {
    .title-content {
      @apply font-semibold text-base flex self-center ml-4;
    }
  }
</style>
