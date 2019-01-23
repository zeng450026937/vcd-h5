<template>
  <a-layout id="local-file">
    <div class="flex flex-col h-full">
      <div>
        <app-header title="本地录制文件"/>
      </div>
      <a-divider class="my-0"/>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../shared/AppHeader.vue';

export default {
  name       : 'LocalFile',
  components : {
    AppHeader,
  },
};
</script>

<style scoped>

</style>
