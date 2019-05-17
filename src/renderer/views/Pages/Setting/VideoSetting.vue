<template>
  <a-layout id="video-setting" class="h-full">
    <app-header :title="$t('setting.video.title')"/>
    <div class=" border h-full m-4 bg-white p-5 overflow-y-auto">
      <div class="flex flex-col">
        <div class="flex flex-col">
          <span class="leading-normal">{{$t('setting.video.camera')}}</span>
          <div class="flex items-center mt-2">
            <a-select v-if="videoInputDevices.length > 0"
                      v-model="videoInputDeviceId"
                      style="width: 320px;">
              <a-select-option v-for="videoInput in videoInputDevices"
                               :key="videoInput.deviceId"
              >{{videoInput.label | filterLabel}}
              </a-select-option>
            </a-select>
            <a-input v-else
                     :value="$t('conversation.setting.noDevice')"
                     disabled read-only
                     class="pl-4 mt-2 select-none text-black9 bg-white"
                     style="width: 320px;"/>
            <div class="flex items-end ml-2">
              <span class="text-xs opacity-75">{{$t('setting.video.noneCamera')}}</span>
              <a-popover placement="bottomLeft" trigger="click">
                <div slot="content" style="width: 250px">
                  <div class="text-xs leading-tight flex flex-col">
                    <div class="flex">
                      <div class="mr-1">·</div>
                      {{$t('setting.video.cameraNotice.open')}}
                    </div>
                    <div class="flex">
                      <div class="mr-1">·</div>
                      {{$t('setting.video.cameraNotice.correct')}}
                    </div>
                    <div class="flex">
                      <div class="mr-1">·</div>
                      {{$t('setting.video.cameraNotice.single')}}
                    </div>
                    <div class="flex">
                      <div class="mr-1">·</div>
                      {{$t('setting.video.cameraNotice.restart')}}
                    </div>
                  </div>
                  <a-divider></a-divider>
                  <div class="text-xs mt-1 leading-tight">
                    {{$t('setting.video.questionNotice')}}
                    <span
                      class="text-indigo cursor-pointer"
                      @click="handleTechCenter">
                      {{$t('setting.video.techniqueCenter')}}
                    </span>
                  </div>
                </div>
                <a-iconfont type="icon-tishi" class="ml-2 text-indigo cursor-pointer"/>
              </a-popover>
            </div>
          </div>
        </div>
        <div class="mt-3 relative bg-media" style="height: 180px;width: 320px;">
          <video-view
            muted
            class="w-full h-full bg-white"
            object-fit="cover"/>
        </div>
      </div>
      <div class="flex flex-col mt-3">
        <div class="mt-3 leading-normal">
          <a-switch size="small" v-model="muteVideoWhenJoin"/>
          <span class="ml-5">{{$t('setting.video.disableVideo')}}</span>
        </div>
      </div>
      <div class="mt-3">
        <a-switch size="small" v-model="enableLocalVideo"/>
        <span class="ml-5 setting-label">{{$t('setting.video.enableLocalVideo')}}</span>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { shell } from 'electron';
import AppHeader from '../../../components/Main/MainHeader.vue';
import VideoView from '../../../components/Common/VideoView.vue';

export default {
  name : 'VideoSetting',

  components : {
    AppHeader,
    VideoView,
  },

  sketch : [ 
    {
      ns    : 'setting',
      props : [
        'hardwareAcceleration',
        'muteVideoWhenJoin',
        'horizontalMirroring',
        'enableLocalVideo',
      ],
    },
    {
      ns    : 'media',
      props : [ 'videoInputDevices', 'videoInputDeviceId' ],
    },
  ],

  data() {
    return {
      techSupportUrl : 'http://www.yealink.com',
    };
  },

  methods : {
    handleTechCenter() {
      shell.openExternal(this.techSupportUrl);
    },
  },
  filters : {
    filterLabel(val) {
      return /^(.*)\(.*\)$/.test(val) ? RegExp.$1 : val;
    },
  },

  mounted() {
    console.warn('mounted');
  },
  updated() {
    console.warn('updated');
  },

  deactivated() {
    // this.$dispatch('setting.save');
  },

  destroyed() {
    // this.$dispatch('setting.save');
  },
};
</script>

<style lang="less">
  #video-setting {

    .local-video-bg {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      .display-icon {
        opacity: 0.4;
        color: white;
        font-size: 84px;
      }

    }
  }
</style>
