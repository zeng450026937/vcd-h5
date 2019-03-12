<template>
  <a-layout id="common-setting" class="h-full">
    <div class="h-14 border-b">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>通用</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <div class="flex flex-col border h-full m-4 bg-white p-5">
      <div>
        <div>
          <a-switch size="small" v-model="autoStart"/>
          <span class="ml-5">开机自动启动</span>
        </div>
        <div class="mt-4">
          <a-switch size="small" v-model="forceMinimize"/>
          <span class="ml-5">关闭时最小化</span>
        </div>
        <div class="mt-6">
          <span>切换语言</span>
          <a-select v-model="language" class="w-48 ml-4">
            <a-select-option v-for="(lang, index) in langList" :key="index"
                             :value="lang.lang"
            >{{lang.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-6">
          <span>软终端管理平台地址</span>
          <a-input v-model="address" class="w-48 ml-4"/>
        </div>
        <div class="mt-6">
          <span>升级通道</span>
          <a-select v-model="updateChannel" class="w-48 ml-4">
            <a-select-option v-for="(channel, index) in updateChannelList" :key="index"
                             :value="channel.value"
            >{{channel.label}}</a-select-option>
          </a-select>
        </div>
        <div class="mt-10">
          <a-button type="primary" class="w-32">查看新手引导</a-button>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import updater from '../../../updater';

export default {
  name       : 'CommonSetting',
  components : {
    AppHeader,
  },
  watch : {
    updateChannel(val) {
      const updateConfig = this.$storage.query('AUTO_UPDATE') || {};

      this.updateChannel = updater.channel = updateConfig.channel = val;
      this.$storage.insert('AUTO_UPDATE', updateConfig);
    },
  },
  data() {
    return {
      langList : [
        { label: '简体中文', lang: 'zh-CN' },
        { label: 'English', lang: 'en-US' },
      ],
      updateChannelList : [
        { label: '快速', value: 'fast' },
        { label: '稳定', value: 'stable' },
        { label: '慢速', value: 'insiders' },
      ],
      updateChannel : 'stable',
    };
  },
  deactivated() {
    this.$model.setting.normal.save(); // 页面不显示的时候保存设置
  },
  destroyed() {
    this.$model.setting.normal.save(); // 页面不显示的时候保存设置
  },
  computed : {
    autoStart : {
      get() {
        return this.$model.setting.normal.autoStart;
      },
      set(val) {
        this.$model.setting.normal.autoStart = val;
      },
    },
    forceMinimize : {
      get() {
        return this.$model.setting.normal.forceMinimize;
      },
      set(val) {
        this.$model.setting.normal.forceMinimize = val;
      },
    },
    language : {
      get() {
        return this.$model.setting.normal.language;
      },
      set(val) {
        this.$model.setting.normal.language = val;
      },
    },
    address : {
      get() {
        return this.$model.setting.normal.address;
      },
      set(val) {
        this.$model.setting.normal.address = val;
      },
    },
  },
  created() {
    const updateConig = this.$storage.query('AUTO_UPDATE') || {};

    if (!updateConig.channel) {
      updateConig.channel = 'stable';
      this.$storage.insert('AUTO_UPDATE', updateConig);
    }
    this.updateChannel = updater.channel = this.$storage.query('AUTO_UPDATE').channel;
  },
};
</script>
