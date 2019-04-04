<template>
  <a-layout id="login-content" class="h-full bg-transparent">
    <div class="flex flex-col items-center justify-center h-full">
      <div v-show="!isInSettingContent">
        <login-form-content @openSetting="isInSettingContent = true"/>
      </div>
      <login-setting-content v-if="isInSettingContent"
                                 @closeSetting="isInSettingContent = false"/>

      <div class="flex mt-4 items-center">
        <p class="text-xs flex text-center leading-tight text-white">
          Copyright © 2018 Yealink Inc. All rights reserved.
        </p>
      </div>
    </div>
  </a-layout>
</template>

<script>


import LoginFormContent from '../../components/Login/LoginFormContent.vue';
import LoginSettingContent from '../../components/Login/LoginSettingContent.vue';

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
};
</script>
