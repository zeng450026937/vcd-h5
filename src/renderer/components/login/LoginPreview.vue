<template>
  <a-layout id="login-preview" class="flex-col items-center bg-transparent mt-16">
    <div class="yealink-title text-green-dark">
      Yealink
    </div>
    <div class="w-1/3">
      <a-button type="default"
                class="w-full rounded-full h-10 text-lg"
                @click.stop.self="onLogin">登 录</a-button>
    </div>
    <div class="w-1/3 mt-4">
      <a-button type="default"
                class="w-full rounded-full h-10 text-lg"
                @click.stop.self="onMeeting">加入会议</a-button>
    </div>
    <div class="mt-4 text-white">
      <span class="text-base mr-2">还没有账号?</span>
      <span class="font-semibold ml-2 cursor-pointer text-base">注册账号</span>
    </div>
  </a-layout>
</template>

<script>
export default {
  name     : 'LoginPreview',
  computed : {
    serverType() {
      return this.$model.login.serverType;
    },
  },
  methods : {
    onLogin() {
      this.$model.login.loginType = 'login';
      if (!this.serverType) {
        this.$model.login.forceServerMenu = true;
      }
      else {
        const routeMap = {
          cloud : '/login/cloud',
          yms   : '/login/yms',
        };

        this.$router.push(routeMap[this.serverType]);
      }
    },
    onMeeting() {
      this.$model.login.loginType = 'meeting';
      if (!this.serverType) {
        this.$model.login.forceServerMenu = true;
      }
      else {
        const routeMap = {
          cloud : '/login/m-cloud',
          yms   : '/login/m-yms',
        };

        this.$router.push(routeMap[this.serverType]);
      }
    },
  },
};
</script>

<style scoped lang="less">
  #login-preview {
    .yealink-title {
      font-size: 140px;
    }
  }
</style>
