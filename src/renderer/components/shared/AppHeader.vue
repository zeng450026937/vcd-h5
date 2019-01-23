<template>
  <a-layout id="app-header" class="select-none" :class="{[`bg-${bgColor}`]: true}">
    <div class="flex flex-row text-grey-darkest items-center justify-end cursor-pointer mt-2 py-px">
      <a-icon type="minus" class="text-sm mx-3 text-grey-dark hover:text-indigo no-dragable" @click="clickMinimize"/>
      <a-icon type="border" class="text-sm mx-2 text-grey-dark hover:text-indigo no-dragable" @click="clickMaximize"/>
      <a-icon type="close" class="text-sm mx-3 text-grey-dark hover:text-red no-dragable" @click="clickClose"/>
    </div>
  </a-layout>
</template>

<script>
export default {
  name  : 'AppHeader',
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
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
  },
};
</script>

<style scoped>

</style>
