<template>
  <div id="login-content" class="h-full flex">
    <div class="side">
      <login-header :useOperationBar="false" />
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
import LoginHeader from '../../components/Login/LoginHeader.vue'

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
      width: 50%;
      background-image: url("../../assets/login-bg.png");
      background-repeat: no-repeat;
      background-size: 50% 100%;
      background-attachment: fixed;
    }
    .main {
      width: 50%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .content {
        height: calc(100% - 36px );
      }
    }
  }
</style>
