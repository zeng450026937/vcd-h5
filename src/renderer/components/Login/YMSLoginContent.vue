<template>
  <a-layout id="yms-login" class="h-full bg-transparent">
    <div class="flex flex-col items-center justify-center h-full">
      <div v-show="!isInSettingContent">
        <yms-login-form-content @openSetting="isInSettingContent = true"/>
      </div>

      <yms-login-setting-content v-if="isInSettingContent"
                                 @closeSetting="isInSettingContent = false"/>

      <div class="flex mt-4 items-center">
        <p class="text-xs text-white leading-tight">Copyright © 2018 Yealink Inc. All rights reserved.</p>
      </div>
    </div>
  </a-layout>
</template>

<script>


import YmsLoginFormContent from './YMSLoginFormContent.vue';
import YmsLoginSettingContent from './YMSLoginSettingContent.vue';


export default {
  name       : 'YMSLoginContent',
  components : {
    YmsLoginFormContent,
    YmsLoginSettingContent,
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
