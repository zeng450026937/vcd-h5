<template>
  <a-layout id="audio-setting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>{{$t('setting.audio.title')}}</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5 overflow-y-auto">
      <div class="" style="width: 320px;">
        <div class="flex flex-col">
          <span class="leading-normal">{{$t('setting.audio.audioInput')}}</span>
          <a-select v-if="audioInputDevices.length > 0"
                    v-model="audioInputDeviceId" class="mt-2">
            <a-select-option v-for="audioInput in audioInputDevices"
                             :key="audioInput.deviceId"
            >{{audioInput.label | filterLabel}}
            </a-select-option>
          </a-select>
          <a-input v-else
                   :value="$t('conversation.setting.noDevice')"
                   disabled read-only
                   class="pl-4 mt-2 select-none text-black9 bg-white"/>
          <volume-progress />
          <span class="test-mic-text leading-tight text-xs text-black6">{{$t('setting.audio.microphoneTest')}}</span>
        </div>
        <div class="mt-5">
          <a-switch size="small" v-model="noiseSuppression"/>
          <span class="ml-5">{{$t('setting.audio.clearNoise')}}</span>
        </div>
        <div class="flex flex-col mt-5">
          <span class="leading-normal">{{$t('setting.audio.audioOutput')}}</span>

          <a-select v-if="audioOutputDevices.length > 0"
                    v-model="audioOutputDeviceId" class="mt-2">
            <a-select-option v-for="audioOutput in audioOutputDevices"
                             :key="audioOutput.deviceId"
            >{{audioOutput.label}}
            </a-select-option>
          </a-select>
          <a-input v-else
                   :value="$t('conversation.setting.noDevice')"
                   disabled read-only
                   class="pl-4 mt-2 select-none text-black9 bg-white"/>
          <div class="mt-2 flex items-center text-indigo">
            <a-iconfont :type="isPlaying ? 'icon-tingzhi' : 'icon-bofang'"
                        class="test-audio-text text-base cursor-pointer"
                        @click="playTestMusic"/>
            <span class="test-audio-text ml-1 text-xs leading-tight">{{$t('setting.audio.play')}}</span>
          </div>
        </div>
      </div>
      <audio ref="testAudio" @ended="isPlaying = false" @playing="isPlaying = true">
        <source src="../../../assets/sounds/testspeaker.ogg"
                type="audio/ogg;codec='vorbis'">
      </audio>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../../../components/Main/MainHeader.vue';
import VolumeProgress from '../../../components/Common/VolumeProgress.vue';

export default {
  name       : 'AudioSetting',
  components : {
    AppHeader,
    VolumeProgress,
  },
  data() {
    return {
      isPlaying : false,
    };
  },
  mounted() {
    this.$rtc.media.localMedia.acquireStream();
  },
  destroyed() {
    this.$rtc.media.localMedia.releaseStream();
    this.$dispatch('setting.save');
  },
  sketch : [
    {
      ns    : 'setting',
      props : [ 'noiseSuppression' ],
    },
    {
      ns    : 'media',
      props : [ 
        'audioInputDeviceId',
        'audioInputDevices',
        'audioOutputDeviceId',
        'audioOutputDevices',
      ],
    },
  ],
  computed : {
    audioOutputDevice() {
      return this.$model.media.audioOutputDevice;
    },
  },
  methods : {
    playTestMusic() {
      this.$refs.testAudio.play().then(() => {});
    },
  },
  watch : {
    audioOutputDevice(val) {
      this.$refs.testAudio.setSinkId(val.deviceId);
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
