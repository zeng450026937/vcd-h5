<template>
  <a-layout id="app-header" class="select-none" :class="{[`bg-${bgColor}`]: true}">
    <div class="flex flex-row text-grey-darkest items-center justify-end cursor-pointer mt-2 py-px">
      <a-iconfont type="icon-zuixiaohua"
                  class="text-base mx-4 text-grey-dark hover:text-indigo no-dragable" @click="clickMinimize"/>
      <a-iconfont type="icon-zuidahua"
                  class="text-base text-grey-dark hover:text-indigo no-dragable" @click="clickMaximize"/>
      <a-iconfont type="icon-guanbi"
                  class="text-base mx-4 text-grey-dark hover:text-red no-dragable" @click="clickClose"/>
    </div>
  </a-layout>
</template>

<script>
export default {
  name  : 'MainHeader',
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
