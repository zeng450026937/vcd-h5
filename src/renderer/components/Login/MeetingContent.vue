<template>
  <a-layout id="yms-meeting" class="bg-media h-full absolute w-full">
    <div class="h-full z-10 flex flex-col">
      <div class="flex h-full flex-col justify-center absolute pin-t w-full">
        <div v-if="!isInSetting" class="enter-meeting-content mr-5 self-end rounded-sm">
          <div class="flex justify-end">
            <a-iconfont type='icon-kongzhi'
                        title="设置"
                        class="text-lg cursor-pointer text-white"
                        @click="isInSetting = true"/>
          </div>
          <div class="p-4">
            <h2 class="text-white">加入会议</h2>
            <div class="mt-10 flex flex-col">
              <div class="input-with-icon">
                <a-input
                    v-number-only
                    placeholder='会议ID'
                    :value="meetingData.account"
                    @change="onAccountChange"
                >
                  <a-iconfont slot="prefix" type='icon-ID' class="text-base text-black9"/>
                </a-input>
              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    placeholder='会议密码(选)'
                    type='password'
                    :value="meetingData.pin"
                    @change="onPasswordChange"
                >
                  <a-iconfont slot="prefix" type='icon-mima' class="text-base text-black9"/>
                </a-input>
              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    v-model="meetingData.server"
                    placeholder='服务器'
                >
                  <a-iconfont slot="prefix" type='icon-fuwuqi' class="text-base text-black9"/>
                </a-input>
              </div>
              <div class="mt-4 input-with-icon">
                <a-input
                    v-model="meetingData.displayName"
                    placeholder='昵称'
                >
                  <a-iconfont slot="prefix" type='icon-ren' class="text-base text-black9"/>
                </a-input>
              </div>

              <div class="mt-5 input-with-icon">
                <div class="flex text-white justify-end items-center">
                  <div class="cursor-pointer" @click="isProxyPanelVisible = !isProxyPanelVisible">
                    <span>代理服务器</span>
                    <a-iconfont :type="isProxyPanelVisible ? 'icon-up' : 'icon-down'" class="ml-2"></a-iconfont>
                  </div>
                </div>
              </div>

              <div v-if="isProxyPanelVisible" class="mt-3 mb-5 input-without-icon flex justify-between">
                <a-input
                    v-model="meetingData.proxyAddress"
                    placeholder='代理服务器地址'
                    style="width: 188px;"
                >
                </a-input>
                <a-input
                    v-model="meetingData.proxyPort"
                    v-number-only
                    placeholder='端口'
                    style="width: 76px;"
                >
                </a-input>
              </div>

            </div>
            <div class="mt-5 flex flex-col">
              <a-button type="primary"
                        @click="joinMeeting">加入</a-button>
              <a-button block class="mt-4" @click="returnLogin">返回登录</a-button>
            </div>
          </div>
        </div>
        <div v-else class="setting-content self-end rounded-sm mr-5">
          <div class="text-white">
            <a-iconfont type="icon-left"
                        title="返回"
                        class="cursor-pointer text-base"
                        @click="isInSetting = false"/>
          </div>
          <div class="setting-media-content m-4">
            <tab-setting-media :show-video="false"/>
          </div>
        </div>
      </div>
      <div class="flex flex-grow"></div>
      <div class="controls-content flex justify-center pb-5">
        <a-button shape="circle"
                  class="controls-btn text-lg w-10 h-10 border-transparent"
                  :title="videoIcon.title"
                  :class="{[`bg-${videoIcon.color}`] : true}"
                  @click="triggerVideo">
          <a-iconfont :type="videoIcon.icon" class="text-white"/>
        </a-button>
        <a-button class="controls-btn text-lg w-10 h-10 ml-3 border-transparent"
                  :title="audioIcon.title"
                  :class="{[`bg-${audioIcon.color}`] : true}"
                  shape="circle"
                  @click="triggerAudio">
          <a-iconfont :type="audioIcon.icon" class="text-white"/>
        </a-button>
      </div>
    </div>
    <video-view v-if="!muteVideo" object-fit="cover" muted class="z-0 bg-media"/>
    <div v-else class="local-video-bg flex flex-grow flex-col items-center justify-center">
      <a-iconfont type="icon-shipinjinyong" class="display-icon"/>
    </div>
  </a-layout>
