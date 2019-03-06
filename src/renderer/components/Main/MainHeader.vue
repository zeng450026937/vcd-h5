<template>
  <a-layout id="app-header" class="select-none" :class="{[`bg-${bgColor}`]: true}">
    <div class="flex flex-row text-grey-darkest items-center justify-end cursor-pointer mt-2 py-px">
      <a-iconfont type="icon-zuixiaohua"
                  title="最小化"
                  class="text-base mx-4 text-grey-dark hover:text-indigo no-dragable"
                  @click="clickMinimize"/>
      <a-iconfont type="icon-zuidahua"
                  title="最大化"
                  class="text-base text-grey-dark hover:text-indigo no-dragable"
                  @click="clickMaximize"/>
      <a-iconfont type="icon-guanbi"
                  title="关闭"
                  class="text-base mx-4 text-grey-dark hover:text-red no-dragable"
                  @click="clickClose"/>
    </div>
  </a-layout>
</template>

<script>
import screenfull from 'screenfull';

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
      // screenfull.toggle(document.getElementById('app'));
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
  },
};
</script>

<style scoped>

</style>
