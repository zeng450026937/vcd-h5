<template>
  <a-layout id="layout-login" class="h-full bg-transparent">
    <div class="flex flex-col h-full">
      <login-header/>
      <router-view/>
    </div>
  </a-layout>
</template>

<script>
import LoginHeader from '../../components/Login/LoginHeader.vue';

export default {
  name       : 'LayoutLogin',
  components : {
    LoginHeader,
  },
};
</script>
