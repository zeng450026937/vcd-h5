<template>
  <a-layout id="window" class="h-full bg-white">
    <div class="flex flex-col p-5 h-full">
      <div class="flex flex-grow mt-5">
        <div class="flex h-12">
          <a-avatar :size="48" class="target-avatar">{{this.displayName.substr(-2,2)}}</a-avatar>
          <div class="flex flex-col ml-5">
            <span class="text-base leading-none font-bold">{{this.displayName}}</span>
            <span class="text-base leading-none mt-4">邀请您参加语言通话</span>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-4 self-end">
        <!--麦克风（接听）-->
        <a-button class="text-base w-14 text-white border-transparent"
                  type="primary"
                  @click="answerCall">
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
    displayName() {
      const { remoteIdentity } = this.rtc.call.incoming[0];

      return (remoteIdentity && (remoteIdentity.display_name
        || remoteIdentity.uri.user)) || '未知用户';
    },
  },
  mounted() {
    setInterval(() => {
      this.checkStatus();
    }, 1000);
  },
  methods : {
    hangUp() {
      this.rtc.call.decline().catch(() => {});
    },
    answerCall() {
      this.rtc.call.answer().catch(() => {});
    },
    // getStatus() {
    //   if (this.rtc.call.ringing) return 'ringing';
    //   else if (this.rtc.call.connecting) return 'connecting';
    //   else if (this.rtc.call.connected) return 'connected';
    //   else return 'disconnected';
    // },
    checkStatus() {
      // const status = this.getStatus();
      if (!this.rtc.call.ringing) {
        window.close();
      }
    },
  },
};
</script>

<style lang="less">
</style>
