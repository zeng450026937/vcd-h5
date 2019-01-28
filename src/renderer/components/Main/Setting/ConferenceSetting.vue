<template>
  <a-layout id="conference-setting" class="h-full">
    <div class="h-14">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>会议</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <a-divider class="my-0"/>
    <div class="flex flex-col h-full m-4 bg-white p-5">
      <div>
        <a-switch size="small"/>
        <span class="ml-5">通话中免打扰</span>
      </div>
      <div class="mt-4">
        <a-switch size="small" defaultChecked/>
        <span class="ml-5">入会及离会提示语</span>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';

export default {
  name       : 'ConferenceSetting',
  components : {
    AppHeader,
  },
};
</script>

<style scoped>

</style>
