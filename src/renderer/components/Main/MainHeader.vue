<template>
  <div id="app-header" class="h-14 bg-white border-b py-1">
    <div class="flex dragable h-full">
      <span v-if="title" class="font-semibold text-base flex self-center ml-4">{{title}}</span>
      <slot name="content"></slot>
      <div class="flex flex-grow"></div>
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
