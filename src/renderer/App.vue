<template>
  <div id="app" class="h-full w-full">
    <a-locale-provider :locale="locale">
      <router-view />
    </a-locale-provider>
  </div>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
import enUS from 'ant-design-vue/lib/locale-provider/en_US';
import { getLocale } from './proxy/main-process-proxy';

export default {
  name   : 'App',
  sketch : [
    {
      ns    : 'i18n',
      props : [ 'language', 'langList' ],
    }, 
    {
      ns    : 'application',
      props : [ 'offLine' ],
    },
  ],
  computed : {
    locale() {
      switch (this.language) {
        case 'zh':
          return zhCN;
        case 'en':
          return enUS;
        default:
          return zhCN;
      }
    },
  },
  methods : {},
  watch   : {
    language(val) {
      this.$i18n.locale = val;

      const langName = this.langList.find((item) => item.lang === val).label;

      this.$message.success(
        this.$t('setting.common.langChangeNotice', { lang: langName })
      );
    },
    offLine(val) {
      if (val) this.offLineMessage = this.$message.error('网络不可用，请检查你的网络设置');
      else if (this.offLineMessage) this.offLineMessage();
    },
  },
  async created() {
    this.$i18n.locale = this.language;

    const lang = await getLocale();

    this.$dispatch('i18n.setRendererLocale', { lang });
  },
};
</script>

<style lang="less">
  #app {

  }
</style>
