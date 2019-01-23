<template>
  <a-layout id="common-setting" class="h-full">
    <div class="h-14">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>通用</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <a-divider class="my-0"/>
    <div class="flex flex-col h-full m-4 bg-white p-5">
      <div>
        <div>
          <a-switch size="small" defaultChecked/>
          <span class="ml-5">开机自动启动</span>
        </div>
        <div class="mt-4">
          <a-switch size="small"/>
          <span class="ml-5">关闭时最小化</span>
        </div>
        <div class="mt-6">
          <span>切换语言</span>
          <a-select defaultValue="简体中文" class="w-48 ml-4">
            <a-select-option v-for="(lang, index) in langList" :key="index"
                             :value="lang.lang"
            >{{lang.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-10">
          <a-button type="primary" class="w-32">查看新手引导</a-button>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../shared/AppHeader.vue';

export default {
  name       : 'CommonSetting',
  components : {
    AppHeader,
  },
  data() {
    return {
      langList : [
        { label: '简体中文', lang: 'zn-CH' },
        { label: 'English', lang: 'en-US' },
      ],
    };
  },
};
</script>

<style scoped>

</style>
