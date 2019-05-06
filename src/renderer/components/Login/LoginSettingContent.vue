<template>
  <div id="login-setting-content" class="flex flex-col bg-white shadow w-full">
    <div class="flex flex-grow">
      <a-tabs defaultActiveKey="1" class="w-full">
        <a-tab-pane :tab="$t('login.basicSetting')" key="1">
          <div class="flex flex-col px-20 pt-10">
            <span class="mb-3 leading-normal">{{$t('login.serverSetting')}}</span>
            <a-input maxlength="64" v-model="tmpServer" :placeholder="$t('login.serverSetting')">
            </a-input>
            <div class="mt-4"></div>
          </div>
          <div class="flex h-full flex-col px-20">
            <span class="mb-3 leading-normal">{{$t('login.proxyServerSetting')}}</span>
            <a-input  maxlength="64"  v-model="tmpProxy" :placeholder="$t('login.proxyServerAddress')">
            </a-input>
            <div class="mt-4"></div>
            <a-input v-model="tmpProxyPort" :placeholder="$t('login.port')">
            </a-input>
          </div>
        </a-tab-pane>
        <a-tab-pane :tab="$t('login.about')" key="2">
          <update-panel></update-panel>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="flex justify-center h-12 border-t items-center">
      <a-button type="primary" style="width: 68px" @click="handlerEnsure">
        {{$t('login.button.confirm')}}
      </a-button>
      <a-button class="ml-4" style="width: 68px" @click="closeSetting">
        {{$t('login.button.cancel')}}
      </a-button>
    </div>
  </div>
</template>

<script>
import { IP_REG, DOMAIN_REG } from '../../utils';
import updatePanel from '../Common/update-panel.vue';

export default {
  name       : 'LoginSettingContent',
  components : {
    updatePanel,
  },
  data() {
    return {
      tmpProxy     : '',
      tmpProxyPort : '',
      tmpServer    : '',
      errorQueue   : Promise.resolve(),
    };
  },
  mounted() {
    this.tmpProxy = this.proxy;
    this.tmpProxyPort = this.proxyPort;
    this.tmpServer = this.server;
  },
  sketch : {
    ns    : 'account',
    props : [ 'proxy', 'proxyPort', 'server' ],
  },
  methods : {
    validateProxy() {
      return (!this.tmpProxy && !this.tmpProxyPort)
        || (IP_REG.test(this.tmpProxy) || DOMAIN_REG.test(this.tmpProxy));
    },
    handlerEnsure() {
      if (this.validateProxy()) {
        this.proxy = this.tmpProxy;
        this.proxyPort = this.tmpProxyPort;
        this.server = this.tmpServer;
        this.closeSetting();
      }
      else {
        this.errorQueue = this.errorQueue.then(() => this.$message.error('代理服务器格式错误'));
      }
    },
    closeSetting() {
      this.$emit('closeSetting');
    },
  },
  watch : {
    tmpProxyPort(val) {
      if (val) this.tmpProxyPort = val.replace(/\D+/, '');
    },
  },
};
</script>

<style lang="less">
  #login-setting-content {
    height: 100%;
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
