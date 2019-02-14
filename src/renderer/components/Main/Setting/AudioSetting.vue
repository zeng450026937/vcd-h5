<template>
  <a-layout id="audio-setting" class="h-full">
    <div class="h-14">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>音频</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <a-divider class="my-0"/>
    <div class="flex flex-col h-full m-4 bg-white p-5">
      <div class="flex flex-col">
        <span class="leading-normal">音频输入</span>
        <a-select defaultValue="请选择麦克风" class="w-80 mt-2">
          <a-select-option v-for="(mic, index) in micList"
                           :key="index"
                           :value="mic.value"
          >{{mic.label}}</a-select-option>
        </a-select>
        <a-slider :defaultValue="30" class="my-0 mt-1 w-80 mx-0 dragable"/>
        <span class="text-xs text-black-lightest">麦克风测试</span>
      </div>
      <div class="flex flex-col mt-6">
        <span class="leading-normal">音频输出</span>
        <a-select defaultValue="请选择扬声器" class="w-80 mt-2">
          <a-select-option v-for="(mic, index) in micList"
                           :key="index"
                           :value="mic.value"
          >{{mic.label}}</a-select-option>
        </a-select>
        <div class="text-indigo mt-2 flex items-center">
          <a-iconfont type="icon-bofang" />
          <span class="ml-1 text-xs">播放测试音频</span>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';

export default {
  name       : 'AudioSetting',
  components : {
    AppHeader,
  },
  data() {
    return {
      micList : [
        { label: '麦克风一号', value: 'mic1' },
        { label: '麦克风二号', value: 'mic2' },
        { label: '麦克风三号', value: 'mic3' },
      ],
      speakList : [
        { label: '扬声器一号', value: 'speak1' },
        { label: '扬声器二号', value: 'speak2' },
        { label: '扬声器三号', value: 'speak3' },
      ],
    };
  },
};
</script>

<style lang="less">
#audio-setting {
  .ant-slider {
    .ant-slider-rail {
      height: 2px;
    }
    .ant-slider-track {
      height: 2px;
    }
    .ant-slider-step {
      height: 2px;
    }
    .ant-slider-handle {
      display: none;
    }
  }
}
</style>
