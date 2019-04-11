<template>
  <div id="app" class="h-full w-full">
    <a-locale-provider :locale="locale">
      <router-view />
    </a-locale-provider>
  </div>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

export default {
  name : 'App',
  data() {
    return {
      locale : zhCN,
    };
  },
  computed : {
  },
  methods : {},
  watch   : {
  },
};
</script>

<style lang="less">
  #app {
    background-image: url("./assets/bg_login.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-attachment: fixed;
  }
</style>