</template>

<script>
import TabSettingMedia from '../Conference/TabSettingMedia.vue';
import VideoView from '../Common/VideoView.vue';
import { LOGIN } from '../../router/constants';

export default {
  name       : 'YMAMeeting',
  components : {
    TabSettingMedia,
    VideoView,
  },
  data() {
    return {
      meetingData : {
        account     : '',
        pin         : '',
        displayName : '',
        server      : '',
        proxy       : '',
      },
      showProxyItem       : false,
      isInSetting         : false,
      isProxyPanelVisible : false,
    };
  },
  computed : {
    muteAudio : {
      get() {
        return this.$rtc.media.localMedia.muteAudio;
      },
      set(val) {
        this.$rtc.media.localMedia.muteAudio = val;
      },
    },
    muteVideo : {
      get() {
        return this.$rtc.media.localMedia.muteVideo;
      },
      set(val) {
        this.$rtc.media.localMedia.muteVideo = val;
      },
    },
    localStream() {
      return this.$rtc.media.localMedia.stream;
    },
    videoIcon() {
      return this.muteVideo ? {
        title : '打开摄像头',
        icon  : 'icon-shipinjinyong',
        color : 'red-light',
      } : {
        title : '关闭摄像头',
        icon  : 'icon-shipin',
        color : '',
      };
    },
    audioIcon() {
      return this.muteAudio ? {
        title : '打开麦克风',
        icon  : 'icon-maikefengjinyong',
        color : 'red-light',
      } : {
        title : '关闭麦克风',
        icon  : 'icon-maikefeng',
        color : '' };
    },
    meetingBtnClasses() {
      return {};
    },
    meetingEnabled() {
      return this.meetingData.account && this.meetingData.displayName;
    },
    isConnecting() {
      return this.$rtc.conference.connecting;
    },
  },
  methods : {
    onAccountChange(e) {
      const { value } = e.target;
      const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

      if ((!Number.isNaN(value) && reg.test(value)) || value === '') {
        if (value.length <= 64) {
          this.meetingData.account = value;
        }
      }
    },
    onPasswordChange(e) {
      const { value } = e.target;
      const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

      if ((!Number.isNaN(value) && reg.test(value)) || value === '') {
        this.meetingData.pin = value;
      }
    },
    joinMeeting() {
      if (!this.meetingData.account) {
        this.$message.error('会议号码不可为空');
        
        return;
      }
      this.$dispatch('meeting.joinMeeting', this.meetingData);
    },
    returnLogin() {
      this.$model.login.loginType = 'login';
      this.$router.push(LOGIN.LOGIN_CONTENT);
    },
    handleMeeting() {
    },
    goBack() {
      this.$model.login.loginType = 'login';
      this.$router.push('/login/yms');
    },
    triggerAudio() {
      this.muteAudio = !this.muteAudio;
    },
    triggerVideo() {
      this.muteVideo = !this.muteVideo;
    },
  },
};
</script>

<style lang="less">
  #yms-meeting {
    .controls-content {
      button{
        box-shadow: 0 0 8px 0 rgba(255,255,255,0.30);
      }
    }
    .enter-meeting-content, .setting-content {
      background-color: rgba(0, 0, 0, 0.65);
      width: 360px;
      padding: 20px;
    }

    .setting-content {
      padding-bottom: 108px;
      .setting-media-content {
        #tab-setting-media {
          background-color: transparent !important;
          color: white !important;

          > div {
            padding: 0 !important;
          }

          .test-mic-text {
            color: white !important;
          }

          .test-audio-text {
            color: white !important;
          }
        }
      }
    }
    .input-with-icon{
      .ant-input {
        padding-left: 36px;
      }
    }
    .controls-btn {
      background: rgba(0,0,0,0.65);
    }
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
    #tab-setting-media {
      .ant-progress {
        .ant-progress-inner {
          background-color: rgba(153, 153, 153, 0.5);
          .ant-progress-bg {
            background-color: #FFF;
          }
        }
      }
    }
  }
</style>
