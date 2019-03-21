<template>
  <a-layout id="app-about" class="h-full ">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>{{$t('setting.about.title')}}</span>
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
  name : 'AppAbout',
  
  components : {
    AppHeader,
    updatePanel,
  },

  mounted() {
  },

  deactivated() {
    this.$dispatch('setting.save');
  },

  destroyed() {
    this.$dispatch('setting.save');
  },
  
  methods : {},
};
</script>

<style scoped>
</style>
