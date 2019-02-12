<template>
  <a-layout id="yms-meeting" class="bg-transparent h-full">
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
            <a-iconfont slot="prefix" type='icon-ID'/>
          </a-input>
          <div class="mt-5">
            <a-input
                v-model="meetingData.pin"
                placeholder='会议密码(选填)'
            >
              <a-iconfont slot="prefix" type='icon-mima'/>
            </a-input>
          </div>
          <div class="mt-5">
            <a-input
                v-model="meetingData.server"
                placeholder='服务器'
            >
              <a-iconfont slot="prefix" type='icon-fuwuqi'/>
            </a-input>
          </div>
        </div>
        <div class="mt-10 flex flex-col">
          <a-button type="primary" block>登陆</a-button>
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
      <!--<media-content/>-->
    </div>
    <div class="flex flex-grow"></div>
    <div class="flex justify-center pb-5">
      <a-button ghost shape="circle" class="text-xl w-12 h-12 mx-4 bg-black-lightest">
        <a-iconfont type="icon-shexiangtou"/>
      </a-button>
      <a-button ghost class="w-12 h-12 text-xl mx-4 bg-black-lightest"
                shape="circle">
        <a-iconfont type="icon-maikefeng"/>
      </a-button>
    </div>
  </a-layout>
</template>

<script>
import TabSettingMedia from '../Conference/TabSettingMedia.vue';
import { LOGIN } from '../../router/constants';

export default {
  name       : 'YMAMeeting',
  components : {
    TabSettingMedia,
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
      muteAudio     : false,
      muteVideo     : false,
    };
  },
  computed : {
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
    returnLogin() {
      this.$router.push(LOGIN.YMS_LOGIN);
    },
    handleMeeting() {
    },
    goBack() {
      this.$model.login.loginType = 'login';
      this.$router.push('/login/yms');
    },
    triggerAudio() {

    },
    triggerVideo() {

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
  }
</style>
