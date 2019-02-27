<template>
  <a-layout id="yms-meeting" class="bg-indigo-darker h-full">
    <div class="h-full z-10 flex flex-col">
      <div class="flex h-full flex-col">
        <div v-if="!isInSetting" class="enter-meeting-content self-end rounded-sm">
          <div class="flex justify-end">
            <a-iconfont type='icon-kongzhi' class="text-lg cursor-pointer text-white"
                        @click="isInSetting = true"/>
          </div>
          <h2 class="text-white mt-4">加入会议</h2>
          <div class="mt-10 flex flex-col">
            <a-input
                v-model="meetingData.account"
                placeholder='会议ID'
            >
              <a-iconfont slot="prefix" type='icon-ID' class="text-base text-black9"/>
            </a-input>
            <div class="mt-5">
              <a-input
                  v-model="meetingData.pin"
                  placeholder='会议密码(选填)'
                  type='password'
              >
                <a-iconfont slot="prefix" type='icon-mima' class="text-base text-black9"/>
              </a-input>
            </div>
            <div class="mt-5">
              <a-input
                  v-model="meetingData.server"
                  placeholder='服务器'
              >
                <a-iconfont slot="prefix" type='icon-fuwuqi' class="text-base text-black9"/>
              </a-input>
            </div>
          </div>
          <div class="mt-10 flex flex-col">
            <a-button type="primary" block @click="joinMeeting">加入</a-button>
            <a-button block class="mt-5" @click="returnLogin">返回登陆</a-button>
          </div>
        </div>
        <div v-else class="setting-content self-end rounded-sm">
          <div class="text-white">
            <a-iconfont type="icon-left" class="cursor-pointer text-base" @click="isInSetting = false"/>
          </div>
          <div class="setting-media-content mt-5">
            <tab-setting-media :show-video="false"/>
          </div>
        </div>
      </div>
      <div class="flex flex-grow"></div>
      <div class="flex justify-center pb-5">
        <a-button shape="circle"
                  class="controls-btn text-xl w-12 h-12 mx-4 border-transparent"
                  @click="triggerVideo">
          <a-iconfont :type="videoIcon" class="text-white"/>
        </a-button>
        <a-button class="controls-btn w-12 h-12 text-xl mx-4 border-transparent"
                  shape="circle"
                  @click="triggerAudio">
          <a-iconfont :type="audioIcon" class="text-white"/>
        </a-button>
      </div>
    </div>
    <video-view v-if="!muteVideo" class="z-0 bg-indigo-darker"/>
    <div v-else class="local-video-bg flex flex-grow flex-col items-center justify-center">
      <a-iconfont type="icon-huiyishi" class="display-icon"/>
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
        account     : '9001',
        pin         : '123456',
        displayName : 'C',
        server      : 'academia.com',
        proxy       : '10.86.112.165',
      },
      showProxyItem : false,
      isInSetting   : false,
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
      return this.muteVideo ? 'icon-shexiangtoujinyong' : 'icon-shexiangtou';
    },
    audioIcon() {
      return this.muteAudio ? 'icon-maikefengjinyong' : 'icon-maikefeng';
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
    joinMeeting() {
      this.$dispatch('meeting.joinMeeting', this.meetingData);
    },
    returnLogin() {
      this.$model.login.loginType = 'login';
      this.$router.push(LOGIN.YMS_LOGIN);
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
    .enter-meeting-content, .setting-content {
      background-color: rgba(0, 0, 0, 0.65);
      width: 320px;
      height: 420px;
      margin-top: 70px;
      margin-right: 20px;
      padding: 20px;
    }

    .setting-content {
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

    .ant-input {
      padding-left: 36px;
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
