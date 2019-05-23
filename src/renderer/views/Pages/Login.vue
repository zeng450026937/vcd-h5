<template>
  <div id="login-content" class="h-full flex">
    <div class="h-full">
      <div class="side h-full">
      <login-header class="header" :useOperationBar="false" />
      <img  ondragstart="return false;" class="bg" src="../../assets/login-bg.png"/>
      <div class="logo z-10">
        Yealink
      </div>
    </div>
    </div>
    <div class="main">
      <login-header :use-drop-down="!showSetting" :background="'#ffffff'" :use-title="false" />
      <div class="w-full content" v-show="!showSetting">
        <login-form-content @openSetting="openSetting"/>
      </div>
      <div class="w-full content" v-if="showSetting">
        <login-setting-content  @closeSetting="closeSetting"/>
      </div>

    </div>
  </div>
</template>

<script>


import LoginFormContent from '../../components/Login/LoginFormContent.vue';
import LoginSettingContent from '../../components/Login/LoginSettingContent.vue';
import LoginHeader from '../../components/Login/LoginHeader.vue';

export default {
  name       : 'YMSLoginContent',
  components : {
    LoginFormContent,
    LoginSettingContent,
    LoginHeader,
  },
  data() {
    return {
      showSetting : false,
    };
  },
  methods : {
    openSetting() {
      this.showSetting = true;
    },
    closeSetting() {
      this.showSetting = false;
    },
  },
};
</script>
<style lang="less">
  #login-content {
    .side {
      display: flex;
      flex-direction: column;
      width: 560px;
      position: relative;
    }
    .header {
      width: 100%;
      height: 36px;
    }
    .logo {
      display: flex;
      font-size: 32px;
      color: #ffffff;
      height: calc(100% - 36px);
      font-weight: bold;
      justify-content: center;
      align-items: center;
      padding-bottom: 36px;
      user-select: none;
    }
    .bg {
      object-fit: cover;
      object-position: 50% 50%;
      height: 100%;
      width: 100%;
      position: absolute;
    }
    .main {
      flex-grow: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      > .content {
        @apply h-1 flex-grow;
      }
    }
  }
</style>
