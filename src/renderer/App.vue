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
  sketch : {
    ns    : 'application',
    props : [ 'offLine' ],
  },
  methods : {},
  watch   : {
    offLine(val) {
      if (val) this.offLineMessage = this.$message.error('网络不可用，请检查你的网络设置');
      else if (this.offLineMessage) this.offLineMessage();
    },
  },
};
</script>

<style lang="less">
  #app {

  }
</style>
