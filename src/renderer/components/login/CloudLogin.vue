<template>
  <a-layout id="cloud-login" class="col-flex justify-center items-center bg-transparent">
    <div class="flex flex-grow"></div>
    <div class="text-white text-2xl mb-8">
      登录获得更佳体验
    </div>
    <div class="items-center justify-center w-1/3 h-full">
      <div class="flex items-center">
        <div class="flex-grow mr-2">
          <a-input
              v-model="loginData.account"
              placeholder='电话或电子邮件'
              class="h-10"
          >
            <a-icon slot="prefix" type='user'/>
          </a-input>
        </div>
      </div>
      <div class="flex items-center mt-6">
        <div class="flex-grow mr-2">
          <a-input
              v-model="loginData.pin"
              type='password'
              placeholder='密码'
              class="h-10"
          >
            <a-icon slot="prefix" type='lock'/>
          </a-input>
        </div>
        <div class="flex-shrink text-white">
        </div>
      </div>
      <div class="flex mt-6">
        <a-checkbox class="text-white">
          自动登录
        </a-checkbox>
      </div>
      <div class="mt-8 text-center">
        <a-button class='rounded-full h-10 w-2/3'
                  type="primary"
                  :loading="isConnecting"
                  :disabled="!loginEnabled"
                  @click="handleLogin">
          登 录
        </a-button>
        <a-button class='rounded-full border-transparent h-10 w-2/3 mt-4'
                  @click="joinMeeting">
          加入会议
        </a-button>
      </div>
    </div>
    <div class="flex flex-grow"></div>
    <div class="flex text-white mb-2">
      <span class="text-base cursor-pointer">忘记密码</span>
      <div class="w-px bg-white mx-2"></div>
      <span class="text-base cursor-pointer">注册账号</span>
      <div class="w-px bg-white mx-2"></div>
      <span class="text-base cursor-pointer">登录设置</span>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'LoginCloud',
  data() {
    return {
      loginData : {
        account : '',
        pin     : '',
      },
    };
  },
  computed : {
    isConnecting() {
      return this.$rtc.account.connecting;
    },
    loginEnabled() {
      return this.loginData.account && this.loginData.pin;
    },
  },
  methods : {
    handleLogin() {
      this.$dispatch('login.doLogin');
      // console.warn(this.loginData);
    },
    joinMeeting() {
      this.$model.login.loginType = 'meeting';
      this.$router.push('/login/m-cloud');
    },
  },
};
</script>

<style scoped lang="less">
</style>
