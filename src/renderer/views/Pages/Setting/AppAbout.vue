<template>
  <a-layout id="app-about" class="h-full ">
    <app-header :title="$t('setting.about.title')"/>
    <div class="flex flex-col border h-full m-4 bg-white p-5 text-center overflow-y-auto">
      <update-panel></update-panel>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../../../components/Main/MainHeader.vue';
import updatePanel from '../../../components/Common/update-panel.vue';

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
