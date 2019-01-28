<template>
  <a-layout id="record-setting" class="h-full">
    <div class="h-14">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>录制</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <a-divider class="my-0"/>
    <div class="flex flex-col h-full m-4 bg-white p-5 w-full">
      <div class="mt-16">
        <a-row type="flex" align="middle">
          <a-col :span="8" class="self-start">文件管理</a-col>
          <a-col :span="16">
            <div class="flex flex-col">
              <span>将我的本地录制文件保存在：</span>
              <a-input class="mt-2" placeholder="文件保存路径" disabled/>
              <div class="flex mt-2">
                <a-button type="primary" ghost>更改目录</a-button>
                <a-button class="ml-4" type="primary" ghost>打开文件夹</a-button>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
      <div class="mt-6">
        <a-checkbox>在录制中加入时间轴</a-checkbox>
      </div>
      <div class="mt-4">
        <a-checkbox>在共享屏幕时录制视频</a-checkbox>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';

export default {
  name       : 'RecordSetting',
  components : {
    AppHeader,
  },
  data() {
    return {
    };
  },
};
</script>

<style scoped>

</style>
