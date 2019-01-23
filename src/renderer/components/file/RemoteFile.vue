<template>
  <a-layout id="remote-file">
    <div class="flex flex-col h-full">
      <div>
        <app-header title="云录制文件"/>
      </div>
      <a-divider class="my-0"/>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../shared/AppHeader.vue';

export default {
  name       : 'RemoteFile',
  components : {
    AppHeader,
  },
};
</script>

<style scoped>

</style>
