<template>
  <a-layout id="tab-setting" class="w-full bg-white">
    <tab-setting-media class="mt-3"/>
  </a-layout>
</template>

<script>
import TabSettingMedia from '../Conference/TabSettingMedia.vue';

export default {
  name       : 'TabSetting',
  components : {
    TabSettingMedia,
  },
};
</script>
