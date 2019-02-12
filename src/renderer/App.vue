<template>
  <div id="app" class="h-full">
    <a-locale-provider :locale="locale">
      <router-view />
    </a-locale-provider>
  </div>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

export default {
  name       : 'App',
  components : {
  },
  data() {
    return {
      locale : zhCN,
    };
  },
  computed : {
  },
  methods : {},
};
</script>

<style lang="less">
  #app {
    background-image: url("./assets/bg.svg");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-attachment: fixed;
  }
</style>
