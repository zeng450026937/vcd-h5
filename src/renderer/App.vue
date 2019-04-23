<template>
  <div id="app" class="h-full w-full">
    <a-locale-provider :locale="locale">
      <router-view />
    </a-locale-provider>
  </div>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
import { getLocale } from './proxy/main-process-proxy';

export default {
  name   : 'App',
  sketch : {
    ns    : 'i18n',
    props : [ 'language' ],
  },
  data() {
    return {
      locale : zhCN,
    };
  },
  computed : {
  },
  methods : {},
  watch   : {
    language(val) {
      this.$i18n.locale = val;
    },
  },
  async created() {
    this.$i18n.locale = await getLocale();
  },
};
</script>

<style lang="less">
  #app {

  }
</style>
