<template>
  <div id="login-setting-content" class="flex flex-col bg-white shadow" style="width: 480px;height: 538px;">
    <div class="flex flex-grow">
      <a-tabs defaultActiveKey="1" class="w-full">
        <a-tab-pane tab="基本设置" key="1">
          <div class="flex h-full flex-col px-20 pt-10">
            <span class="mb-3 leading-normal">代理服务器设置</span>
            <a-input v-model="tmpProxy" placeholder='代理服务器地址'>
            </a-input>
            <div class="mt-4"></div>
            <a-input v-number-only v-model="tmpProxyPort" placeholder='端口'>
            </a-input>
          </div>
        </a-tab-pane>
        <a-tab-pane tab="关于" key="2">
          <div class="flex flex-col h-full items-center">
            <div class="mt-10">
              <a-avatar class="cursor-pointer rounded-lger hover:shadow bg-green-dark"
                        shape="square"
                        :size="128">
                <span class="text-xl">Yealink</span>
              </a-avatar>
            </div>
            <div class="mt-5 text-base leading-loose">
              Yealink VC Desktop
            </div>
            <div class="mt-1 text-black6 text-xs leading-tight">
              版本号： 1.0.9-alpha
            </div>
            <div class="mt-5 w-1/2">
              <a-button class="w-full h-9" type="primary">检查更新</a-button>
            </div>
            <div class="mt-5">
              <a-switch size="small"/>
              <span class="ml-2">自动更新</span>
            </div>
            <div class="flex text-indigo mt-5 items-center text-xs">
              <span class="cursor-pointer">用户协议</span>
              <a-divider class="mx-4" type="vertical"></a-divider>
              <span class="cursor-pointer">隐私政策</span>
            </div>
            <p class="mt-5 text-xs leading-tight text-black9">
              Copyright © 2018 Yealink Inc. All rights reserved.
            </p>
          </div>
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
export default {
  name       : 'LoginSettingContent',
  directives : {
    numberOnly : {
      bind(el) {
        el.handler = function() {
          el.value = el.value.replace(/\D+/, '');
        };
        el.addEventListener('input', el.handler);
      },
      unbind(el) {
        el.removeEventListener('input', el.handler);
      },
    },
  },
  data() {
    return {
      tmpProxy     : '',
      tmpProxyPort : '',
    };
  },
  mounted() {
    this.tmpProxy = this.proxy;
    this.tmpProxyPort = this.proxyPort;
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
      const IP_REG = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
      const DOMAIN_REG = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;

      if (this.tmpProxy && this.tmpProxyPort && !IP_REG.test(this.tmpProxy) && !DOMAIN_REG.test(this.tmpProxyPort)) {
        this.$message.error('代理服务器地址格式错误');
      }
      else {
        this.proxy = this.tmpProxy;
        this.proxyPort = this.tmpProxyPort;
        this.$emit('closeSetting');
      }
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
