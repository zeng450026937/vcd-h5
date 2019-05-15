<template>
  <div v-if="show" id="common-header" class="flex items-center z-20 no-dragable">
    <a-iconfont type="icon-zuixiaohua"
                :title="$t('common.controls.minimize')"
                class="header-control"
                @click="clickMinimize"></a-iconfont>
    <a-iconfont type="icon-zuidahua" class="maximize header-control"
                :title="$t('common.controls.maximize')"
                @click="clickMaximize"></a-iconfont>
    <a-iconfont type="icon-guanbi" class="close hover:bg-red-light hover:text-white header-control"
                :title="$t('common.controls.close')"
                @click="clickClose"></a-iconfont>
  </div>
</template>

<script>
export default {
  name : 'CommonHeader',
  data() {
    return {
      show : process.platform !== 'darwin',
    };
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
#common-header {
  .header-control {
    color: #666666;
    &:hover {
      background: #e5e5e5;
      color: #000000;
    }
    transition: all .2s ease-in-out;
    @apply text-base w-12 h-9 cursor-pointer flex items-center justify-center;
  }
  .minimize {

  }
}
</style>
