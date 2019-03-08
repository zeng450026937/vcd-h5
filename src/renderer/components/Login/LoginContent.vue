<template>
  <a-layout id="yms-login" class="h-full bg-transparent mt-8">
    <div class="flex flex-col items-center justify-center h-full">
      <div v-show="!isInSettingContent">
        <login-form-content @openSetting="isInSettingContent = true"/>
      </div>
      <login-setting-content v-if="isInSettingContent"
                             @closeSetting="isInSettingContent = false"/>
    </div>
  </a-layout>
</template>

<script>


import LoginFormContent from './LoginFormContent.vue';
import LoginSettingContent from './LoginSettingContent.vue';


export default {
  name       : 'YMSLoginContent',
  components : {
    LoginFormContent,
    LoginSettingContent,
  },
  data() {
    return {
      isInSettingContent : false,
    };
  },
  computed : {
  },
  mounted() {

  },
  methods : {


  },
};
</script>

<style lang="less">
  #yms-login {
    .ant-form-item{
      margin-bottom: 12px;
      .ant-input {
        padding-left: 36px;
      }
    }
  }
</style>
