<template>
  <a-layout id="recent-file" class="h-full">
    <div class="flex flex-col h-full">
      <div>
        <app-header title="最近录制文件"/>
      </div>
      <a-divider class="my-0"/>
      <div class="flex h-full">
        <no-found/>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../shared/AppHeader.vue';
import NoFound from '../shared/no-found';

export default {
  name       : 'RecentFile',
  components : {
    AppHeader,
    NoFound,
  },
};
</script>

<style scoped>

</style>
