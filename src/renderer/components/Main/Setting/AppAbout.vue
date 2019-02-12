<template>
  <a-layout id="app-about" class="h-full">
    <div class="h-14">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>关于</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <a-divider class="my-0"/>
    <div class="flex flex-col h-full m-4 bg-white p-5 text-center">
      <div class="mt-9">
        <a-avatar class="cursor-pointer rounded-lg hover:shadow bg-green-dark"
                  shape="square"
                  :size="128">
          <span class="text-xl font-bold">Yealink</span>
        </a-avatar>
      </div>
      <div class="mt-6 text-base">
        Yealink VC Desktop
      </div>
      <div class="mt-2 text-grey-dark text-xs">
        版本号： 1.0.9-alpha
      </div>
      <div class="mt-12">
        <a-button class="w-60 h-9" type="primary">检查更新</a-button>
      </div>
      <div class="mt-5 leading-normal">
        <a-switch size="small"/>
        <span class="ml-2">自动更新</span>
      </div>
      <div class="text-indigo text-xs text-center mt-10">
        <span class="cursor-pointer">用户协议</span>
        <span class="cursor-pointer ml-8">隐私政策</span>
      </div>
      <div class="flex mt-8 justify-center">
        <p class="text-xs text-black-lightest leading-tight">Copyright © 2018 Yealink Inc. All rights reserved.</p>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';

export default {
  name       : 'AppAbout',
  components : {
    AppHeader,
  },
  data() {
    return {};
  },
  methods : {},
};
</script>

<style scoped>
</style>
