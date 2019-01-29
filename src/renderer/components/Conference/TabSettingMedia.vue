<template>
  <a-layout id="tab-setting-media" class="bg-white">
    <div class="flex flex-col select-none px-4">
      <div class="flex flex-col">
        <span>摄像头</span>
        <a-select defaultValue="请选择摄像头"
                  v-model="videoInput" class="mt-2">
          <a-select-option v-for="videoInput in videoInputList"
                           :key="videoInput.id"
                           :value="videoInput.id"
          >{{videoInput.label}}
          </a-select-option>
        </a-select>
        <div class="mt-2 relative">
          <video-view class="w-full h-full bg-white" position="relative" object-fit="cover"/>
        </div>
      </div>

      <div class="flex flex-col mt-5">
        <span>麦克风</span>
        <a-select defaultValue="请选择麦克风"
                  v-model="audioInput" class="mt-2">
          <a-select-option v-for="audioInput in audioInputList"
                           :key="audioInput.id"
                           :value="audioInput.id"
          >{{audioInput.label}}
          </a-select-option>
        </a-select>
        <a-slider :defaultValue="30" class="my-0 mt-1 mx-0 dragable"/>
        <span class="text-xs text-grey-darkest">麦克风测试</span>
      </div>

      <div class="flex flex-col mt-5">
        <span>扬声器</span>

        <a-select defaultValue="请选择扬声器"
                  v-model="audioOutput" class="mt-2">
          <a-select-option v-for="audioOutput in audioOutputList"
                           :key="audioOutput.id"
                           :value="audioOutput.id"
          >{{audioOutput.label}}
          </a-select-option>
        </a-select>
        <div class="mt-2 flex items-center">
          <a-icon type="play-circle" class="text-indigo"/>
          <span class="ml-1 text-xs text-grey-darkest">播放测试音频</span>
        </div>
      </div>
      <a-button type="primary" block class="mt-5">保存</a-button>
    </div>
  </a-layout>
</template>

<script>
import VideoView from '../Common/VideoView.vue';

export default {
  name       : 'TabSettingMedia',
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
  #tab-setting-media {
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
