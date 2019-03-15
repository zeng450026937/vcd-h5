<template>
  <a-layout id="audio-setting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>音频</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5">
      <div class="" style="width: 320px;">
        <div class="flex flex-col">
          <span class="leading-normal">音频输入</span>
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
          <span class="leading-normal">音频输出</span>

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
    this.$model.setting.device.save('device'); // 页面不显示的时候保存设置
    this.$rtc.media.localMedia.releaseStream();
  },
  sketch : {
    ns    : 'setting.device',
    props : [ 'audioInput', 'audioOutput' ],
  },
  computed : {
    volume() {
      return this.$rtc.media.localMedia.volume;
    },
    audioInputList() { // 麦克风
      return this.$rtc.media.audioInputs;
    },
    audioOutputList() { // 扬声器
      return this.$rtc.media.audioOutputs;
    },
  },
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
