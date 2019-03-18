<template>
  <div class="flex items-center z-20">
    <a-iconfont type="icon-zuixiaohua"
                title="最小化"
                class="text-base mr-3 hover:text-indigo no-dragable cursor-pointer"
                @click="clickMinimize"/>
    <a-iconfont type="icon-zuidahua" class="text-base mx-1 hover:text-indigo no-dragable cursor-pointer"
                title="最大化"
                @click="clickMaximize"/>
    <a-iconfont type="icon-guanbi" class="text-base ml-3 hover:text-red no-dragable cursor-pointer"
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

<style scoped>

</style>
