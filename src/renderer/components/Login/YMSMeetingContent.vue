<template>
  <a-layout id="yms-meeting" class="bg-transparent h-full">
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
      <a-drawer :closable="false" visible placement="left" :width="320" wrapClassName="yms-meeting-drawer">
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
          <div class="my-2">
            <a-input
                v-model="meetingData.server"
                placeholder='服务器'
                class="h-10"
            >
              <a-icon slot="prefix" type='cloud'/>
            </a-input>
          </div>
          <div class="my-1 text-white flex items-center text-base">
            <div class="flex flex-grow"></div>
            <div class="cursor-pointer"
                 @click="showProxyItem = !showProxyItem">
              <span class="mr-1 select-none">服务器设置</span>
              <a-icon class="text-white" :type="showProxyItem ? 'caret-up': 'caret-down'"/>
            </div>
          </div>
          <transition name="slideY-fade">
            <div class="mb-2 h-10">
              <a-input
                  v-show="showProxyItem"
                  v-model="meetingData.proxy"
                  placeholder='代理服务器'
                  class="h-10"
              >
                <a-icon slot="prefix" type='global'/>
              </a-input>
            </div>
          </transition>
          <div class="flex mt-8 justify-center">
            <a-button class='rounded-full text-white bg-blue border-blue w-2/3'
                      :loading="isConnecting"
                      :class="meetingBtnClasses"
                      :disabled="!meetingEnabled"
                      @click="handleMeeting">
              立即加入
            </a-button>
          </div>
          <div class="flex mt-16">
            <a-icon class="text-white text-3xl cursor-pointer"
                    type="arrow-left" @click="goBack"/>
          </div>
        </div>
      </a-drawer>
    </div>
  </a-layout>
</template>

<script>

import MediaContent from '../Common/MediaContent.vue';

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
  .yms-meeting-drawer {
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
