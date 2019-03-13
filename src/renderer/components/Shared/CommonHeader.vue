<template>
  <div class="flex items-center">
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
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
      this.$dispatch('sys.maximize');
    },
    clickClose() {
      if (this.$model.setting.normal.forceMinimize) {
        this.clickMinimize();
      }
      else {
        this.$dispatch('sys.close');
      }
    },
  },
};
</script>

<style scoped>

</style>
