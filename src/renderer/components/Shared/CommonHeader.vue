<template>
  <div id="common-header" class="flex items-center z-20 no-dragable">
    <a-iconfont type="icon-zuixiaohua"
                title="最小化"
                class="hover:bg-disabled hover:text-white header-control"
                @click="clickMinimize"/>
    <a-iconfont type="icon-zuidahua" class="hover:bg-disabled hover:text-white header-control"
                title="最大化"
                @click="clickMaximize"/>
    <a-iconfont type="icon-guanbi" class="hover:bg-red-light hover:text-white header-control"
                title="关闭"
                @click="clickClose"/>
  </div>
</template>

<script>
export default {
  name    : 'CommonHeader',
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
#common-header {
  .header-control {
    transition: all .2s ease-in-out;
    @apply text-base w-12 h-9 cursor-pointer flex items-center justify-center;
  }
}
</style>
