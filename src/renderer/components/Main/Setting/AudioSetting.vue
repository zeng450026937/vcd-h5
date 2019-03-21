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
    <div class="flex flex-col border h-full m-4 bg-white p-5">
      <div class="" style="width: 320px;">
        <div class="flex flex-col">
          <span class="leading-normal">{{$t('setting.audio.audioInput')}}</span>
          <a-select :defaultValue="$t('setting.audio.inputPlaceHolder')"
                    v-model="audioInputDevice.deviceId" class="mt-2">
            <a-select-option v-for="audioInput in audioInputDevices"
                             :key="audioInput.deviceId"
                             :value="audioInput.deviceId"
            >{{audioInput.label}}
            </a-select-option>
          </a-select>
          <volume-progress />
          <span class="test-mic-text leading-tight text-xs text-black6">{{$t('setting.audio.microphoneTest')}}</span>
        </div>

        <div class="flex flex-col mt-5">
          <span class="leading-normal">{{$t('setting.audio.audioOutput')}}</span>

          <a-select :defaultValue="$t('setting.audio.outputPlaceHolder')"
                    v-model="audioOutputDevice.deviceId" class="mt-2">
            <a-select-option v-for="audioOutput in audioOutputDevices"
                             :key="audioOutput.deviceId"
                             :value="audioOutput.deviceId"
            >{{audioOutput.label}}
            </a-select-option>
          </a-select>
          <div class="mt-2 flex items-center text-indigo">
            <a-iconfont :type="isPlaying ? 'icon-tingzhi' : 'icon-bofang'"
                        class="test-audio-text text-base cursor-pointer"
                        @click="playTestMusic"/>
            <span class="test-audio-text ml-1 text-xs leading-tight">{{$t('setting.audio.play')}}</span>
          </div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import VolumeProgress from '../../Common/VolumeProgress.vue';

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
    // TODO:device初始化失败
    // this.$model.setting.save('device'); // 页面不显示的时候保存设置
  },
  sketch : [
    {
      ns    : 'setting',
      props : [ 'audioInputDevice', 'audioOutputDevice' ],
    },
    {
      ns    : 'media',
      props : [ 'audioInputDevices', 'audioOutputDevices' ],
    },
  ],
  methods : {
    playTestMusic() {
      this.isPlaying = !this.isPlaying;
    },
  },
};
</script>

<style lang="less">
#audio-setting {
}
</style>
