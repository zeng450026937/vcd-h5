<template>
  <div id="login-setting-content" class="flex flex-col bg-white shadow" style="width: 480px;height: 538px;">
    <div class="flex flex-grow">
      <a-tabs defaultActiveKey="1" class="w-full">
        <a-tab-pane tab="基本设置" key="1">
          <div class="flex h-full flex-col px-20 pt-10">
            <span class="mb-3 leading-normal">代理服务器设置</span>
            <a-input v-model="proxy" placeholder='代理服务器地址'>
            </a-input>
            <div class="mt-4"></div>
            <a-input v-model="proxyPort" placeholder='端口'>
            </a-input>
          </div>
        </a-tab-pane>
        <a-tab-pane tab="关于" key="2">
          <update-panel></update-panel>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="flex justify-center h-12 border-t items-center">
      <a-button type="primary" style="width: 68px" @click="ensure">
        确定
      </a-button>
      <a-button class="ml-4" style="width: 68px" @click="cancel">
        取消
      </a-button>
    </div>
  </div>
</template>

<script>
import updatePanel from '../Common/update-panel.vue';

export default {
  name       : 'LoginSettingContent',
  components : {
    updatePanel,
  },
  data() {
    return {
      status : 0,
    };
  },
  computed : {
    proxy : {
      get() {
        return this.$model.login.proxy;
      },
      set(val) {
        this.$model.login.proxy = val;
      },
    },

    proxyPort : {
      get() {
        return this.$model.login.proxyPort;
      },
      set(val) {
        this.$model.login.proxyPort = val;
      },
    },
  },
  methods : {
    ensure() {
      this.$emit('closeSetting');
    },
    cancel() {
      this.$emit('closeSetting');
    },
  },
};
</script>

<style lang="less">
  #login-setting-content {
    .ant-tabs-bar {
      text-align: center;
      margin: 0;
    }
    .ant-tabs-tab {
      height: 48px;
      font-size: 16px;
      text-align: center;
      line-height: 24px;
    }
  }

</style>
