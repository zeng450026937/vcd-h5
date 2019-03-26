<template>
  <a-layout class="bg-transparent" id="media-content">
    <div class="flex flex-col select-none px-4">
      <div class="flex flex-col">
        <span>摄像头</span>
        <a-select defaultValue="请选择摄像头"
                  v-model="videoInputDeviceId" class="mt-2">
          <a-select-option v-for="videoInput in videoInputDevices"
                           :key="videoInput.deviceId + videoInput.groupId"
          >{{videoInput.label}}
          </a-select-option>
        </a-select>
        <div class="mt-2 relative" style="height: 158px;">
          <video-view class="h-full bg-white" position="absolute" object-fit="cover"/>
        </div>
      </div>

      <div class="flex flex-col mt-5">
        <span>麦克风</span>
        <a-select defaultValue="请选择麦克风"
                  v-model="audioInputDeviceId" class="mt-2">
          <a-select-option v-for="audioInput in audioInputDevices"
                           :key="audioInput.deviceId + audioInput.groupId"
          >{{audioInput.label}}
          </a-select-option>
        </a-select>
        <a-slider :defaultValue="30" class="my-0 mt-1 mx-0 dragable"/>
        <span class="test-mic-text text-xs">麦克风测试</span>
      </div>

      <div class="flex flex-col mt-5">
        <span>扬声器</span>

        <a-select defaultValue="请选择扬声器"
                  v-model="audioOutputDeviceId" class="mt-2">
          <a-select-option v-for="audioOutput in audioOutputDevices"
                           :key="audioOutput.deviceId + audioOutput.groupId"
          >{{audioOutput.label}}
          </a-select-option>
        </a-select>
        <div class="mt-2 flex items-center">
          <a-icon type="play-circle" class="test-audio-text"/>
          <span class="test-audio-text ml-1 text-xs">播放测试音频</span>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import VideoView from './VideoView.vue';

// TODO combine mediaContent & TabSettingMedia
export default {
  name       : 'MediaContent',
  components : {
    VideoView,
  },
  sketch : {
    ns    : 'media',
    props : [ 
      'audioInputDeviceId',
      'audioInputDevices',
      'audioOutputDeviceId',
      'audioOutputDevices',
      'videoInputDeviceId',
      'videoInputDevices',
    ],
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
