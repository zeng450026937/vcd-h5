<template>
  <a-layout id="window" class="h-full bg-white">
    <div class="flex flex-col p-5 h-full">
      <div class="flex flex-grow mt-5">
        <div class="flex h-12">
          <a-avatar :size="48" class="target-avatar">{{this.displayName.substr(-2,2)}}</a-avatar>
          <div class="flex flex-col ml-5">
            <span class="text-base leading-none font-bold">{{this.displayName}}</span>
            <span class="text-base leading-none mt-4">{{isVideoCall ? '邀请您进行视频通话': '邀请您参加语音通话'}}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-4 self-end">
        <!--麦克风（接听）-->
        <a-button v-if="isVideoCall" class="text-base w-36"
                  @click="transferToAudio">
          <a-iconfont type="icon-qiehuan"/>
          转语音通话
        </a-button>
        <!--麦克风（接听）-->
        <a-button class="text-base w-14 ml-3 text-white border-transparent"
                  type="primary"
                  @click="answerCall(false)">
          <a-iconfont type="icon-yuyin"/>
        </a-button>
        <!--挂断-->
        <a-button class="text-base w-14 text-white ml-3 bg-red-light border-transparent"
                  @click="hangUp">
          <a-iconfont type="icon-guaduan"/>
        </a-button>
      </div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name     : 'WindowRinging',
  computed : {
    rtc() {
      return (window.opener && window.opener.rtc) || window.rtc;
    },
    kom() {
      return (window.opener && window.opener.kom) || window.kom;
    },
    displayName() {
      const { remoteIdentity } = this.rtc.call.incoming[0];

      return (remoteIdentity && (remoteIdentity.display_name
        || remoteIdentity.uri.user)) || '未知用户';
    },
    isVideoCall() {
      const { callInfo } = this.rtc.account.newChannel[0]; // 只考虑一路

      return callInfo && callInfo.video;
    },
  },
  mounted() {
    setInterval(() => {
      this.checkStatus();
    }, 1000);
  },
  methods : {
    hangUp() {
      this.kom.dispatch('call.decline');
    },
    answerCall(toAudio = false) {
      this.kom.dispatch('call.answer', { toAudio });
      window.close();
    },
    transferToAudio() {
      this.answerCall(true);
    },
    checkStatus() {
      if (!this.rtc.call.ringing) {
        window.close();
      }
    },
  },
};
</script>

<style lang="less">
</style>
