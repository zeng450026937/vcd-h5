<template>
  <a-layout id="tab-setting-media" class="bg-white">
    <div class="flex flex-col select-none px-4">
      <div class="flex flex-col">
        <span class="leading-normal">摄像头</span>
        <a-select defaultValue="请选择摄像头"
                  v-model="videoInput" class="mt-2">
          <a-select-option v-for="videoInput in videoInputList"
                           :key="videoInput.id"
                           :value="videoInput.id"
          >{{videoInput.label}}
          </a-select-option>
        </a-select>
        <div v-if="showVideo"
             class="video-content mt-2 relative"
             style="height: 140px;">
          <video-view class="w-full h-full bg-white"
                      position="absolute"
                      object-fit="cover"/>
        </div>
      </div>

      <div class="flex flex-col mt-5">
        <span class="leading-normal">麦克风</span>
        <a-select defaultValue="请选择麦克风"
                  v-model="audioInput" class="mt-2">
          <a-select-option v-for="audioInput in audioInputList"
                           :key="audioInput.id"
                           :value="audioInput.id"
          >{{audioInput.label}}
          </a-select-option>
        </a-select>
        <volume-progress />
        <span class="test-mic-text leading-tight text-xs text-black6">麦克风测试</span>
      </div>

      <div class="flex flex-col mt-5">
        <span class="leading-normal">扬声器</span>

        <a-select defaultValue="请选择扬声器"
                  v-model="audioOutput" class="mt-2">
          <a-select-option v-for="audioOutput in audioOutputList"
                           :key="audioOutput.id"
                           :value="audioOutput.id"
          >{{audioOutput.label}}
          </a-select-option>
        </a-select>
        <div class="mt-2 flex items-center text-indigo">
          <a-iconfont :type="isPlaying ? 'icon-tingzhi' : 'icon-bofang'"
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
  deactivated() {

  },
  computed : {
    volume() {
      return this.$rtc.media.localMedia.volume;
    },
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
  methods : {
    playTestMusic() {
      this.$refs.testAudio.play().then(() => {});
    },
  },
};
</script>

<style lang="less">
</style>
