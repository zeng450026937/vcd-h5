<template>
  <a-layout id="conference-setting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>会议</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5 overflow-y-auto">
      <div>
        <div class="flex flex-col">
          <div class="flex items-center">
            <span class="border-l-4 border-black h-4"></span>
            <span class="setting-title">内容共享</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="minWindowWhenSharing"/>
            <span class="setting-label">发送内容共享时最小化VCD窗口</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="maxWindowWhenWatchingSharing"/>
            <span class="setting-label">观看他人内容共享时自动最大化VCD窗口</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="enableGpu"/>
            <span class="setting-label">屏幕共享时启用GPU加速</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="preferredPictureFluency"/>
            <span class="setting-label">画面流畅度优先</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="shareComputerSound"/>
            <span class="setting-label">共享电脑声音</span>
          </div>
        </div>
      </div>
      <div>
        <div class="flex flex-col mt-5">
          <div class="flex items-center">
            <span class="border-l-4 border-black h-4"></span>
            <span class="setting-title">基本设置</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="autoSilence"/>
            <span class="setting-label">入会自动静音</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="noticeWhenLeaving"/>
            <span class="setting-label">入会及离会提示音</span>
            <a-iconfont type="icon-tishi" class="ml-3 text-indigo-dark cursor-pointer text-base"/>
          </div>
          <!--入会及离会提示音-->
          <div class="flex flex-col ml-10">
            <div class="mt-2">
              <a-checkbox>
                <span class="setting-label ml-1">仅入会方接收提示音</span>
              </a-checkbox>
            </div>
            <div class="mt-2">
              <a-checkbox>
                <span class="setting-label ml-1">仅入会方和主持人接收提示音</span>
              </a-checkbox>
            </div>
            <div class="mt-2">
              <a-checkbox>
                <span class="setting-label ml-1">所有参会方接收提示音</span>
              </a-checkbox>
            </div>
          </div>
          <div class="mt-3">
            <span class="setting-label ml-0">提前入会时间</span>
            <a-input class="w-16 mx-4" v-model="advanceEntryTime"/>
            <span class="setting-label ml-0">分钟</span>
            <span class="text-black9 setting-label ml-0">（请设置5~180分钟）</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="instanceMeetingPassword"/>
            <span class="setting-label">即时会议密码</span>
          </div>

          <div class="mt-3">
            <a-switch size="small" v-model="reserveMeetingPassword"/>
            <span class="setting-label">预约会议密码</span>
          </div>

          <div class="mt-3 ml-10">
            <a-radio-group class="flex flex-col">
              <a-radio :value="1">
                <span class="setting-label ml-1">随机密码</span>
              </a-radio>
              <a-radio :value="2" class="mt-3">
                <span class="setting-label ml-1">自定义密码</span>
                <a-input class="mx-3" style="width: 140px;"/>
                <span class="text-black9 setting-label ml-0">（请输入6位纯数字）</span>
                <a-button>保存</a-button>
              </a-radio>
            </a-radio-group>
          </div>

          <div class="mt-3">
            <a-switch size="small"/>
            <span class="setting-label">登录选项框</span>
          </div>
          <div class="mt-3">
            <a-switch size="small" v-model="dndWhenCalling"/>
            <span class="setting-label">通话中免打扰</span>
          </div>
        </div>
      </div>
      <div>
        <div class="mt-10">
          <a-button type="primary">
            <span class="leading-tight px-1">高级设置</span>
          </a-button>
        </div>
      </div>
    </div>

  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';

export default {
  name       : 'ConferenceSetting',
  components : {
    AppHeader,
  },
  computed : {
    minWindowWhenSharing : {
      get() { return this.$model.setting.conference.minWindowWhenSharing; },
      set(val) { this.$model.setting.conference.minWindowWhenSharing = val; },
    },
    maxWindowWhenWatchingSharing : {
      get() { return this.$model.setting.conference.maxWindowWhenWatchingSharing; },
      set(val) { this.$model.setting.conference.maxWindowWhenWatchingSharing = val; },
    },
    enableGpu : {
      get() { return this.$model.setting.conference.enableGpu; },
      set(val) { this.$model.setting.conference.enableGpu = val; },
    },
    autoSilence : {
      get() { return this.$model.setting.conference.autoSilence; },
      set(val) { this.$model.setting.conference.autoSilence = val; },
    },
    noticeWhenLeaving : {
      get() { return this.$model.setting.conference.noticeWhenLeaving; },
      set(val) { this.$model.setting.conference.noticeWhenLeaving = val; },
    },
    advanceEntryTime : {
      get() { return this.$model.setting.conference.advanceEntryTime; },
      set(val) { this.$model.setting.conference.advanceEntryTime = val; },
    },
    instanceMeetingPassword : {
      get() { return this.$model.setting.conference.instanceMeetingPassword; },
      set(val) { this.$model.setting.conference.instanceMeetingPassword = val; },
    },
    reserveMeetingPassword : {
      get() { return this.$model.setting.conference.reserveMeetingPassword; },
      set(val) { this.$model.setting.conference.reserveMeetingPassword = val; },
    },
    dndWhenCalling : {
      get() { return this.$model.setting.conference.dndWhenCalling; },
      set(val) { this.$model.setting.conference.dndWhenCalling = val; },
    },
    shareComputerSound : {
      get() { return this.$model.setting.conference.shareComputerSound; },
      set(val) { this.$model.setting.conference.shareComputerSound = val; },
    },
    preferredPictureFluency : {
      get() { return this.$model.setting.conference.preferredPictureFluency; },
      set(val) { this.$model.setting.conference.preferredPictureFluency = val; },
    },
  },
  deactivated() {
    this.$model.setting.conference.save(); // 页面不显示的时候保存设置
  },
  destroyed() {
    this.$model.setting.conference.save(); // 页面不显示的时候保存设置
  },
};
</script>

<style lang="less">
#conference-setting {
  .setting-title {
    font-weight: 600;
  }
  .setting-title, .setting-label {
    padding-left: 12px;
    font-size: 14px;
    color: #333333;
    line-height: 22px;
  }
}
</style>
