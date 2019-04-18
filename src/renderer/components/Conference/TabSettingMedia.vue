<template>
  <a-layout id="tab-setting-media" class="bg-white">
    <div class="flex flex-col select-none px-4">
      <div class="flex flex-col">
        <span class="leading-normal">摄像头</span>
        <a-select v-if="videoInputDevices.length > 0"
                  v-model="videoInputDeviceId"
                  :getPopupContainer="selectContainer"
                  class="mt-2">
          <a-select-option v-for="videoInput in videoInputDevices"
                           :key="videoInput.deviceId + videoInput.groupId"
          >{{videoInput.label | filterLabel}}
          </a-select-option>
        </a-select>
        <a-input v-else
                 value="无设备"
                 disabled read-only
                 class="pl-4 mt-2 select-none text-black9 bg-white"/>
        <div v-if="showVideo"
             class="video-content mt-2 relative"
             style="height: 140px;">
          <video-view class="w-full h-full bg-white"
                      muted
                      position="absolute"
                      object-fit="cover"/>
        </div>
      </div>

      <div class="flex flex-col mt-5">
        <span class="leading-normal">麦克风</span>
        <a-select v-if="audioInputDevices.length > 0"
                  v-model="audioInputDeviceId"
                  :getPopupContainer="selectContainer"
                  class="mt-2">
          <a-select-option v-for="audioInput in audioInputDevices"
                           :key="audioInput.deviceId + audioInput.groupId"
          >{{audioInput.label}}
          </a-select-option>
        </a-select>
        <a-input v-else
                 value="无设备"
                 disabled read-only
                 class="pl-4 mt-2 select-none text-black9 bg-white"/>
        <volume-progress />
        <span class="test-mic-text leading-tight text-xs text-black6">麦克风测试</span>
      </div>

      <div class="flex flex-col mt-5">
        <span class="leading-normal">扬声器</span>

        <a-select v-if="audioOutputDevices.length > 0"
                  v-model="audioOutputDeviceId"
                  :getPopupContainer="selectContainer"
                  class="mt-2">
          <a-select-option v-for="audioOutput in audioOutputDevices"
                           :key="audioOutput.deviceId + audioOutput.groupId"
          >{{audioOutput.label}}
          </a-select-option>
        </a-select>
        <a-input v-else
                 value="无设备"
                 disabled read-only
                 class="pl-4 mt-2 select-none text-black9 bg-white"/>
        <div class="mt-2 flex items-center text-indigo">
          <a-iconfont :type="isPlaying ? 'icon-tingzhi' : 'icon-bofang'"
                      title="播放测试音频"
                      class="test-audio-text text-base cursor-pointer"
                      @click="playTestMusic"/>
          <span class="test-audio-text ml-1 text-xs leading-tight">播放测试音频</span>
        </div>
      </div>
      <audio ref="testAudio" @ended="isPlaying = false" @playing="isPlaying = true">
        <source src="../../assets/sounds/testspeaker.ogg"
                type="audio/ogg;codec='vorbis'">
      </audio>
    </div>
  </a-layout>
</template>

<script>
import VideoView from '../Common/VideoView.vue';
import VolumeProgress from '../Common/VolumeProgress.vue';

export default {
  name       : 'TabSettingMedia',
  components : {
    VideoView,
    VolumeProgress,
  },
  data() {
    return {
      isPlaying : false,
    };
  },
  props : {
    showVideo : {
      type    : Boolean,
      default : true,
    },
  },
  destroyed() {
    this.$dispatch('setting.save');
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
  computed : {
    selectContainer() {
      return () => this.$el;
    },
    audioOutputDevice() {
      return this.$model.media.audioOutputDevice;
    },
  },
  watch : {
    audioOutputDevice(val) {
      this.$refs.testAudio.setSinkId(val.deviceId);
    },
  },
  methods : {
    playTestMusic() {
      this.$refs.testAudio.play().then(() => {});
    },
  },
  filters : {
    filterLabel(val) {
      return /^(.*)\(.*\)$/.test(val) ? RegExp.$1 : val;
    },
  },
};
</script>

<style lang="less">
</style>
