<template>
  <a-layout class="bg-transparent" id="media-content">
    <div class="flex flex-col select-none">

      <div class="flex w-full justify-center items-center">
        <a-icon type="video-camera" class="text-white self-start mt-2"/>
        <div class="w-1/2 ml-3">
          <a-select defaultValue="请选择摄像头"
                    v-model="videoInput"
                    class="w-full">
            <a-select-option v-for="videoInput in videoInputList"
                             :key="videoInput.id"
                             :value="videoInput.id"
            >{{videoInput.label}}</a-select-option>
          </a-select>
          <div class="mt-3 h-32 relative">
            <video-view class="w-full h-full bg-white" object-fit="cover"/>
          </div>
        </div>
      </div>

      <div class="flex w-full mt-5 items-center justify-center items-center">
        <a-icon type="phone" class="text-white self-start mt-2"/>
        <div class="w-1/2 ml-3">
          <a-select defaultValue="请选择麦克风"
                    v-model="audioInput"
                    class="w-full">
            <a-select-option v-for="audioInput in audioInputList"
                             :key="audioInput.id"
                             :value="audioInput.id"
            >{{audioInput.label}}
            </a-select-option>
          </a-select>
          <a-slider :defaultValue="30" class="my-0 mt-1 mx-0 dragable"/>
          <span class="text-xs mt-2 text-white">麦克风测试</span>
        </div>
      </div>

      <div class="flex w-full mt-5 items-center justify-center items-center">
        <a-icon type="sound" class="text-white self-start mt-2"/>
        <div class="w-1/2 ml-3">
          <a-select defaultValue="请选择扬声器"
                    v-model="audioOutput"
                    class="w-full">
            <a-select-option v-for="audioOutput in audioOutputList"
                             :key="audioOutput.id"
                             :value="audioOutput.id"
            >{{audioOutput.label}}</a-select-option>
          </a-select>
          <div class="text-white mt-2 flex items-center">
            <a-icon type="play-circle" />
            <span class="ml-1 text-xs">播放测试音频</span>
          </div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import VideoView from './VideoView.vue';

export default {
  name       : 'MediaContent',
  components : {
    VideoView,
  },
  computed : {
    videoInput : {
      get() {
        return this.$model.setting.device.videoInput;
      },
      set(val) {
        this.$model.setting.device.videoInput = val;
      },
    },
    audioInput : {
      get() {
        return this.$model.setting.device.audioInput;
      },
      set(val) {
        this.$model.setting.device.audioInput = val;
      },
    },
    audioOutput : {
      get() {
        return this.$model.setting.device.audioOutput;
      },
      set(val) {
        this.$model.setting.device.audioOutput = val;
      },
    },
    videoInputList() { // 摄像头
      return this.$model.setting.device.videoInputList;
    },
    audioInputList() { // 麦克风
      return this.$model.setting.device.audioInputList;
    },
    audioOutputList() { // 扬声器
      return this.$model.setting.device.audioOutputList;
    },
  },
};
</script>

<style lang="less">
  #media-content {
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
