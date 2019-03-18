<template>
  <a-layout id="app-about" class="h-full ">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>关于</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5 text-center overflow-y-auto">
      <update-panel></update-panel>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import updatePanel from '../../Common/update-panel.vue';

export default {
  name       : 'AppAbout',
  components : {
    AppHeader,
    updatePanel,
  },
  mounted() {
  },
  deactivated() {
    this.$model.setting1.save('about'); // 页面不显示的时候保存设置
  },
  destroyed() {
    this.$model.setting1.save('about'); // 页面不显示的时候保存设置
  },
  methods : {},
};
</script>

<style scoped>
</style>
