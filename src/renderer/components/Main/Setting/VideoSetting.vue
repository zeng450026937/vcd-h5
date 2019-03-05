<template>
  <a-layout id="video-setting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>视频</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5">
      <div class="flex flex-col">
        <div class="flex flex-col">
          <span class="leading-normal">摄像头</span>
          <div class="flex items-center mt-2">
            <a-select defaultValue="请选择摄像头"
                      v-model="videoInput"
                      style="width: 320px;">
              <a-select-option v-for="videoInput in videoInputList"
                               :key="videoInput.id"
                               :value="videoInput.id"
              >{{videoInput.label}}
              </a-select-option>
            </a-select>
            <div class="flex items-end ml-2">
              <span class="text-xs opacity-75">看不到任何视频</span>
              <a-popover placement="bottomLeft" trigger="click"
                         overlayClassName="calendar-info-popover">
                <div slot="content" style="width: 250px">
                  <div class="text-xs leading-tight">
                    <div>· 请确认您的摄像头已经接通并开启。</div>
                    <div>· 检查视频选项以使用正确的网络摄像头。</div>
                    <div>· 请确认其他程序没有占用您的摄像头。</div>
                    <div>· 重启您的电脑</div>
                  </div>
                  <div class="text-xs mt-6 leading-tight">
                    如仍有问题，请访问我们的
                    <span class="text-indigo cursor-pointer">支持中心</span>。
                  </div>
                </div>
                <a-iconfont type="icon-tishi" class="ml-2 text-indigo cursor-pointer"/>
              </a-popover>
            </div>
          </div>
        </div>
        <div class="mt-3 relative" style="height: 180px;width: 320px;">
          <video-view class="w-full h-full bg-white"
                      position="absolute"
                      object-fit="cover"/>
        </div>
      </div>
      <div class="flex flex-col mt-3">
        <div class="leading-normal">
          <a-switch size="small" v-model="enableHDVideo"/>
          <span class="ml-5">启用高清视频</span>
        </div>
        <div class="mt-3 leading-normal">
          <a-switch size="small" v-model="enableHWSpeed"/>
          <span class="ml-5">启用硬件加速</span>
        </div>
        <div class="mt-3 leading-normal">
          <a-switch size="small" v-model="enableMirroring"/>
          <span class="ml-5">启用视频镜像效果</span>
        </div>
        <div class="mt-3 leading-normal">
          <a-switch size="small" v-model="disableVideo"/>
          <span class="ml-5">加入会议时不开启摄像头</span>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import VideoView from '../../Common/VideoView.vue';

export default {
  name       : 'VideoSetting',
  components : {
    AppHeader,
    VideoView,
  },
  data() {
    return {
    };
  },
  computed : {
    videoInput : {
      get() { return this.$model.setting.device.videoInput; },
      set(val) { this.$model.setting.device.videoInput = val; },
    },
    videoInputList() { // 摄像头
      return this.$model.setting.device.videoInputList;
    },
    enableHDVideo : {
      get() { return this.$model.setting.video.enableHDVideo; },
      set(val) { this.$model.setting.video.enableHDVideo = val; },
    },
    enableHWSpeed : {
      get() { return this.$model.setting.video.enableHWSpeed; },
      set(val) { this.$model.setting.video.enableHWSpeed = val; },
    },
    disableVideo : {
      get() { return this.$model.setting.video.disableVideo; },
      set(val) { this.$model.setting.video.disableVideo = val; },
    },
    enableMirroring : {
      get() { return this.$model.setting.video.enableMirroring; },
      set(val) { this.$model.setting.video.enableMirroring = val; },
    },
  },
  deactivated() {
    this.$model.setting.video.save(); // 页面不显示的时候保存设置
  },
  destroyed() {
    this.$model.setting.video.save(); // 页面不显示的时候保存设置
  },
};
</script>

<style scoped>

</style>
