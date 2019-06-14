<template>
  <div id="login-setting-content" class="flex flex-col bg-white shadow w-full">
    <div class="flex flex-grow">
      <a-tabs v-model="activeKey" class="w-full login-setting-tab">
        <a-tab-pane :tab="$t('login.basicSetting')" key="1">
          <div class="flex flex-col px-20 pt-10">
            <span class="mb-3 leading-normal">{{$t('login.serverSetting')}}</span>
            <a-input maxlength="64" v-model.trim="tmpServer" :placeholder="$t('login.serverSetting')">
            </a-input>
          </div>
          <div class="flex flex-col px-20 mt-4">
            <span class="mb-3 leading-normal">{{$t('login.proxyServerSetting')}}</span>
            <a-input  maxlength="64"  v-model.trim="tmpProxy" :placeholder="$t('login.proxyServerAddress')">
            </a-input>
            <div class="mt-4"></div>
            <a-input v-model="tmpProxyPort" :placeholder="$t('login.port')">
            </a-input>
          </div>
          <div class="flex h-full flex-col px-20 mt-4">
            <span class="mb-3 leading-normal">接入服务器地址</span>
            <a-input  maxlength="64"  v-model.trim="pushUrl" placeholder="接入服务器地址">
            </a-input>
          </div>
        </a-tab-pane>
        <a-tab-pane :tab="$t('login.about')" key="2">
          <update-panel v-if="activeKey === '2'"></update-panel>
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
      activeKey    : '1',
    };
  },
  mounted() {
    this.tmpProxy = this.proxy;
    this.tmpProxyPort = this.proxyPort;
    this.tmpServer = this.loginData.server;
  },
  sketch : {
    ns    : 'login.account',
    props : [ 'pushUrl', 'proxy', 'proxyPort', 'loginData' ],
  },
  methods : {
    validateProxy() {
      return (!this.tmpProxy && !this.tmpProxyPort)
        || (IP_REG.test(this.tmpProxy) || DOMAIN_REG.test(this.tmpProxy));
    },
    handlerEnsure() {
      this.$dispatch('login.updatePushServiceUrl', { url: this.pushUrl });
      if (this.validateProxy()) {
        this.proxy = this.tmpProxy;
        this.proxyPort = this.tmpProxyPort;
        this.loginData.server = this.tmpServer;
        this.closeSetting();
      }
      else {
        this.$message.error('代理服务器格式错误');
      }
    },
    closeSetting() {
      this.$emit('closeSetting');
    },
  },
  watch : {
    tmpProxyPort(val) {
      if (val && typeof val !== 'number') this.tmpProxyPort = val.replace(/\D+/, '');
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
    .login-setting-tab {
      .ant-tabs-content {
        height: calc(100% - 46px);
      }
    }
    .ant-tabs-tab {
      height: 48px;
      font-size: 16px;
      text-align: center;
      line-height: 24px;
    }
  }

</style>
