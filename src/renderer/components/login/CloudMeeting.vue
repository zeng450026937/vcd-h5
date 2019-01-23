<template>
  <a-layout id="cloud-meeting" class="bg-transparent h-full">
    <div class="flex h-full flex-col">
      <div class="media-content w-1/3 self-end p-4 m-2 rounded-sm">
        <div class="flex justify-end">
          <a-icon type='setting' class="text-lg cursor-pointer text-white hover:text-blue"/>
        </div>
        <media-content/>
      </div>
      <div class="flex flex-grow"></div>
      <div class="flex justify-center pb-4">
        <a-button ghost shape="circle" icon="video-camera" class="text-xl w-12 h-12 mx-4"/>
        <a-button ghost class="w-12 h-12 text-xl mx-4"
                  shape="circle"
                  icon="sound"/>
      </div>
    </div>
    <div>
      <a-drawer :closable="false" visible placement="left" :width="320" wrapClassName="cloud-meeting-drawer">

        <div class="flex justify-center flex-col px-8 h-full pt-12">
          <div class="text-white text-center text-2xl my-8">
            加入会议
          </div>
          <div class="my-2">
            <a-input
                v-model="meetingData.account"
                placeholder='会议ID'
                class="h-10"
            >
              <a-icon slot="prefix" type='team'/>
            </a-input>
          </div>
          <div class="my-2">
            <a-input
                v-model="meetingData.pin"
                placeholder='会议密码(选填)'
                class="h-10"
            >
              <a-icon slot="prefix" type='lock'/>
            </a-input>
          </div>
          <div class="my-2">
            <a-input
                v-model="meetingData.displayName"
                placeholder='昵称'
                class="h-10"
            >
              <a-icon slot="prefix" type='user'/>
            </a-input>
          </div>

          <div class="flex mt-12 justify-center">
            <a-button class='rounded-full text-white bg-blue border-blue w-2/3'
                      :loading="isConnecting"
                      :class="meetingBtnClasses"
                      :disabled="!meetingEnabled"
                      @click="handleMeeting">
              立即加入
            </a-button>
          </div>
          <div class="flex flex-grow"></div>
          <div class="flex py-6">
            <a-icon class="text-white text-3xl cursor-pointer"
                    type="arrow-left" @click="goBack"/>
          </div>
        </div>

      </a-drawer>
    </div>
  </a-layout>
</template>

<script>

import MediaContent from '../device/MediaContent.vue';

export default {
  name       : 'YMAMeeting',
  components : {
    MediaContent,
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
      muteAudio     : false,
      muteVideo     : false,
      enterPopup    : null,
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
    handleMeeting() {
      this.enterPopup = this.enterPopup || this.$popup.prepared('loadingModal', { content: '正在进入会议...' });
      this.enterPopup.display();
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
  .media-content{
    background-color: rgba(0, 0, 0, 0.4);
  }
  .cloud-meeting-drawer {
    width: auto !important;
    .ant-drawer-mask {
      display: none;
    }
    .ant-drawer-content {
      background-color: rgba(0, 0, 0, 0.4);
      .ant-drawer-body {
        height: 100%;
        padding: 0;
      }
    }
  }
</style>
